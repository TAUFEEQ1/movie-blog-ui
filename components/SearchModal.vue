<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Search Movies & TV Shows</h2>
        <button 
          @click="closeModal"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <!-- Search Form -->
      <form @submit.prevent="performSearch" class="p-6">
        <div class="space-y-4">
          <!-- Search Input -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="mdi:magnify" class="w-5 h-5 text-gray-400" />
            </div>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              class="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              @input="handleInput"
            />
          </div>

          <!-- Search Suggestions (if we want to add them later) -->
          <div v-if="suggestions.length > 0" class="space-y-2">
            <p class="text-sm text-gray-600">Quick suggestions:</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                @click="searchQuery = suggestion; performSearch()"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Search Button -->
          <button
            type="submit"
            :disabled="!searchQuery.trim() || isSearching"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Icon 
              :name="isSearching ? 'mdi:loading' : 'mdi:magnify'" 
              :class="['w-5 h-5', { 'animate-spin': isSearching }]" 
            />
            {{ isSearching ? 'Searching...' : 'Search' }}
          </button>
        </div>
      </form>

      <!-- Recent Searches (optional for future) -->
      <div v-if="recentSearches.length > 0" class="px-6 pb-6">
        <div class="border-t border-gray-200 pt-4">
          <p class="text-sm text-gray-600 mb-3">Recent searches:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="search in recentSearches"
              :key="search"
              @click="searchQuery = search; performSearch()"
              class="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Icon name="mdi:history" class="w-3 h-3" />
              {{ search }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  search: [query: string]
}>()

// State
const searchQuery = ref('')
const isSearching = ref(false)
const searchInput = ref<HTMLInputElement>()

// Mock data for suggestions and recent searches
const suggestions = ref([
  'Popular Movies 2024',
  'Marvel Movies',
  'Netflix Originals',
  'Comedy TV Shows'
])

const recentSearches = ref([
  'Breaking Bad',
  'The Avengers',
  'Stranger Things'
])

// Methods
const closeModal = () => {
  emit('close')
  searchQuery.value = ''
}

const handleInput = () => {
  // Could add real-time suggestions here
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  
  try {
    // Add to recent searches
    const query = searchQuery.value.trim()
    if (!recentSearches.value.includes(query)) {
      recentSearches.value.unshift(query)
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop()
      }
    }

    // Emit search event and navigate
    emit('search', query)
    
    // Navigate to search results page
    await navigateTo(`/search?q=${encodeURIComponent(query)}`)
    
    // Close modal
    closeModal()
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
  }
}

// Auto-focus when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

// Handle escape key
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) {
      closeModal()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>
