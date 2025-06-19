<template>
  <div class="bg-white rounded-2xl p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6">Continue watching</h3>
    
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-3 rounded-xl animate-pulse">
        <div class="w-20 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="w-12 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    <!-- Paused Entries -->
    <div v-else-if="pausedEntries.length > 0" class="space-y-4">
      <div 
        v-for="entry in pausedEntries" 
        :key="entry.id"
        class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
        @click="resumeWatching(entry)"
      >
        <!-- Thumbnail -->
        <div class="relative flex-shrink-0">
          <img 
            :src="getImageUrl(entry.media_item?.poster_path)"
            :alt="entry.media_item?.title || 'Movie poster'"
            class="w-20 h-12 object-cover rounded-lg"
            @error="handleImageError"
          />
          <!-- Play Button -->
          <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all">
            <Icon name="mdi:play" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <!-- Status indicator -->
          <div class="absolute top-1 right-1">
            <span class="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded">
              Paused
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 truncate">
            {{ entry.title || entry.media_item?.title }}
          </h4>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>Movie</span>
            <span v-if="entry.media_item?.releaseDate">•</span>
            <span v-if="entry.media_item?.releaseDate">{{ new Date(entry.media_item.releaseDate).getFullYear() }}</span>
          </div>
          <div v-if="entry.notes_reflections" class="text-xs text-gray-400 truncate mt-1">
            {{ entry.notes_reflections }}
          </div>
        </div>

        <!-- Action Info -->
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-medium text-gray-900">Resume</div>
          <div class="text-xs text-gray-500">
            {{ formatDate(entry.updated_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else
      class="text-center py-8"
    >
      <Icon name="mdi:play-circle-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No paused movies</p>
      <p class="text-sm text-gray-400 mt-1">Mark movie entries as "Paused" in your journal to see them here</p>
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
  notes_reflections?: string
  media_item: MediaItem
  user: any
  created_at: string
  updated_at: string
}

const emit = defineEmits(['resume-watching'])

const config = useRuntimeConfig()
const { user } = useAuth()

// State
const pausedEntries = ref<JournalEntry[]>([])
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

// Fetch paused movie entries (not TV series)
const fetchPausedEntries = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await strapiCall('/journal-entries', {
      method: 'GET',
      query: {
        'populate[media_item]': true,
        'populate[user]': true,
        'filters[watch_status]': 'paused',
        'filters[media_item][type]': 'movies', // Only movies, not TV series
        // Temporarily commented out user filter until existing entries have user relationships
        // 'filters[user][id]': user.value.id,
        sort: 'updatedAt:desc',
        'pagination[limit]': 10 // Get up to 10 paused movie entries
      }
    }) as { data: JournalEntry[] }
    
    pausedEntries.value = response.data || []
  } catch (error) {
    console.error('Error fetching paused movie entries:', error)
    pausedEntries.value = []
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

const resumeWatching = (entry: JournalEntry) => {
  emit('resume-watching', entry)
  // Navigate to journal page with the entry selected
  navigateTo(`/journal?entry=${entry.id}`)
}

// Lifecycle
onMounted(() => {
  fetchPausedEntries()
})

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchPausedEntries()
  } else {
    pausedEntries.value = []
  }
})

// Expose refetch method for parent components
defineExpose({
  refetch: fetchPausedEntries
})
</script>
