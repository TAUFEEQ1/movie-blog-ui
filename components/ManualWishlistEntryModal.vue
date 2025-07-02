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
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
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
                Add Watchlist Entry Manually
              </h3>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Type (Radio) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div class="flex gap-4">
                    <label class="inline-flex items-center">
                      <input type="radio" v-model="form.type" value="movie" class="form-radio text-blue-600" />
                      <span class="ml-2">Movie</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input type="radio" v-model="form.type" value="tv" class="form-radio text-blue-600" />
                      <span class="ml-2">TV Show</span>
                    </label>
                  </div>
                </div>

                <!-- Title -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <template v-if="selectedTmdbItem">
                    <div class="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded px-3 py-2">
                      <span class="font-medium text-gray-800">{{ selectedTmdbItem.title }}</span>
                      <button type="button" @click="selectedTmdbItem = null; form.tmdb_id = undefined; form.title = ''" class="ml-auto text-xs text-blue-600 hover:underline">Change</button>
                    </div>
                  </template>
                  <template v-else>
                    <input
                      v-model="form.title"
                      type="text"
                      required
                      placeholder="Enter title..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <!-- Search Results -->
                    <div v-if="form.title && searchLoading" class="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <Icon name="mdi:loading" class="w-4 h-4 animate-spin" /> Searching TMDB...
                    </div>
                    <div v-if="searchResults.length > 0" class="mt-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                      <div v-for="result in searchResults" :key="result.tmdb_id" class="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer" @click="selectTmdbItem(result)">
                        <img v-if="result.poster_path" :src="`https://image.tmdb.org/t/p/w92${result.poster_path}`" :alt="result.title" class="w-8 h-12 object-cover rounded" />
                        <div class="flex-1">
                          <div class="font-medium text-gray-800">{{ result.title }}</div>
                          <div class="text-xs text-gray-500">{{ result.release_date || '' }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>

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
                    placeholder="Add any personal notes..."
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
                    :disabled="loading || !form.tmdb_id"
                    class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    <span v-if="loading" class="flex items-center justify-center gap-2">
                      <Icon name="mdi:loading" class="w-4 h-4 animate-spin" />
                      Adding...
                    </span>
                    <span v-else>Add to Watchlist</span>
                    <span v-if="!loading && !form.tmdb_id" class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg z-10" style="white-space:nowrap;">
                      Please select a search result before submitting.
                    </span>
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
import { ref, reactive, watch, computed } from 'vue'
import { useWatchlist } from '~/composables/useWatchlist'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'added', item: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = reactive({
  title: '',
  type: 'movie' as 'movie' | 'tv',
  priority: 'medium' as 'low' | 'medium' | 'high',
  watch_status: 'want_to_watch' as 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped',
  notes: '',
  tmdb_id: undefined as number | undefined,
  genres: undefined as string[] | undefined
})

const loading = ref(false)
const { searchTmdb } = useWatchlist()

const searchResults = ref<any[]>([])
const searchLoading = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Watch for title or type changes and debounce search
watch([
  () => form.title,
  () => form.type
], ([title, type]) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!title.trim()) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchTmdb(title, form.type)
      searchResults.value = results
    } catch (e) {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 3000)
})

const selectedTmdbItem = ref<any | null>(null)

const selectTmdbItem = (item: any) => {
  selectedTmdbItem.value = item
  form.title = item.title
  form.tmdb_id = item.tmdb_id
  form.genres = item.genres
  // Optionally, you could also fill other fields here
  searchResults.value = []
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.title = ''
  form.type = 'movie'
  form.priority = 'medium'
  form.watch_status = 'want_to_watch'
  form.notes = ''
  form.tmdb_id = undefined
  form.genres = []
  selectedTmdbItem.value = null
}

const handleSubmit = async () => {
  if (!form.title.trim()) return
  try {
    loading.value = true
    // Emit the form data for parent to handle (e.g., call addToWatchlist)
    emit('added', { ...form })
    closeModal()
  } catch (error) {
    // Optionally handle error
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 4px;
}
textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}
textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
