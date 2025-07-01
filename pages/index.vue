<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="showMobileMenu" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="showMobileMenu = false"
    ></div>

    <div class="flex gap-0 lg:gap-6 p-3 lg:p-6">
      <!-- Mobile Menu Toggle -->
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
        <TopBar />

        <!-- Hero Section with Auto-Rotating Trending Movies -->
        <div class="relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl overflow-hidden mb-8 h-96 md:h-[500px] transition-all duration-500">
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
                  <span class="text-white font-semibold">{{ currentHeroItem?.tmdb_rating?.toFixed(1) }}</span>
                  <span class="text-white opacity-75">TMDB</span>
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
                  @click="addToWatchlist(currentHeroItem)"
                  class="bg-blue-600 bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Icon name="mdi:heart-outline" class="w-5 h-5" />
                  Add to Wishlist
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

        <!-- Content Grid -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main Sections -->
          <div class="xl:col-span-2 space-y-8">
            <!-- Top Picks (derived from trending) -->
            <div class="bg-white rounded-2xl p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <Icon name="mdi:star" class="w-6 h-6 text-yellow-500" />
                  <h2 class="text-2xl font-bold text-gray-900">Top Picks</h2>
                </div>
                <button 
                  @click="shuffleTopPicks"
                  class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Icon name="mdi:shuffle-variant" class="w-4 h-4" />
                  Shuffle
                </button>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <TrendingCard 
                  v-for="item in topPicks" 
                  :key="`top-pick-${item.tmdb_id}`"
                  :item="item"
                  @play-trailer="playTrailer"
                  @add-to-wishlist="addToWatchlist"
                />
              </div>
            </div>

            <!-- All Trending Content -->
            <div class="bg-white rounded-2xl p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <Icon name="mdi:fire" class="w-6 h-6 text-orange-500" />
                  <h2 class="text-2xl font-bold text-gray-900">Trending Now</h2>
                  <span class="text-sm text-gray-500">Updated within 48 hours</span>
                </div>
                
                <!-- Filter Controls -->
                <div class="flex items-center gap-3">
                  <select 
                    v-model="selectedType" 
                    @change="applyFilters"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                <TrendingCard 
                  v-for="item in paginatedItems" 
                  :key="`${item.tmdb_id}-${item.type}`"
                  :item="item"
                  @play-trailer="playTrailer"
                  @add-to-wishlist="addToWatchlist"
                />
              </div>

              <!-- Load More Button -->
              <div v-if="showPagination" class="text-center mt-8">
                <button
                  @click="loadMoreTrending"
                  :disabled="loading"
                  class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                  <Icon 
                    :name="loading ? 'mdi:loading' : 'mdi:plus'" 
                    :class="['w-5 h-5', { 'animate-spin': loading }]" 
                  />
                  {{ loading ? 'Loading...' : 'Load More' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Sidebar Widgets -->
          <div class="space-y-6">
            <!-- Wishlist Widget -->
            <div class="bg-white rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <Icon name="mdi:heart" class="w-6 h-6 text-red-500" />
                  <h3 class="text-lg font-bold text-gray-900">My Wishlist</h3>
                </div>
                <span class="text-sm text-gray-500">{{ wishlistItems.length }} items</span>
              </div>
              
              <div v-if="wishlistItems.length > 0" class="space-y-3">
                <div 
                  v-for="item in wishlistItems.slice(0, 5)" 
                  :key="`wishlist-${item.tmdb_id}`"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  @click="playTrailer(item.trailer_url)"
                >
                  <img 
                    :src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
                    :alt="item.title"
                    class="w-12 h-16 object-cover rounded"
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 truncate">{{ item.title }}</h4>
                    <p class="text-sm text-gray-500">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</p>
                  </div>
                  <button 
                    @click.stop="removeFromWishlist(item)"
                    class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Icon name="mdi:close" class="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  v-if="wishlistItems.length > 5"
                  @click="viewAllWatchlist"
                  class="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
                >
                  View all {{ wishlistItems.length }} items
                </button>
              </div>
              
              <div v-else class="text-center py-8">
                <Icon name="mdi:heart-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 text-sm">No items in your wishlist yet</p>
                <p class="text-gray-400 text-xs mt-1">Add movies and shows from trending</p>
              </div>
            </div>
            
            <!-- Stats Widget Coming Soon -->
            <!-- TODO: Implement stats for trending content -->

            <!-- Strapi Status -->
            <StrapiStatus />
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoModal 
      :is-open="isVideoModalOpen"
      :video-url="currentVideoUrl"
      @close="closeVideoModal"
    />


    <!-- Watchlist Modal -->
    <WatchlistModal
      :is-open="isWatchlistModalOpen"
      :movie-data="selectedMovieForWatchlist"
      @close="closeWatchlistModal"
      @added="handleWatchlistAdded"
    />
  </div>
</template>

<script setup lang="ts">
// Import composables explicitly
import { useTrending } from '~/composables/useTrending'
import { useWatchlist } from '~/composables/useWatchlist'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Import composables
const { user } = useAuth()
const { getAllTrending } = useTrending()
const { getComingSoonItems, getTmdbPosterUrl } = useComingSoon()
const { fetchWatchlist, removeFromWatchlistByTmdbId, watchlistItems: watchlistData } = useWatchlist()

// Mobile Menu State
const showMobileMenu = ref(false)

// Video Modal State
interface VideoInfo {
  title: string
  description: string
  genre: string
  year: number
  duration: string
}

const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')
const currentVideoInfo = ref<VideoInfo | undefined>(undefined)

// Wishlist Modal State
const isWatchlistModalOpen = ref(false)
const selectedMovieForWatchlist = ref<any>(null)

// Trending State
const loading = ref(false)
const trendingItems = ref<any[]>([])
const displayedItems = ref<any[]>([])
const paginatedItems = ref<any[]>([])
const topPicks = ref<any[]>([])
const wishlistItems = ref<any[]>([])

// Hero Section State
const heroItems = ref<any[]>([])
const heroIndex = ref(0)
const currentHeroItem = ref<any>(null)
const isAutoRotating = ref(true)
const showVideo = ref(false)
const heroVideoRef = ref<HTMLVideoElement | null>(null)
let heroRotationInterval: NodeJS.Timeout | null = null

// Filter State
const searchQuery = ref('')
const selectedType = ref('')
const selectedPlatform = ref('')
const sortOrder = ref('rating_desc')
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Hero pool for rotation
const heroPool: any[] = []

// Movie data interface
interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  genres: string[]
  year: number
  duration: string
  trailerUrl: string
}

// Sample movie data - replace with API calls later
const trendingMovies = ref<Movie[]>([])
const comingSoonMovies = ref<Movie[]>([])

// Convert Coming Soon API data to Movie interface format
const convertComingSoonToMovie = (comingSoonItem: any): Movie => {
  return {
    id: comingSoonItem.id,
    title: comingSoonItem.title,
    poster: getTmdbPosterUrl(comingSoonItem.poster_path),
    rating: comingSoonItem.tmdb_rating || 0,
    genres: comingSoonItem.genres || [],
    year: new Date(comingSoonItem.release_date).getFullYear(),
    duration: comingSoonItem.runtime ? `${Math.floor(comingSoonItem.runtime / 60)}h ${comingSoonItem.runtime % 60}m` : 'TBA',
    trailerUrl: comingSoonItem.trailer_url || ''
  }
}

// Load trending data on mount

// Event Handlers
const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
  currentVideoInfo.value = undefined
}

// Watchlist Integration Methods
const addToWatchlist = (movie: any) => {
  console.log('Adding to watchlist:', movie.title)
  selectedMovieForWatchlist.value = movie
  isWatchlistModalOpen.value = true
}

const closeWatchlistModal = () => {
  isWatchlistModalOpen.value = false
  selectedMovieForWatchlist.value = null
}

const handleWatchlistAdded = async () => {
  // Refresh watchlist data
  await loadWatchlistData()
  closeWatchlistModal()
}

// Hero navigation methods
const goToHeroItem = (index: number) => {
  heroIndex.value = index
  currentHeroItem.value = heroItems.value[index]
  // Reset video state for new item
  showVideo.value = false
  nextTick(() => {
    showVideo.value = true
  })
}

const rotateHero = () => {
  if (heroItems.value.length > 1) {
    heroIndex.value = (heroIndex.value + 1) % heroItems.value.length
    currentHeroItem.value = heroItems.value[heroIndex.value]
    // Reset video state for new item
    showVideo.value = false
    nextTick(() => {
      showVideo.value = true
    })
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
  heroRotationInterval = setInterval(rotateHero, 120000) // Change every 2 minutes
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

// Video modal methods
const playTrailer = (trailerUrl: string) => {
  currentVideoUrl.value = trailerUrl
  isVideoModalOpen.value = true
}

// Filter and sorting methods
const applyFilters = () => {
  let filtered = [...trendingItems.value]

  // Apply type filter
  if (selectedType.value) {
    filtered = filtered.filter(item => item.type === selectedType.value)
  }

  displayedItems.value = filtered
  
  // Reset to first page when filters change
  currentPage.value = 1
  
  sortItems()
  updatePagination()
}

const updatePagination = () => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  paginatedItems.value = displayedItems.value.slice(startIndex, endIndex)
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
    case 'title':
      displayedItems.value.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  // Update pagination after sorting
  updatePagination()
}

const shuffleTopPicks = () => {
  // Fisher-Yates shuffle algorithm
  const shuffled = [...topPicks.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  topPicks.value = shuffled
}

const loadMoreTrending = () => {
  // Increase items per page to show more
  itemsPerPage.value += 20
  updatePagination()
}

// Computed properties
const showPagination = computed(() => {
  return displayedItems.value.length > itemsPerPage.value
})

// Data fetching
const fetchTrendingItems = async () => {
  try {
    loading.value = true
    
    // Fetch all trending items without pagination
    const response = await getAllTrending()
    
    trendingItems.value = response.data
    heroPool.push(...response.data)
    
    // Set hero items from first few trending items
    if (response.data.length > 0) {
      heroItems.value = heroPool.slice(0, 5)
      currentHeroItem.value = heroItems.value[0]
      
      // Create top picks from highest-rated trending items
      const sortedByRating = [...response.data].sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      topPicks.value = sortedByRating.slice(0, 8)
    }

    applyFilters()
  } catch (error) {
    console.error('Error fetching trending items:', error)
  } finally {
    loading.value = false
  }
}

// Wishlist management
const loadWatchlistData = async () => {
  try {
    await fetchWatchlist()
    wishlistItems.value = [...(watchlistData.value || [])]
  } catch (error) {
    console.error('Error loading wishlist:', error)
    wishlistItems.value = []
  }
}

const removeFromWishlist = async (item: any) => {
  try {
    console.log('Removing from wishlist:', item.title)
    await removeFromWatchlistByTmdbId(item.tmdb_id)
    await loadWatchlistData()
  } catch (error) {
    console.error('Error removing from wishlist:', error)
  }
}

const viewAllWatchlist = () => {
  navigateTo('/watchlist')
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchTrendingItems(),
    loadWatchlistData(),
  ])
  
  // Start hero rotation
  startHeroRotation()
})

// Cleanup on unmount
onUnmounted(() => {
  stopHeroRotation()
})
</script>
