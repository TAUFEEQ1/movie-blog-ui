export interface BackendKeyword {
  keyword: string
  count: number
  totalScore: number
  avgScore: number
}

export interface BackendKeywordStats {
  totalItems: number
  itemsWithKeywords: number
  topKeywords: Array<{ keyword: string; count: number; score: number }>
  keywordsByCategory: Record<string, any[]>
}

export interface BackendExtractedKeyword {
  keyword: string
  score: number
  frequency: number
  id?: number
}

export const useBackendKeywords = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  // Direct API calls to Strapi with authentication
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Add authorization header if token exists
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    return await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers,
      ...options
    })
  }

  /**
   * Get keyword statistics from backend
   */
  const getKeywordStats = async (): Promise<BackendKeywordStats | null> => {
    try {
      const response = await apiCall('/keywords/stats') as {
        success: boolean
        data: BackendKeywordStats
      }
      
      if (response.success) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Error fetching keyword stats:', error)
      return null
    }
  }

  /**
   * Get all available keywords from backend
   */
  const getAllKeywords = async (search?: string, limit = 100): Promise<BackendKeyword[]> => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (limit) params.append('limit', limit.toString())
      
      const queryString = params.toString()
      const endpoint = `/keywords/all${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as {
        success: boolean
        keywords: BackendKeyword[]
        total: number
      }
      
      if (response.success) {
        return response.keywords
      }
      return []
    } catch (error) {
      console.error('Error fetching all keywords:', error)
      return []
    }
  }

  /**
   * Get trending items by keyword
   */
  const getTrendingByKeyword = async (keyword: string, limit = 20): Promise<any[]> => {
    try {
      const params = new URLSearchParams()
      params.append('keyword', keyword)
      params.append('limit', limit.toString())
      
      const response = await apiCall(`/keywords/trending-by-keyword?${params.toString()}`) as {
        success: boolean
        items: any[]
        total: number
      }
      
      if (response.success) {
        return response.items
      }
      return []
    } catch (error) {
      console.error('Error fetching trending items by keyword:', error)
      return []
    }
  }

  /**
   * Filter trending items by selected keywords (client-side)
   */
  const filterItemsByKeywords = (items: any[], selectedKeywords: string[]): any[] => {
    if (!selectedKeywords || selectedKeywords.length === 0 || !items) {
      return items
    }

    return items.filter(item => {
      if (!item.keywords || !Array.isArray(item.keywords)) {
        return false
      }

      // Check if any selected keyword exactly matches item keywords
      return selectedKeywords.some(selectedKeyword => 
        item.keywords.some((itemKeyword: BackendExtractedKeyword) => 
          itemKeyword.keyword.toLowerCase() === selectedKeyword.toLowerCase()
        )
      )
    })
  }

  /**
   * Get keyword suggestions based on partial input
   */
  const getKeywordSuggestions = async (query: string, limit = 10): Promise<BackendKeyword[]> => {
    if (!query || query.length < 2) {
      // Return top keywords if no query
      return await getAllKeywords('', limit)
    }

    return await getAllKeywords(query, limit)
  }

  /**
   * Extract keywords from items by calling backend directly
   */
  const extractKeywordsFromItems = async (items: any[]): Promise<{
    totalKeywords: number
    topKeywords: BackendExtractedKeyword[]
    allKeywords: BackendExtractedKeyword[]
  }> => {
    // For the new system, we get keywords from the items themselves since they're pre-processed
    const allKeywordMap = new Map<string, BackendExtractedKeyword>()

    items.forEach(item => {
      if (item.keywords && Array.isArray(item.keywords)) {
        item.keywords.forEach((kw: BackendExtractedKeyword) => {
          const existing = allKeywordMap.get(kw.keyword)
          if (existing) {
            allKeywordMap.set(kw.keyword, {
              keyword: kw.keyword,
              score: existing.score + kw.score,
              frequency: existing.frequency + kw.frequency,
              id: kw.id
            })
          } else {
            allKeywordMap.set(kw.keyword, { ...kw })
          }
        })
      }
    })

    const allKeywords = Array.from(allKeywordMap.values())
      .sort((a, b) => b.score - a.score)
      .filter(kw => kw.frequency >= 1)

    const topKeywords = allKeywords.slice(0, 50)

    return {
      totalKeywords: allKeywords.length,
      topKeywords,
      allKeywords
    }
  }

  /**
   * Trigger manual keyword extraction for all trending items
   */
  const triggerKeywordExtraction = async (): Promise<{
    success: boolean
    processed: number
    updated: number
    errors: number
  } | null> => {
    try {
      const response = await apiCall('/keywords/extract-all', {
        method: 'POST'
      }) as {
        success: boolean
        data: {
          processed: number
          updated: number
          errors: number
        }
        message: string
      }
      
      if (response.success) {
        return {
          success: true,
          ...response.data
        }
      }
      return null
    } catch (error) {
      console.error('Error triggering keyword extraction:', error)
      return null
    }
  }

  /**
   * Get categorized keywords from backend (preferred) or fallback to client-side categorization
   */
  const getCategorizedKeywords = async (): Promise<Record<string, BackendKeyword[]>> => {
    try {
      // First try to get categories from backend stats
      const stats = await getKeywordStats()
      if (stats && stats.keywordsByCategory) {
        // Convert backend format to frontend format
        const categorized: Record<string, BackendKeyword[]> = {}
        
        Object.entries(stats.keywordsByCategory).forEach(([category, keywords]) => {
          if (Array.isArray(keywords) && keywords.length > 0) {
            // Convert backend keyword format to BackendKeyword format
            categorized[category] = keywords.map(kw => ({
              keyword: kw.keyword || kw,
              count: kw.count || 1,
              totalScore: kw.totalScore || kw.score || 1,
              avgScore: kw.avgScore || kw.score || 1
            }))
          }
        })
        
        return categorized
      }
      
      // Fallback: get all keywords and categorize them locally
      const keywords = await getAllKeywords('', 200)
      return categorizeKeywordsClientSide(keywords)
    } catch (error) {
      console.error('Error getting categorized keywords:', error)
      return {}
    }
  }

  /**
   * Client-side keyword categorization (fallback only)
   */
  const categorizeKeywordsClientSide = (keywords: BackendKeyword[]): Record<string, BackendKeyword[]> => {
    if (!keywords || !Array.isArray(keywords)) {
      return {}
    }

    const categories: Record<string, BackendKeyword[]> = {
      'Characters & People': [],
      'Places & Locations': [],
      'Themes & Concepts': [],
      'Actions & Events': [],
      'Other': []
    }

    keywords.forEach(kw => {
      const keyword = kw.keyword.toLowerCase()
      
      // Simple categorization based on common patterns (same logic as backend)
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
    getKeywordStats,
    getAllKeywords,
    getTrendingByKeyword,
    filterItemsByKeywords,
    getKeywordSuggestions,
    extractKeywordsFromItems,
    triggerKeywordExtraction,
    getCategorizedKeywords,
    categorizeKeywords: categorizeKeywordsClientSide // Keep old name for backwards compatibility
  }
}
