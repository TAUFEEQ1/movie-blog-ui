<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay -->
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="closeModal"
        ></div>

        <!-- Modal panel -->
        <div
          class="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          @click.stop
        >
          <!-- Header -->
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                Add to Watchlist
              </h3>

              <!-- Movie/Show Info -->
              <div v-if="movieData" class="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <img
                  v-if="movieData.poster_path"
                  :src="`https://image.tmdb.org/t/p/w200${movieData.poster_path}`"
                  :alt="movieData.title"
                  class="w-16 h-24 object-cover rounded-lg shadow-sm"
                >
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 mb-1">{{ movieData.title }}</h4>
                  <p class="text-sm text-gray-600 mb-2">{{ movieData.type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                  <div v-if="movieData.tmdb_rating" class="flex items-center gap-1">
                    <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                    <span class="text-sm text-gray-700">{{ movieData.tmdb_rating.toFixed(1) }}</span>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Priority -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    v-model="form.priority"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    v-model="form.watch_status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="want_to_watch">Want to Watch</option>
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Add any personal notes about this movie/show..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                      <Icon name="mdi:loading" class="w-4 h-4 animate-spin" />
                      Adding...
                    </span>
                    <span v-else>Add to Watchlist</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// import type { Tag } from '~/composables/useWishlist' // Shelved for now

interface Props {
  isOpen: boolean
  movieData: {
    tmdb_id: number
    title: string
    type: 'movie' | 'tv'
    poster_path?: string
    backdrop_path?: string
    tmdb_rating?: number
    release_year?: number
    overview?: string
    genres?: string[]
  } | null
}

interface Emits {
  (e: 'close'): void
  (e: 'added', item: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { addToWatchlist } = useWatchlist()

// Form state
const form = reactive({
  priority: 'medium' as 'low' | 'medium' | 'high',
  watch_status: 'want_to_watch' as 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped',
  notes: ''
})

// Loading state
const loading = ref(false)

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.priority = 'medium'
  form.watch_status = 'want_to_watch'
  form.notes = ''
}

const handleSubmit = async () => {
  if (!props.movieData) return

  try {
    loading.value = true

    const watchlistData = {
      tmdb_id: props.movieData.tmdb_id,
      title: props.movieData.title,
      type: props.movieData.type,
      poster_path: props.movieData.poster_path,
      backdrop_path: props.movieData.backdrop_path,
      tmdb_rating: props.movieData.tmdb_rating,
      release_year: props.movieData.release_year,
      overview: props.movieData.overview,
      genres: props.movieData.genres,
      priority: form.priority,
      watch_status: form.watch_status,
      notes: form.notes.trim() || undefined
      // tags: selectedTags.value.map(tag => tag.id) // Shelved for now
    }

    const newItem = await addToWatchlist(watchlistData)
    emit('added', newItem)
    closeModal()
  } catch (error: any) {
    console.error('Error adding to watchlist:', error)
    // You could show a toast notification here
  } finally {
    loading.value = false
  }
}

// Removed tag-related watchers and event listeners since tags are shelved
</script>

<style scoped>
/* Custom scrollbar for tag suggestions */
.max-h-40::-webkit-scrollbar {
  width: 4px;
}

.max-h-40::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
