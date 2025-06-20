<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Hero Section -->
    <div class="relative h-screen overflow-hidden">
      <div v-if="heroItem" class="absolute inset-0">
        <img
          :src="getTmdbBackdropUrl(heroItem.backdrop_path)"
          :alt="heroItem.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      </div>
      
      <div class="absolute inset-0 flex items-end">
        <div class="container mx-auto px-6 pb-20">
          <div v-if="heroItem" class="max-w-2xl">
            <div class="flex items-center space-x-4 mb-4">
              <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                Coming Soon
              </span>
              <span :class="getStatusColor(heroItem.status || 'announced')" class="px-3 py-1 rounded-full text-sm font-medium text-white">
                {{ getStatusLabel(heroItem.status || 'announced') }}
              </span>
            </div>
            
            <h1 class="text-6xl font-bold mb-4">{{ heroItem.title }}</h1>
            
            <div class="flex items-center space-x-6 mb-6">
              <div class="flex items-center space-x-2">
                <span class="text-yellow-400">★</span>
                <span class="text-lg font-semibold">{{ heroItem.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
              </div>
              <div class="text-lg">{{ formatReleaseDate(heroItem.release_date) }}</div>
              <div class="text-lg text-blue-400 font-semibold">{{ getTimeUntilRelease(heroItem.release_date) }}</div>
            </div>
            
            <p class="text-xl text-gray-300 mb-8 line-clamp-3">{{ heroItem.overview }}</p>
            
            <div class="flex space-x-4">
              <button
                v-if="heroItem.trailer_url"
                @click="openTrailerModal(heroItem)"
                class="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l7-5z"/>
                </svg>
                <span>Watch Trailer</span>
              </button>
              
              <button class="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="container mx-auto px-6 py-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 class="text-3xl font-bold">Coming Soon</h2>
        
        <div class="flex flex-wrap gap-4">
          <select 
            v-model="selectedType" 
            @change="(e) => handleFilterChange('type', (e.target as HTMLSelectElement).value)"
            class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          
          <select 
            v-model="selectedPeriod" 
            @change="(e) => handleFilterChange('period', (e.target as HTMLSelectElement).value)"
            class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Time</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="next-month">Next Month</option>
            <option value="this-year">This Year</option>
            <option value="next-year">Next Year</option>
          </select>
          
          <select 
            v-model="selectedStatus" 
            @change="(e) => handleFilterChange('status', (e.target as HTMLSelectElement).value)"
            class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="announced">Announced</option>
            <option value="in_production">In Production</option>
            <option value="post_production">Post-Production</option>
            <option value="rumored">Rumored</option>
            <option value="planned">Planned</option>
          </select>
          
          <select 
            v-model="selectedSort" 
            @change="(e) => handleFilterChange('sort', (e.target as HTMLSelectElement).value)"
            class="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="release_date">Release Date</option>
            <option value="anticipation_score">Most Anticipated</option>
            <option value="popularity">Popularity</option>
            <option value="tmdb_rating">TMDB Rating</option>
          </select>
        </div>
      </div>

      <!-- Coming Soon Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-8">
        <ComingSoonCard
          v-for="item in comingSoonItems"
          :key="item.id"
          :item="item"
          @click="openTrailerModal(item)"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="flex justify-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoModal
      :is-open="!!selectedTrailer"
      :video-url="selectedTrailer?.trailer_url || ''"
      :video-info="selectedTrailer ? {
        title: selectedTrailer.title,
        description: selectedTrailer.overview || '',
        genre: selectedTrailer.genres?.[0] || selectedTrailer.type,
        year: new Date(selectedTrailer.release_date).getFullYear(),
        duration: selectedTrailer.runtime ? `${selectedTrailer.runtime} min` : 'TBA'
      } : undefined"
      @close="closeTrailerModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { ComingSoonItem } from '~/composables/useComingSoon'

// Composables
const { 
  getComingSoonItems,
  getComingSoonByPeriod,
  getMostAnticipated,
  formatReleaseDate,
  getTimeUntilRelease,
  getTmdbBackdropUrl,
  getStatusColor,
  getStatusLabel
} = useComingSoon()

// State
const comingSoonItems = ref<ComingSoonItem[]>([])
const heroItems = ref<ComingSoonItem[]>([])
const loading = ref(true)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const selectedType = ref('')
const selectedPeriod = ref('')
const selectedStatus = ref('')
const selectedSort = ref('release_date')

// Modals
const selectedTrailer = ref<ComingSoonItem | null>(null)

// Hero rotation
const currentHeroIndex = ref(0)
const heroItem = computed(() => heroItems.value[currentHeroIndex.value] || null)

// Auto-rotate hero items
let heroInterval: NodeJS.Timeout | null = null

const startHeroRotation = () => {
  if (heroItems.value.length > 1) {
    heroInterval = setInterval(() => {
      currentHeroIndex.value = (currentHeroIndex.value + 1) % heroItems.value.length
    }, 8000) // Change every 8 seconds
  }
}

const stopHeroRotation = () => {
  if (heroInterval) {
    clearInterval(heroInterval)
    heroInterval = null
  }
}

// Filter handlers
const handleFilterChange = (filterType: string, value: string) => {
  if (filterType === 'type') selectedType.value = value
  if (filterType === 'period') selectedPeriod.value = value
  if (filterType === 'status') selectedStatus.value = value
  if (filterType === 'sort') selectedSort.value = value
  
  // Reset pagination and reload
  currentPage.value = 1
  loadComingSoonItems(true)
}

// Load coming soon items
const loadComingSoonItems = async (reset = false) => {
  try {
    loading.value = true
    
    let items: ComingSoonItem[] = []
    
    if (selectedPeriod.value) {
      const response = await getComingSoonByPeriod(
        selectedPeriod.value as any,
        {
          type: selectedType.value as any,
          limit: pageSize.value * currentPage.value
        }
      )
      items = response?.items || []
    } else {
      items = await getComingSoonItems({
        type: selectedType.value as any,
        status: selectedStatus.value as any,
        sortBy: selectedSort.value as any,
        limit: pageSize.value * currentPage.value
      })
    }
    
    if (reset) {
      comingSoonItems.value = items
    } else {
      comingSoonItems.value = [...comingSoonItems.value, ...items]
    }
    
    // Check if there are more items
    hasMore.value = items.length === pageSize.value * currentPage.value
    
    // Set hero items from the first few items
    if (reset || heroItems.value.length === 0) {
      heroItems.value = items.filter(item => item.backdrop_path).slice(0, 5)
      currentHeroIndex.value = 0
      stopHeroRotation()
      startHeroRotation()
    }
  } catch (error) {
    console.error('Error loading coming soon items:', error)
  } finally {
    loading.value = false
  }
}

// Load more items
const loadMore = () => {
  currentPage.value++
  loadComingSoonItems()
}

// Trailer modal functions
const openTrailerModal = (item: ComingSoonItem) => {
  if (item.trailer_url) {
    selectedTrailer.value = item
  }
}

const closeTrailerModal = () => {
  selectedTrailer.value = null
}

// Lifecycle
onMounted(() => {
  loadComingSoonItems(true)
})

onUnmounted(() => {
  stopHeroRotation()
})

// SEO
useSeoMeta({
  title: 'Coming Soon - Movie & TV Journal',
  description: 'Discover upcoming movies and TV shows with release dates, trailers, and more.',
  ogTitle: 'Coming Soon - Movie & TV Journal',
  ogDescription: 'Discover upcoming movies and TV shows with release dates, trailers, and more.'
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
