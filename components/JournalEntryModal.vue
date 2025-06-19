<template>
  <Teleport to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      @click="closeModal"
    >
      <div 
        class="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">
            {{ entry ? 'Edit Journal Entry' : 'Add Journal Entry' }}
          </h2>
          <button 
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Media Search -->
          <div v-if="!entry">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search for Movie/TV Show
            </label>
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="searchMedia"
                type="text"
                placeholder="Type to search movies and TV shows..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Icon name="mdi:magnify" class="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              <div
                v-for="media in searchResults"
                :key="media.id"
                @click="selectMedia(media)"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <img 
                  :src="media.poster_path || '/default-poster.jpg'" 
                  :alt="media.title"
                  class="w-12 h-18 object-cover rounded"
                />
                <div>
                  <h4 class="font-medium text-gray-900">{{ media.title }}</h4>
                  <p class="text-sm text-gray-500">
                    {{ media.type === 'tv_series' ? 'TV Series' : 'Movie' }} • {{ new Date(media.releaseDate).getFullYear() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && searchResults.length === 0 && !searching" class="mt-2 p-3 text-center text-gray-500">
              No results found. <button type="button" @click="showAddMedia = true" class="text-blue-600 hover:text-blue-700">Add manually</button>
            </div>
          </div>

          <!-- Selected Media -->
          <div v-if="selectedMedia" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              :src="selectedMedia.poster_path || '/default-poster.jpg'" 
              :alt="selectedMedia.title"
              class="w-16 h-24 object-cover rounded"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ selectedMedia.title }}</h4>
              <p class="text-sm text-gray-500">
                {{ selectedMedia.type === 'tv_series' ? 'TV Series' : 'Movie' }} • {{ new Date(selectedMedia.releaseDate).getFullYear() }}
              </p>
            </div>
            <button 
              v-if="!entry"
              type="button" 
              @click="selectedMedia = null" 
              class="p-2 text-gray-400 hover:text-gray-600"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>

          <!-- Custom Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Custom Title (optional)
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Custom title for this entry..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Watch Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Watch Status *
            </label>
            <select
              v-model="form.watch_status"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned_to_watch">Planned to Watch</option>
              <option value="watched">Watched</option>
              <option value="rewatched">Rewatched</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <!-- Season Number (for TV series) -->
          <div v-if="selectedMedia?.type === 'tv_series'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Season Number
            </label>
            <input
              v-model.number="form.season_number"
              type="number"
              min="1"
              placeholder="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Rating -->
          <div v-if="form.watch_status === 'watched' || form.watch_status === 'rewatched'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              My Rating (1-10)
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="form.my_rating"
                type="range"
                min="1"
                max="10"
                step="0.1"
                class="flex-1"
              />
              <span class="text-lg font-semibold text-gray-900 w-12">{{ form.my_rating || 5 }}</span>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="form.watch_status === 'planned_to_watch'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Planned Date
              </label>
              <input
                v-model="form.start_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div v-if="form.watch_status === 'watched' || form.watch_status === 'rewatched'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Watch Date
              </label>
              <input
                v-model="form.watched_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div v-if="selectedMedia?.type === 'tv_series' && (form.watch_status === 'watched' || form.watch_status === 'rewatched')">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                v-model="form.start_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div v-if="selectedMedia?.type === 'tv_series' && (form.watch_status === 'watched' || form.watch_status === 'rewatched')">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                v-model="form.end_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes & Reflections
            </label>
            <textarea
              v-model="form.notes_reflections"
              rows="4"
              placeholder="Share your thoughts, favorite moments, quotes, or any other reflections..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!selectedMedia || !form.watch_status"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {{ entry ? 'Update Entry' : 'Add Entry' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface MediaItem {
  id: number
  title: string
  type: 'movies' | 'tv_series'
  poster_path: string
  releaseDate: string
  trailerUrl?: string
}

interface JournalEntry {
  id: number
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
}

interface Props {
  isOpen: boolean
  entry?: JournalEntry | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'save'])

// Form state
const form = ref({
  title: '',
  watch_status: 'planned_to_watch' as 'watched' | 'rewatched' | 'planned_to_watch' | 'dropped' | 'paused',
  my_rating: 5,
  watched_date: '',
  start_date: '',
  end_date: '',
  season_number: undefined as number | undefined,
  notes_reflections: ''
})

// Media search
const searchQuery = ref('')
const searchResults = ref<MediaItem[]>([])
const selectedMedia = ref<MediaItem | null>(null)
const searching = ref(false)
const showAddMedia = ref(false)

// Create a typed strapi instance
const config = useRuntimeConfig()

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

// Initialize form when entry prop changes
watch(() => props.entry, (entry) => {
  if (entry) {
    form.value = {
      title: entry.title || '',
      watch_status: entry.watch_status,
      my_rating: entry.my_rating || 5,
      watched_date: entry.watched_date || '',
      start_date: entry.start_date || '',
      end_date: entry.end_date || '',
      season_number: entry.season_number,
      notes_reflections: entry.notes_reflections || ''
    }
    selectedMedia.value = entry.media_item
  } else {
    // Reset form for new entry
    form.value = {
      title: '',
      watch_status: 'planned_to_watch',
      my_rating: 5,
      watched_date: '',
      start_date: '',
      end_date: '',
      season_number: undefined,
      notes_reflections: ''
    }
    selectedMedia.value = null
  }
}, { immediate: true })

// Search media
const searchMedia = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const response = await strapiCall('/media', {
      method: 'GET',
      query: {
        'filters[title][$containsi]': searchQuery.value,
        populate: '*'
      }
    }) as { data: MediaItem[] }
    
    searchResults.value = response.data || []
  } catch (error) {
    console.error('Error searching media:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}, 300)

const selectMedia = (media: MediaItem) => {
  selectedMedia.value = media
  searchResults.value = []
  searchQuery.value = ''
}

const handleSubmit = () => {
  if (!selectedMedia.value) return

  const entryData = {
    ...form.value,
    media_item: selectedMedia.value.id
  }

  emit('save', entryData)
}

const closeModal = () => {
  emit('close')
}

// Close modal on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})
</script>
