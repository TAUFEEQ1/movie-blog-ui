export interface UserRating {
  id: number
  user: any
  tmdb_id: number
  content_type: 'trending' | 'coming_soon'
  media_type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable: boolean
  is_unfavorable: boolean
  is_watchlisted: boolean
  watched_date?: string
  rewatch_count: number
  tags?: string[]
  mood_rating?: 'excited' | 'interested' | 'neutral' | 'disappointed' | 'avoid'
  anticipation_level?: number
  recommendation_score?: number
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface RateItemRequest {
  tmdb_id: number
  content_type: 'trending' | 'coming_soon'
  media_type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable?: boolean
  is_unfavorable?: boolean
  is_watchlisted?: boolean
  mood_rating?: 'excited' | 'interested' | 'neutral' | 'disappointed' | 'avoid'
  anticipation_level?: number
  tags?: string[]
}

export interface UserRatingFilters {
  content_type?: 'trending' | 'coming_soon'
  media_type?: 'movie' | 'tv'
  mood_rating?: 'excited' | 'interested' | 'neutral' | 'disappointed' | 'avoid'
  min_rating?: number
  max_rating?: number
  limit?: number
  page?: number
  pageSize?: number
}

export const useUserRatings = () => {
  const config = useRuntimeConfig()
  const { user, token } = useAuth()
  
  // Direct API calls to Strapi
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

  // Rate an item (trending or coming soon)
  const rateItem = async (ratingData: RateItemRequest): Promise<UserRating | null> => {
    try {
      if (!user.value) {
        throw new Error('User must be logged in to rate items')
      }

      const response = await apiCall('/user-ratings/rate', {
        method: 'POST',
        body: ratingData
      }) as any

      return response.data || response
    } catch (error) {
      console.error('Error rating item:', error)
      throw error
    }
  }

  // Get user's rating for a specific item
  const getMyRating = async (
    tmdb_id: number, 
    content_type: 'trending' | 'coming_soon', 
    media_type: 'movie' | 'tv'
  ): Promise<UserRating | null> => {
    try {
      if (!user.value) return null

      const response = await apiCall(`/user-ratings/my-rating/${tmdb_id}/${content_type}/${media_type}`) as any
      return response.data || response
    } catch (error) {
      console.error('Error fetching user rating:', error)
      return null
    }
  }

  // Get user's notable items
  const getNotableItems = async (filters: Pick<UserRatingFilters, 'content_type' | 'media_type' | 'limit'> = {}): Promise<UserRating[]> => {
    try {
      if (!user.value) return []

      const queryParams = new URLSearchParams()
      if (filters.content_type) queryParams.append('content_type', filters.content_type)
      if (filters.media_type) queryParams.append('media_type', filters.media_type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/user-ratings/notable${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching notable items:', error)
      return []
    }
  }

  // Get user's unfavorable items
  const getUnfavorableItems = async (filters: Pick<UserRatingFilters, 'content_type' | 'media_type' | 'limit'> = {}): Promise<UserRating[]> => {
    try {
      if (!user.value) return []

      const queryParams = new URLSearchParams()
      if (filters.content_type) queryParams.append('content_type', filters.content_type)
      if (filters.media_type) queryParams.append('media_type', filters.media_type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/user-ratings/unfavorable${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching unfavorable items:', error)
      return []
    }
  }

  // Get user's watchlist
  const getWatchlist = async (filters: Pick<UserRatingFilters, 'content_type' | 'media_type' | 'limit'> = {}): Promise<UserRating[]> => {
    try {
      if (!user.value) return []

      const queryParams = new URLSearchParams()
      if (filters.content_type) queryParams.append('content_type', filters.content_type)
      if (filters.media_type) queryParams.append('media_type', filters.media_type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())

      const queryString = queryParams.toString()
      const endpoint = `/user-ratings/watchlist${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      return []
    }
  }

  // Get all user ratings with filters
  const getMyRatings = async (filters: UserRatingFilters = {}): Promise<UserRating[]> => {
    try {
      if (!user.value) return []

      const queryParams = new URLSearchParams()
      if (filters.content_type) queryParams.append('content_type', filters.content_type)
      if (filters.media_type) queryParams.append('media_type', filters.media_type)
      if (filters.mood_rating) queryParams.append('mood_rating', filters.mood_rating)
      if (filters.min_rating) queryParams.append('min_rating', filters.min_rating.toString())
      if (filters.max_rating) queryParams.append('max_rating', filters.max_rating.toString())
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.pageSize) queryParams.append('pageSize', filters.pageSize.toString())

      const queryString = queryParams.toString()
      const endpoint = `/user-ratings/my-ratings${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      return []
    }
  }

  // Remove a rating
  const removeRating = async (
    tmdb_id: number, 
    content_type: 'trending' | 'coming_soon', 
    media_type: 'movie' | 'tv'
  ): Promise<boolean> => {
    try {
      if (!user.value) return false

      await apiCall(`/user-ratings/remove/${tmdb_id}/${content_type}/${media_type}`, {
        method: 'DELETE'
      })

      return true
    } catch (error) {
      console.error('Error removing rating:', error)
      return false
    }
  }

  // Quick rating helpers
  const markAsNotable = async (
    tmdb_id: number, 
    content_type: 'trending' | 'coming_soon', 
    media_type: 'movie' | 'tv',
    currentRating = 8
  ) => {
    return await rateItem({
      tmdb_id,
      content_type,
      media_type,
      rating: currentRating,
      is_notable: true
    })
  }

  const markAsUnfavorable = async (
    tmdb_id: number, 
    content_type: 'trending' | 'coming_soon', 
    media_type: 'movie' | 'tv',
    currentRating = 3
  ) => {
    return await rateItem({
      tmdb_id,
      content_type,
      media_type,
      rating: currentRating,
      is_unfavorable: true
    })
  }

  const addToWatchlist = async (
    tmdb_id: number, 
    content_type: 'trending' | 'coming_soon', 
    media_type: 'movie' | 'tv',
    currentRating = 7
  ) => {
    return await rateItem({
      tmdb_id,
      content_type,
      media_type,
      rating: currentRating,
      is_watchlisted: true
    })
  }

  // Rating display helpers
  const getRatingColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-500'
    if (rating >= 6) return 'text-yellow-500'
    if (rating >= 4) return 'text-orange-500'
    return 'text-red-500'
  }

  const getRatingEmoji = (rating: number): string => {
    if (rating >= 9) return '🔥'
    if (rating >= 8) return '⭐'
    if (rating >= 7) return '👍'
    if (rating >= 6) return '👌'
    if (rating >= 5) return '😐'
    if (rating >= 3) return '👎'
    return '💩'
  }

  const getMoodEmoji = (mood: string): string => {
    switch (mood) {
      case 'excited': return '🤩'
      case 'interested': return '😊'
      case 'neutral': return '😐'
      case 'disappointed': return '😞'
      case 'avoid': return '🚫'
      default: return '❓'
    }
  }

  const formatRatingText = (rating: number): string => {
    return `${rating.toFixed(1)}/10`
  }

  return {
    // Core rating functions
    rateItem,
    getMyRating,
    getNotableItems,
    getUnfavorableItems,
    getWatchlist,
    getMyRatings,
    removeRating,
    
    // Quick actions
    markAsNotable,
    markAsUnfavorable,
    addToWatchlist,
    
    // Display helpers
    getRatingColor,
    getRatingEmoji,
    getMoodEmoji,
    formatRatingText
  }
}
