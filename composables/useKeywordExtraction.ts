export interface ExtractedKeyword {
  keyword: string
  score: number
  frequency: number
}

export interface KeywordStats {
  totalKeywords: number
  topKeywords: ExtractedKeyword[]
  allKeywords: ExtractedKeyword[]
}

interface TMDBKeyword {
  id: number
  name: string
}

export const useKeywordExtraction = () => {
  // Load keywords from JSONL file
  let availableKeywords: TMDBKeyword[] = []
  
  const loadKeywords = async (): Promise<TMDBKeyword[]> => {
    if (availableKeywords.length > 0) {
      return availableKeywords
    }

    try {
      // Import the keywords JSONL file
      const keywordsFile = await import('~/assets/keywords.jsonl?raw')
      const lines = keywordsFile.default.split('\n').filter(line => line.trim())
      
      availableKeywords = lines.map(line => {
        try {
          return JSON.parse(line) as TMDBKeyword
        } catch (e) {
          return null
        }
      }).filter(Boolean) as TMDBKeyword[]
      
      return availableKeywords
    } catch (error) {
      console.error('Error loading keywords from JSONL:', error)
      return []
    }
  }

  /**
   * Extract keywords from text using TMDB keyword matching
   */
  const extractKeywordsFromText = async (text: string): Promise<ExtractedKeyword[]> => {
    if (!text || typeof text !== 'string' || process.server) {
      return []
    }

    try {
      const keywords = await loadKeywords()
      if (keywords.length === 0) {
        return []
      }

      // Clean and normalize text
      const cleanText = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      if (cleanText.length < 10) {
        return []
      }

      // Find matching keywords in the text
      const foundKeywords: Map<string, ExtractedKeyword> = new Map()

      keywords.forEach(keyword => {
        const keywordName = keyword.name.toLowerCase()
        
        // Check if keyword appears in text
        if (cleanText.includes(keywordName)) {
          // Count occurrences
          const regex = new RegExp(`\\b${keywordName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
          const matches = cleanText.match(regex)
          const frequency = matches ? matches.length : 0
          
          if (frequency > 0) {
            // Calculate score based on frequency and keyword specificity
            const specificity = keywordName.split(' ').length // Multi-word keywords get higher specificity
            const score = frequency * specificity * (keywordName.length / 10) // Longer keywords get slight boost
            
            foundKeywords.set(keywordName, {
              keyword: keywordName,
              score: score,
              frequency: frequency
            })
          }
        }
      })

      // Sort by score and return top results
      return Array.from(foundKeywords.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 30) // Top 30 keywords per text

    } catch (error) {
      console.error('Error extracting keywords from text:', error)
      return []
    }
  }

  /**
   * Extract keywords from multiple trending items
   */
  const extractKeywordsFromItems = async (items: any[]): Promise<KeywordStats> => {
    if (process.server || !items || !Array.isArray(items)) {
      return { totalKeywords: 0, topKeywords: [], allKeywords: [] }
    }

    const allKeywordMap = new Map<string, ExtractedKeyword>()

    // Process each item's overview/synopsis
    for (const item of items) {
      if (item.overview) {
        const itemKeywords = await extractKeywordsFromText(item.overview)
        
        itemKeywords.forEach(kw => {
          const existing = allKeywordMap.get(kw.keyword)
          if (existing) {
            // Combine scores and frequencies
            allKeywordMap.set(kw.keyword, {
              keyword: kw.keyword,
              score: existing.score + kw.score,
              frequency: existing.frequency + kw.frequency
            })
          } else {
            allKeywordMap.set(kw.keyword, { ...kw })
          }
        })
      }
    }

    // Convert map to array and sort by combined score
    const allKeywords = Array.from(allKeywordMap.values())
      .sort((a, b) => b.score - a.score)
      .filter(kw => kw.frequency >= 1) // Keep all keywords that appear at least once

    // Get top keywords for quick access
    const topKeywords = allKeywords.slice(0, 50)

    return {
      totalKeywords: allKeywords.length,
      topKeywords,
      allKeywords
    }
  }

  /**
   * Filter items by selected keywords
   */
  const filterItemsByKeywords = async (items: any[], selectedKeywords: string[]): Promise<any[]> => {
    if (!selectedKeywords || selectedKeywords.length === 0 || !items) {
      return items
    }

    const filteredItems = []
    
    for (const item of items) {
      if (!item.overview) continue

      const itemKeywords = await extractKeywordsFromText(item.overview)
      const itemKeywordStrings = itemKeywords.map(kw => kw.keyword.toLowerCase())

      // Check if any selected keyword matches item keywords
      const hasMatchingKeyword = selectedKeywords.some(selectedKeyword => 
        itemKeywordStrings.some(itemKeyword => 
          itemKeyword.includes(selectedKeyword.toLowerCase()) ||
          selectedKeyword.toLowerCase().includes(itemKeyword)
        )
      )
      
      if (hasMatchingKeyword) {
        filteredItems.push(item)
      }
    }

    return filteredItems
  }

  /**
   * Get keyword suggestions based on partial input
   */
  const getKeywordSuggestions = async (query: string, allKeywords?: ExtractedKeyword[], limit = 10): Promise<ExtractedKeyword[]> => {
    if (!query || query.length < 2) {
      if (allKeywords) {
        return allKeywords.slice(0, limit)
      }
      // If no allKeywords provided, return top keywords from JSONL
      const keywords = await loadKeywords()
      return keywords.slice(0, limit).map(k => ({
        keyword: k.name,
        score: 1,
        frequency: 1
      }))
    }

    if (allKeywords) {
      const lowercaseQuery = query.toLowerCase()
      return allKeywords
        .filter(kw => kw.keyword.toLowerCase().includes(lowercaseQuery))
        .slice(0, limit)
    }

    // Search in JSONL keywords
    const keywords = await loadKeywords()
    const lowercaseQuery = query.toLowerCase()
    return keywords
      .filter(k => k.name.toLowerCase().includes(lowercaseQuery))
      .slice(0, limit)
      .map(k => ({
        keyword: k.name,
        score: 1,
        frequency: 1
      }))
  }

  /**
   * Get all available keywords from JSONL file
   */
  const getAllAvailableKeywords = async (): Promise<ExtractedKeyword[]> => {
    const keywords = await loadKeywords()
    return keywords.map(k => ({
      keyword: k.name,
      score: 1,
      frequency: 1
    }))
  }

  /**
   * Group keywords by category/theme for better organization
   */
  const categorizeKeywords = (keywords: ExtractedKeyword[]): Record<string, ExtractedKeyword[]> => {
    if (!keywords || !Array.isArray(keywords)) {
      return {}
    }

    const categories: Record<string, ExtractedKeyword[]> = {
      'Characters & People': [],
      'Places & Locations': [],
      'Themes & Concepts': [],
      'Actions & Events': [],
      'Other': []
    }

    keywords.forEach(kw => {
      const keyword = kw.keyword.toLowerCase()
      
      // Simple categorization based on common patterns
      if (keyword.includes('character') || keyword.includes('man') || keyword.includes('woman') || 
          keyword.includes('boy') || keyword.includes('girl') || keyword.includes('hero') ||
          keyword.includes('villain') || keyword.includes('detective') || keyword.includes('doctor') ||
          keyword.includes('agent') || keyword.includes('captain') || keyword.includes('king') ||
          keyword.includes('queen') || keyword.includes('president') || keyword.includes('teacher')) {
        categories['Characters & People'].push(kw)
      } else if (keyword.includes('city') || keyword.includes('world') || keyword.includes('school') ||
                 keyword.includes('hospital') || keyword.includes('space') || keyword.includes('planet') ||
                 keyword.includes('house') || keyword.includes('home') || keyword.includes('office') ||
                 keyword.includes('island') || keyword.includes('country') || keyword.includes('town') ||
                 keyword.includes('village') || keyword.includes('forest') || keyword.includes('mountain')) {
        categories['Places & Locations'].push(kw)
      } else if (keyword.includes('love') || keyword.includes('death') || keyword.includes('power') ||
                 keyword.includes('friendship') || keyword.includes('betrayal') || keyword.includes('revenge') ||
                 keyword.includes('family') || keyword.includes('secret') || keyword.includes('mystery') ||
                 keyword.includes('truth') || keyword.includes('hope') || keyword.includes('fear') ||
                 keyword.includes('justice') || keyword.includes('freedom') || keyword.includes('peace')) {
        categories['Themes & Concepts'].push(kw)
      } else if (keyword.includes('fight') || keyword.includes('escape') || keyword.includes('discover') ||
                 keyword.includes('battle') || keyword.includes('journey') || keyword.includes('mission') ||
                 keyword.includes('investigation') || keyword.includes('chase') || keyword.includes('rescue') ||
                 keyword.includes('attack') || keyword.includes('defense') || keyword.includes('search') ||
                 keyword.includes('hunt') || keyword.includes('race') || keyword.includes('competition')) {
        categories['Actions & Events'].push(kw)
      } else {
        categories['Other'].push(kw)
      }
    })

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key]
      }
    })

    return categories
  }

  return {
    loadKeywords,
    extractKeywordsFromText,
    extractKeywordsFromItems,
    filterItemsByKeywords,
    getKeywordSuggestions,
    getAllAvailableKeywords,
    categorizeKeywords
  }
}
