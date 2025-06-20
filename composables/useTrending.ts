export interface TrendingItem {
  id: number
  title: string
  tmdb_id: number
  type: 'movie' | 'tv'
  platform: string
  tmdb_rating?: number
  tmdb_vote_count?: number
  genres?: string[]
  poster_path?: string
  backdrop_path?: string
  release_year?: number
  release_date?: string
  trailer_url?: string
  overview?: string
  runtime?: number
  language?: string
  popularity?: number
  trending_score?: number
  trending_rank?: number
  is_active: boolean
  expires_at?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface TrendingFilters {
  type?: 'movie' | 'tv'
  platform?: string
  limit?: number
}

export const useTrending = () => {
  const config = useRuntimeConfig()
  
  // Direct API calls to Strapi
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    return await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
  }

  // Get active trending items
  const getActiveTrending = async (filters: TrendingFilters = {}): Promise<TrendingItem[]> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.platform) params.append('platform', filters.platform)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const queryString = params.toString()
      const endpoint = `/trendings/active${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint)
      return response as TrendingItem[]
    } catch (error) {
      console.error('Error fetching active trending items:', error)
      return []
    }
  }

  // Get trending items by platform
  const getTrendingByPlatform = async (platform: string, filters: Omit<TrendingFilters, 'platform'> = {}): Promise<TrendingItem[]> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const queryString = params.toString()
      const endpoint = `/trendings/platform/${platform}${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint)
      return response as TrendingItem[]
    } catch (error) {
      console.error(`Error fetching trending items for platform ${platform}:`, error)
      return []
    }
  }

  // Get all trending items (with pagination)
  const getAllTrending = async (filters: TrendingFilters & { page?: number, pageSize?: number } = {}): Promise<{
    data: TrendingItem[]
    meta: {
      pagination: {
        page: number
        pageSize: number
        pageCount: number
        total: number
      }
    }
  }> => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('filters[type][$eq]', filters.type)
      if (filters.platform) params.append('filters[platform][$eq]', filters.platform)
      if (filters.limit) params.append('pagination[pageSize]', filters.limit.toString())
      if (filters.page) params.append('pagination[page]', filters.page.toString())
      if (filters.pageSize) params.append('pagination[pageSize]', filters.pageSize.toString())
      
      // Add sorting
      params.append('sort[0]', 'trending_rank:asc')
      params.append('sort[1]', 'trending_score:desc')
      
      const queryString = params.toString()
      const endpoint = `/trendings${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as {
        data: TrendingItem[]
        meta: {
          pagination: {
            page: number
            pageSize: number
            pageCount: number
            total: number
          }
        }
      }
      return response
    } catch (error) {
      console.error('Error fetching all trending items:', error)
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 0,
            total: 0
          }
        }
      }
    }
  }

  // Transform trending item to match Movie interface used in UI
  const transformTrendingToMovie = (item: TrendingItem) => {
    const tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/w500'
    
    return {
      id: item.tmdb_id,
      title: truncateTitle(item.title, 60), // Truncate long titles for better UI display
      poster: item.poster_path ? `${tmdbImageBaseUrl}${item.poster_path}` : '',
      rating: item.tmdb_rating ? Number((item.tmdb_rating / 2).toFixed(1)) : 0, // Convert to 5-star rating
      genres: item.genres || [],
      year: item.release_year || new Date(item.release_date || '').getFullYear() || 0,
      duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '',
      trailerUrl: item.trailer_url || '',
      platform: item.platform,
      type: item.type,
      tmdb_id: item.tmdb_id
    }
  }

  // Utility function to truncate long titles
  const truncateTitle = (title: string, maxLength: number = 60): string => {
    if (!title) return ''
    
    // Simple truncation if title is too long
    if (title.length > maxLength) {
      const truncated = title.substring(0, maxLength)
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > maxLength * 0.7) {
        return truncated.substring(0, lastSpace) + '...'
      } else {
        return truncated + '...'
      }
    }
    
    return title
  }

  // Get trending movies formatted for UI
  const getTrendingMovies = async (limit: number = 10) => {
    const trendingItems = await getActiveTrending({ type: 'movie', limit })
    return trendingItems.map(transformTrendingToMovie)
  }

  // Get trending TV shows formatted for UI
  const getTrendingTVShows = async (limit: number = 10) => {
    const trendingItems = await getActiveTrending({ type: 'tv', limit })
    return trendingItems.map(transformTrendingToMovie)
  }

  // Get trending by platform formatted for UI
  const getTrendingByPlatformForUI = async (platform: string, limit: number = 10) => {
    const trendingItems = await getTrendingByPlatform(platform, { limit })
    return trendingItems.map(transformTrendingToMovie)
  }

  return {
    getActiveTrending,
    getTrendingByPlatform,
    getAllTrending,
    getTrendingMovies,
    getTrendingTVShows,
    getTrendingByPlatformForUI,
    transformTrendingToMovie,
    truncateTitle
  }
}
