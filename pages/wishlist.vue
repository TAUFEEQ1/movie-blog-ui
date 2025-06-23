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
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <div class="flex items-center gap-3">
              <!-- View Toggle -->
              <div class="flex bg-white rounded-lg shadow-sm p-1">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  ]"
                >
                  <Icon name="mdi:view-grid" class="w-4 h-4" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  ]"
                >
                  <Icon name="mdi:view-list" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
              <div class="text-sm text-gray-600">Total Items</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-green-600">{{ stats.wantToWatch }}</div>
              <div class="text-sm text-gray-600">Want to Watch</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-orange-600">{{ stats.watching }}</div>
              <div class="text-sm text-gray-600">Watching</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-purple-600">{{ stats.completed }}</div>
              <div class="text-sm text-gray-600">Completed</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-indigo-600">{{ stats.movies }}</div>
              <div class="text-sm text-gray-600">Movies</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-pink-600">{{ stats.tvShows }}</div>
              <div class="text-sm text-gray-600">TV Shows</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-red-600">{{ stats.highPriority }}</div>
              <div class="text-sm text-gray-600">High Priority</div>
            </div>
            <div class="bg-white rounded-xl p-4 shadow-sm">
              <div class="text-2xl font-bold text-gray-600">{{ userTags.length }}</div>
              <div class="text-sm text-gray-600">Tags</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <!-- Search -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="Search titles..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-model="filters.wish_status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="want_to_watch">Want to Watch</option>
                  <option value="watching">Currently Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <!-- Type Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  v-model="filters.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>

              <!-- Priority Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  v-model="filters.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <!-- Tag Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in userTags"
                  :key="tag.id"
                  @click="toggleTagFilter(tag.id)"
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    filters.tags.includes(tag.id)
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                  :style="filters.tags.includes(tag.id) ? { backgroundColor: tag.color } : {}"
                >
                  <div
                    v-if="!filters.tags.includes(tag.id)"
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: tag.color }"
                  ></div>
                  {{ tag.name }}
                </button>
              </div>
              <button
                v-if="filters.tags.length > 0"
                @click="filters.tags = []"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear tag filters
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <Icon name="mdi:loading" class="w-8 h-8 animate-spin text-blue-600" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredItems.length === 0 && !isLoading" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon name="mdi:bookmark-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters' }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ wishlistItems.length === 0 
                ? 'Start adding movies and TV shows you want to watch!' 
                : 'Try adjusting your filters to see more items.' 
              }}
            </p>
            <NuxtLink
              v-if="wishlistItems.length === 0"
              to="/"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="mdi:plus" class="w-4 h-4 mr-2" />
              Browse Movies & TV Shows
            </NuxtLink>
          </div>
        </div>

        <!-- Wishlist Items -->
        <div v-else>
          <!-- Grid View -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            <WishlistCard
              v-for="item in filteredItems"
              :key="item.id"
              :item="item"
              @remove="removeItem"
              @update="updateItem"
              @view="openDetailModal"
            />
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <WishlistListItem
              v-for="item in filteredItems"
              :key="item.id"
              :item="item"
              @remove="removeItem"
              @update="updateItem"
              @view="openDetailModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <WishlistDetailModal
      v-if="selectedItem"
      :show="showDetailModal"
      :item="selectedItem"
      @close="closeDetailModal"
      @edit="openEditModal"
      @remove="removeItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { WishlistItem } from '~/composables/useWishlist'

// definePageMeta({
//   middleware: 'auth'
// })

const { 
  wishlistItems, 
  userTags, 
  isLoading, 
  fetchWishlist, 
  fetchTags, 
  removeFromWishlist,
  updateWishlistItem,
  getWishlistStats,
  filterWishlistItems
} = useWishlist()

// State
const showMobileMenu = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const showDetailModal = ref(false)
const selectedItem = ref<WishlistItem | null>(null)

const filters = reactive({
  search: '',
  wish_status: '',
  type: '',
  priority: '',
  tags: [] as number[]
})

// Computed
const stats = computed(() => getWishlistStats.value)

const filteredItems = computed(() => {
  return filterWishlistItems({
    wish_status: filters.wish_status || undefined,
    type: filters.type || undefined,
    priority: filters.priority || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    search: filters.search || undefined
  })
})

// Methods
const toggleTagFilter = (tagId: number) => {
  const index = filters.tags.indexOf(tagId)
  if (index > -1) {
    filters.tags.splice(index, 1)
  } else {
    filters.tags.push(tagId)
  }
}

const removeItem = async (item: WishlistItem) => {
  try {
    await removeFromWishlist(item.id)
  } catch (error) {
    console.error('Error removing item:', error)
  }
}

const updateItem = async (item: WishlistItem, updates: any) => {
  try {
    await updateWishlistItem(item.id, updates)
  } catch (error) {
    console.error('Error updating item:', error)
  }
}

const openDetailModal = (item: WishlistItem) => {
  selectedItem.value = item
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedItem.value = null
}

const openEditModal = (item: WishlistItem) => {
  // Close detail modal and open edit modal
  closeDetailModal()
  // You could emit an event or use a global state to open the edit modal
  // For now, we'll just close the detail modal
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchWishlist(),
    fetchTags()
  ])
})

// Save view mode preference
watch(viewMode, (newMode) => {
  localStorage.setItem('wishlist-view-mode', newMode)
})

// Load view mode preference
onMounted(() => {
  const savedMode = localStorage.getItem('wishlist-view-mode')
  if (savedMode === 'list' || savedMode === 'grid') {
    viewMode.value = savedMode
  }
})
</script>
