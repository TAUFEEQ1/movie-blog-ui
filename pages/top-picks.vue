<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Overlay -->
    <div v-if="showMobileMenu" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="showMobileMenu = false"></div>
    <div class="flex gap-0 lg:gap-6 p-3 lg:p-6">
      <!-- Mobile Menu Toggle -->
      <button @click="showMobileMenu = !showMobileMenu" class="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md">
        <Icon name="mdi:menu" class="w-6 h-6 text-gray-700" />
      </button>
      <!-- Sidebar -->
      <div :class="['fixed lg:relative inset-y-0 left-0 z-40 lg:z-0 transform transition-transform duration-300 ease-in-out lg:transform-none', showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
        <Sidebar @close-mobile="showMobileMenu = false" />
      </div>
      <!-- Main Content -->
      <div class="flex-1 w-full lg:ml-0">
        <TopBar />
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Genre Tabs Sidebar -->
          <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 h-fit transition-all duration-300 lg:w-80">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Genres</h2>
            <div class="flex flex-wrap gap-2 mb-6">
              <button v-for="genre in genres" :key="genre" @click="selectGenre(genre)" :class="['px-4 py-2 rounded-lg text-sm font-medium', selectedGenre === genre ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100']">
                {{ genre }}
              </button>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <input v-model="searchQuery" type="text" placeholder="Search top picks..." class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" @input="applyFilters" />
                <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <!-- Results Section -->
          <div class="flex-1">
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Icon name="mdi:star" class="w-7 h-7 text-yellow-500" /> Editor Top Picks</h1>
              <div v-if="filteredEditorPicks.length === 0" class="text-gray-500 py-8 text-center">No editor top picks found.</div>
              <div v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  <TrendingCard v-for="item in filteredEditorPicks" :key="`editor-top-pick-${item.tmdb_id}`" :item="item" @play-trailer="playTrailer" @add-to-wishlist="addToWishlist" />
                </div>
              </div>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Icon name="mdi:robot" class="w-7 h-7 text-blue-500" /> AI Top Picks</h1>
              <div v-if="filteredAiPicks.length === 0" class="text-gray-500 py-8 text-center">No AI top picks found.</div>
              <div v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  <TrendingCard v-for="item in filteredAiPicks" :key="`ai-top-pick-${item.tmdb_id}`" :item="item" @play-trailer="playTrailer" @add-to-wishlist="addToWishlist" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Video Modal -->
        <VideoModal :is-open="isVideoModalOpen" :video-url="currentVideoUrl" @close="closeVideoModal" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTrending } from '~/composables/useTrending'

// State
const showMobileMenu = ref(false)
const searchQuery = ref('')
const selectedGenre = ref('All')
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')
const editorPicks = ref<any[]>([])
const aiPicks = ref<any[]>([])
const genres = ref<string[]>(['All'])

// Filtered lists
const filteredEditorPicks = computed(() => {
  let items = editorPicks.value
  if (selectedGenre.value !== 'All') {
    items = items.filter(item => item.genres && item.genres.includes(selectedGenre.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.overview && item.overview.toLowerCase().includes(q)))
  }
  return items
})
const filteredAiPicks = computed(() => {
  let items = aiPicks.value
  if (selectedGenre.value !== 'All') {
    items = items.filter(item => item.genres && item.genres.includes(selectedGenre.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(item => item.title.toLowerCase().includes(q) || (item.overview && item.overview.toLowerCase().includes(q)))
  }
  return items
})

// Fetch top picks from API and section them
const { getTopPicks } = useTrending()
const fetchTopPicks = async () => {
  const picks = await getTopPicks()
  // Section by top_pick_type (assume 'editor' and 'ai')
  editorPicks.value = picks.filter((item: any) => item.top_pick_type === 'editor')
  aiPicks.value = picks.filter((item: any) => item.top_pick_type === 'ai')
  // Collect genres
  const allGenres = new Set<string>()
  picks.forEach((item: any) => (item.genres || []).forEach((g: string) => allGenres.add(g)))
  genres.value = ['All', ...Array.from(allGenres).sort()]
}

const selectGenre = (genre: string) => {
  selectedGenre.value = genre
}
const applyFilters = () => {}
const playTrailer = (trailerUrl: string) => {
  if (trailerUrl) {
    currentVideoUrl.value = trailerUrl
    isVideoModalOpen.value = true
  }
}
const addToWishlist = (item: any) => {
  // TODO: Implement wishlist functionality
  console.log('Adding to wishlist:', item.title)
}
const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}
onMounted(() => {
  fetchTopPicks()
})
</script>
