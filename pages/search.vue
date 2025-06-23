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

        <!-- Page Header -->
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div class="flex items-center gap-3 mb-2">
            <Icon name="mdi:magnify" class="w-7 h-7 text-blue-600" />
            <h1 class="text-2xl font-bold text-gray-900">Discover Trending Content</h1>
          </div>
          <p class="text-gray-600">Search and filter through the latest trending movies and TV shows</p>
        </div>

        <div class="flex gap-6">
          <!-- Filters Sidebar -->
          <div class="w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-fit">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
            
            <!-- Search Input -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search trending content..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  @input="async () => await applyFilters()"
                />
                <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <!-- Content Type Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="selectedTypes"
                    type="checkbox"
                    value="movie"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="async () => await applyFilters()"
                  />
                  <span class="ml-3 text-sm text-gray-700">Movies</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="selectedTypes"
                    type="checkbox"
                    value="tv"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    @change="async () => await applyFilters()"
                  />
                  <span class="ml-3 text-sm text-gray-700">TV Shows</span>
                </label>
              </div>
            </div>

            <!-- Platform Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Platforms</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="platform in platforms"
                  :key="platform.name"
                  @click="togglePlatform(platform.name)"
                  :class="[
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105',
                    selectedPlatforms.includes(platform.name)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  ]"
                >
                  <Icon :name="platform.icon" class="w-8 h-8 mb-2" :class="platform.color" />
                  <span class="text-xs font-medium text-gray-700">{{ platform.displayName }}</span>
                </button>
              </div>
            </div>

            <!-- Keyword Filter -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-medium text-gray-700">Keywords</label>
                <button
                  @click="openKeywordModal"
                  :disabled="keywordsLoading"
                  class="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  {{ keywordsLoading ? 'Loading...' : (selectedKeywords?.length || 0) > 0 ? 'Edit' : 'Select' }}
                </button>
              </div>
              
              <!-- Selected Keywords Display -->
              <div v-if="selectedKeywords && selectedKeywords.length > 0" class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="keyword in displayedKeywords"
                    :key="keyword"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {{ keyword }}
                    <button
                      @click="removeKeyword(keyword)"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <Icon name="mdi:close" class="w-3 h-3" />
                    </button>
                  </span>
                  <button
                    v-if="hasMoreKeywords"
                    @click="openKeywordModal"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
                  >
                    +{{ (selectedKeywords?.length || 0) - 4 }} more
                  </button>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-else class="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <Icon name="mdi:tag-outline" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p class="text-xs text-gray-500 mb-2">No keywords selected</p>
                <button
                  @click="openKeywordModal"
                  :disabled="keywordsLoading"
                  class="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  {{ keywordsLoading ? 'Extracting keywords...' : 'Browse Keywords' }}
                </button>
              </div>
            </div>

            <!-- Rating Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
              <div class="space-y-2">
                <input
                  v-model.number="minRating"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  @input="async () => await applyFilters()"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span class="font-medium text-blue-600">{{ minRating }}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <!-- Sort Options -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
              <select
                v-model="sortBy"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @change="async () => await applyFilters()"
              >
                <option value="trending_rank">Trending Rank</option>
                <option value="rating_desc">Rating (High to Low)</option>
                <option value="rating_asc">Rating (Low to High)</option>
                <option value="title">Title (A-Z)</option>
                <option value="release_date">Release Date</option>
              </select>
            </div>

            <!-- Reset Filters -->
            <button
              @click="resetFilters"
              class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="mdi:refresh" class="w-4 h-4" />
              Reset Filters
            </button>
          </div>

          <!-- Results Grid -->
          <div class="flex-1">
            <!-- Results Header -->
            <div class="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">
                    {{ filteredItems?.length || 0 }} {{ (filteredItems?.length || 0) === 1 ? 'result' : 'results' }} found
                  </span>
                  <div v-if="activeFiltersCount > 0" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">•</span>
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {{ activeFiltersCount }} filter{{ activeFiltersCount === 1 ? '' : 's' }} active
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'p-2 rounded-lg transition-colors',
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    ]"
                  >
                    <Icon name="mdi:view-grid" class="w-5 h-5" />
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'p-2 rounded-lg transition-colors',
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    ]"
                  >
                    <Icon name="mdi:view-list" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <div class="text-center">
                <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p class="text-gray-600">Loading trending content...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!filteredItems || filteredItems.length === 0" class="text-center py-12">
              <Icon name="mdi:movie-search" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p class="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <button
                @click="resetFilters"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>

            <!-- Results Grid -->
            <div v-else>
              <!-- Grid View -->
              <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <TrendingCard
                  v-for="item in paginatedItems"
                  :key="`trending-${item.tmdb_id}`"
                  :item="item"
                  @play-trailer="playTrailer"
                  @add-to-wishlist="addToWishlist"
                />
              </div>

              <!-- List View -->
              <div v-else class="space-y-4">
                <div
                  v-for="item in paginatedItems"
                  :key="`trending-list-${item.tmdb_id}`"
                  class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center gap-4">
                    <img
                      :src="`https://image.tmdb.org/t/p/w154${item.poster_path}`"
                      :alt="item.title"
                      class="w-16 h-24 object-cover rounded-lg"
                      @error="handleImageError"
                    />
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h3>
                      <div class="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span class="capitalize">{{ item.type === 'tv' ? 'TV Show' : 'Movie' }}</span>
                        <span>{{ item.release_year }}</span>
                        <span class="px-2 py-1 bg-gray-100 rounded text-xs">{{ item.platform }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                        <span class="text-sm font-medium">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
                      </div>
                    </div>
                    <button
                      v-if="item.trailer_url"
                      @click="playTrailer(item.trailer_url)"
                      class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Icon name="mdi:play" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <Icon name="mdi:chevron-left" class="w-5 h-5" />
                </button>
                
                <span class="px-4 py-2 text-sm text-gray-600">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="p-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <Icon name="mdi:chevron-right" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal for Trailers -->
    <VideoModal 
      :is-open="isVideoModalOpen"
      :video-url="currentVideoUrl"
      @close="closeVideoModal"
    />

    <!-- Keyword Selection Modal -->
    <KeywordSelectionModal
      :show="showKeywordModal"
      :keywords="extractedKeywords"
      :selected-keywords="selectedKeywords"
      @close="showKeywordModal = false"
      @update:selected-keywords="onKeywordsUpdated"
      @apply="applyFilters"
    />
  </div>
</template>

<script setup lang="ts">
import type { TrendingItem } from '~/composables/useTrending'
import type { ExtractedKeyword } from '~/composables/useKeywordExtraction'

// Set page metadata
definePageMeta({
  title: 'Search Trending Content'
})

// Composables
const { getAllTrending } = useTrending()
const { extractKeywordsFromItems, filterItemsByKeywords } = useKeywordExtraction()

// State
const showMobileMenu = ref(false)
const loading = ref(false)
const keywordsLoading = ref(false)
const allItems = ref<TrendingItem[]>([])
const filteredItems = ref<TrendingItem[]>([])
const searchQuery = ref('')
const selectedTypes = ref<string[]>(['movie', 'tv'])
const selectedPlatforms = ref<string[]>([])
const selectedKeywords = ref<string[]>([])
const minRating = ref(0)
const sortBy = ref('trending_rank')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 20

// Keyword state
const extractedKeywords = ref<ExtractedKeyword[]>([])
const showKeywordModal = ref(false)

// Video modal state
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Platform definitions
const platforms = [
  { name: 'Netflix', displayName: 'Netflix', icon: 'mdi:netflix', color: 'text-red-600' },
  { name: 'HBO Max', displayName: 'HBO Max', icon: 'mdi:television-box', color: 'text-purple-600' },
  { name: 'Prime Video', displayName: 'Prime', icon: 'mdi:amazon', color: 'text-blue-600' },
  { name: 'Paramount+', displayName: 'Paramount+', icon: 'mdi:play-box', color: 'text-blue-500' },
  { name: 'Disney+', displayName: 'Disney+', icon: 'mdi:disney', color: 'text-blue-700' },
  { name: 'Apple TV+', displayName: 'Apple TV+', icon: 'mdi:apple', color: 'text-gray-800' },
  { name: 'Hulu', displayName: 'Hulu', icon: 'mdi:television-play', color: 'text-green-500' },
  { name: 'Theaters', displayName: 'Theaters', icon: 'mdi:movie', color: 'text-yellow-600' }
]

// Computed properties
const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (selectedTypes.value && selectedTypes.value.length < 2) count++
  if (selectedPlatforms.value && selectedPlatforms.value.length > 0) count++
  if (selectedKeywords.value && selectedKeywords.value.length > 0) count++
  if (minRating.value > 0) count++
  if (sortBy.value !== 'trending_rank') count++
  return count
})

const displayedKeywords = computed(() => {
  return selectedKeywords.value ? selectedKeywords.value.slice(0, 4) : []
})

const hasMoreKeywords = computed(() => {
  return selectedKeywords.value && selectedKeywords.value.length > 4
})

const paginatedItems = computed(() => {
  if (!filteredItems.value || !Array.isArray(filteredItems.value)) return []
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  if (!filteredItems.value || !Array.isArray(filteredItems.value)) return 1
  return Math.ceil(filteredItems.value.length / itemsPerPage)
})

// Methods
const fetchTrendingItems = async () => {
  try {
    loading.value = true
    keywordsLoading.value = true
    
    const response = await getAllTrending()
    allItems.value = response.data || []
    
    // Extract keywords from all items (client-side only)
    if (process.client && allItems.value.length > 0) {
      const keywordStats = await extractKeywordsFromItems(allItems.value)
      extractedKeywords.value = keywordStats.topKeywords
    }
    
    await applyFilters()
  } catch (error) {
    console.error('Error fetching trending items:', error)
    allItems.value = []
    extractedKeywords.value = []
  } finally {
    loading.value = false
    keywordsLoading.value = false
  }
}

const togglePlatform = async (platform: string) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
  await applyFilters()
}

const applyFilters = async () => {
  if (!allItems.value || !Array.isArray(allItems.value)) {
    filteredItems.value = []
    return
  }
  
  let items = [...allItems.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.title?.toLowerCase().includes(query) ||
      item.overview?.toLowerCase().includes(query) ||
      item.genres?.some(genre => genre.toLowerCase().includes(query))
    )
  }

  // Type filter
  if (selectedTypes.value && selectedTypes.value.length > 0 && selectedTypes.value.length < 2) {
    items = items.filter(item => selectedTypes.value.includes(item.type))
  }

  // Platform filter
  if (selectedPlatforms.value && selectedPlatforms.value.length > 0) {
    items = items.filter(item => selectedPlatforms.value.includes(item.platform))
  }

  // Keyword filter
  if (selectedKeywords.value && selectedKeywords.value.length > 0) {
    items = await filterItemsByKeywords(items, selectedKeywords.value)
  }

  // Rating filter
  if (minRating.value > 0) {
    items = items.filter(item => (item.tmdb_rating || 0) >= minRating.value)
  }

  // Sort items
  switch (sortBy.value) {
    case 'rating_desc':
      items.sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      break
    case 'rating_asc':
      items.sort((a, b) => (a.tmdb_rating || 0) - (b.tmdb_rating || 0))
      break
    case 'trending_rank':
      items.sort((a, b) => (a.trending_rank || 999) - (b.trending_rank || 999))
      break
    case 'release_date':
      items.sort((a, b) => {
        const dateA = new Date(a.release_date || '1900-01-01').getTime()
        const dateB = new Date(b.release_date || '1900-01-01').getTime()
        return dateB - dateA
      })
      break
    case 'title':
      items.sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  filteredItems.value = items
  currentPage.value = 1
}

const resetFilters = async () => {
  searchQuery.value = ''
  selectedTypes.value = ['movie', 'tv']
  selectedPlatforms.value = []
  selectedKeywords.value = []
  minRating.value = 0
  sortBy.value = 'trending_rank'
  currentPage.value = 1
  await applyFilters()
}

const playTrailer = (trailerUrl: string) => {
  if (trailerUrl) {
    currentVideoUrl.value = trailerUrl
    isVideoModalOpen.value = true
  }
}

const addToWishlist = (item: TrendingItem) => {
  // TODO: Implement wishlist functionality
  console.log('Adding to wishlist:', item.title)
}

const openKeywordModal = () => {
  showKeywordModal.value = true
}

const removeKeyword = async (keyword: string) => {
  const index = selectedKeywords.value.indexOf(keyword)
  if (index > -1) {
    selectedKeywords.value.splice(index, 1)
    await applyFilters()
  }
}

const onKeywordsUpdated = async (keywords: string[]) => {
  selectedKeywords.value = keywords
  await applyFilters()
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/default-poster.jpg'
}

// Lifecycle
onMounted(() => {
  fetchTrendingItems()
})

// Watch for page changes to reset pagination
watch(() => [selectedTypes.value, selectedPlatforms.value, selectedKeywords.value, minRating.value, sortBy.value], () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
