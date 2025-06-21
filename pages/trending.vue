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
        <TopBar @search="handleSearch" />

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
                  <Icon name="mdi:star" class="w-5 h-5 text-yellow-400" />
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
          <div class="flex flex-col gap-6">
            <!-- Header -->
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">All Trending Content</h2>
              <p class="text-gray-600">Discover what's popular right now</p>
            </div>

            <!-- Search and Filters -->
            <div class="space-y-4">
              <!-- Search Bar -->
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="mdi:magnify" class="w-5 h-5 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search trending movies and TV shows..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  @input="handleSearchInput"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Icon name="mdi:close-circle" class="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              </div>

              <!-- Filter Controls -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex flex-wrap items-center gap-3">
                  <!-- Type Filter -->
                  <select 
                    v-model="selectedType" 
                    class="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="() => applyFilters()"
                  >
                    <option value="">All Types</option>
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                  </select>

                  <!-- Platform Filter -->
                  <select 
                    v-model="selectedPlatform" 
                    class="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="() => applyFilters()"
                  >
                    <option value="">All Platforms</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Hulu">Hulu</option>
                    <option value="Disney+">Disney+</option>
                    <option value="HBO Max">HBO Max</option>
                    <option value="Prime Video">Prime Video</option>
                    <option value="Apple TV+">Apple TV+</option>
                    <option value="Theaters">Theaters</option>
                  </select>
                </div>

                <!-- Sort and Clear -->
                <div class="flex items-center gap-3">
                  <!-- Sort Order -->
                  <select 
                    v-model="sortOrder" 
                    class="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    @change="() => sortItems()"
                  >
                    <option value="rating_desc">TMDB Rating ↓</option>
                    <option value="rating_asc">TMDB Rating ↑</option>
                    <option value="trending_rank">Trending Rank</option>
                    <option value="release_date">Release Date</option>
                    <option value="title">Title A-Z</option>
                  </select>

                  <!-- Clear Filters -->
                  <button
                    v-if="hasActiveFilters"
                    @click="clearAllFilters"
                    class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Icon name="mdi:filter-off" class="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>

              <!-- Active Filters Summary -->
              <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
                <span class="text-sm text-gray-600">Active filters:</span>
                <span v-if="searchQuery" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Search: "{{ searchQuery }}"
                  <button @click="clearSearch" class="hover:text-blue-900">
                    <Icon name="mdi:close" class="w-3 h-3" />
                  </button>
                </span>
                <span v-if="selectedType" class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Type: {{ selectedType === 'movie' ? 'Movies' : 'TV Shows' }}
                  <button @click="selectedType = ''; applyFilters()" class="hover:text-purple-900">
                    <Icon name="mdi:close" class="w-3 h-3" />
                  </button>
                </span>
                <span v-if="selectedPlatform" class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Platform: {{ selectedPlatform }}
                  <button @click="selectedPlatform = ''; applyFilters()" class="hover:text-green-900">
                    <Icon name="mdi:close" class="w-3 h-3" />
                  </button>
                </span>
              </div>

              <!-- Results Count -->
              <div class="text-sm text-gray-600">
                Showing {{ displayedItems.length }} of {{ trendingItems.length }} trending items
                <span v-if="searchQuery || selectedType || selectedPlatform">
                  (filtered)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Trending Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <TrendingCard 
            v-for="item in paginatedItems" 
            :key="`${item.tmdb_id}-${item.type}`"
            :item="item"
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

        <!-- Pagination Controls -->
        <div v-if="showPagination" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white rounded-lg border">
          <div class="text-sm text-gray-600">
            {{ paginationInfo }}
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Previous Button -->
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Icon name="mdi:chevron-left" class="w-4 h-4" />
              Previous
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
              <!-- First page -->
              <button
                v-if="currentPage > 3"
                @click="goToPage(1)"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                1
              </button>
              
              <!-- Ellipsis -->
              <span v-if="currentPage > 4" class="px-2 text-gray-400">...</span>
              
              <!-- Previous pages -->
              <button
                v-for="page in Math.max(1, currentPage - 2)"
                v-show="page < currentPage && page >= Math.max(1, currentPage - 2)"
                :key="`prev-${page}`"
                @click="goToPage(page)"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ page }}
              </button>
              
              <!-- Current page -->
              <button
                class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold"
                disabled
              >
                {{ currentPage }}
              </button>
              
              <!-- Next pages -->
              <button
                v-for="page in Math.min(totalPages, currentPage + 2)"
                v-show="page > currentPage && page <= Math.min(totalPages, currentPage + 2)"
                :key="`next-${page}`"
                @click="goToPage(page)"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ page }}
              </button>
              
              <!-- Ellipsis -->
              <span v-if="currentPage < totalPages - 3" class="px-2 text-gray-400">...</span>
              
              <!-- Last page -->
              <button
                v-if="currentPage < totalPages - 2"
                @click="goToPage(totalPages)"
                class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ totalPages }}
              </button>
            </div>

            <!-- Next Button -->
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Next
              <Icon name="mdi:chevron-right" class="w-4 h-4" />
            </button>
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
  </div>
</template>

<script setup lang="ts">
// Import composables explicitly
import { useTrending } from '~/composables/useTrending'
import type { TrendingItem } from '~/composables/useTrending'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const { user } = useAuth()
const { getAllTrending } = useTrending()

// Reactive state
const showMobileMenu = ref(false)
const trendingItems = ref<TrendingItem[]>([])
const displayedItems = ref<TrendingItem[]>([])
const currentHeroItem = ref<TrendingItem | null>(null)

// Hero carousel state
interface HeroPoolItem extends TrendingItem {}
const heroPool: HeroPoolItem[] = [];
const heroIndex = ref(0)
const heroItems = ref<TrendingItem[]>([])
const isAutoRotating = ref(true)
const showVideo = ref(true)
const heroVideoRef = ref<HTMLVideoElement | null>(null)
let heroRotationInterval: NodeJS.Timeout | null = null

// Search and filter state
const searchQuery = ref('')
const selectedPlatform = ref('')
const selectedType = ref('')
const sortOrder = ref('rating_desc')

// Client-side pagination state
const currentPage = ref(1)
const itemsPerPage = ref(20)
const paginatedItems = ref<TrendingItem[]>([])

// Modals
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Loading states
const loading = ref(false)

// Methods
const handleSearch = (query: string) => {
  navigateTo(`/search?q=${encodeURIComponent(query)}`)
}

// Hero carousel
const rotateHero = () => {
  if (heroItems.value.length > 1 && isAutoRotating.value) {
    heroIndex.value = (heroIndex.value + 1) % heroItems.value.length
    const previousIndex = heroIndex.value
    currentHeroItem.value = heroItems.value[heroIndex.value]
    showVideo.value = false // Reset video state
    nextTick(() => {
      showVideo.value = true // Trigger video load
    })
    if (previousIndex === heroItems.value.length - 1 && heroIndex.value === 0) {
      const rotationCompleteEvent = new CustomEvent('hero-rotation-complete', {
        detail: {
          items: heroItems.value
        }
      })
      window.dispatchEvent(rotationCompleteEvent)
    }
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

// Search and filter methods
const handleSearchInput = () => {
  // Debounce search to avoid too many filter calls
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  applyFilters()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedPlatform.value = ''
  applyFilters()
}

const applyFilters = () => {
  let filtered = [...trendingItems.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.overview?.toLowerCase().includes(query) ||
      item.genres?.some(genre => genre.toLowerCase().includes(query)) ||
      item.platform.toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (selectedType.value) {
    filtered = filtered.filter(item => item.type === selectedType.value)
  }

  // Apply platform filter
  if (selectedPlatform.value) {
    filtered = filtered.filter(item => item.platform === selectedPlatform.value)
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

const goToPage = (page: number) => {
  const totalPages = Math.ceil(displayedItems.value.length / itemsPerPage.value)
  if (page >= 1 && page <= totalPages) {
    currentPage.value = page
    updatePagination()
    
    // Scroll to top of trending grid
    const trendingGrid = document.querySelector('.grid')
    if (trendingGrid) {
      trendingGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const nextPage = () => {
  const totalPages = Math.ceil(displayedItems.value.length / itemsPerPage.value)
  if (currentPage.value < totalPages) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// Computed properties
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         selectedType.value !== '' || 
         selectedPlatform.value !== ''
})

const totalPages = computed(() => {
  return Math.ceil(displayedItems.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, displayedItems.value.length)
})

const paginationInfo = computed(() => {
  if (displayedItems.value.length === 0) return 'No items'
  return `${startIndex.value}-${endIndex.value} of ${displayedItems.value.length}`
})

const showPagination = computed(() => {
  return totalPages.value > 1
})

// Search timeout for debouncing
let searchTimeout: NodeJS.Timeout

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

const onRotationComplete = () => {
  // Move the first 5 items to the end of the pool
  const rotated = heroPool.splice(0, 5)
  heroPool.push(...rotated)

  // Take the next 5 items to display
  heroItems.value = heroPool.slice(0, 5)
}


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
      currentHeroItem.value = heroItems.value[0] as TrendingItem
    }

    applyFilters()
  } catch (error) {
    console.error('Error fetching trending items:', error)
  } finally {
    loading.value = false
  }
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

// Video modal methods
const playTrailer = (trailerUrl: string) => {
  currentVideoUrl.value = trailerUrl
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

  window.addEventListener('hero-rotation-complete', onRotationComplete)
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
