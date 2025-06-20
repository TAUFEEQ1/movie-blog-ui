<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="showMobileMenu" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="showMobileMenu = false"
    ></div>

    <div class="flex gap-0 lg:gap-6 p-3 lg:p-6">
      <!-- Mob// Loading states
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1) Toggle -->
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md"
      >
        <Icon name="mdi:menu" class="w-6 h-6 text-gray-700" />
      </button>

      <!-- Sidebar -->
      <div :class="[
        'fixed lg:relative inset-y-0 left-0 z-40 lg:z-0 transform transition-transform duration-300 ease-in-out lg:transform-none',
        showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]">
        <Sidebar @close-mobile="showMobileMenu = false" />
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 w-full lg:ml-0">
        <!-- Top Navigation -->
        <TopBar @search="handleSearch" />

        <!-- Hero Section with Auto-Rotating Trending Movies -->
        <div class="relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl overflow-hidden mb-8 h-96 transition-all duration-500">
          <!-- Background Video/Image -->
          <div 
            v-if="currentHeroItem"
            class="absolute inset-0 transition-opacity duration-1000"
            :class="{ 'opacity-100': currentHeroItem, 'opacity-0': !currentHeroItem }"
          >
            <!-- YouTube Video Background -->
            <iframe 
              v-if="currentHeroItem.trailer_url && showVideo && isYouTubeUrl(currentHeroItem.trailer_url)"
              :key="`youtube-${currentHeroItem.tmdb_id}`"
              class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000"
              :src="`https://www.youtube.com/embed/${getYouTubeVideoId(currentHeroItem.trailer_url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&playlist=${getYouTubeVideoId(currentHeroItem.trailer_url)}`"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
              @load="onVideoLoaded"
              @error="onVideoError"
            ></iframe>
            
            <!-- Direct Video Background (for non-YouTube videos) -->
            <video 
              v-else-if="currentHeroItem.trailer_url && showVideo && getVideoSource(currentHeroItem.trailer_url)"
              ref="heroVideoRef"
              :key="`video-${currentHeroItem.tmdb_id}`"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              :src="getVideoSource(currentHeroItem.trailer_url) || ''"
              autoplay
              muted
              loop
              playsinline
              @loadeddata="onVideoLoaded"
              @error="onVideoError"
            ></video>
            
            <!-- Fallback Image Background -->
            <div 
              v-if="!currentHeroItem.trailer_url || !showVideo"
              class="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              :style="`background-image: url('https://image.tmdb.org/t/p/w1280${currentHeroItem.backdrop_path}')`"
            ></div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60 transition-opacity duration-1000"></div>
          </div>

          <!-- Loading State -->
          <div 
            v-if="!currentHeroItem" 
            class="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center"
          >
            <div class="text-white text-center">
              <Icon name="mdi:loading" class="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading trending content...</p>
            </div>
          </div>

          <!-- Content -->
          <div class="relative z-10 flex items-center h-full p-8">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:fire" class="w-5 h-5 text-orange-400" />
                <span class="text-orange-400 font-medium">Trending Now</span>
                <span class="text-white opacity-60 text-sm ml-2">
                  {{ heroIndex + 1 }} / {{ heroItems.length }}
                </span>
              </div>

              <h1 v-if="currentHeroItem" class="text-4xl md:text-6xl font-bold text-white mb-4 transition-all duration-500">
                {{ currentHeroItem.title }}
              </h1>

              <p v-if="currentHeroItem" class="text-lg text-white mb-6 max-w-xl opacity-90 transition-all duration-500">
                {{ currentHeroItem.overview }}
              </p>

              <!-- Rating Display and Actions -->
              <div class="flex items-center gap-4 mb-6">
                <div class="flex items-center gap-2">
                  <Icon name="mdi:star" class="w-5 h-5 text-yellow-400" />
                  <span class="text-white font-semibold">{{ currentHeroItem?.tmdb_rating?.toFixed(1) }}</span>
                  <span class="text-white opacity-75">TMDB</span>
                </div>

                <!-- User Rating Display -->
                <div v-if="currentHeroRating" class="flex items-center gap-2">
                  <Icon name="mdi:account-star" class="w-5 h-5 text-green-400" />
                  <span class="text-white font-semibold">{{ currentHeroRating.rating.toFixed(1) }}</span>
                  <span class="text-white opacity-75">Your Rating</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-4">
                <button 
                  v-if="currentHeroItem?.trailer_url"
                  @click="playTrailer(currentHeroItem.trailer_url)"
                  class="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Icon name="mdi:play" class="w-5 h-5" />
                  Watch Trailer
                </button>

                <button 
                  v-if="currentHeroItem"
                  @click="openRatingModal(currentHeroItem)"
                  class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Icon name="mdi:star-outline" class="w-5 h-5" />
                  {{ currentHeroRating ? 'Update Rating' : 'Rate' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Hero Navigation Dots -->
          <div class="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              v-for="(item, index) in heroItems"
              :key="`hero-dot-${item.tmdb_id}`"
              @click="goToHeroItem(index)"
              :class="[
                'w-3 h-3 rounded-full transition-all duration-300 relative overflow-hidden',
                index === heroIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              ]"
            >
              <!-- Progress indicator for current item -->
              <div 
                v-if="index === heroIndex && isAutoRotating"
                class="absolute inset-0 bg-orange-400 rounded-full origin-center animate-pulse"
                :style="{ 
                  animation: 'progress-fill 8s linear infinite'
                }"
              ></div>
            </button>
          </div>

          <!-- Auto-rotation Controls -->
          <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
            <!-- Video/Image indicator -->
            <div 
              v-if="currentHeroItem?.trailer_url"
              class="flex items-center gap-1 px-2 py-1 bg-black bg-opacity-30 rounded-lg backdrop-blur-sm text-white text-xs"
            >
              <Icon :name="showVideo && (isYouTubeUrl(currentHeroItem.trailer_url) || getVideoSource(currentHeroItem.trailer_url)) ? 'mdi:play-circle' : 'mdi:image'" class="w-3 h-3" />
              <span>{{ showVideo && (isYouTubeUrl(currentHeroItem.trailer_url) || getVideoSource(currentHeroItem.trailer_url)) ? 'Video' : 'Image' }}</span>
            </div>
            
            <button
              @click="toggleAutoRotation"
              :class="[
                'p-2 rounded-lg backdrop-blur-sm transition-colors',
                isAutoRotating 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-white bg-opacity-30 text-white hover:bg-opacity-40'
              ]"
              :title="isAutoRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'"
            >
              <Icon :name="isAutoRotating ? 'mdi:pause' : 'mdi:play'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Controls and Filters -->
        <div class="bg-white rounded-2xl p-6 mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">All Trending Content</h2>
              <p class="text-gray-600">Discover what's popular right now</p>
            </div>

            <div class="flex items-center gap-4">
              <!-- Type Filter -->
              <select 
                v-model="selectedType" 
                class="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                @change="() => fetchTrendingItems()"
              >
                <option value="">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>

              <!-- Sort Order -->
              <select 
                v-model="sortOrder" 
                class="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                @change="() => sortItems()"
              >
                <option value="rating_desc">TMDB Rating (High to Low)</option>
                <option value="rating_asc">TMDB Rating (Low to High)</option>
                <option value="trending_rank">Trending Rank</option>
                <option value="release_date">Release Date</option>
              </select>

              <!-- My Ratings Filter -->
              <select 
                v-model="ratingFilter" 
                class="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                @change="() => applyRatingFilter()"
              >
                <option value="all">All Items</option>
                <option value="rated">My Rated</option>
                <option value="unrated">Unrated</option>
                <option value="notable">Notable</option>
                <option value="unfavorable">Unfavorable</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Trending Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <TrendingCard 
            v-for="item in displayedItems" 
            :key="`${item.tmdb_id}-${item.type}`"
            :item="item"
            :user-rating="userRatings.get(`${item.tmdb_id}-${item.type}`)"
            @rate="openRatingModal"
            @play-trailer="playTrailer"
          />
        </div>

        <!-- Empty State -->
        <div 
          v-if="displayedItems.length === 0"
          class="text-center py-12"
        >
          <Icon name="mdi:movie-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No trending items found</p>
        </div>

        <!-- Load More -->
        <div 
          v-if="hasMore" 
          class="text-center mt-8"
        >
          <button 
            @click="loadMore"
            :disabled="loading"
            class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <UniversalRatingModal 
      v-if="isRatingModalOpen && selectedItem"
      :item="selectedItem"
      :content-type="'trending'"
      :existing-rating="selectedItemRating"
      @close="closeRatingModal"
      @rated="handleItemRated"
    />

    <!-- Video Modal -->
    <VideoModal 
      :is-open="isVideoModalOpen"
      :video-url="currentVideoUrl"
      @close="closeVideoModal"
    />
  </div>
</template>

<script setup lang="ts">
// Import composables explicitly
import { useTrending } from '~/composables/useTrending'
import { useUserRatings } from '~/composables/useUserRatings'
import type { TrendingItem } from '~/composables/useTrending'
import type { UserRating } from '~/composables/useUserRatings'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const { user } = useAuth()
const { getAllTrending, getActiveTrending } = useTrending()
const { getMyRating, getMyRatings, rateItem } = useUserRatings()

// Reactive state
const showMobileMenu = ref(false)
const trendingItems = ref<TrendingItem[]>([])
const displayedItems = ref<TrendingItem[]>([])
const userRatings = ref(new Map<string, UserRating>())
const currentHeroItem = ref<TrendingItem | null>(null)
const currentHeroRating = ref<UserRating | null>(null)

// Hero carousel state
const heroIndex = ref(0)
const heroItems = ref<TrendingItem[]>([])
const isAutoRotating = ref(true)
const showVideo = ref(true)
const heroVideoRef = ref<HTMLVideoElement | null>(null)
let heroRotationInterval: NodeJS.Timeout | null = null

// Filters and sorting
const selectedType = ref('')
const sortOrder = ref('rating_desc')
const ratingFilter = ref('all')

// Modals
const isRatingModalOpen = ref(false)
const selectedItem = ref<TrendingItem | null>(null)
const selectedItemRating = ref<UserRating | null>(null)
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Loading states
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

// Methods
const handleSearch = (query: string) => {
  console.log('Searching for:', query)
}

// Hero carousel
const rotateHero = () => {
  if (heroItems.value.length > 1 && isAutoRotating.value) {
    heroIndex.value = (heroIndex.value + 1) % heroItems.value.length
    currentHeroItem.value = heroItems.value[heroIndex.value]
    showVideo.value = false // Reset video state
    nextTick(() => {
      showVideo.value = true // Trigger video load
    })
    loadHeroRating()
  }
}

const goToHeroItem = (index: number) => {
  if (index >= 0 && index < heroItems.value.length) {
    heroIndex.value = index
    currentHeroItem.value = heroItems.value[index]
    showVideo.value = false
    nextTick(() => {
      showVideo.value = true
    })
    loadHeroRating()
  }
}

const toggleAutoRotation = () => {
  isAutoRotating.value = !isAutoRotating.value
  if (isAutoRotating.value) {
    startHeroRotation()
  } else {
    stopHeroRotation()
  }
}

const startHeroRotation = () => {
  if (heroRotationInterval) {
    clearInterval(heroRotationInterval)
  }
  heroRotationInterval = setInterval(rotateHero, 8000) // Change every 8 seconds
}

const stopHeroRotation = () => {
  if (heroRotationInterval) {
    clearInterval(heroRotationInterval)
    heroRotationInterval = null
  }
}

const onVideoLoaded = () => {
  // Video loaded successfully
  if (heroVideoRef.value) {
    heroVideoRef.value.play().catch(() => {
      // Fallback to image if autoplay fails
      showVideo.value = false
    })
  }
}

const onVideoError = () => {
  // Video failed to load, fallback to image
  showVideo.value = false
}

// Utility function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : null
}

// Check if URL is a YouTube video
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

// Get video source URL (for non-YouTube videos)
const getVideoSource = (url: string): string | null => {
  if (isYouTubeUrl(url)) {
    return null // YouTube videos can't be played directly
  }
  return url
}

const fetchTrendingItems = async (reset = true) => {
  try {
    loading.value = true
    
    if (reset) {
      currentPage.value = 1
      trendingItems.value = []
    }

    const filters: any = {
      page: currentPage.value,
      pageSize: 20
    }

    if (selectedType.value) {
      filters.type = selectedType.value
    }

    const response = await getAllTrending(filters)
    
    if (reset) {
      trendingItems.value = response.data
    } else {
      trendingItems.value.push(...response.data)
    }

    hasMore.value = currentPage.value < response.meta.pagination.pageCount
    
    // Set hero items from first few trending items
    if (reset && response.data.length > 0) {
      heroItems.value = response.data.slice(0, 5)
      currentHeroItem.value = heroItems.value[0]
      await loadHeroRating()
    }

    await loadUserRatings()
    applyRatingFilter()
    sortItems()
  } catch (error) {
    console.error('Error fetching trending items:', error)
  } finally {
    loading.value = false
  }
}

const loadUserRatings = async () => {
  try {
    const ratings = await getMyRatings({ content_type: 'trending' })
    userRatings.value.clear()
    
    ratings.forEach(rating => {
      const key = `${rating.tmdb_id}-${rating.media_type}`
      userRatings.value.set(key, rating)
    })
  } catch (error) {
    console.error('Error loading user ratings:', error)
  }
}

const loadHeroRating = async () => {
  if (currentHeroItem.value) {
    currentHeroRating.value = await getMyRating(
      currentHeroItem.value.tmdb_id, 
      'trending',
      currentHeroItem.value.type
    )
  }
}

const applyRatingFilter = () => {
  let filtered = [...trendingItems.value]

  switch (ratingFilter.value) {
    case 'rated':
      filtered = filtered.filter(item => 
        userRatings.value.has(`${item.tmdb_id}-${item.type}`)
      )
      break
    case 'unrated':
      filtered = filtered.filter(item => 
        !userRatings.value.has(`${item.tmdb_id}-${item.type}`)
      )
      break
    case 'notable':
      filtered = filtered.filter(item => {
        const rating = userRatings.value.get(`${item.tmdb_id}-${item.type}`)
        return rating && (rating.is_notable || rating.rating >= 8)
      })
      break
    case 'unfavorable':
      filtered = filtered.filter(item => {
        const rating = userRatings.value.get(`${item.tmdb_id}-${item.type}`)
        return rating && (rating.is_unfavorable || rating.rating <= 4)
      })
      break
    default:
      // Show all
      break
  }

  displayedItems.value = filtered
}

const sortItems = () => {
  switch (sortOrder.value) {
    case 'rating_desc':
      displayedItems.value.sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      break
    case 'rating_asc':
      displayedItems.value.sort((a, b) => (a.tmdb_rating || 0) - (b.tmdb_rating || 0))
      break
    case 'trending_rank':
      displayedItems.value.sort((a, b) => (a.trending_rank || 999) - (b.trending_rank || 999))
      break
    case 'release_date':
      displayedItems.value.sort((a, b) => {
        const dateA = new Date(a.release_date || '1900-01-01').getTime()
        const dateB = new Date(b.release_date || '1900-01-01').getTime()
        return dateB - dateA
      })
      break
  }
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  
  currentPage.value++
  await fetchTrendingItems(false)
}

const openRatingModal = (item: TrendingItem) => {
  selectedItem.value = item
  selectedItemRating.value = userRatings.value.get(`${item.tmdb_id}-${item.type}`) || null
  isRatingModalOpen.value = true
}

const closeRatingModal = () => {
  isRatingModalOpen.value = false
  selectedItem.value = null
  selectedItemRating.value = null
}

const handleItemRated = async (rating: UserRating | null) => {
  if (rating) {
    const key = `${rating.tmdb_id}-${rating.media_type}`
    userRatings.value.set(key, rating)
    
    // Update hero rating if it's the current hero item
    if (currentHeroItem.value && 
        currentHeroItem.value.tmdb_id === rating.tmdb_id && 
        currentHeroItem.value.type === rating.media_type) {
      currentHeroRating.value = rating
    }
  } else {
    // Handle rating removal
    if (selectedItem.value) {
      const key = `${selectedItem.value.tmdb_id}-${selectedItem.value.type}`
      userRatings.value.delete(key)
      
      // Clear hero rating if it's the current hero item
      if (currentHeroItem.value && 
          currentHeroItem.value.tmdb_id === selectedItem.value.tmdb_id && 
          currentHeroItem.value.type === selectedItem.value.type) {
        currentHeroRating.value = null
      }
    }
  }
  
  applyRatingFilter()
  closeRatingModal()
}

const playTrailer = (videoUrl: string) => {
  currentVideoUrl.value = videoUrl
  isVideoModalOpen.value = true
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}

// Initialize
onMounted(async () => {
  await fetchTrendingItems()
  
  // Start hero rotation
  startHeroRotation()
})

// Cleanup on unmount
onUnmounted(() => {
  stopHeroRotation()
})
</script>

<style scoped>
@keyframes progress-fill {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

/* Smooth transitions for hero content */
.hero-content-enter-active,
.hero-content-leave-active {
  transition: all 0.5s ease-in-out;
}

.hero-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.hero-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
