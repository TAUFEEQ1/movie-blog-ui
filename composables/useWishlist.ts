export interface WishlistItem {
  id: number
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
  priority: 'low' | 'medium' | 'high'
  wish_status: 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'
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

export interface AddToWishlistData {
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
  wish_status?: 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped'
  // tags?: number[] // Shelved for now
}

export const useWishlist = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  // State
  const wishlistItems = ref<WishlistItem[]>([])
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

  // Fetch user's wishlist
  const fetchWishlist = async () => {
    try {
      isLoading.value = true
      error.value = ''
      
      const response = await apiCall('/wishlists') as any
      wishlistItems.value = response.data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch wishlist'
      console.error('Error fetching wishlist:', err)
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

  // Add item to wishlist
  const addToWishlist = async (itemData: AddToWishlistData): Promise<WishlistItem> => {
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
      wishlistItems.value.push(newItem)
      
      return newItem
    } catch (err: any) {
      error.value = err.message || 'Failed to add item to wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove item from wishlist by ID
  const removeFromWishlist = async (id: number) => {
    try {
      isLoading.value = true
      error.value = ''

      await apiCall(`/wishlists/${id}`, {
        method: 'DELETE'
      })

      wishlistItems.value = wishlistItems.value.filter(item => item.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item from wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove item from wishlist by TMDB ID
  const removeFromWishlistByTmdbId = async (tmdbId: number) => {
    try {
      isLoading.value = true
      error.value = ''

      await apiCall(`/wishlists/tmdb/${tmdbId}`, {
        method: 'DELETE'
      })

      wishlistItems.value = wishlistItems.value.filter(item => item.tmdb_id !== tmdbId)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove item from wishlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Check if item exists in wishlist
  const checkInWishlist = async (tmdbId: number): Promise<{ exists: boolean; item?: WishlistItem }> => {
    try {
      const response = await apiCall(`/wishlists/check/${tmdbId}`) as any
      return response
    } catch (err: any) {
      console.error('Error checking wishlist:', err)
      return { exists: false }
    }
  }

  // Update wishlist item
  const updateWishlistItem = async (id: number, updates: Partial<AddToWishlistData>) => {
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
      const index = wishlistItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        wishlistItems.value[index] = updatedItem
      }

      return updatedItem
    } catch (err: any) {
      error.value = err.message || 'Failed to update wishlist item'
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

  // Get wishlist stats
  const getWishlistStats = computed(() => {
    const stats = {
      total: wishlistItems.value.length,
      wantToWatch: 0,
      watching: 0,
      completed: 0,
      onHold: 0,
      dropped: 0,
      movies: 0,
      tvShows: 0,
      highPriority: 0
    }

    wishlistItems.value.forEach(item => {
      // Status counts
      stats[item.wish_status.replace('_', '') as keyof typeof stats]++
      
      // Type counts
      if (item.type === 'movie') stats.movies++
      else stats.tvShows++
      
      // Priority counts
      if (item.priority === 'high') stats.highPriority++
    })

    return stats
  })

  // Filter wishlist items
  const filterWishlistItems = (filters: {
    wish_status?: string
    type?: string
    priority?: string
    // tags?: number[] // Shelved for now
    search?: string
  }) => {
    let filtered = [...wishlistItems.value]

    if (filters.wish_status) {
      filtered = filtered.filter(item => item.wish_status === filters.wish_status)
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

  return {
    // State
    wishlistItems: readonly(wishlistItems),
    // userTags: readonly(userTags), // Shelved for now
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Actions
    fetchWishlist,
    // fetchTags, // Shelved for now
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByTmdbId,
    checkInWishlist,
    updateWishlistItem,
    // createTag, // Shelved for now
    // searchTags, // Shelved for now
    
    // Computed
    getWishlistStats,
    filterWishlistItems
  }
}
