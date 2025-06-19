<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:pause-circle" class="w-5 h-5 text-orange-600" />
        Paused Shows
      </h2>
      <div v-if="!loading" class="text-sm text-gray-500">{{ pausedShows.length }} shows</div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="border border-gray-100 rounded-lg p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-12 h-16 bg-gray-200 rounded flex-shrink-0"></div>
          <div class="flex-1 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-2 bg-gray-200 rounded w-full"></div>
            <div class="flex gap-2">
              <div class="h-6 bg-gray-200 rounded w-16"></div>
              <div class="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Paused Shows -->
    <div v-else-if="pausedShows.length > 0" class="space-y-4">
      <div 
        v-for="show in pausedShows" 
        :key="show.id"
        class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <img 
            :src="getImageUrl(show.media_item?.poster_path)" 
            :alt="show.title || show.media_item?.title"
            class="w-12 h-16 object-cover rounded flex-shrink-0"
            @error="handleImageError"
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ show.title || show.media_item?.title }}
                  <span v-if="show.season_number" class="text-purple-600 font-semibold">
                    - Season {{ show.season_number }}
                  </span>
                </h3>
                <p class="text-sm text-gray-500">
                  TV Series
                  <span v-if="show.media_item?.releaseDate">
                    • {{ new Date(show.media_item.releaseDate).getFullYear() }}
                  </span>
                </p>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(show.updated_at) }}
              </div>
            </div>
            
            <div v-if="show.notes_reflections" class="text-sm text-gray-600 mb-3 italic">
              "{{ show.notes_reflections }}"
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="continueWatching(show)"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                <Icon name="mdi:play" class="w-4 h-4" />
                Continue
              </button>
              <button 
                @click="editShow(show)"
                class="flex items-center gap-1 border border-gray-200 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors"
              >
                <Icon name="mdi:pencil" class="w-4 h-4" />
                Edit
              </button>
              <button 
                @click="dropShow(show)"
                class="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                <Icon name="mdi:close" class="w-4 h-4" />
                Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <Icon name="mdi:television-play" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>No paused shows</p>
      <p class="text-sm">All caught up! 🎉</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  id: number
  documentId?: string
  title: string
  type: 'movies' | 'tv_series'
  poster_path: string
  releaseDate: string
  trailerUrl?: string
}

interface JournalEntry {
  id: number
  documentId?: string
  title?: string
  watch_status: 'watched' | 'rewatched' | 'planned_to_watch' | 'dropped' | 'paused'
  my_rating?: number
  watched_date?: string
  start_date?: string
  end_date?: string
  season_number?: number
  episode?: number
  notes_reflections?: string
  media_item: MediaItem
  user: any
  created_at: string
  updated_at: string
}

const emit = defineEmits(['resume-show', 'status-updated', 'edit-show'])

const config = useRuntimeConfig()
const { user } = useAuth()

// State
const pausedShows = ref<JournalEntry[]>([])
const loading = ref(false)

// Helper function for API calls
const strapiCall = async (endpoint: string, options: any = {}) => {
  const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
  const token = useState<string | null>('auth.token')
  
  return await $fetch(`${strapiUrl}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token.value && { Authorization: `Bearer ${token.value}` }),
      ...options.headers
    },
    ...options
  })
}

// Fetch paused TV series entries
const fetchPausedShows = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await strapiCall('/journal-entries', {
      method: 'GET',
      query: {
        'populate[media_item]': true,
        'populate[user]': true,
        'filters[watch_status]': 'paused',
        'filters[media_item][type]': 'tv_series', // Only TV series, not movies
        // Temporarily commented out user filter until existing entries have user relationships
        // 'filters[user][id]': user.value.id,
        sort: 'updatedAt:desc',
        'pagination[limit]': 10 // Get up to 10 paused TV series entries
      }
    }) as { data: JournalEntry[] }
    
    pausedShows.value = response.data || []
  } catch (error) {
    console.error('Error fetching paused TV series entries:', error)
    pausedShows.value = []
  } finally {
    loading.value = false
  }
}

// Helper functions
const getImageUrl = (posterPath: string | null) => {
  if (!posterPath) {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    return `${strapiUrl}/uploads/default_image_312eed5d3f.png`
  }
  if (posterPath.startsWith('http')) return posterPath
  return `https://image.tmdb.org/t/p/w200${posterPath}`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
  target.src = `${strapiUrl}/uploads/default_image_312eed5d3f.png`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric'
  }).format(new Date(dateString))
}

const continueWatching = (show: JournalEntry) => {
  emit('resume-show', show)
  // Navigate to journal page with the entry selected
  navigateTo(`/journal?entry=${show.id}`)
}

const editShow = (show: JournalEntry) => {
  emit('edit-show', show)
  // Navigate to journal page with the entry selected for editing
  navigateTo(`/journal?entry=${show.id}`)
}

const dropShow = async (show: JournalEntry) => {
  if (!confirm(`Are you sure you want to drop "${show.title || show.media_item?.title}"?`)) {
    return
  }
  
  try {
    await strapiCall(`/journal-entries/${show.documentId}`, {
      method: 'PUT',
      body: {
        data: {
          watch_status: 'dropped'
        }
      }
    })
    
    // Remove from local state
    pausedShows.value = pausedShows.value.filter(s => s.id !== show.id)
    emit('status-updated', { ...show, watch_status: 'dropped' })
  } catch (error) {
    console.error('Error dropping show:', error)
    alert('Failed to drop show. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  fetchPausedShows()
})

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchPausedShows()
  } else {
    pausedShows.value = []
  }
})

// Expose refetch method for parent components
defineExpose({
  refetch: fetchPausedShows
})
</script>
