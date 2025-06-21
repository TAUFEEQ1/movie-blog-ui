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
        <TopBar @search="handleNewSearch" />

        <!-- Search Header -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <button 
              @click="$router.back()"
              class="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <Icon name="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Search Results</h1>
              <p v-if="currentQuery" class="text-gray-600">
                Results for "<span class="font-medium">{{ currentQuery }}</span>"
                <span v-if="totalResults > 0" class="ml-2">
                  ({{ totalResults }} {{ totalResults === 1 ? 'result' : 'results' }})
                </span>
              </p>
            </div>
          </div>

          <!-- Search Filters -->
          <div class="bg-white rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <Icon name="mdi:filter-variant" class="w-5 h-5 text-gray-400" />
              <span class="text-sm text-gray-600">Filter by:</span>
            </div>
            
            <select 
              v-model="selectedType" 
              @change="applyFilters"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            <select 
              v-model="selectedYear" 
              @change="applyFilters"
              class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Year</option>
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}
              </option>
            </select>

            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <Icon name="mdi:close" class="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isSearching && searchResults.length === 0" class="text-center py-12">
          <Icon name="mdi:loading" class="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p class="text-gray-600">Searching...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="!isSearching && searchResults.length === 0 && currentQuery" class="text-center py-12">
          <Icon name="mdi:movie-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p class="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
          <button
            @click="clearFilters"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <!-- Search Results Grid -->
        <div v-else class="space-y-8">
          <!-- Featured Result (First result gets special treatment) -->
          <div v-if="searchResults.length > 0" class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <SearchResultFeatured 
              :item="searchResults[0]"
              @play-trailer="playTrailer"
            />
          </div>

          <!-- Regular Results Grid -->
          <div v-if="searchResults.length > 1" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <SearchResultCard
              v-for="item in searchResults.slice(1)"
              :key="`${item.id}-${item.media_type}`"
              :item="item"
              @play-trailer="playTrailer"
            />
          </div>

          <!-- Load More Button -->
          <div v-if="currentPage < totalPages" class="text-center py-8">
            <button
              @click="loadMore"
              :disabled="isSearching"
              class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <Icon 
                :name="isSearching ? 'mdi:loading' : 'mdi:plus'" 
                :class="['w-5 h-5', { 'animate-spin': isSearching }]" 
              />
              {{ isSearching ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="searchError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Icon name="mdi:alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
          <p class="text-red-700 mb-4">{{ searchError }}</p>
          <button
            @click="retrySearch"
            class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
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
import { useSearch } from '~/composables/useSearch'
import type { TMDBSearchResult, SearchFilters } from '~/composables/useSearch'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Composables
const route = useRoute()
const router = useRouter()
const { 
  searchResults, 
  isSearching, 
  searchError, 
  currentQuery, 
  currentPage, 
  totalPages, 
  totalResults,
  searchContent,
  loadMoreResults,
  clearSearch
} = useSearch()

// State
const showMobileMenu = ref(false)
const selectedType = ref('')
const selectedYear = ref('')
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Computed
const hasActiveFilters = computed(() => {
  return selectedType.value !== '' || selectedYear.value !== ''
})

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year)
  }
  return years
})

// Methods
const handleNewSearch = (query: string) => {
  router.push(`/search?q=${encodeURIComponent(query)}`)
}

const applyFilters = () => {
  if (!currentQuery.value) return

  const filters: SearchFilters = {}
  
  if (selectedType.value) {
    filters.type = selectedType.value as 'movie' | 'tv'
  }
  
  if (selectedYear.value) {
    filters.year = parseInt(selectedYear.value)
  }

  searchContent(currentQuery.value, filters)
}

const clearFilters = () => {
  selectedType.value = ''
  selectedYear.value = ''
  
  if (currentQuery.value) {
    searchContent(currentQuery.value)
  }
}

const loadMore = () => {
  const filters: SearchFilters = {}
  
  if (selectedType.value) {
    filters.type = selectedType.value as 'movie' | 'tv'
  }
  
  if (selectedYear.value) {
    filters.year = parseInt(selectedYear.value)
  }

  loadMoreResults(filters)
}

const retrySearch = () => {
  if (currentQuery.value) {
    applyFilters()
  }
}

const playTrailer = (trailerUrl: string) => {
  currentVideoUrl.value = trailerUrl
  isVideoModalOpen.value = true
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}

// Initialize search from query parameter
onMounted(async () => {
  const query = route.query.q as string
  
  if (query) {
    await searchContent(query)
  } else {
    // Redirect to home if no search query
    router.push('/')
  }
})

// Watch for query changes
watch(() => route.query.q, async (newQuery) => {
  if (newQuery && typeof newQuery === 'string') {
    clearSearch()
    await searchContent(newQuery)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  clearSearch()
})
</script>

<style scoped>
/* Custom styles for search page */
</style>
