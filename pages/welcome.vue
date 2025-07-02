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
        <div class="flex items-center gap-3">
          <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
          <h1 class="text-2xl font-bold text-white">TrendingNow</h1>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink 
            to="/login" 
            class="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            Sign In
          </NuxtLink>
          <NuxtLink 
            to="/register" 
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Get Started
          </NuxtLink>
        </div>
      </nav>

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
            :key="`trending-${item.tmdb_id}`"
            class="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105"
          >
            <!-- Movie Poster -->
            <div class="aspect-[2/3] overflow-hidden">
              <img 
                :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                @error="handleImageError"
              />
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <!-- Content Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="font-bold text-lg mb-1 line-clamp-2">{{ item.title }}</h3>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300 capitalize">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                <div class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                  <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm font-bold text-white">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
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

        <!-- Features Section -->
        <div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div class="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Icon name="mdi:movie-open" class="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 class="text-xl font-bold mb-2">Track Movies & Shows</h3>
            <p class="text-gray-300">Keep track of what you've watched and what you want to watch next.</p>
          </div>
          <div class="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Icon name="mdi:star" class="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 class="text-xl font-bold mb-2">Rate & Review</h3>
            <p class="text-gray-300">Share your thoughts and see what others think about the latest releases.</p>
          </div>
          <div class="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Icon name="mdi:compass" class="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 class="text-xl font-bold mb-2">Discover New Content</h3>
            <p class="text-gray-300">Get personalized recommendations based on your watching history.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTrending } from '~/composables/useTrending'
import { nextTick } from 'vue'

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

// Filter and pagination state
const searchQuery = ref('')
const activeTab = ref('movies')
const currentPage = ref(1)
const itemsPerPage = 10
const sortBy = ref('rating') // 'rating' or 'title'
const sortOrder = ref('desc')

// Computed properties for filtered items
const movies = computed(() => {
  return trendingItems.value
    .filter(item => item.type === 'movie')
    .filter(item => 
      searchQuery.value === '' || 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy.value === 'rating') {
        return sortOrder.value === 'desc' 
          ? (b.tmdb_rating || 0) - (a.tmdb_rating || 0)
          : (a.tmdb_rating || 0) - (b.tmdb_rating || 0)
      }
      return sortOrder.value === 'desc'
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title)
    })
})

const tvShows = computed(() => {
  return trendingItems.value
    .filter(item => item.type === 'tv')
    .filter(item => 
      searchQuery.value === '' || 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy.value === 'rating') {
        return sortOrder.value === 'desc' 
          ? (b.tmdb_rating || 0) - (a.tmdb_rating || 0)
          : (a.tmdb_rating || 0) - (b.tmdb_rating || 0)
      }
      return sortOrder.value === 'desc'
        ? b.title.localeCompare(a.title)
        : a.title.localeCompare(b.title)
    })
})

// Pagination
const totalPages = computed(() => {
  const items = activeTab.value === 'movies' ? movies.value : tvShows.value
  return Math.ceil(items.length / itemsPerPage)
})

const paginatedItems = computed(() => {
  const items = activeTab.value === 'movies' ? movies.value : tvShows.value
  const start = (currentPage.value - 1) * itemsPerPage
  return items.slice(start, start + itemsPerPage)
})

// Handle pagination
const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle sorting
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

// Load initial trending items
const loadTrendingItems = async () => {
  try {
    const response = await getAllTrending()
    // Load all items that have a poster and rating
    trendingItems.value = response.data
      .filter((item: any) => item.poster_path && item.tmdb_rating)
      .sort((a: any, b: any) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
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
onMounted(async () => {
  await nextTick()
  loadTrendingItems()
  
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
