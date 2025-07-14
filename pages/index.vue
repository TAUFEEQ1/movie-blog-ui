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
        <div 
          class="relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl overflow-hidden mb-8 h-96 md:h-[500px] transition-all duration-500"
          @touchstart.passive="handleTouchStart"
          @touchmove.passive="handleTouchMove"
          @touchend.passive="handleTouchEnd"
        >
          <!-- Background Video/Image -->
          <div 
            v-if="currentHeroItem"
            class="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            :class="{ 'opacity-100': currentHeroItem, 'opacity-0': !currentHeroItem }"
          >
            <!-- YouTube Video Background (hidden on mobile) -->
            <iframe 
              v-if="!isMobile && currentHeroItem.trailer_url && showVideo && isYouTubeUrl(currentHeroItem.trailer_url)"
              :key="`youtube-${currentHeroItem.tmdb_id}`"
              class="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000"
              :src="`https://www.youtube.com/embed/${getYouTubeVideoId(currentHeroItem.trailer_url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&playlist=${getYouTubeVideoId(currentHeroItem.trailer_url)}`"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
              @load="onVideoLoaded"
              @error="onVideoError"
            ></iframe>
            
            <!-- Direct Video Background (hidden on mobile) -->
            <video 
              v-else-if="!isMobile && currentHeroItem.trailer_url && showVideo && getVideoSource(currentHeroItem.trailer_url)"
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
              v-if="isMobile || !currentHeroItem.trailer_url || !showVideo"
              class="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              :style="`background-image: url('https://image.tmdb.org/t/p/w1280${currentHeroItem.backdrop_path}')`"
            ></div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60 transition-opacity duration-1000"></div>
          </div>

          <!-- Loading State -->
          <div 
            v-if="!currentHeroItem" 
            class="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center pointer-events-none"
          >
            <div class="text-white text-center">
              <Icon name="mdi:loading" class="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading trending content...</p>
            </div>
          </div>

          <!-- Content -->
          <div class="relative z-10 flex items-center h-full p-8 pointer-events-none">
            <div class="flex-1 pointer-events-auto">
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

              <p v-if="currentHeroItem" class="hidden md:block text-lg text-white mb-6 max-w-xl opacity-90 transition-all duration-500">
                {{ truncate(currentHeroItem.overview, 200) }}
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
                  <span class="hidden sm:inline">Watch Trailer</span>
                  <span class="sm:hidden">Play</span>
                </button>

                <button 
                  @click="addToWatchlist(currentHeroItem)"
                  class="bg-blue-600 bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Icon name="mdi:bookmark-outline" class="w-5 h-5" />
                  <span class="hidden sm:inline">Add to Watchlist</span>
                  <span class="sm:hidden">Save</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Hero Navigation Dots -->
          <div class="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
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
          <div class="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            <!-- Video/Image indicator (hidden on mobile) -->
            <div 
              v-if="!isMobile && currentHeroItem?.trailer_url"
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

          <!-- Mobile Swipe Indicator -->
          <div 
            v-if="isMobile && isSwiping" 
            class="absolute inset-y-0 z-30 pointer-events-none flex items-center px-4"
            :class="swipeDirection === 'right' ? 'left-0' : 'right-0'"
          >
            <div class="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Icon 
                :name="swipeDirection === 'right' ? 'mdi:chevron-left' : 'mdi:chevron-right'" 
                class="w-6 h-6 text-white"
              />
            </div>
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
              
              <Carousel 
                :items-to-show="isMobile ? 1 : 3"
                :wrap-around="true"
                :touch-drag="true"
                :mouse-drag="true"
                :autoplay="5000"
                pause-autoplay-on-hover
                class="top-picks-carousel"
              >
                <template #addons>
                  <Navigation />
                  <Pagination />
                </template>
                <Slide 
                  v-for="item in topPicks" 
                  :key="`top-pick-${item.tmdb_id}`"
                  class="p-2"
                >
                  <TrendingCard 
                    :item="item"
                    @play-trailer="playTrailer"
                    @add-to-wishlist="addToWatchlist"
                  />
                </Slide>
              </Carousel>
            </div>

            <!-- All Trending Content -->
            <div 
              class="bg-white rounded-2xl p-6"
              ref="trendingSection"
            >
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <Icon name="mdi:fire" class="w-6 h-6 text-orange-500" />
                  <h2 class="text-2xl font-bold text-gray-900">Trending Now</h2>
                  <span class="text-sm text-gray-500">Updated within 48 hours</span>
                </div>
                
                <!-- Filter Controls - Hidden on mobile -->
                <div class="hidden md:flex items-center gap-3">
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


              
              <!-- Current Month Carousel -->
              <div v-if="currentMonthItems.length > 0" class="mb-8">
                <h3 class="text-lg font-medium text-gray-800 mb-4">This Month</h3>
                <Carousel 
                  :items-to-show="isMobile ? 1.2 : 4.2"
                  :wrap-around="false"
                  :touch-drag="true"
                  :mouse-drag="true"
                  snap-align="start"
                  class="trending-carousel"
                >
                  <template #addons>
                    <Navigation />
                  </template>
                  <Slide 
                    v-for="item in currentMonthItems" 
                    :key="`current-${item.tmdb_id}-${item.type}`"
                    class="pr-4"
                  >
                    <TrendingCard 
                      :item="item"
                      @play-trailer="playTrailer"
                      @add-to-wishlist="addToWatchlist"
                    />
                  </Slide>
                </Carousel>
              </div>

              <!-- Last Month Carousel -->
              <div v-if="lastMonthItems.length > 0" class="mb-8">
                <h3 class="text-lg font-medium text-gray-800 mb-4">Last Month</h3>
                <Carousel 
                  :items-to-show="isMobile ? 1.2 : 4.2"
                  :wrap-around="false"
                  :touch-drag="true"
                  :mouse-drag="true"
                  snap-align="start"
                  class="trending-carousel"
                >
                  <template #addons>
                    <Navigation />
                  </template>
                  <Slide 
                    v-for="item in lastMonthItems" 
                    :key="`last-${item.tmdb_id}-${item.type}`"
                    class="pr-4"
                  >
                    <TrendingCard 
                      :item="item"
                      @play-trailer="playTrailer"
                      @add-to-wishlist="addToWatchlist"
                    />
                  </Slide>
                </Carousel>
              </div>

              <!-- Empty State -->
              <div 
                v-if="currentMonthItems.length === 0 && lastMonthItems.length === 0" 
                class="text-center py-12"
              >
                <Icon name="mdi:movie-open-off" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No trending items found for this period</p>
                <p class="text-gray-400 text-sm mt-1">Try changing your filters or check back later</p>
              </div>
            </div>
          </div>

          <!-- Sidebar Widgets -->
          <div class="space-y-6">
            <!-- Wishlist Widget -->
            <div class="bg-white rounded-2xl p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <Icon name="mdi:playlist-plus" class="w-6 h-6 text-black" />
                  <h3 class="text-lg font-bold text-gray-900">My Watchlist</h3>
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
                <Icon name="mdi:bookmark-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 text-sm">No items in your watchlist yet</p>
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

    <!-- Filter Modal (Mobile Only) -->
    <div
      v-if="isMobile && isFilterModalOpen"
      class="fixed inset-0 z-50 lg:hidden"
    >
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50"
        @click="isFilterModalOpen = false"
      ></div>
      
      <!-- Modal Content -->
      <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 transform transition-transform duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold">Filter Content</h3>
          <button 
            @click="isFilterModalOpen = false"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>

        <!-- Filter Options -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <select 
              v-model="selectedType" 
              @change="applyFiltersAndCloseModal"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>

          <!-- Apply Button -->
          <button
            @click="applyFiltersAndCloseModal"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Filter Button (Mobile Only) -->
    <button
      v-if="isMobile && showFilterFab"
      @click="isFilterModalOpen = true"
      class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all transform scale-100 hover:scale-105"
    >
      <Icon name="mdi:filter-variant" class="w-5 h-5" />
      <span>Filters</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// Import composables explicitly
import { useTrending } from '~/composables/useTrending'
import { useWatchlist } from '~/composables/useWatchlist'

// Protect this page with authentication middleware
definePageMeta({
  middleware: ['auth'],
  auth: true
})

// Import composables
const { user } = useAuth()
const { getAllTrending, getTopPicks } = useTrending()
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
const itemsPerPage = ref(8) // Changed from 20 to 8 items per page

// Filter trending items by faded_on date
const currentMonthItems = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return paginatedItems.value.filter(item => {
    const fadedOn = new Date(item.faded_on)
    return fadedOn >= startOfMonth
  })
})

const lastMonthItems = computed(() => {
  const now = new Date()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  
  return paginatedItems.value.filter(item => {
    const fadedOn = new Date(item.faded_on)
    return fadedOn >= startOfLastMonth && fadedOn <= endOfLastMonth
  })
})

// Get all items for display
const displayedItems = computed(() => [...currentMonthItems.value, ...lastMonthItems.value])

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
  if (!trendingItems.value.length) return;
  
  let filtered = [...trendingItems.value]

  // Apply type filter
  if (selectedType.value) {
    filtered = filtered.filter(item => item.type === selectedType.value)
  }

  // No need to filter by tabs anymore since we show all items in separate carousels

  // Reset to first page when filters change
  currentPage.value = 1

  // Update paginatedItems based on filtered and sorted items
  let sorted = [...filtered]
  switch (sortOrder.value) {
    case 'rating_desc':
      sorted.sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      break
    case 'rating_asc':
      sorted.sort((a, b) => (a.tmdb_rating || 0) - (b.tmdb_rating || 0))
      break
    case 'trending_rank':
      sorted.sort((a, b) => (a.trending_rank || 999) - (b.trending_rank || 999))
      break
    case 'release_date':
      sorted.sort((a, b) => {
        const dateA = new Date(a.release_date || '1900-01-01').getTime()
        const dateB = new Date(b.release_date || '1900-01-01').getTime()
        return dateB - dateA
      })
      break
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  // Update the paginated items
  paginatedItems.value = sorted

  // No need to call updatePagination() since displayedItems computed property 
  // will handle the pagination based on currentPage and itemsPerPage
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
  // Increase items per page by 8
  itemsPerPage.value += 8
  updatePagination()
}

// Computed properties
const showPagination = computed(() => {
  return displayedItems.value.length > itemsPerPage.value
})

// Data fetching
// Declare heroPool to store trending items for the hero section
const heroPool: any[] = []

const fetchTrendingItems = async () => {
  try {
    loading.value = true
    
    // Fetch all trending items without pagination
    const response = await getAllTrending()
    
    // Set all items first
    trendingItems.value = response.data
    paginatedItems.value = response.data
    
    // Set up hero section
    if (response.data.length > 0) {
      const potentialHeroItems = response.data
        .filter(item => item.backdrop_path && (item.trailer_url || item.type === 'tv'))
        .slice(0, 5)
      heroItems.value = potentialHeroItems
      currentHeroItem.value = heroItems.value[0]
    }

    // Apply initial filters after data is loaded
    applyFilters()
  } catch (error) {
    console.error('Error fetching trending items:', error)
  } finally {
    loading.value = false
  }
}

// Patch TrendingItem type for runtime fields
interface TrendingItemWithScore extends TrendingItem {
  combined_score?: number
}

// Fetch all trending items with authentication for Top Picks
const fetchTopPicks = async () => {
  try {
    loading.value = true
    // Fetch from /api/top-picks
    const picks = await getTopPicks()
    topPicks.value = picks.slice(0, 8)
  } catch (error) {
    console.error('Error fetching top picks:', error)
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
    fetchTopPicks(),
    loadWatchlistData(),
  ])
  
  // Start hero rotation
  startHeroRotation()
})

// Cleanup on unmount
onUnmounted(() => {
  stopHeroRotation()
})

// Helper function to truncate text
const truncate = (text: string, max: number) => {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}

// Import additional libraries
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

// Responsive check for mobile
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)


// Touch handling state
const touchStartX = ref(0)
const touchEndX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)
const swipeDirection = ref<'left' | 'right' | null>(null)
const minSwipeDistance = 50 // minimum distance for a swipe
const swipeThreshold = 30 // threshold to show swipe indicator

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = e.touches[0].clientX
  isSwiping.value = false
  swipeDirection.value = null
}

const handleTouchMove = (e: TouchEvent) => {
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value

  if (Math.abs(deltaX) > swipeThreshold) {
    isSwiping.value = true
    swipeDirection.value = deltaX > 0 ? 'right' : 'left'
  }
}

const handleTouchEnd = () => {
  const swipeDistance = touchCurrentX.value - touchStartX.value
  
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swipe right - go to previous
      const newIndex = (heroIndex.value - 1 + heroItems.value.length) % heroItems.value.length
      goToHeroItem(newIndex)
    } else {
      // Swipe left - go to next
      const newIndex = (heroIndex.value + 1) % heroItems.value.length
      goToHeroItem(newIndex)
    }
  }

  isSwiping.value = false
  swipeDirection.value = null
}

// Filter Modal State
const isFilterModalOpen = ref(false)
const showFilterFab = ref(false)
const trendingSection = ref<HTMLElement | null>(null)

// Scroll handler for filter FAB
const handleScroll = () => {
  if (!trendingSection.value || !isMobile.value) return
  
  const rect = trendingSection.value.getBoundingClientRect()
  const threshold = window.innerHeight * 0.3 // Show FAB when 30% of viewport height is reached
  
  // Show FAB when trending section is in view and user has scrolled past threshold
  showFilterFab.value = rect.top <= threshold && rect.bottom > 0
}

// Apply filters and close modal
const applyFiltersAndCloseModal = () => {
  applyFilters()
  isFilterModalOpen.value = false
}

// Add scroll event listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
.top-picks-carousel .carousel__slide,
.trending-carousel .carousel__slide {
  padding: 1rem;
}

/* Carousel Navigation Buttons - Desktop */
@media (min-width: 1024px) {
  .top-picks-carousel .carousel__prev,
  .top-picks-carousel .carousel__next,
  .trending-carousel .carousel__prev,
  .trending-carousel .carousel__next {
    background-color: #3b82f6;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .top-picks-carousel .carousel__prev:hover,
  .top-picks-carousel .carousel__next:hover,
  .trending-carousel .carousel__prev:hover,
  .trending-carousel .carousel__next:hover {
    background-color: #2563eb;
    transform: scale(1.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .top-picks-carousel .carousel__prev:focus,
  .top-picks-carousel .carousel__next:focus,
  .trending-carousel .carousel__prev:focus,
  .trending-carousel .carousel__next:focus {
    border-color: #60a5fa;
    outline: none;
  }
}

/* Carousel Navigation Buttons - Mobile */
@media (max-width: 1023px) {
  .top-picks-carousel .carousel__prev,
  .top-picks-carousel .carousel__next,
  .trending-carousel .carousel__prev,
  .trending-carousel .carousel__next {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .top-picks-carousel .carousel__prev:hover,
  .top-picks-carousel .carousel__next:hover,
  .trending-carousel .carousel__prev:hover,
  .trending-carousel .carousel__next:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.top-picks-carousel .carousel__pagination {
  margin-top: 1rem;
}

.top-picks-carousel .carousel__pagination-button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e5e7eb;
  margin: 0 4px;
  transition: transform 0.3s, background-color 0.3s;
}

.top-picks-carousel .carousel__pagination-button--active {
  transform: scale(1.2);
  background-color: #3b82f6;
}

/* Filter FAB and Modal Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.filter-fab-enter-active,
.filter-fab-leave-active {
  transition: all 0.3s ease;
}

.filter-fab-enter-from,
.filter-fab-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  transform: translateY(100%);
}
</style>
