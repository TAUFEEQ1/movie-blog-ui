import axios from 'axios'

export interface WatchlistItem {
  id: number
  tmdb_id: number
  documentId: string // Unique identifier for Strapi
  title: string
  type: 'movie' | 'tv'
  poster_path?: string
  backdrop_path?: string
  tmdb_rating?: number
  release_year?: number
  overview?: string
  genres?: string[]
  notes?: string
  priority: 'low' | 'medium' | 'high'
  watch_status: 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'
  date_added: string
  watched_date?: string
  is_active: boolean
  // tags?: Tag[] // Shelved for now
  user?: any
}

export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  description?: string
  usage_count: number
  user?: any
}

export interface AddToWatchlistData {
  tmdb_id: number
  title: string
  type: 'movie' | 'tv'
  poster_path?: string
  backdrop_path?: string
  tmdb_rating?: number
  release_year?: number
  overview?: string
  genres?: string[]
  notes?: string
  priority?: 'low' | 'medium' | 'high'
  watch_status?: 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'
  // tags?: number[] // Shelved for now
}

export interface NetflixImportResponse {
  imported: number;
  items: WatchlistItem[];
}

export const useWatchlist = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  // State
  const watchlistItems = ref<WatchlistItem[]>([])
  const userTags = ref<Tag[]>([])
  const isLoading = ref(false)
  const error = ref('')

  // API call helper
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    try {
      return await $fetch(`${strapiUrl}/api${endpoint}`, {
        headers,
        ...options
      })
    } catch (err: any) {
      console.error('API call failed:', err)
      throw err
    }
  }

  // Fetch user's watchlist
  const fetchWatchlist = async () => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await apiCall('/wishlists') as any
      watchlistItems.value = response.data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch watchlist'
      console.error('Error fetching watchlist:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch user's tags
  const fetchTags = async () => {
    try {
      const response = await apiCall('/tags') as any
      userTags.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching tags:', err)
    }
  }

  // Add item to watchlist
  const addToWatchlist = async (itemData: AddToWatchlistData): Promise<WatchlistItem> => {
    try {
      isLoading.value = true
      error.value = ''

      const response = await apiCall('/wishlists', {
        method: 'POST',
        body: {
          data: itemData
        }
      }) as any

      const newItem = response.data
      watchlistItems.value.push(newItem)
      
      return newItem
    } catch (err: any) {
      error.value = err.message || 'Failed to add item to watchlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove item from watchlist by ID
  const removeFromWatchlist = async (documentId: string) => {
    try {
      isLoading.value = true
      error.value = ''

      await apiCall(`/wishlists/${documentId}`, {
        method: 'DELETE'
      })

      watchlistItems.value = watchlistItems.value.filter(item => item.documentId !== documentId)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item from watchlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove item from watchlist by TMDB ID
  const removeFromWatchlistByTmdbId = async (tmdbId: number) => {
    try {
      isLoading.value = true
      error.value = ''

      await apiCall(`/wishlists/tmdb/${tmdbId}`, {
        method: 'DELETE'
      })

      watchlistItems.value = watchlistItems.value.filter(item => item.tmdb_id !== tmdbId)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item from watchlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Check if item exists in watchlist
  const checkInWatchlist = async (tmdbId: number): Promise<{ exists: boolean; item?: WatchlistItem }> => {
    try {
      const response = await apiCall(`/wishlists/check/${tmdbId}`) as any
      return response
    } catch (err: any) {
      console.error('Error checking watchlist:', err)
      return { exists: false }
    }
  }

  // Update watchlist item
  const updateWatchlistItem = async (id: number, updates: Partial<AddToWatchlistData>) => {
    try {
      isLoading.value = true
      error.value = ''

      const response = await apiCall(`/wishlists/${id}`, {
        method: 'PUT',
        body: {
          data: updates
        }
      }) as any

      const updatedItem = response.data
      const index = watchlistItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        watchlistItems.value[index] = updatedItem
      }

      return updatedItem
    } catch (err: any) {
      error.value = err.message || 'Failed to update watchlist item'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create new tag
  const createTag = async (tagData: { name: string; color?: string; description?: string }): Promise<Tag> => {
    try {
      const response = await apiCall('/tags', {
        method: 'POST',
        body: {
          data: {
            name: tagData.name,
            color: tagData.color || '#3B82F6',
            description: tagData.description || ''
          }
        }
      }) as any

      const newTag = response.data
      userTags.value.push(newTag)
      
      return newTag
    } catch (err: any) {
      error.value = err.message || 'Failed to create tag'
      throw err
    }
  }

  // Search tags
  const searchTags = async (query: string): Promise<Tag[]> => {
    try {
      const response = await apiCall(`/tags/search?q=${encodeURIComponent(query)}`) as any
      return response.data || []
    } catch (err: any) {
      console.error('Error searching tags:', err)
      return []
    }
  }

  // Get watchlist stats
  const getWatchlistStats = computed(() => {
    const stats = {
      total: watchlistItems.value.length,
      wantToWatch: 0,
      watching: 0,
      completed: 0,
      onHold: 0,
      dropped: 0,
      movies: 0,
      tvShows: 0,
      highPriority: 0
    }

    watchlistItems.value.forEach(item => {
      // Status counts
      stats[item.watch_status.replace('_', '') as keyof typeof stats]++
      
      // Type counts
      if (item.type === 'movie') stats.movies++
      else stats.tvShows++
      
      // Priority counts
      if (item.priority === 'high') stats.highPriority++
    })

    return stats
  })

  // Filter watchlist items
  const filterWatchlistItems = (filters: {
    watch_status?: string
    type?: string
    priority?: string
    // tags?: number[] // Shelved for now
    search?: string
  }) => {
    let filtered = [...watchlistItems.value]

    if (filters.watch_status) {
      filtered = filtered.filter(item => item.watch_status === filters.watch_status)
    }

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    if (filters.priority) {
      filtered = filtered.filter(item => item.priority === filters.priority)
    }

    // Tags filtering shelved for now
    // if (filters.tags && filters.tags.length > 0) {
    //   filtered = filtered.filter(item => 
    //     item.tags?.some(tag => filters.tags!.includes(tag.id))
    //   )
    // }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.overview?.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }

  // Upload Netflix watchlist CSV file
  const uploadNetflixWatchlist = async (file: File): Promise<NetflixImportResponse> => {
    if (!token.value) throw new Error('Not authenticated')
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    const formData = new FormData()
    formData.append('files.file', file)
    const response = await axios.post<NetflixImportResponse>(
      `${strapiUrl}/api/wishlists/import-netflix-watchlist`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  return {
    // State
    watchlistItems: readonly(watchlistItems),
    // userTags: readonly(userTags), // Shelved for now
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Actions
    fetchWatchlist,
    // fetchTags, // Shelved for now
    addToWatchlist,
    removeFromWatchlist,
    removeFromWatchlistByTmdbId,
    checkInWatchlist,
    updateWatchlistItem,
    // createTag, // Shelved for now
    // searchTags, // Shelved for now
    uploadNetflixWatchlist,

    // Computed
    getWatchlistStats,
    filterWatchlistItems
  }
}
