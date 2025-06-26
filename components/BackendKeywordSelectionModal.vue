<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Select Keywords</h2>
          <p class="text-sm text-gray-600 mt-1">Choose keywords to filter trending content</p>
        </div>
        <button
          @click="closeModal"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <Icon name="mdi:loading" class="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p class="text-gray-600">Loading keywords...</p>
        </div>

        <div v-else>
          <!-- Search Bar -->
          <div class="mb-6">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search keywords..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <!-- Selected Keywords Summary -->
          <div v-if="localSelectedKeywords.length > 0" class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-blue-900">Selected Keywords ({{ localSelectedKeywords.length }})</h3>
              <button
                @click="clearAllKeywords"
                class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="keyword in localSelectedKeywords"
                :key="keyword"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {{ keyword }}
                <button
                  @click="toggleKeyword(keyword)"
                  class="hover:text-blue-900"
                >
                  <Icon name="mdi:close" class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Keyword Stats -->
          <div v-if="keywordStats" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Keyword Statistics</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-gray-600">Total Items</p>
                <p class="font-medium">{{ keywordStats.totalItems }}</p>
              </div>
              <div>
                <p class="text-gray-600">Items with Keywords</p>
                <p class="font-medium">{{ keywordStats.itemsWithKeywords }}</p>
              </div>
              <div>
                <p class="text-gray-600">Unique Keywords</p>
                <p class="font-medium">{{ keywordStats.topKeywords?.length || 0 }}</p>
              </div>
              <div>
                <p class="text-gray-600">Categories</p>
                <p class="font-medium">{{ Object.keys(categorizedKeywords).length }}</p>
              </div>
            </div>
          </div>

          <!-- Keywords Display -->
          <div v-if="searchQuery.trim()">
            <!-- Search Results -->
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-3">
                Search Results ({{ searchResults.length }})
              </h3>
              <div v-if="searchResults.length === 0" class="text-center py-8 text-gray-500">
                No keywords found matching "{{ searchQuery }}"
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="keyword in searchResults"
                  :key="keyword.keyword"
                  @click="toggleKeyword(keyword.keyword)"
                  :class="[
                    'text-left p-3 rounded-lg border transition-all duration-200',
                    isKeywordSelected(keyword.keyword)
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ keyword.keyword }}</span>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ keyword.count }}</span>
                      <Icon 
                        :name="isKeywordSelected(keyword.keyword) ? 'mdi:check-circle' : 'mdi:plus-circle-outline'" 
                        class="w-4 h-4"
                        :class="isKeywordSelected(keyword.keyword) ? 'text-blue-600' : 'text-gray-400'"
                      />
                    </div>
                  </div>
                  <div class="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      :style="{ width: Math.min((keyword.totalScore || keyword.avgScore || keyword.count) / maxScore * 100, 100) + '%' }"
                    ></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div v-else>
            <!-- Categorized Keywords -->
            <div v-if="Object.keys(categorizedKeywords).length > 0">
              <div
                v-for="(keywords, category) in categorizedKeywords"
                :key="category"
                class="mb-6"
              >
                <button
                  @click="toggleCategory(category)"
                  class="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-3"
                >
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ category }} ({{ keywords.length }})
                  </h3>
                  <Icon 
                    :name="expandedCategories.has(category) ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                    class="w-5 h-5 text-gray-500"
                  />
                </button>
                
                <div v-if="expandedCategories.has(category)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    v-for="keyword in keywords"
                    :key="keyword.keyword"
                    @click="toggleKeyword(keyword.keyword)"
                    :class="[
                      'text-left p-3 rounded-lg border transition-all duration-200',
                      isKeywordSelected(keyword.keyword)
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ keyword.keyword }}</span>
                      <div class="flex items-center gap-2 text-xs text-gray-500">
                        <span>{{ keyword.count }}</span>
                        <Icon 
                          :name="isKeywordSelected(keyword.keyword) ? 'mdi:check-circle' : 'mdi:plus-circle-outline'" 
                          class="w-4 h-4"
                          :class="isKeywordSelected(keyword.keyword) ? 'text-blue-600' : 'text-gray-400'"
                        />
                      </div>
                    </div>
                    <div class="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div 
                        class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        :style="{ width: Math.min((keyword.totalScore || keyword.avgScore || keyword.count) / maxScore * 100, 100) + '%' }"
                      ></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- All Keywords (fallback) -->
            <div v-else-if="displayKeywords.length > 0">
              <h3 class="text-lg font-medium text-gray-900 mb-3">
                All Keywords ({{ displayKeywords.length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="keyword in displayKeywords.slice(0, 100)"
                  :key="keyword.keyword"
                  @click="toggleKeyword(keyword.keyword)"
                  :class="[
                    'text-left p-3 rounded-lg border transition-all duration-200',
                    isKeywordSelected(keyword.keyword)
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ keyword.keyword }}</span>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>{{ keyword.count }}</span>
                      <Icon 
                        :name="isKeywordSelected(keyword.keyword) ? 'mdi:check-circle' : 'mdi:plus-circle-outline'" 
                        class="w-4 h-4"
                        :class="isKeywordSelected(keyword.keyword) ? 'text-blue-600' : 'text-gray-400'"
                      />
                    </div>
                  </div>
                  <div class="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      :style="{ width: Math.min((keyword.totalScore || keyword.avgScore || keyword.count) / maxScore * 100, 100) + '%' }"
                    ></div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="mdi:tag-outline" class="w-12 h-12 mx-auto mb-2" />
              <p>No keywords available</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          {{ localSelectedKeywords.length }} keyword(s) selected
        </div>
        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="applyKeywords"
            :disabled="localSelectedKeywords.length === 0"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Keywords
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBackendKeywords } from '~/composables/useBackendKeywords'
import type { BackendKeyword } from '~/composables/useBackendKeywords'

interface Props {
  show: boolean
  selectedKeywords: string[]
}

interface Emits {
  (e: 'close'): void
  (e: 'apply', keywords: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { 
  getAllKeywords, 
  getKeywordSuggestions, 
  getCategorizedKeywords,
  getKeywordStats 
} = useBackendKeywords()

// Reactive state
const searchQuery = ref('')
const localSelectedKeywords = ref<string[]>([...props.selectedKeywords])
const availableKeywords = ref<BackendKeyword[]>([])
const categorizedKeywords = ref<Record<string, BackendKeyword[]>>({})
const keywordStats = ref<any>(null)
const loading = ref(false)
const expandedCategories = ref<Set<string>>(new Set(['Other']))
const searchResults = ref<BackendKeyword[]>([])

// Watchers
watch(() => props.selectedKeywords, (newKeywords: string[]) => {
  localSelectedKeywords.value = [...newKeywords]
})

// Debounced search watcher
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, async (newQuery: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await performSearch(newQuery)
  }, 300)
})

watch(() => props.show, async (show: boolean) => {
  if (show) {
    await loadKeywords()
  }
})

// Methods
const loadKeywords = async () => {
  try {
    loading.value = true
    
    // Load categorized keywords directly from backend
    const [categorized, stats] = await Promise.all([
      getCategorizedKeywords(),
      getKeywordStats()
    ])
    
    // Flatten categorized keywords to get all keywords
    const allKeywords: BackendKeyword[] = []
    Object.values(categorized).forEach(categoryKeywords => {
      allKeywords.push(...categoryKeywords)
    })
    
    availableKeywords.value = allKeywords
    keywordStats.value = stats
    categorizedKeywords.value = categorized
    
    // Initialize with popular categories expanded
    const popularCategories = Object.keys(categorized)
      .sort((a, b) => categorized[b].length - categorized[a].length)
      .slice(0, 2)
    
    expandedCategories.value = new Set([...popularCategories, 'Other'])
    
  } catch (error) {
    console.error('Error loading keywords:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    const results = await getKeywordSuggestions(query, 50)
    searchResults.value = results
  } catch (error) {
    console.error('Error searching keywords:', error)
    searchResults.value = []
  }
}

const isKeywordSelected = (keyword: string): boolean => {
  return localSelectedKeywords.value.includes(keyword)
}

const toggleKeyword = (keyword: string) => {
  const index = localSelectedKeywords.value.indexOf(keyword)
  if (index === -1) {
    localSelectedKeywords.value.push(keyword)
  } else {
    localSelectedKeywords.value.splice(index, 1)
  }
}

const clearAllKeywords = () => {
  localSelectedKeywords.value = []
}

const applyKeywords = () => {
  emit('apply', localSelectedKeywords.value)
  closeModal()
}

const closeModal = () => {
  emit('close')
}

const toggleCategory = (category: string) => {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
}

// Computed properties
const displayKeywords = computed(() => {
  if (searchQuery.value.trim()) {
    return searchResults.value
  }
  return availableKeywords.value
})

const maxScore = computed(() => {
  if (!availableKeywords.value || availableKeywords.value.length === 0) {
    return 1
  }
  // For backend keywords, use totalScore or avgScore
  const scores = availableKeywords.value.map((kw: BackendKeyword) => kw.totalScore || kw.avgScore || kw.count || 1)
  return Math.max(...scores, 1)
})

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
