export interface TMDBSearchResult {
  id: number
  title?: string // for movies
  name?: string // for TV shows
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string // for movies
  first_air_date?: string // for TV shows
  vote_average: number
  vote_count: number
  media_type: 'movie' | 'tv' | 'person'
  genre_ids: readonly number[]
  popularity: number
  adult?: boolean
  original_language: string
  original_title?: string // for movies
  original_name?: string // for TV shows
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBSearchResult[]
  total_pages: number
  total_results: number
}

export interface SearchFilters {
  type?: 'movie' | 'tv' | 'person' | 'multi'
  year?: number
  language?: string
  region?: string
  include_adult?: boolean
}

export const useSearch = () => {
  const config = useRuntimeConfig()
  const { user, token } = useAuth()

  // Search state
  const searchResults = ref<TMDBSearchResult[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)
  const currentQuery = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalResults = ref(0)

  // Debounce timer
  let searchTimeout: NodeJS.Timeout

  // API call helper
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (user.value && token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    
    return await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers,
      ...options
    })
  }

  // Search movies and TV shows
  const searchContent = async (
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1
  ): Promise<TMDBSearchResponse> => {
    if (!query.trim()) {
      throw new Error('Search query is required')
    }

    isSearching.value = true
    searchError.value = null
    currentQuery.value = query
    currentPage.value = page

    try {
      // Add deliberate delay to avoid overwhelming TMDB API
      await new Promise(resolve => setTimeout(resolve, 300))

      const params = new URLSearchParams()
      params.append('query', query.trim())
      params.append('page', page.toString())
      
      if (filters.type && filters.type !== 'multi') {
        params.append('type', filters.type)
      }
      
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      
      if (filters.language) {
        params.append('language', filters.language)
      }
      
      if (filters.region) {
        params.append('region', filters.region)
      }
      
      if (filters.include_adult !== undefined) {
        params.append('include_adult', filters.include_adult.toString())
      }

      const queryString = params.toString()
      const endpoint = `/journal-entries/tmdb/search${queryString ? `?${queryString}` : ''}`

      const response = await apiCall(endpoint) as any
      
      // Handle Strapi response format (data array with meta)
      const results = response.data || []
      const meta = response.meta?.pagination || {}
      
      // Transform the response to ensure consistent data structure
      const transformedResults = results.map((item: any) => ({
        ...item,
        title: item.title || item.name,
        name: item.title || item.name,
        release_date: item.release_date || item.first_air_date,
        first_air_date: item.release_date || item.first_air_date,
        media_type: item.type,
        poster_path: item.poster_url ? item.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
        backdrop_path: item.backdrop_url ? item.backdrop_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
        vote_average: item.rating,
        vote_count: item.vote_count,
        genre_ids: [],
        popularity: Math.round(Math.random() * 1000),
        adult: false,
        original_language: item.original_language,
        original_title: item.original_title,
        original_name: item.original_title,
        overview: item.overview
      }))

      const searchResponse: TMDBSearchResponse = {
        page: meta.page || page,
        results: transformedResults,
        total_pages: meta.totalPages || 1,
        total_results: meta.total || transformedResults.length
      }

      // Update reactive state
      if (page === 1) {
        searchResults.value = searchResponse.results
      } else {
        searchResults.value.push(...searchResponse.results)
      }
      
      totalPages.value = searchResponse.total_pages
      totalResults.value = searchResponse.total_results

      return searchResponse
    } catch (error: any) {
      console.error('Error searching content:', error)
      searchError.value = error.message || 'Failed to search content'
      
      // Return empty results on error
      const emptyResponse: TMDBSearchResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      }
      
      if (page === 1) {
        searchResults.value = []
      }
      
      return emptyResponse
    } finally {
      isSearching.value = false
    }
  }

  // Debounced search
  const debouncedSearch = (
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1,
    delay: number = 500
  ) => {
    clearTimeout(searchTimeout)
    
    searchTimeout = setTimeout(() => {
      searchContent(query, filters, page)
    }, delay)
  }

  // Load more results (pagination)
  const loadMoreResults = async (filters: SearchFilters = {}) => {
    if (!currentQuery.value || currentPage.value >= totalPages.value || isSearching.value) {
      return
    }

    await searchContent(currentQuery.value, filters, currentPage.value + 1)
  }

  // Clear search results
  const clearSearch = () => {
    searchResults.value = []
    currentQuery.value = ''
    currentPage.value = 1
    totalPages.value = 0
    totalResults.value = 0
    searchError.value = null
    clearTimeout(searchTimeout)
  }

  // Get poster URL
  const getPosterUrl = (posterPath: string | null, size: string = 'w500'): string => {
    if (!posterPath) return '/default-poster.jpg'
    return `https://image.tmdb.org/t/p/${size}${posterPath}`
  }

  // Get backdrop URL
  const getBackdropUrl = (backdropPath: string | null, size: string = 'w1280'): string => {
    if (!backdropPath) return '/default-backdrop.jpg'
    return `https://image.tmdb.org/t/p/${size}${backdropPath}`
  }

  // Format release year
  const getReleaseYear = (item: TMDBSearchResult): string => {
    const date = item.release_date || item.first_air_date
    if (!date) return 'N/A'
    return new Date(date).getFullYear().toString()
  }

  // Get display title
  const getDisplayTitle = (item: TMDBSearchResult): string => {
    return item.title || item.name || 'Unknown Title'
  }

  // Fetch trailer URL for a specific item
  const fetchTrailerUrl = async (item: TMDBSearchResult): Promise<string | null> => {
    try {
      const endpoint = `/journal-entries/tmdb/details/${item.media_type}/${item.id}`
      const response = await apiCall(endpoint) as any
      
      if (response.data && response.data.trailer_url) {
        return response.data.trailer_url
      }
      
      return null
    } catch (error) {
      console.error('Error fetching trailer:', error)
      return null
    }
  }

  return {
    // State
    searchResults: readonly(searchResults),
    isSearching: readonly(isSearching),
    searchError: readonly(searchError),
    currentQuery: readonly(currentQuery),
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalResults: readonly(totalResults),
    
    // Methods
    searchContent,
    debouncedSearch,
    loadMoreResults,
    clearSearch,
    getPosterUrl,
    getBackdropUrl,
    getReleaseYear,
    getDisplayTitle,
    fetchTrailerUrl
  }
}
