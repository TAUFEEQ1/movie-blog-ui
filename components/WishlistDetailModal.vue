<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">{{ item.title }}</h2>
        <button
          @click="closeModal"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Poster and Basic Info -->
          <div class="lg:col-span-1">
            <!-- Poster -->
            <div class="relative mb-4">
              <img
                :src="item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/images/default-poster.jpg'"
                :alt="item.title"
                class="w-full rounded-lg shadow-lg"
              />
              <!-- Status Badge -->
              <div class="absolute top-3 right-3">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  :class="getStatusColor(item.wish_status)"
                >
                  {{ getStatusLabel(item.wish_status) }}
                </span>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Type:</span>
                <span class="text-sm text-gray-900 capitalize">{{ item.type === 'tv' ? 'TV Show' : 'Movie' }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Priority:</span>
                <span 
                  class="text-sm font-medium capitalize"
                  :class="getPriorityColor(item.priority)"
                >
                  {{ item.priority }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Release Year:</span>
                <span class="text-sm text-gray-900">{{ item.release_year || 'N/A' }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">TMDB Rating:</span>
                <div class="flex items-center gap-1">
                  <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                  <span class="text-sm text-gray-900">{{ item.tmdb_rating ? item.tmdb_rating.toFixed(1) : 'N/A' }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Date Added:</span>
                <span class="text-sm text-gray-900">{{ formatDate(item.date_added) }}</span>
              </div>

              <div v-if="item.watched_date" class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Watched Date:</span>
                <span class="text-sm text-gray-900">{{ formatDate(item.watched_date) }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Trailer -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Trailer</h3>
              <div class="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <!-- Loading State -->
                <div v-if="trailerLoading" class="w-full h-full flex items-center justify-center">
                  <div class="text-center">
                    <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p class="text-sm text-gray-600">Loading trailer...</p>
                  </div>
                </div>
                <!-- Trailer Video -->
                <iframe
                  v-else-if="trailerUrl"
                  :src="trailerUrl"
                  class="w-full h-full"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
                <!-- No Trailer Available -->
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="text-center">
                    <Icon name="mdi:video-off" class="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p class="text-sm text-gray-600">No trailer available</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Overview -->
            <div v-if="item.overview">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
              <p class="text-gray-700 leading-relaxed">{{ item.overview }}</p>
            </div>

            <!-- Genres -->
            <div v-if="item.genres && item.genres.length > 0">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Genres</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(genre, index) in item.genres"
                  :key="index"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {{ getGenreName(genre) }}
                </span>
              </div>
            </div>

            <!-- Personal Notes -->
            <div v-if="item.notes">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">My Notes</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-gray-700 leading-relaxed">{{ item.notes }}</p>
              </div>
            </div>

            <!-- Metadata -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">TMDB ID:</span>
                  <span class="text-sm text-gray-900">{{ item.tmdb_id }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Added on:</span>
                  <span class="text-sm text-gray-900">{{ formatDateTime(item.date_added) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700">Status:</span>
                  <span class="text-sm text-gray-900">{{ item.is_active ? 'Active' : 'Inactive' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            @click="$emit('edit', item)"
            class="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Icon name="mdi:pencil" class="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            @click="$emit('remove', item)"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icon name="mdi:delete" class="w-4 h-4 mr-2" />
            Remove
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WishlistItem } from '~/composables/useWishlist'

interface Props {
  show: boolean
  item: WishlistItem
}

interface Emits {
  (e: 'close'): void
  (e: 'edit', item: WishlistItem): void
  (e: 'remove', item: WishlistItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchTrailer } = useMedia()

// State for trailer
const trailerData = ref<{ trailerUrl: string | null; embedUrl: string | null } | null>(null)
const trailerLoading = ref(false)

// Computed
const trailerUrl = computed(() => {
  return trailerData.value?.embedUrl || null
})

// Methods
const closeModal = () => {
  emit('close')
}

const fetchTrailerData = async () => {
  console.log('fetchTrailerData called with:', { tmdb_id: props.item.tmdb_id, type: props.item.type })
  if (!props.item.tmdb_id) {
    console.log('No TMDB ID found, skipping trailer fetch')
    return
  }
  
  trailerLoading.value = true
  try {
    console.log('Calling fetchTrailer...')
    // Fetch trailer directly from TMDB API using media composable
    const trailerResponse = await fetchTrailer(props.item.tmdb_id, props.item.type)
    console.log('Trailer response:', trailerResponse)
    
    if (trailerResponse && trailerResponse.trailerUrl) {
      trailerData.value = {
        trailerUrl: trailerResponse.trailerUrl,
        embedUrl: trailerResponse.embedUrl
      }
      console.log('Trailer data set:', trailerData.value)
    } else {
      trailerData.value = null
      console.log('No trailer found in response')
    }
  } catch (error) {
    console.error('Error fetching trailer:', error)
    trailerData.value = null
  } finally {
    trailerLoading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'want_to_watch':
      return 'bg-blue-500'
    case 'watching':
      return 'bg-orange-500'
    case 'completed':
      return 'bg-green-500'
    case 'on_hold':
      return 'bg-yellow-500'
    case 'dropped':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'want_to_watch':
      return 'Want to Watch'
    case 'watching':
      return 'Currently Watching'
    case 'completed':
      return 'Completed'
    case 'on_hold':
      return 'On Hold'
    case 'dropped':
      return 'Dropped'
    default:
      return status
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600'
    case 'medium':
      return 'text-orange-600'
    case 'low':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

const getGenreName = (genre: any) => {
  if (typeof genre === 'string') {
    return genre
  }
  if (typeof genre === 'object' && genre !== null) {
    return genre.name || 'Unknown Genre'
  }
  return 'Unknown Genre'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Add/remove event listeners and load trailer data
watch(() => props.show, (newValue) => {
  console.log('Modal show changed:', newValue)
  if (newValue) {
    console.log('Modal opening, item:', props.item)
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    // Load trailer data when modal opens
    fetchTrailerData()
  } else {
    console.log('Modal closing')
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
    // Reset trailer data when modal closes
    trailerData.value = null
  }
}, { immediate: true })

// Debug: Check if component is mounting
onMounted(() => {
  console.log('WishlistDetailModal mounted with props:', { show: props.show, item: props.item })
  // If the modal is already showing when mounted, fetch trailer
  if (props.show) {
    console.log('Modal is already showing on mount, fetching trailer...')
    fetchTrailerData()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>
