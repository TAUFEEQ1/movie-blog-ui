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
          <h2 class="text-xl font-bold text-gray-900">Edit Journal Entry</h2>
          <button 
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Selected Media (Read-only) -->
          <div v-if="entry?.media_item" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              :src="getImageUrl(entry.media_item.poster_path)"
              :alt="entry.media_item.title"
              class="w-16 h-24 object-cover rounded"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ entry.media_item.title }}</h4>
              <p class="text-sm text-gray-500">
                {{ entry.media_item.type === 'tv_series' ? 'TV Series' : 'Movie' }} • {{ entry.media_item.releaseDate ? new Date(entry.media_item.releaseDate).getFullYear() : 'Unknown' }}
              </p>
              <p class="text-xs text-gray-400 mt-1">Media cannot be changed when editing</p>
            </div>
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
              <option value="paused">Paused</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <!-- Season Number (for TV series) -->
          <div v-if="entry?.media_item?.type === 'tv_series'">
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

          <!-- Episode Number (for TV series) -->
          <div v-if="entry?.media_item?.type === 'tv_series'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Episode Number
              <span v-if="form.watch_status === 'paused'" class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.episode"
              type="number"
              min="1"
              placeholder="1"
              :required="form.watch_status === 'paused'"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': form.watch_status === 'paused' && !form.episode }"
            />
            <p v-if="form.watch_status === 'paused' && !form.episode" class="text-red-500 text-sm mt-1">
              Episode number is required for paused TV series
            </p>
          </div>

          <!-- Total Episodes (for paused TV series) -->
          <div v-if="entry?.media_item?.type === 'tv_series' && form.watch_status === 'paused'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Total Episodes (optional)
            </label>
            <input
              v-model.number="form.total_episodes"
              type="number"
              min="1"
              placeholder="e.g. 24"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="text-sm text-gray-500 mt-1">
              For progress tracking (current: {{ form.episode || 0 }}/{{ form.total_episodes || '?' }})
            </p>
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

            <div v-if="entry?.media_item?.type === 'tv_series' && (form.watch_status === 'watched' || form.watch_status === 'rewatched')">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                v-model="form.start_date"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div v-if="entry?.media_item?.type === 'tv_series' && (form.watch_status === 'watched' || form.watch_status === 'rewatched')">
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
              :disabled="!form.watch_status"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              Update Entry
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
  documentId?: string
  title: string
  type: 'movies' | 'tv_series'
  poster_path: string
  releaseDate: string
  trailerUrl?: string
  tmdbId?: number
  tmdbType?: string
  overview?: string
  genres?: string[]
  rating?: number
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
}

interface Props {
  isOpen: boolean
  entry: JournalEntry
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
  episode: undefined as number | undefined,
  total_episodes: undefined as number | undefined,
  notes_reflections: ''
})

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

// Initialize form with entry data
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
      episode: entry.episode,
      total_episodes: entry.total_episodes,
      notes_reflections: entry.notes_reflections || ''
    }
  }
}, { immediate: true })

// Helper functions
const getImageUrl = (posterPath: string | null) => {
  if (!posterPath) return '/default-poster.jpg'
  if (posterPath.startsWith('http')) return posterPath
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}

const handleSubmit = async () => {
  if (!props.entry) return

  // Validate episode field for paused TV series
  if (props.entry.media_item?.type === 'tv_series' && 
      form.value.watch_status === 'paused' && 
      !form.value.episode) {
    alert('Episode number is required for paused TV series')
    return
  }

  try {
    // Only send form data, no media changes - filter out empty values
    const updateData: any = {
      watch_status: form.value.watch_status,
      // Keep the existing media_item relationship - use documentId if available
      media_item: props.entry.media_item.documentId || props.entry.media_item.id
    }

    // Only include non-empty values
    if (form.value.title?.trim()) {
      updateData.title = form.value.title.trim()
    }
    
    if (form.value.my_rating && form.value.my_rating > 0) {
      updateData.my_rating = form.value.my_rating
    }
    
    if (form.value.watched_date) {
      updateData.watched_date = form.value.watched_date
    }
    
    if (form.value.start_date) {
      updateData.start_date = form.value.start_date
    }
    
    if (form.value.end_date) {
      updateData.end_date = form.value.end_date
    }
    
    if (form.value.season_number && form.value.season_number > 0) {
      updateData.season_number = form.value.season_number
    }
    
    if (form.value.episode && form.value.episode > 0) {
      updateData.episode = form.value.episode
    }
    
    if (form.value.total_episodes && form.value.total_episodes > 0) {
      updateData.total_episodes = form.value.total_episodes
    }
    
    if (form.value.notes_reflections?.trim()) {
      updateData.notes_reflections = form.value.notes_reflections.trim()
    }
    
    // Use documentId for the API call, fallback to numeric id
    const entryId = props.entry.documentId || props.entry.id
    
    const response: any = await strapiCall(`/journal-entries/${entryId}`, {
      method: 'PUT',
      body: { data: updateData }
    })
    
    emit('save', response.data)
    closeModal()
  } catch (error) {
    console.error('Error updating journal entry:', error)
    // Could add error handling here
  }
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
