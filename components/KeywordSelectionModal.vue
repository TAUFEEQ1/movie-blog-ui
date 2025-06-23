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
        <div v-if="selectedKeywords.length > 0" class="mb-6 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-blue-900">Selected Keywords ({{ selectedKeywords.length }})</h3>
            <button
              @click="clearAllKeywords"
              class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="keyword in selectedKeywords"
              :key="keyword"
              class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ keyword }}
              <button
                @click="removeKeyword(keyword)"
                class="text-blue-600 hover:text-blue-800"
              >
                <Icon name="mdi:close" class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="flex items-center gap-2 mb-4">
          <button
            @click="viewMode = 'categories'"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'categories' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            By Category
          </button>
          <button
            @click="viewMode = 'all'"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'all' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            All Keywords
          </button>
          <button
            @click="viewMode = 'popular'"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'popular' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Most Popular
          </button>
        </div>

        <!-- Categorized View -->
        <div v-if="viewMode === 'categories'" class="space-y-6">
          <div 
            v-for="(keywords, category) in categorizedKeywords" 
            :key="category"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 class="text-sm font-medium text-gray-900">{{ category }}</h3>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <button
                  v-for="keyword in keywords.slice(0, 20)"
                  :key="keyword.keyword"
                  @click="toggleKeyword(keyword.keyword)"
                  :class="[
                    'text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 border',
                    isKeywordSelected(keyword.keyword)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <span class="truncate">{{ keyword.keyword }}</span>
                    <span class="text-xs text-gray-500 ml-1">({{ keyword.frequency }})</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- All Keywords View -->
        <div v-else-if="viewMode === 'all'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <button
            v-for="keyword in filteredKeywords"
            :key="keyword.keyword"
            @click="toggleKeyword(keyword.keyword)"
            :class="[
              'text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 border',
              isKeywordSelected(keyword.keyword)
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="truncate">{{ keyword.keyword }}</span>
              <span class="text-xs text-gray-500 ml-1">({{ keyword.frequency }})</span>
            </div>
          </button>
        </div>

        <!-- Popular Keywords View -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="keyword in filteredKeywords.slice(0, 30)"
              :key="keyword.keyword"
              @click="toggleKeyword(keyword.keyword)"
              :class="[
                'text-left px-4 py-3 rounded-lg transition-all duration-200 border',
                isKeywordSelected(keyword.keyword)
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ keyword.keyword }}</div>
                  <div class="text-xs text-gray-500">
                    Score: {{ keyword.score.toFixed(1) }} • Frequency: {{ keyword.frequency }}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="w-2 h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="bg-blue-500 rounded-full transition-all duration-300"
                      :style="{ height: `${Math.min(100, (keyword.score / maxScore) * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredKeywords.length === 0" class="text-center py-8">
          <Icon name="mdi:tag-search" class="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p class="text-gray-600">No keywords found matching your search.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          {{ filteredKeywords.length }} keywords available
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="applyKeywords"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtractedKeyword } from '~/composables/useKeywordExtraction'

interface Props {
  show: boolean
  keywords: ExtractedKeyword[]
  selectedKeywords: string[]
}

interface Emits {
  (e: 'close'): void
  (e: 'update:selectedKeywords', keywords: string[]): void
  (e: 'apply'): void
}

const props = withDefaults(defineProps<Props>(), {
  keywords: () => [],
  selectedKeywords: () => []
})
const emit = defineEmits<Emits>()

// Composables
const { categorizeKeywords, getAllAvailableKeywords } = useKeywordExtraction()

// State
const searchQuery = ref('')
const viewMode = ref<'categories' | 'all' | 'popular'>('popular')
const localSelectedKeywords = ref<string[]>([...props.selectedKeywords])
const availableKeywords = ref<ExtractedKeyword[]>([])
const loadingKeywords = ref(false)

// Load available keywords on mount
onMounted(async () => {
  if (!props.keywords || props.keywords.length === 0) {
    try {
      loadingKeywords.value = true
      availableKeywords.value = await getAllAvailableKeywords()
    } catch (error) {
      console.error('Error loading available keywords:', error)
    } finally {
      loadingKeywords.value = false
    }
  }
})

// Use available keywords from JSONL if props.keywords is empty
const effectiveKeywords = computed(() => {
  return props.keywords && props.keywords.length > 0 ? props.keywords : availableKeywords.value
})

// Computed
const filteredKeywords = computed((): ExtractedKeyword[] => {
  if (!effectiveKeywords.value || !Array.isArray(effectiveKeywords.value)) {
    return []
  }
  
  if (!searchQuery.value) {
    return effectiveKeywords.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return effectiveKeywords.value.filter(kw => 
    kw.keyword.toLowerCase().includes(query)
  )
})

const categorizedKeywords = computed<Record<string, ExtractedKeyword[]>>(() => {
  if (!categorizeKeywords || typeof categorizeKeywords !== 'function') {
    return {}
  }
  return categorizeKeywords(filteredKeywords.value)
})

const maxScore = computed(() => {
  if (!effectiveKeywords.value || effectiveKeywords.value.length === 0) {
    return 1
  }
  return Math.max(...effectiveKeywords.value.map(kw => kw.score), 1)
})

// Methods
const closeModal = () => {
  emit('close')
}

const toggleKeyword = (keyword: string) => {
  const index = localSelectedKeywords.value.indexOf(keyword)
  if (index > -1) {
    localSelectedKeywords.value.splice(index, 1)
  } else {
    localSelectedKeywords.value.push(keyword)
  }
}

const removeKeyword = (keyword: string) => {
  const index = localSelectedKeywords.value.indexOf(keyword)
  if (index > -1) {
    localSelectedKeywords.value.splice(index, 1)
  }
}

const clearAllKeywords = () => {
  localSelectedKeywords.value = []
}

const isKeywordSelected = (keyword: string) => {
  return localSelectedKeywords.value.includes(keyword)
}

const applyKeywords = () => {
  emit('update:selectedKeywords', [...localSelectedKeywords.value])
  emit('apply')
  emit('close')
}

// Handle escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    localSelectedKeywords.value = [...props.selectedKeywords]
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})

watch(() => props.selectedKeywords, (newValue) => {
  localSelectedKeywords.value = [...newValue]
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>
