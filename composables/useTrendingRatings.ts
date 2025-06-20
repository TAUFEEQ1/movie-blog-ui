export interface TrendingRating {
  id: number
  user: number
  tmdb_id: number
  type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable: boolean
  is_unfavorable: boolean
  createdAt: string
  updatedAt: string
  trending?: any
}

export interface RateItemRequest {
  tmdb_id: number
  type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable?: boolean
  is_unfavorable?: boolean
}

export const useTrendingRatings = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()
  
  // Direct API calls to Strapi
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    return await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token.value && { Authorization: `Bearer ${token.value}` }),
        ...options.headers
      },
      ...options
    })
  }

  // Rate a trending item
  const rateItem = async (ratingData: RateItemRequest): Promise<TrendingRating | null> => {
    try {
      const response = await apiCall('/trending-ratings/rate', {
        method: 'POST',
        body: ratingData
      })
      return response as TrendingRating
    } catch (error) {
      console.error('Error rating item:', error)
      return null
    }
  }

  // Get user's rating for a specific item
  const getMyRating = async (tmdb_id: number, type: 'movie' | 'tv'): Promise<TrendingRating | null> => {
    try {
      const response = await apiCall(`/trending-ratings/my-rating/${tmdb_id}/${type}`)
      return response as TrendingRating
    } catch (error) {
      console.error('Error fetching user rating:', error)
      return null
    }
  }

  // Get user's notable items (highly rated)
  const getNotableItems = async (filters: { type?: 'movie' | 'tv', limit?: number } = {}): Promise<TrendingRating[]> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const queryString = params.toString()
      const endpoint = `/trending-ratings/notable${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint)
      return response as TrendingRating[]
    } catch (error) {
      console.error('Error fetching notable items:', error)
      return []
    }
  }

  // Get user's unfavorable items (low rated)
  const getUnfavorableItems = async (filters: { type?: 'movie' | 'tv', limit?: number } = {}): Promise<TrendingRating[]> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const queryString = params.toString()
      const endpoint = `/trending-ratings/unfavorable${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint)
      return response as TrendingRating[]
    } catch (error) {
      console.error('Error fetching unfavorable items:', error)
      return []
    }
  }

  // Get all user's ratings
  const getMyRatings = async (filters: { type?: 'movie' | 'tv', page?: number, pageSize?: number } = {}): Promise<TrendingRating[]> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
      
      const queryString = params.toString()
      const endpoint = `/trending-ratings/my-ratings${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint)
      return response as TrendingRating[]
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      return []
    }
  }

  // Quick rating helpers
  const markAsNotable = async (tmdb_id: number, type: 'movie' | 'tv', rating: number = 9, comment?: string) => {
    return await rateItem({
      tmdb_id,
      type,
      rating,
      comment,
      is_notable: true,
      is_unfavorable: false
    })
  }

  const markAsUnfavorable = async (tmdb_id: number, type: 'movie' | 'tv', rating: number = 3, comment?: string) => {
    return await rateItem({
      tmdb_id,
      type,
      rating,
      comment,
      is_notable: false,
      is_unfavorable: true
    })
  }

  return {
    rateItem,
    getMyRating,
    getNotableItems,
    getUnfavorableItems,
    getMyRatings,
    markAsNotable,
    markAsUnfavorable
  }
}
