export interface ComingSoonItem {
  id: number
  title: string
  tmdb_id: number
  type: 'movie' | 'tv'
  platform?: string
  tmdb_rating?: number
  tmdb_vote_count?: number
  genres?: string[]
  poster_path?: string
  backdrop_path?: string
  release_date: string
  air_date?: string
  trailer_url?: string
  overview?: string
  runtime?: number
  language?: string
  popularity?: number
  anticipation_score?: number
  anticipation_rank?: number
  is_active: boolean
  expires_at?: string
  status?: 'announced' | 'in_production' | 'post_production' | 'rumored' | 'planned' | 'canceled'
  production_companies?: any[]
  cast?: any[]
  director?: string
  budget?: number
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface ComingSoonFilters {
  type?: 'movie' | 'tv'
  status?: 'announced' | 'in_production' | 'post_production' | 'rumored' | 'planned' | 'canceled'
  limit?: number
  sortBy?: 'release_date' | 'anticipation_score' | 'popularity' | 'tmdb_rating'
}

export interface ComingSoonByPeriodResponse {
  period: string
  startDate: string
  endDate: string
  items: ComingSoonItem[]
}

export const useComingSoon = () => {
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

  // Get all active coming soon items
  const getComingSoonItems = async (filters: ComingSoonFilters = {}): Promise<ComingSoonItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      
      const queryString = queryParams.toString()
      const endpoint = `/coming-soons${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching coming soon items:', error)
      return []
    }
  }

  // Get coming soon items by period
  const getComingSoonByPeriod = async (
    period: 'this-week' | 'this-month' | 'next-month' | 'this-year' | 'next-year',
    filters: Pick<ComingSoonFilters, 'type' | 'limit'> = {}
  ): Promise<ComingSoonByPeriodResponse | null> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      
      const queryString = queryParams.toString()
      const endpoint = `/coming-soons/by-period/${period}${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || null
    } catch (error) {
      console.error('Error fetching coming soon items by period:', error)
      return null
    }
  }

  // Get most anticipated items
  const getMostAnticipated = async (filters: Pick<ComingSoonFilters, 'type' | 'limit'> = {}): Promise<ComingSoonItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      
      const queryString = queryParams.toString()
      const endpoint = `/coming-soons/most-anticipated${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching most anticipated items:', error)
      return []
    }
  }

  // Get coming soon items by genre
  const getComingSoonByGenre = async (
    genre: string,
    filters: Pick<ComingSoonFilters, 'type' | 'limit'> = {}
  ): Promise<ComingSoonItem[]> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      
      const queryString = queryParams.toString()
      const endpoint = `/coming-soons/by-genre/${encodeURIComponent(genre)}${queryString ? `?${queryString}` : ''}`
      
      const response = await apiCall(endpoint) as any
      return response.data || response || []
    } catch (error) {
      console.error('Error fetching coming soon items by genre:', error)
      return []
    }
  }

  // Format release date
  const formatReleaseDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  // Get time until release
  const getTimeUntilRelease = (dateString: string): string => {
    try {
      const releaseDate = new Date(dateString)
      const now = new Date()
      const timeDiff = releaseDate.getTime() - now.getTime()
      
      if (timeDiff <= 0) {
        return 'Released'
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const months = Math.floor(days / 30)
      const years = Math.floor(days / 365)
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`
      } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`
      } else {
        return 'Today'
      }
    } catch (error) {
      return 'Unknown'
    }
  }

  // Get TMDB poster URL
  const getTmdbPosterUrl = (posterPath: string | undefined, size: string = 'w500'): string => {
    if (!posterPath) return '/default-poster.jpg'
    return `https://image.tmdb.org/t/p/${size}${posterPath}`
  }

  // Get TMDB backdrop URL
  const getTmdbBackdropUrl = (backdropPath: string | undefined, size: string = 'w1280'): string => {
    if (!backdropPath) return '/default-backdrop.jpg'
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`
  }

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'announced':
        return 'bg-blue-500'
      case 'in_production':
        return 'bg-yellow-500'
      case 'post_production':
        return 'bg-orange-500'
      case 'rumored':
        return 'bg-purple-500'
      case 'planned':
        return 'bg-green-500'
      case 'canceled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'announced':
        return 'Announced'
      case 'in_production':
        return 'In Production'
      case 'post_production':
        return 'Post-Production'
      case 'rumored':
        return 'Rumored'
      case 'planned':
        return 'Planned'
      case 'canceled':
        return 'Canceled'
      default:
        return 'Unknown'
    }
  }

  return {
    // API functions
    getComingSoonItems,
    getComingSoonByPeriod,
    getMostAnticipated,
    getComingSoonByGenre,
    
    // Utility functions
    formatReleaseDate,
    getTimeUntilRelease,
    getTmdbPosterUrl,
    getTmdbBackdropUrl,
    getStatusColor,
    getStatusLabel
  }
}
