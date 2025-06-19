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
          <h2 class="text-xl font-bold text-gray-900">Add Journal Entry</h2>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search for Movie/TV Show
            </label>
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="searchTMDB"
                @focus="isSearchFocused = true"
                @blur="handleSearchBlur"
                type="text"
                placeholder="Type to search movies and TV shows from TMDB..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Icon name="mdi:magnify" class="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <div v-if="searching" class="absolute right-10 top-3">
                <Icon name="mdi:loading" class="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            </div>

            <!-- Search Type Filter -->
            <div class="flex gap-2 mt-2">
              <button
                v-for="filter in searchFilters"
                :key="filter.value"
                @click="searchType = filter.value"
                type="button"
                :class="[
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  searchType === filter.value 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ filter.label }}
              </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.length > 0" class="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
              <div
                v-for="media in searchResults"
                :key="`${media.media_type || media.type}-${media.id}`"
                @click="selectTMDBMedia(media)"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <img 
                  :src="media.poster_url"
                  :alt="media.title || media.name"
                  class="w-12 h-18 object-cover rounded shadow-sm"
                  @error="handleImageError"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ media.title || media.name }}</h4>
                  <p class="text-sm text-gray-500">
                    {{ (media.media_type === 'tv' || media.type === 'tv') ? 'TV Series' : 'Movie' }} • {{ getYear(media.release_date || media.first_air_date) }}
                  </p>
                  <p class="text-xs text-gray-400 truncate mt-1" v-if="media.overview">
                    {{ media.overview }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center gap-1" v-if="media.vote_average > 0">
                      <Icon name="mdi:star" class="w-3 h-3 text-yellow-500" />
                      <span class="text-xs text-gray-500">{{ media.vote_average.toFixed(1) }}</span>
                    </div>
                    <div v-if="media.genre_ids && media.genre_ids.length > 0" class="text-xs text-gray-400">
                      Genre IDs: {{ media.genre_ids.slice(0, 2).join(', ') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && searchResults.length === 0 && !searching && hasSearched && isSearchFocused" class="mt-2 p-3 text-center text-gray-500 border border-gray-200 rounded-lg">
              No results found for "{{ searchQuery }}". Try a different search term.
            </div>

            <!-- Search Error -->
            <div v-if="searchError" class="mt-2 p-3 text-center text-red-600 border border-red-200 rounded-lg bg-red-50">
              {{ searchError }}
            </div>
          </div>

          <!-- Selected Media -->
          <div v-if="selectedMedia" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              :src="selectedMedia.tmdbData.poster_url"
              :alt="selectedMedia.title"
              class="w-16 h-24 object-cover rounded"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ selectedMedia.title }}</h4>
              <p class="text-sm text-gray-500">
                {{ selectedMedia.type === 'tv_series' ? 'TV Series' : 'Movie' }} • {{ selectedMedia.releaseDate ? new Date(selectedMedia.releaseDate).getFullYear() : 'Unknown' }}
              </p>
            </div>
            <button 
              type="button" 
              @click="clearSelectedMedia" 
              class="p-2 text-gray-400 hover:text-gray-600"
            >
              <Icon name="mdi:close" class="w-5 h-5" />
            </button>
          </div>

          <!-- Rest of the form fields -->
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
              <option value="paused">Paused</option>
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
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface TMDBMedia {
  id: number
  title: string
  type: 'tv_series' | 'movies'
  poster_path: string
  releaseDate: string
  tmdbId: number
  tmdbType: string
  overview?: string
  rating?: number
  tmdbData: any
}

interface Props {
  isOpen: boolean
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

// Media search - TMDB integration
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedMedia = ref<TMDBMedia | null>(null)
const searching = ref(false)
const hasSearched = ref(false)
const searchError = ref('')
const searchType = ref('multi')
const isSearchFocused = ref(false)
const searchFilters = [
  { label: 'All', value: 'multi' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' }
]

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

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

const resetForm = () => {
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
  clearSearchState()
}

const clearSearchState = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = ''
  hasSearched.value = false
  searching.value = false
  isSearchFocused.value = false
}

const clearSelectedMedia = () => {
  selectedMedia.value = null
  clearSearchState()
}

// Search TMDB
const searchTMDB = useDebounceFn(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  searching.value = true
  searchError.value = ''
  
  try {
    const response: any = await strapiCall(`/journal-entries/tmdb/search?query=${encodeURIComponent(searchQuery.value)}&type=${searchType.value}`)
    searchResults.value = response.data || []
    hasSearched.value = true
  } catch (error) {
    console.error('Error searching TMDB:', error)
    searchError.value = 'Failed to search movies and TV shows. Please try again.'
    searchResults.value = []
    hasSearched.value = true
  } finally {
    searching.value = false
  }
}, 300)

// Watch for search type changes and re-search
watch(searchType, () => {
  if (searchQuery.value.trim()) {
    searchTMDB()
  }
})

// Select TMDB media
const selectTMDBMedia = (media: any) => {
  const mediaType = media.media_type || media.type
  selectedMedia.value = {
    id: media.id,
    title: media.title || media.name,
    type: mediaType === 'tv' ? 'tv_series' : 'movies',
    poster_path: media.poster_path,
    releaseDate: media.release_date || media.first_air_date,
    tmdbId: media.id,
    tmdbType: mediaType,
    overview: media.overview,
    rating: media.vote_average || 0,
    tmdbData: media
  }
  
  clearSearchState()
}

// Helper functions
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}

const getYear = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).getFullYear()
}

const getImageUrl = (posterPath: string | null) => {
  if (!posterPath) return '/default-poster.jpg'
  if (posterPath.startsWith('http')) return posterPath
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}

// Handle search blur with delay to allow for selection clicks
const handleSearchBlur = () => {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 150)
}

const handleSubmit = async () => {
  if (!selectedMedia.value) return

  try {
    // Build entry data, filtering out empty values
    const entryData: any = {
      title: form.value.title || undefined,
      watch_status: form.value.watch_status,
      notes_reflections: form.value.notes_reflections || undefined,
      tmdb: {
        id: selectedMedia.value.tmdbId,
        type: selectedMedia.value.tmdbType,
        title: selectedMedia.value.title,
        overview: selectedMedia.value.overview,
        release_date: selectedMedia.value.releaseDate,
        poster_path: selectedMedia.value.tmdbData.poster_url,
        vote_average: selectedMedia.value.rating,
        ...selectedMedia.value.tmdbData
      }
    }

    // Only include rating for watched/rewatched entries
    if (form.value.watch_status === 'watched' || form.value.watch_status === 'rewatched') {
      if (form.value.my_rating) {
        entryData.my_rating = form.value.my_rating
      }
    }

    // Only include dates if they have values (not empty strings)
    if (form.value.watched_date && form.value.watched_date.trim()) {
      entryData.watched_date = form.value.watched_date
    }

    if (form.value.start_date && form.value.start_date.trim()) {
      entryData.start_date = form.value.start_date
    }

    if (form.value.end_date && form.value.end_date.trim()) {
      entryData.end_date = form.value.end_date
    }

    // Only include season number if it's provided and for TV series
    if (selectedMedia.value.type === 'tv_series' && form.value.season_number) {
      entryData.season_number = form.value.season_number
    }
    
    const response: any = await strapiCall('/journal-entries/tmdb/create', {
      method: 'POST',
      body: entryData
    })
    
    emit('save', response.data)
    closeModal()
  } catch (error) {
    console.error('Error saving journal entry:', error)
    searchError.value = 'Failed to save journal entry. Please try again.'
  }
}

const closeModal = () => {
  resetForm()
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
