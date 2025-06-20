<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg max-w-md w-full p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-white">Rate {{ item.title }}</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content Type Badge -->
      <div class="flex items-center gap-2 mb-4">
        <span 
          :class="contentType === 'trending' ? 'bg-red-600' : 'bg-blue-600'"
          class="px-2 py-1 rounded text-xs font-medium text-white"
        >
          {{ contentType === 'trending' ? 'Trending Now' : 'Coming Soon' }}
        </span>
        <span class="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
          {{ item.type?.toUpperCase() || 'MOVIE' }}
        </span>
      </div>

      <!-- Rating Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Your Rating (1-10)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="localRating"
            type="range"
            min="1"
            max="10"
            step="0.1"
            class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span class="text-white font-semibold w-12 text-center">{{ localRating.toFixed(1) }}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>Terrible</span>
          <span>Amazing</span>
        </div>
      </div>

      <!-- Mood Rating (for Coming Soon) -->
      <div v-if="contentType === 'coming_soon'" class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Anticipation Level
        </label>
        <div class="flex gap-2">
          <button
            v-for="mood in moodOptions"
            :key="mood.value"
            @click="localMoodRating = mood.value"
            :class="[
              'flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors',
              localMoodRating === mood.value 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            <span>{{ mood.emoji }}</span>
            <span>{{ mood.label }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">Quick Actions</label>
        <div class="flex flex-wrap gap-2">
          <button
            @click="toggleNotable"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              localIsNotable 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            ⭐ {{ localIsNotable ? 'Notable' : 'Mark Notable' }}
          </button>
          <button
            @click="toggleUnfavorable"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              localIsUnfavorable 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            👎 {{ localIsUnfavorable ? 'Unfavorable' : 'Mark Unfavorable' }}
          </button>
          <button
            @click="toggleWatchlist"
            :class="[
              'px-3 py-1 rounded text-sm transition-colors',
              localIsWatchlisted 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
          >
            📝 {{ localIsWatchlisted ? 'In Watchlist' : 'Add to Watchlist' }}
          </button>
        </div>
      </div>

      <!-- Comment -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Comment (Optional)
        </label>
        <textarea
          v-model="localComment"
          class="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          :placeholder="`Share your thoughts about ${item.title}...`"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="handleSubmit"
          :disabled="loading"
          class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Saving...' : (existingRating ? 'Update Rating' : 'Save Rating') }}
        </button>
        <button
          v-if="existingRating"
          @click="handleRemove"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remove
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    id: number
    title: string
    tmdb_id: number
    type: 'movie' | 'tv'
  }
  contentType: 'trending' | 'coming_soon'
  existingRating?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'rated'])

// Composables
const { rateItem, removeRating, getMyRating } = useUserRatings()

// Local state
const loading = ref(false)
const localRating = ref(props.existingRating?.rating || 5)
const localComment = ref(props.existingRating?.comment || '')
const localIsNotable = ref(props.existingRating?.is_notable || false)
const localIsUnfavorable = ref(props.existingRating?.is_unfavorable || false)
const localIsWatchlisted = ref(props.existingRating?.is_watchlisted || false)
const localMoodRating = ref(props.existingRating?.mood_rating || null)

// Mood options for coming soon items
const moodOptions = [
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'interested', label: 'Interested', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'disappointed', label: 'Disappointed', emoji: '😞' },
  { value: 'avoid', label: 'Avoid', emoji: '🚫' }
]

// Toggle functions
const toggleNotable = () => {
  localIsNotable.value = !localIsNotable.value
  if (localIsNotable.value) {
    localIsUnfavorable.value = false
    if (localRating.value < 7) localRating.value = 8
  }
}

const toggleUnfavorable = () => {
  localIsUnfavorable.value = !localIsUnfavorable.value
  if (localIsUnfavorable.value) {
    localIsNotable.value = false
    if (localRating.value > 5) localRating.value = 3
  }
}

const toggleWatchlist = () => {
  localIsWatchlisted.value = !localIsWatchlisted.value
}

// Submit rating
const handleSubmit = async () => {
  try {
    loading.value = true
    
    const ratingData = {
      tmdb_id: props.item.tmdb_id,
      content_type: props.contentType,
      media_type: props.item.type,
      rating: localRating.value,
      comment: localComment.value || undefined,
      is_notable: localIsNotable.value,
      is_unfavorable: localIsUnfavorable.value,
      is_watchlisted: localIsWatchlisted.value,
      mood_rating: localMoodRating.value || undefined
    }

    await rateItem(ratingData)
    emit('rated', ratingData)
    emit('close')
  } catch (error) {
    console.error('Error submitting rating:', error)
    // You might want to show a toast notification here
  } finally {
    loading.value = false
  }
}

// Remove rating
const handleRemove = async () => {
  try {
    loading.value = true
    
    const success = await removeRating(
      props.item.tmdb_id,
      props.contentType,
      props.item.type
    )
    
    if (success) {
      emit('rated', null) // Signal that rating was removed
      emit('close')
    }
  } catch (error) {
    console.error('Error removing rating:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: none;
}
</style>
