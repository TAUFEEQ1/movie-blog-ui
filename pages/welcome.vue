<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
    <Transition name="fade" appear>
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full bg-gradient" style="animation-delay: 0s"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400 to-yellow-500 rounded-full bg-gradient" style="animation-delay: 2s"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-ping" style="animation-delay: 4s"></div>
      </div>
    </Transition>

    <div class="relative z-10 p-6">
      <!-- Navigation Bar -->
      <nav class="flex justify-between items-center max-w-7xl mx-auto mb-12">
        <!-- Hamburger Menu Button -->
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <Icon name="mdi:menu" class="w-6 h-6" />
        </button>
        
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
          <h1 class="text-2xl font-bold text-white">TrendingNow</h1>
        </div>
        <div class="hidden sm:flex items-center">
          <NuxtLink 
            to="/guest-watchlist" 
            class="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Icon name="mdi:bookmark" class="w-5 h-5" />
            My Watchlist
            <span v-if="guestWatchlist.length > 0" class="px-2 py-0.5 text-xs bg-white/20 rounded-full">
              {{ guestWatchlist.length }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Mobile Menu Overlay -->
      <div 
        v-if="showMobileMenu" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="showMobileMenu = false"
      >
        <div 
          class="fixed inset-y-0 left-0 w-64 bg-gradient-to-br from-gray-900 to-blue-900 p-6 transform transition-transform duration-300"
          :class="showMobileMenu ? 'translate-x-0' : '-translate-x-full'"
          @click.stop
        >
          <div class="flex flex-col gap-4">
            <NuxtLink 
              to="/guest-watchlist"
              class="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
              @click="showMobileMenu = false"
            >
              <Icon name="mdi:bookmark" class="w-5 h-5" />
              My Watchlist
            </NuxtLink>
            <NuxtLink 
              to="/login" 
              class="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
              @click="showMobileMenu = false"
            >
              <Icon name="mdi:login" class="w-5 h-5" />
              Sign In
            </NuxtLink>
            <NuxtLink 
              to="/register" 
              class="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
              @click="showMobileMenu = false"
            >
              <Icon name="mdi:rocket" class="w-5 h-5" />
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
          Discover Your Next Favorite
          <span class="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Entertainment</span>
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Track, rate, and discover trending movies and TV shows. Join our community of entertainment enthusiasts.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto">
          <NuxtLink 
            to="/register" 
            class="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Icon name="mdi:rocket" class="w-5 h-5" />
            Start Your Journey
          </NuxtLink>
          <NuxtLink 
            to="/login" 
            class="w-full px-8 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="mdi:login" class="w-5 h-5" />
            Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- Trending Content -->
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col gap-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="mdi:fire" class="w-6 h-6 text-orange-400" />
              <h2 class="text-2xl font-bold text-white">Trending Now</h2>
            </div>
            <NuxtLink 
              to="/register" 
              class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              <span>Join to see more</span>
              <Icon name="mdi:arrow-right" class="w-5 h-5" />
            </NuxtLink>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search titles..."
                class="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex items-center gap-4">
              <select
                v-model="sortBy"
                class="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="title">Sort by Title</option>
              </select>
              <button
                @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
                class="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20"
              >
                <Icon 
                  :name="sortOrder === 'desc' ? 'mdi:sort-descending' : 'mdi:sort-ascending'" 
                  class="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <!-- Content Tabs -->
          <div class="flex gap-4 border-b border-white/20">
            <button
              v-for="tab in [{ id: 'movies', label: 'Movies', icon: 'mdi:movie' }, { id: 'tv', label: 'TV Shows', icon: 'mdi:television-classic' }]"
              :key="tab.id"
              @click="activeTab = tab.id; currentPage = 1"
              :class="[
                'px-6 py-3 flex items-center gap-2 font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              ]"
            >
              <Icon :name="tab.icon" class="w-5 h-5" />
              {{ tab.label }}
              <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10">
                {{ tab.id === 'movies' ? movies.length : tvShows.length }}
              </span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div 
            v-for="item in paginatedItems" 
            :key="`trending-${item.id}`"
            class="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105"
          >
            <!-- Movie Poster -->
            <div class="aspect-[2/3] overflow-hidden">
              <img 
                :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
                :alt="item.title || item.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                @error="handleImageError"
              />
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 class="font-bold text-lg mb-2 line-clamp-2">{{ item.title || item.name }}</h3>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-300 capitalize">{{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                    <div class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                      <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                      <span class="text-sm font-bold text-white">{{ item.vote_average?.toFixed(1) || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="openTrailer(item)"
                      class="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded"
                    >
                      <Icon name="mdi:play" class="w-4 h-4" />
                      Trailer
                    </button>
                    <button
                      @click="toggleGuestWatchlist(item)"
                      class="flex-1 flex items-center justify-center gap-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors px-3 py-1.5 rounded"
                    >
                      <Icon 
                        :name="isInGuestWatchlist(item) ? 'mdi:bookmark-check' : 'mdi:bookmark-plus'" 
                        class="w-4 h-4" 
                      />
                      {{ isInGuestWatchlist(item) ? 'Saved' : 'Save' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
          <!-- Previous Page -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-left" class="w-5 h-5" />
          </button>

          <!-- First Page -->
          <button
            v-if="currentPage > 3"
            @click="changePage(1)"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white hover:bg-white/20"
          >
            1
          </button>

          <!-- Ellipsis -->
          <span v-if="currentPage > 3" class="text-white/50">...</span>

          <!-- Pages around current -->
          <button
            v-for="page in totalPages"
            :key="page"
            v-show="page === currentPage || (page >= currentPage - 1 && page <= currentPage + 1)"
            @click="changePage(page)"
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            ]"
          >
            {{ page }}
          </button>

          <!-- Ellipsis -->
          <span v-if="currentPage < totalPages - 2" class="text-white/50">...</span>

          <!-- Last Page -->
          <button
            v-if="currentPage < totalPages - 2"
            @click="changePage(totalPages)"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white hover:bg-white/20"
          >
            {{ totalPages }}
          </button>

          <!-- Next Page -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:chevron-right" class="w-5 h-5" />
          </button>
        </div>

        <!-- Empty State -->
        <div 
          v-if="paginatedItems.length === 0" 
          class="text-center py-12"
        >
          <Icon name="mdi:movie-off" class="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p class="text-gray-400">No items found matching your search.</p>
        </div>

        <!-- Video Modal -->
        <VideoModal
          :isOpen="showVideoModal"
          :videoUrl="selectedVideoKey ? `https://www.youtube.com/embed/${selectedVideoKey}` : ''"
          @close="showVideoModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrending } from '~/composables/useTrending'
import { nextTick } from 'vue'

type VideoResult = {
  id: number
  results: Array<{
    id: string
    key: string
    name: string
    site: string
    type: string
  }>
}

// Page meta
definePageMeta({
  auth: false
})

// Add head configuration for critical CSS
useHead({
  title: 'Welcome to TrendingNow',
  bodyAttrs: {
    class: 'overflow-x-hidden'
  }
})

// Get trending items
const { getAllTrending } = useTrending()
const trendingItems = ref<any[]>([])

// Mobile menu state
const showMobileMenu = ref(false)

// Guest watchlist using localStorage
const guestWatchlist = ref<any[]>([])

// Video modal state
const showVideoModal = ref(false)
const selectedVideoKey = ref('')

// Pagination and filtering state
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref('')
const sortBy = ref('popularity')
const sortOrder = ref<'asc' | 'desc'>('desc')
const activeTab = ref('movies')

const tabs = [
  { id: 'movies', label: 'Movies' },
  { id: 'tvShows', label: 'TV Shows' }
]

// Filter and sort functions
const movies = computed(() => trendingItems.value.filter(item => item.media_type === 'movie'))
const tvShows = computed(() => trendingItems.value.filter(item => item.media_type === 'tv'))

const filteredItems = computed(() => {
  const items = activeTab.value === 'movies' ? movies.value : tvShows.value
  return items.filter(item => 
    (item.title || item.name || '')
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
})

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    const aValue = sortBy.value === 'date' 
      ? new Date(a.release_date || a.first_air_date || '').getTime()
      : a.vote_average
    const bValue = sortBy.value === 'date'
      ? new Date(b.release_date || b.first_air_date || '').getTime()
      : b.vote_average
    
    return sortOrder.value === 'desc' ? bValue - aValue : aValue - bValue
  })
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedItems.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => 
  Math.ceil(sortedItems.value.length / itemsPerPage)
)

// Pagination functions
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

onMounted(() => {
  // Load guest watchlist from localStorage
  const savedWatchlist = localStorage.getItem('guestWatchlist')
  if (savedWatchlist) {
    guestWatchlist.value = JSON.parse(savedWatchlist)
  }
})

// Guest watchlist functions
const toggleGuestWatchlist = (item: any) => {
  const index = guestWatchlist.value.findIndex(i => i.id === item.id)
  if (index === -1) {
    guestWatchlist.value.push(item)
  } else {
    guestWatchlist.value.splice(index, 1)
  }
  localStorage.setItem('guestWatchlist', JSON.stringify(guestWatchlist.value))
}

const isInGuestWatchlist = (item: any) => {
  return guestWatchlist.value.some(i => i.id === item.id)
}

// Video modal functions
const openTrailer = async (item: any) => {
  try {
    const videos = await $fetch<VideoResult>(`https://api.themoviedb.org/3/${item.media_type}/${item.id}/videos`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`
      }
    })
    
    const trailer = videos.results?.find(v => v.type === 'Trailer') || videos.results?.[0]
    if (trailer) {
      selectedVideoKey.value = trailer.key
      showVideoModal.value = true
    }
  } catch (error) {
    console.error('Error fetching trailer:', error)
  }
}

// Load trending items
const loadTrendingItems = async () => {
  try {
    const response = await getAllTrending()
    // Load all items that have a poster
    trendingItems.value = response.data
      .filter((item: any) => item.poster_path)
      .map((item: any) => ({
        ...item,
        vote_average: item.tmdb_rating || item.vote_average || 0,
        media_type: item.type || item.media_type || 'movie'
      }))
      .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
  } catch (error) {
    console.error('Error loading trending items:', error)
  }
}

// Handle image loading errors
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// Ensure proper hydration
// Load data on mount
onMounted(async () => {
  await nextTick()
  
  // Load all data in parallel
  await Promise.all([
    loadTrendingItems(),
    // Load guest watchlist from localStorage
    new Promise<void>((resolve) => {
      const savedWatchlist = localStorage.getItem('guestWatchlist')
      if (savedWatchlist) {
        guestWatchlist.value = JSON.parse(savedWatchlist)
      }
      resolve()
    })
  ])
  
  // Force a repaint to ensure animations start properly
  document.body.style.display = 'none'
  document.body.offsetHeight // Force reflow
  document.body.style.display = ''
})
</script>

<style>
/* Critical styles for transitions and animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Background animations */
@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.3; }
}

@keyframes ping {
  0% { transform: scale(1); opacity: 0.1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Animated entrance for trending items with will-change for performance */
.grid > div {
  will-change: transform, opacity;
  animation: slideInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation delays for grid items */
.grid > div:nth-child(1) { animation-delay: 0ms; }
.grid > div:nth-child(2) { animation-delay: 100ms; }
.grid > div:nth-child(3) { animation-delay: 200ms; }
.grid > div:nth-child(4) { animation-delay: 300ms; }
.grid > div:nth-child(5) { animation-delay: 400ms; }

/* Optimized animations for background elements */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.bg-gradient {
  animation: float 6s ease-in-out infinite;
}
</style>
