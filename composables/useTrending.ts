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
  const { user, token } = useAuth()
  
  // Mock data for testing
  const mockTrendingData: TrendingItem[] = [
    {
      id: 1,
      title: "Titan: The OceanGate Disaster",
      tmdb_id: 1184918,
      type: "movie",
      platform: "Netflix",
      tmdb_rating: 7.1,
      tmdb_vote_count: 234,
      genres: ["Documentary", "Drama"],
      poster_path: "/pzc7S7NzSeKG3VCXxGClFD5BQ5K.jpg",
      backdrop_path: "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
      release_year: 2024,
      release_date: "2024-06-18",
      trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      overview: "An in-depth look at the tragic OceanGate submersible incident that captivated the world in 2023.",
      runtime: 120,
      popularity: 89.5,
      trending_score: 95.2,
      trending_rank: 1,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Deadpool & Wolverine",
      tmdb_id: 533535,
      type: "movie",
      platform: "Theaters",
      tmdb_rating: 8.2,
      tmdb_vote_count: 15420,
      genres: ["Action", "Comedy", "Superhero"],
      poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
      release_year: 2024,
      release_date: "2024-07-26",
      trailer_url: "https://www.youtube.com/watch?v=73_1biulkYk",
      overview: "Deadpool and Wolverine team up in this highly anticipated superhero crossover.",
      runtime: 127,
      popularity: 95.8,
      trending_score: 98.5,
      trending_rank: 2,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "Stranger Things",
      tmdb_id: 66732,
      type: "tv",
      platform: "Netflix",
      tmdb_rating: 8.7,
      tmdb_vote_count: 12340,
      genres: ["Drama", "Fantasy", "Horror"],
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      release_year: 2016,
      release_date: "2016-07-15",
      trailer_url: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.",
      runtime: 50,
      popularity: 92.1,
      trending_score: 94.8,
      trending_rank: 3,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      title: "The Bear",
      tmdb_id: 136315,
      type: "tv",
      platform: "Hulu",
      tmdb_rating: 8.9,
      tmdb_vote_count: 5670,
      genres: ["Comedy", "Drama"],
      poster_path: "/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg",
      backdrop_path: "/zPIug5giU8oug6Xes5K1sTfQJxY.jpg",
      release_year: 2022,
      release_date: "2022-06-23",
      trailer_url: "https://www.youtube.com/watch?v=y-cqqAJIXhs",
      overview: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.",
      runtime: 30,
      popularity: 86.4,
      trending_score: 93.2,
      trending_rank: 4,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      title: "The Batman",
      tmdb_id: 414906,
      type: "movie",
      platform: "HBO Max",
      tmdb_rating: 7.8,
      tmdb_vote_count: 8950,
      genres: ["Action", "Crime", "Drama"],
      poster_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
      backdrop_path: "/qqHQsStV6exghCM7zbObuYBiYxw.jpg",
      release_year: 2022,
      release_date: "2022-03-04",
      trailer_url: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
      overview: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
      runtime: 176,
      popularity: 78.2,
      trending_score: 89.7,
      trending_rank: 5,
      is_active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
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
      console.error('Error fetching trending by platform, using mock data:', error)
      
      // Filter mock data by platform
      let filteredData = [...mockTrendingData].filter(item => item.platform === platform)
      
      if (filters.type) {
        filteredData = filteredData.filter(item => item.type === filters.type)
      }
      
      if (filters.limit) {
        filteredData = filteredData.slice(0, filters.limit)
      }
      
      return filteredData
    }
  }

  // Get all trending items (with pagination)
  const getAllTrending = async (filters: TrendingFilters & { page?: number, pageSize?: number, forceApi?: boolean } = {}): Promise<{
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
      // Try to fetch from API first (public endpoint), fallback to mock data if it fails
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
      
      // Try public API call first
      try {
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
        
        if (response && response.data && response.data.length > 0) {
          console.log('Successfully fetched trending data from API')
          return response
        }
      } catch (apiError) {
        console.warn('API call failed, falling back to mock data:', apiError)
      }
      
      // Fallback to mock data if API fails or user is not authenticated
      console.log('Using mock data for all trending')
      
      // Filter mock data based on filters
      let filteredData = [...mockTrendingData]
      
      if (filters.type) {
        filteredData = filteredData.filter(item => item.type === filters.type)
      }
      
      if (filters.platform) {
        filteredData = filteredData.filter(item => item.platform === filters.platform)
      }
      
      // Apply pagination to mock data
      const page = filters.page || 1
      const pageSize = filters.pageSize || filters.limit || 20
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      return {
        data: paginatedData,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(filteredData.length / pageSize),
            total: filteredData.length
          }
        }
      }
    } catch (error) {
      console.error('Error in getAllTrending, using mock data:', error)
      
      // Filter mock data based on filters
      let filteredData = [...mockTrendingData]
      
      if (filters.type) {
        filteredData = filteredData.filter(item => item.type === filters.type)
      }
      
      if (filters.platform) {
        filteredData = filteredData.filter(item => item.platform === filters.platform)
      }
      
      // Apply pagination to mock data
      const page = filters.page || 1
      const pageSize = filters.pageSize || filters.limit || 20
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      return {
        data: paginatedData,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(filteredData.length / pageSize),
            total: filteredData.length
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
      rating: item.tmdb_rating ? Number(item.tmdb_rating.toFixed(1)) : 0, // Use raw TMDB rating
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
    const allTrending = await getAllTrending()
    const trendingMovies = allTrending.data.filter(item => item.type === 'movie').slice(0, limit)
    return trendingMovies.map(transformTrendingToMovie)
  }

  // Get trending by platform formatted for UI
  const getTrendingByPlatformForUI = async (platform: string, limit: number = 10) => {
    const trendingItems = await getTrendingByPlatform(platform, { limit })
    return trendingItems.map(transformTrendingToMovie)
  }

  return {
    getTrendingByPlatform,
    getAllTrending,
    getTrendingMovies,
    getTrendingByPlatformForUI,
    transformTrendingToMovie,
    truncateTitle
  }
}
