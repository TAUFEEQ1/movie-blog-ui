<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:book-open" class="w-5 h-5 text-purple-600" />
        Recent Journal Entries
      </h2>
      <NuxtLink to="/journal" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
        View All
      </NuxtLink>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="border border-gray-100 rounded-lg p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-12 h-16 bg-gray-200 rounded flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Entries List -->
    <div v-else-if="recentEntries.length > 0" class="space-y-4">
      <div 
        v-for="entry in recentEntries" 
        :key="entry.id"
        class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        @click="openEntry(entry)"
      >
        <div class="flex items-start gap-3">
          <img 
            :src="getImageUrl(entry.media_item?.poster_path)"
            :alt="entry.media_item?.title || 'Movie poster'"
            class="w-12 h-16 object-cover rounded flex-shrink-0"
            @error="handleImageError"
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-medium text-gray-900 truncate">
                  {{ entry.title || entry.media_item?.title }}
                  <span v-if="entry.media_item?.type === 'tv_series' && entry.season_number" 
                        class="text-purple-600 font-semibold">
                    - Season {{ entry.season_number }}
                  </span>
                </h3>
                <p class="text-sm text-gray-500">
                  {{ entry.media_item?.type === 'tv_series' ? 'TV Series' : 'Movie' }}
                  {{ entry.media_item?.releaseDate ? ` • ${new Date(entry.media_item.releaseDate).getFullYear()}` : '' }}
                </p>
              </div>
              <div v-if="entry.my_rating" class="flex items-center gap-1 text-sm text-gray-500">
                <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                <span>{{ entry.my_rating }}</span>
              </div>
            </div>
            
            <p v-if="entry.notes_reflections" class="text-sm text-gray-700 line-clamp-2 mb-2">
              {{ entry.notes_reflections }}
            </p>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ formatDate(entry.updated_at) }}</span>
              <span class="px-2 py-1 rounded-full text-xs" :class="getStatusClass(entry.watch_status)">
                {{ getStatusLabel(entry.watch_status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <Icon name="mdi:book-open-outline" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 mb-4">No journal entries yet</p>
      <button 
        @click="quickAdd"
        class="text-purple-600 hover:text-purple-700 font-medium"
      >
        Create your first entry
      </button>
    </div>
    
    <!-- Quick Add Button -->
    <button 
      v-if="recentEntries.length > 0"
      @click="quickAdd"
      class="w-full mt-4 p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
    >
      <Icon name="mdi:plus" class="w-5 h-5" />
      Add New Entry
    </button>
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
  total_episodes?: number
  notes_reflections?: string
  media_item: MediaItem
  user: any
  created_at: string
  updated_at: string
}

const emit = defineEmits(['entry-updated', 'status-changed'])

const config = useRuntimeConfig()
const { user } = useAuth()

// State
const recentEntries = ref<JournalEntry[]>([])
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

// Fetch recent journal entries
const fetchRecentEntries = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await strapiCall('/journal-entries', {
      method: 'GET',
      query: {
        'populate[media_item]': true,
        'populate[user]': true,
        // Temporarily commented out user filter until existing entries have user relationships
        // 'filters[user][id]': user.value.id,
        sort: 'updatedAt:desc',
        'pagination[limit]': 3 // Only get the 3 most recent entries
      }
    }) as { data: JournalEntry[] }
    
    recentEntries.value = response.data || []
  } catch (error) {
    console.error('Error fetching recent journal entries:', error)
    recentEntries.value = []
  } finally {
    loading.value = false
  }
}

// Helper functions
const getImageUrl = (posterPath: string | null) => {
  if (!posterPath) return '/default-poster.jpg'
  if (posterPath.startsWith('http')) return posterPath
  return `https://image.tmdb.org/t/p/w200${posterPath}`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric'
  }).format(new Date(dateString))
}

const getStatusClass = (status: string) => {
  const statusClasses = {
    'planned_to_watch': 'bg-blue-100 text-blue-700',
    'paused': 'bg-yellow-100 text-yellow-700',
    'watched': 'bg-green-100 text-green-700',
    'rewatched': 'bg-purple-100 text-purple-700',
    'dropped': 'bg-red-100 text-red-700'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const statusLabels = {
    'planned_to_watch': 'Planned',
    'paused': 'Paused',
    'watched': 'Watched',
    'rewatched': 'Rewatched',
    'dropped': 'Dropped'
  }
  return statusLabels[status as keyof typeof statusLabels] || status
}

const openEntry = (entry: JournalEntry) => {
  // Navigate to journal page with the entry selected or open a modal
  navigateTo(`/journal?entry=${entry.id}`)
}

const quickAdd = () => {
  // Navigate to journal page to add a new entry
  navigateTo('/journal?add=true')
}

// Lifecycle
onMounted(() => {
  fetchRecentEntries()
})

// Watch for user changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchRecentEntries()
  } else {
    recentEntries.value = []
  }
})

// Expose refetch method for parent components
defineExpose({
  refetch: fetchRecentEntries
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
