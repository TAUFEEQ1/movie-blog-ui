<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">
          {{ existingRating ? 'Update Rating' : 'Rate Item' }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div v-if="item" class="p-6">
        <!-- Item Info -->
        <div class="flex gap-4 mb-6">
          <img 
            :src="posterUrl" 
            :alt="item.title"
            class="w-20 h-28 object-cover rounded-lg"
            @error="handleImageError"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }} • {{ item.release_year }}</p>
            <div class="flex items-center gap-2">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
              <span class="text-sm font-medium">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
              <span class="text-sm text-gray-500">TMDB</span>
            </div>
          </div>
        </div>

        <!-- Rating Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Your Rating (1-10)
          </label>
          <div class="flex items-center gap-2 mb-4">
            <!-- Star Rating Display -->
            <div class="flex items-center">
              <button
                v-for="star in 10"
                :key="star"
                @click="rating = star"
                class="p-1 transition-colors"
                :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
              >
                <Icon name="mdi:star" class="w-6 h-6" />
              </button>
            </div>
            <span class="text-lg font-semibold text-gray-900 ml-2">{{ rating }}/10</span>
          </div>

          <!-- Quick Rating Buttons -->
          <div class="flex gap-2 mb-4">
            <button
              @click="setQuickRating(3, 'unfavorable')"
              class="px-3 py-1 text-sm rounded-lg transition-colors"
              :class="rating <= 4 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Unfavorable
            </button>
            <button
              @click="setQuickRating(6, 'average')"
              class="px-3 py-1 text-sm rounded-lg transition-colors"
              :class="rating >= 5 && rating <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Average
            </button>
            <button
              @click="setQuickRating(9, 'notable')"
              class="px-3 py-1 text-sm rounded-lg transition-colors"
              :class="rating >= 8 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Notable
            </button>
          </div>
        </div>

        <!-- Special Flags -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Special Flags
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="isNotable"
                type="checkbox"
                class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span class="ml-2 text-sm text-gray-700">Mark as Notable (will not be ephemeral)</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="isUnfavorable"
                type="checkbox"
                class="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span class="ml-2 text-sm text-gray-700">Mark as Unfavorable (will not be ephemeral)</span>
            </label>
          </div>
        </div>

        <!-- Comment -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Comment (optional)
          </label>
          <textarea
            v-model="comment"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts about this movie/show..."
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitRating"
            :disabled="submitting || rating === 0"
            class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Saving...' : (existingRating ? 'Update' : 'Rate') }}
          </button>
        </div>

        <!-- Delete Rating (if exists) -->
        <div v-if="existingRating" class="mt-4 pt-4 border-t">
          <button
            @click="deleteRating"
            :disabled="submitting"
            class="w-full py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Remove Rating
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrendingRatings } from '~/composables/useTrendingRatings'

interface TrendingItem {
  id: number
  title: string
  tmdb_id: number
  type: 'movie' | 'tv'
  platform: string
  tmdb_rating?: number
  poster_path?: string
  release_year?: number
  [key: string]: any
}

interface TrendingRating {
  id: number
  user: number
  tmdb_id: number
  type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable: boolean
  is_unfavorable: boolean
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  isOpen: boolean
  item: TrendingItem | null
  existingRating?: TrendingRating | null
}>()

const emit = defineEmits<{
  close: []
  rated: [rating: TrendingRating]
}>()

// Composables
const { rateItem } = useTrendingRatings()

// Reactive state
const rating = ref(0)
const comment = ref('')
const isNotable = ref(false)
const isUnfavorable = ref(false)
const submitting = ref(false)

// Computed
const posterUrl = computed(() => {
  if (props.item?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${props.item.poster_path}`
  }
  return '/default-poster.jpg'
})

// Methods
const setQuickRating = (value: number, type: string) => {
  rating.value = value
  
  // Auto-set flags based on rating type
  if (type === 'notable') {
    isNotable.value = true
    isUnfavorable.value = false
  } else if (type === 'unfavorable') {
    isNotable.value = false
    isUnfavorable.value = true
  } else {
    // Reset flags for average ratings
    isNotable.value = false
    isUnfavorable.value = false
  }
}

const submitRating = async () => {
  if (!props.item || rating.value === 0) return

  try {
    submitting.value = true

    const result = await rateItem({
      tmdb_id: props.item.tmdb_id,
      type: props.item.type,
      rating: rating.value,
      comment: comment.value.trim() || undefined,
      is_notable: isNotable.value,
      is_unfavorable: isUnfavorable.value
    })

    if (result) {
      emit('rated', result)
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
  } finally {
    submitting.value = false
  }
}

const deleteRating = async () => {
  if (!props.existingRating) return

  // For now, we'll set rating to 0 to indicate deletion
  // You might want to implement a proper delete endpoint
  try {
    submitting.value = true
    
    const result = await rateItem({
      tmdb_id: props.item!.tmdb_id,
      type: props.item!.type,
      rating: 1, // Minimum rating since we don't have delete endpoint
      comment: '',
      is_notable: false,
      is_unfavorable: false
    })

    if (result) {
      emit('rated', result)
    }
  } catch (error) {
    console.error('Error deleting rating:', error)
  } finally {
    submitting.value = false
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}

// Watch for changes in props to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.item) {
    // Reset form
    rating.value = props.existingRating?.rating || 0
    comment.value = props.existingRating?.comment || ''
    isNotable.value = props.existingRating?.is_notable || false
    isUnfavorable.value = props.existingRating?.is_unfavorable || false
  }
})

// Auto-update flags based on rating
watch(rating, (newRating) => {
  if (newRating >= 8 && !isUnfavorable.value) {
    isNotable.value = true
  } else if (newRating <= 4 && !isNotable.value) {
    isUnfavorable.value = true
  } else if (newRating > 4 && newRating < 8) {
    isNotable.value = false
    isUnfavorable.value = false
  }
})
</script>
