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

        <!-- Hero Section with Trending Movie -->
        <div class="relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl overflow-hidden mb-8 h-96">
          <div 
            v-if="currentHeroItem"
            class="absolute inset-0 bg-cover bg-center"
            :style="`background-image: url('https://image.tmdb.org/t/p/w1280${currentHeroItem.backdrop_path}')`"
          >
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          <div class="relative z-10 flex items-center h-full p-8">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:fire" class="w-5 h-5 text-orange-400" />
                <span class="text-orange-400 font-medium">Trending Now</span>
              </div>

              <h1 v-if="currentHeroItem" class="text-4xl md:text-6xl font-bold text-white mb-4">
                {{ currentHeroItem.title }}
              </h1>

              <p v-if="currentHeroItem" class="text-lg text-white mb-6 max-w-xl opacity-90">
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
    <RatingModal 
      :is-open="isRatingModalOpen"
      :item="selectedItem"
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
import { useTrendingRatings } from '~/composables/useTrendingRatings'
import type { TrendingItem } from '~/composables/useTrending'
import type { TrendingRating } from '~/composables/useTrendingRatings'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const { user } = useAuth()
const { getAllTrending, getActiveTrending } = useTrending()
const { getMyRating, getMyRatings, rateItem } = useTrendingRatings()

// Reactive state
const showMobileMenu = ref(false)
const trendingItems = ref<TrendingItem[]>([])
const displayedItems = ref<TrendingItem[]>([])
const userRatings = ref(new Map<string, TrendingRating>())
const currentHeroItem = ref<TrendingItem | null>(null)
const currentHeroRating = ref<TrendingRating | null>(null)

// Filters and sorting
const selectedType = ref('')
const sortOrder = ref('rating_desc')
const ratingFilter = ref('all')

// Modals
const isRatingModalOpen = ref(false)
const selectedItem = ref<TrendingItem | null>(null)
const selectedItemRating = ref<TrendingRating | null>(null)
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Loading states
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)

// Hero carousel
const heroIndex = ref(0)
const heroItems = ref<TrendingItem[]>([])

// Methods
const handleSearch = (query: string) => {
  console.log('Searching for:', query)
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
    const ratings = await getMyRatings()
    userRatings.value.clear()
    
    ratings.forEach(rating => {
      const key = `${rating.tmdb_id}-${rating.type}`
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

const handleItemRated = async (rating: TrendingRating) => {
  const key = `${rating.tmdb_id}-${rating.type}`
  userRatings.value.set(key, rating)
  
  // Update hero rating if it's the current hero item
  if (currentHeroItem.value && 
      currentHeroItem.value.tmdb_id === rating.tmdb_id && 
      currentHeroItem.value.type === rating.type) {
    currentHeroRating.value = rating
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

// Hero carousel
const rotateHero = () => {
  if (heroItems.value.length > 1) {
    heroIndex.value = (heroIndex.value + 1) % heroItems.value.length
    currentHeroItem.value = heroItems.value[heroIndex.value]
    loadHeroRating()
  }
}

// Initialize
onMounted(async () => {
  await fetchTrendingItems()
  
  // Start hero rotation
  setInterval(rotateHero, 8000) // Change every 8 seconds
})
</script>
