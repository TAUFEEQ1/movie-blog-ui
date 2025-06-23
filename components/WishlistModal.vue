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
                Add to Wishlist
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
                    v-model="form.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="want_to_watch">Want to Watch</option>
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <!-- Tags -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  
                  <!-- Tag Input -->
                  <div class="relative mb-3">
                    <input
                      v-model="tagSearch"
                      type="text"
                      placeholder="Search or create tags..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      @input="handleTagSearch"
                      @keydown.enter.prevent="handleTagEnter"
                    >
                    
                    <!-- Tag Suggestions -->
                    <div
                      v-if="showTagSuggestions && (filteredTags.length > 0 || canCreateNewTag)"
                      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                    >
                      <!-- Existing Tags -->
                      <button
                        v-for="tag in filteredTags"
                        :key="tag.id"
                        type="button"
                        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        @click="selectTag(tag)"
                      >
                        <div
                          class="w-3 h-3 rounded-full"
                          :style="{ backgroundColor: tag.color }"
                        ></div>
                        <span>{{ tag.name }}</span>
                        <span class="ml-auto text-xs text-gray-500">({{ tag.usage_count }})</span>
                      </button>
                      
                      <!-- Create New Tag -->
                      <button
                        v-if="canCreateNewTag"
                        type="button"
                        class="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 border-t border-gray-200"
                        @click="createNewTag"
                      >
                        <Icon name="mdi:plus" class="w-4 h-4" />
                        <span>Create "{{ tagSearch }}"</span>
                      </button>
                    </div>
                  </div>

                  <!-- Selected Tags -->
                  <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="tag in selectedTags"
                      :key="tag.id"
                      class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                      :style="{ backgroundColor: tag.color }"
                    >
                      {{ tag.name }}
                      <button
                        type="button"
                        @click="removeTag(tag.id)"
                        class="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                      >
                        <Icon name="mdi:close" class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
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
                    <span v-else>Add to Wishlist</span>
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
import type { Tag } from '~/composables/useWishlist'

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

const { addToWishlist, createTag, searchTags, userTags, fetchTags } = useWishlist()

// Form state
const form = reactive({
  priority: 'medium' as 'low' | 'medium' | 'high',
  status: 'want_to_watch' as 'want_to_watch' | 'watching' | 'completed' | 'on_hold' | 'dropped',
  notes: ''
})

// Tag management
const tagSearch = ref('')
const selectedTags = ref<Tag[]>([])
const filteredTags = ref<Tag[]>([])
const showTagSuggestions = ref(false)
const loading = ref(false)

// Computed
const canCreateNewTag = computed(() => {
  return tagSearch.value.trim().length > 0 && 
         !filteredTags.value.some(tag => tag.name.toLowerCase() === tagSearch.value.toLowerCase()) &&
         !selectedTags.value.some(tag => tag.name.toLowerCase() === tagSearch.value.toLowerCase())
})

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.priority = 'medium'
  form.status = 'want_to_watch'
  form.notes = ''
  selectedTags.value = []
  tagSearch.value = ''
  filteredTags.value = []
  showTagSuggestions.value = false
}

const handleTagSearch = async () => {
  if (tagSearch.value.trim().length === 0) {
    filteredTags.value = []
    showTagSuggestions.value = false
    return
  }

  try {
    const results = await searchTags(tagSearch.value)
    filteredTags.value = results.filter(tag => 
      !selectedTags.value.some(selected => selected.id === tag.id)
    )
    showTagSuggestions.value = true
  } catch (error) {
    console.error('Error searching tags:', error)
  }
}

const handleTagEnter = () => {
  if (canCreateNewTag.value) {
    createNewTag()
  } else if (filteredTags.value.length > 0) {
    selectTag(filteredTags.value[0])
  }
}

const selectTag = (tag: Tag) => {
  if (!selectedTags.value.some(selected => selected.id === tag.id)) {
    selectedTags.value.push(tag)
  }
  tagSearch.value = ''
  filteredTags.value = []
  showTagSuggestions.value = false
}

const createNewTag = async () => {
  try {
    const newTag = await createTag({
      name: tagSearch.value.trim(),
      color: generateRandomColor()
    })
    
    selectedTags.value.push(newTag)
    tagSearch.value = ''
    filteredTags.value = []
    showTagSuggestions.value = false
  } catch (error) {
    console.error('Error creating tag:', error)
  }
}

const removeTag = (tagId: number) => {
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagId)
}

const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const handleSubmit = async () => {
  if (!props.movieData) return

  try {
    loading.value = true

    const wishlistData = {
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
      status: form.status,
      notes: form.notes.trim() || undefined,
      tags: selectedTags.value.map(tag => tag.id)
    }

    const newItem = await addToWishlist(wishlistData)
    emit('added', newItem)
    closeModal()
  } catch (error: any) {
    console.error('Error adding to wishlist:', error)
    // You could show a toast notification here
  } finally {
    loading.value = false
  }
}

// Load tags when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await fetchTags()
  }
})

// Close suggestions when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    showTagSuggestions.value = false
  })
})
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
