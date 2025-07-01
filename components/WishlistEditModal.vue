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
                Edit Wishlist Item
              </h3>

              <!-- Movie/Show Info -->
              <div class="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <img
                  v-if="item.poster_path"
                  :src="`https://image.tmdb.org/t/p/w200${item.poster_path}`"
                  :alt="item.title"
                  class="w-16 h-24 object-cover rounded-lg shadow-sm"
                >
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600 mb-2">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                  <div v-if="item.tmdb_rating" class="flex items-center gap-1">
                    <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                    <span class="text-sm text-gray-700">{{ item.tmdb_rating.toFixed(1) }}</span>
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
                    v-model="form.wish_status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="want_to_watch">Want to Watch</option>
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                <!-- Watched Date (only show if completed) -->
                <div v-if="form.wish_status === 'completed'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Date Completed
                  </label>
                  <input
                    v-model="form.watched_date"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes
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
                      Updating...
                    </span>
                    <span v-else>Update Item</span>
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
import type { WishlistItem } from '~/composables/useWishlist'
// import type { Tag } from '~/composables/useWishlist' // Shelved for now

interface Props {
  isOpen: boolean
  item: WishlistItem
}

interface Emits {
  (e: 'close'): void
  (e: 'updated', item: WishlistItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { updateWishlistItem } = useWishlist()

// Form state
const form = reactive({
  priority: props.item.priority,
  wish_status: props.item.wish_status,
  notes: props.item.notes || '',
  watched_date: props.item.watched_date || ''
})

// Loading state
const loading = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  try {
    loading.value = true

    const updates = {
      priority: form.priority,
      wish_status: form.wish_status,
      notes: form.notes.trim() || undefined,
      watched_date: form.watched_date || undefined
      // tags: selectedTags.value.map(tag => tag.id) // Shelved for now
    }

    const updatedItem = await updateWishlistItem(props.item.id, updates)
    emit('updated', updatedItem)
    closeModal()
  } catch (error: any) {
    console.error('Error updating wishlist item:', error)
  } finally {
    loading.value = false
  }
}

// Reset form when item changes
watch(() => props.item, (newItem) => {
  form.priority = newItem.priority
  form.wish_status = newItem.wish_status
  form.notes = newItem.notes || ''
  form.watched_date = newItem.watched_date || ''
  // selectedTags.value = [...(newItem.tags || [])] // Shelved for now
}, { immediate: true })
</script>
