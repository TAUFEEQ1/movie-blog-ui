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

export const useKeywordExtraction = () => {
  // Stop words list for filtering
  const stopWords = new Set([
    // Common movie/TV stop words
    'movie', 'film', 'show', 'series', 'episode', 'season', 'watch', 'story',
    'character', 'plot', 'drama', 'comedy', 'action', 'thriller', 'horror',
    'romance', 'adventure', 'fantasy', 'science', 'fiction', 'documentary',
    'animation', 'family', 'mystery', 'crime', 'war', 'western', 'musical',
    'biographical', 'historical', 'based', 'true', 'events', 'follows',
    'tells', 'story', 'about', 'when', 'after', 'before', 'during',
    // Common English stop words
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'its', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
    'very', 'more', 'most', 'other', 'some', 'time', 'now', 'then', 'than',
    'only', 'just', 'first', 'also', 'new', 'old', 'good', 'great', 'way',
    'make', 'get', 'go', 'come', 'take', 'see', 'know', 'think', 'look',
    'want', 'give', 'use', 'find', 'work', 'call', 'try', 'ask', 'need',
    'seem', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin',
    'help', 'talk', 'turn', 'start', 'might', 'show', 'hear', 'play', 'run',
    'move', 'live', 'believe', 'bring', 'happen', 'write', 'provide', 'sit',
    'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn'
  ])

  /**
   * Simple RAKE-like algorithm implementation
   * Extracts keywords by finding phrases separated by stop words
   */
  const extractKeywordsFromText = (text: string): ExtractedKeyword[] => {
    if (!text || typeof text !== 'string' || process.server) {
      return []
    }

    try {
      // Clean and normalize text
      const cleanText = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      if (cleanText.length < 10) {
        return []
      }

      // Split text into words
      const words = cleanText.split(' ').filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Remove pure numbers
      )

      if (words.length === 0) {
        return []
      }

      // Find candidate phrases (sequences of non-stop words)
      const phrases: string[] = []
      let currentPhrase: string[] = []

      const textWords = cleanText.split(' ')
      
      for (const word of textWords) {
        if (stopWords.has(word) || word.length <= 2 || /^\d+$/.test(word)) {
          // Stop word found, end current phrase
          if (currentPhrase.length > 0) {
            phrases.push(currentPhrase.join(' '))
            currentPhrase = []
          }
        } else {
          currentPhrase.push(word)
        }
      }

      // Add final phrase if exists
      if (currentPhrase.length > 0) {
        phrases.push(currentPhrase.join(' '))
      }

      // Count phrase frequencies and calculate scores
      const phraseFreq = new Map<string, number>()
      const wordFreq = new Map<string, number>()
      const wordDegree = new Map<string, number>()

      // Count frequencies
      phrases.forEach(phrase => {
        phraseFreq.set(phrase, (phraseFreq.get(phrase) || 0) + 1)
        
        const phraseWords = phrase.split(' ')
        phraseWords.forEach(word => {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
          wordDegree.set(word, (wordDegree.get(word) || 0) + phraseWords.length)
        })
      })

      // Calculate RAKE scores for phrases
      const keywordScores: ExtractedKeyword[] = []

      phraseFreq.forEach((frequency, phrase) => {
        const phraseWords = phrase.split(' ')
        let score = 0

        // Calculate score as sum of (degree/frequency) for each word
        phraseWords.forEach(word => {
          const degree = wordDegree.get(word) || 1
          const freq = wordFreq.get(word) || 1
          score += degree / freq
        })

        keywordScores.push({
          keyword: phrase,
          score: score,
          frequency: frequency
        })
      })

      // Sort by score and filter
      return keywordScores
        .filter(kw => 
          kw.keyword.length > 2 && 
          kw.keyword.length < 50 &&
          kw.frequency >= 1
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 20) // Top 20 keywords per text

    } catch (error) {
      console.error('Error extracting keywords from text:', error)
      return []
    }
  }

  /**
   * Extract keywords from multiple trending items
   */
  const extractKeywordsFromItems = (items: any[]): KeywordStats => {
    if (process.server || !items || !Array.isArray(items)) {
      return { totalKeywords: 0, topKeywords: [], allKeywords: [] }
    }

    const allKeywordMap = new Map<string, ExtractedKeyword>()

    // Process each item's overview/synopsis
    items.forEach(item => {
      if (item.overview) {
        const itemKeywords = extractKeywordsFromText(item.overview)
        
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
    })

    // Convert map to array and sort by combined score
    const allKeywords = Array.from(allKeywordMap.values())
      .sort((a, b) => b.score - a.score)
      .filter(kw => kw.frequency >= 2) // Only keep keywords that appear at least twice

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
  const filterItemsByKeywords = (items: any[], selectedKeywords: string[]): any[] => {
    if (!selectedKeywords || selectedKeywords.length === 0 || !items) {
      return items
    }

    return items.filter(item => {
      if (!item.overview) return false

      const itemKeywords = extractKeywordsFromText(item.overview)
      const itemKeywordStrings = itemKeywords.map(kw => kw.keyword.toLowerCase())

      // Check if any selected keyword matches item keywords
      return selectedKeywords.some(selectedKeyword => 
        itemKeywordStrings.some(itemKeyword => 
          itemKeyword.includes(selectedKeyword.toLowerCase()) ||
          selectedKeyword.toLowerCase().includes(itemKeyword)
        )
      )
    })
  }

  /**
   * Get keyword suggestions based on partial input
   */
  const getKeywordSuggestions = (query: string, allKeywords: ExtractedKeyword[], limit = 10): ExtractedKeyword[] => {
    if (!query || query.length < 2 || !allKeywords) {
      return allKeywords ? allKeywords.slice(0, limit) : []
    }

    const lowercaseQuery = query.toLowerCase()
    return allKeywords
      .filter(kw => kw.keyword.toLowerCase().includes(lowercaseQuery))
      .slice(0, limit)
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
    extractKeywordsFromText,
    extractKeywordsFromItems,
    filterItemsByKeywords,
    getKeywordSuggestions,
    categorizeKeywords
  }
}
