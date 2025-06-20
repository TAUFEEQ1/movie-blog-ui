<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex gap-6 p-6">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <div class="flex-1">
        <!-- Top Navigation -->
        <TopBar 
          @tab-change="handleTabChange"
          @search="handleSearch"
        />

        <!-- Journal Header -->
        <div class="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="mdi:notebook" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">My Journal</h1>
                <p class="text-gray-600">Track your movie and TV show journey</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">{{ totalEntries }}</div>
                <div class="text-sm text-gray-500">Total Entries</div>
              </div>
              <button 
                @click="showAddModal = true"
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Icon name="mdi:plus" class="w-5 h-5" />
                New Entry
              </button>
            </div>
          </div>
        </div>

        <!-- Journal Book Layout -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden" style="min-height: 700px;">
          <!-- Book Header/Tabs -->
          <div class="border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between px-8 py-4">
              <!-- Status Filter Tabs -->
              <div class="flex gap-1">
                <button
                  v-for="status in statusFilters"
                  :key="status.key"
                  @click="activeStatus = status.key"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeStatus === status.key
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-2 h-2 rounded-full"
                      :class="status.color"
                    ></div>
                    {{ status.label }}
                    <span class="text-xs opacity-75">({{ getStatusCount(status.key) }})</span>
                  </div>
                </button>
              </div>

              <!-- View Toggle & Sort -->
              <div class="flex items-center gap-3">
                <select 
                  v-model="sortBy" 
                  class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="updated_at">Recently Updated</option>
                  <option value="created_at">Recently Added</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="my_rating">Rating</option>
                  <option value="watched_date">Watch Date</option>
                </select>
                
                <div class="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    @click="viewMode = 'grid'"
                    :class="[
                      'px-3 py-2 text-sm transition-colors',
                      viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    ]"
                  >
                    <Icon name="mdi:grid" class="w-4 h-4" />
                  </button>
                  <button
                    @click="viewMode = 'list'"
                    :class="[
                      'px-3 py-2 text-sm transition-colors border-l border-gray-200',
                      viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    ]"
                  >
                    <Icon name="mdi:view-list" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Journal Content -->
          <div class="p-8">
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
                v-for="entry in filteredEntries"
                :key="entry.id"
                @click="viewEntry(entry)"
                class="group cursor-pointer"
              >
                <!-- Journal Card -->
                <div class="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
                  <!-- Entry Header -->
                  <div class="flex items-start justify-between mb-4">
                    <div 
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      :class="getStatusBadgeClass(entry.watch_status)"
                    >
                      <Icon :name="getStatusIcon(entry.watch_status)" class="w-4 h-4" />
                    </div>
                    <button 
                      @click.stop="editEntry(entry)"
                      class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                    >
                      <Icon name="mdi:pencil" class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Entry Content -->
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {{ entry.title || entry.media_item?.title }}
                    </h3>
                    
                    <div class="text-sm text-gray-500 mb-3">
                      <div class="flex items-center gap-2">
                        <span>{{ entry.media_item?.type === 'tv_series' ? 'TV Series' : 'Movie' }}</span>
                        <span v-if="entry.season_number">• S{{ entry.season_number }}</span>
                      </div>
                      <div v-if="entry.watched_date || entry.start_date">
                        {{ formatDate(entry.watched_date || entry.start_date) }}
                      </div>
                    </div>

                    <div v-if="entry.my_rating" class="flex items-center gap-1 mb-3">
                      <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                      <span class="text-sm font-medium">{{ entry.my_rating }}/10</span>
                    </div>

                    <p v-if="entry.notes_reflections" class="text-sm text-gray-600 line-clamp-3">
                      {{ stripHtml(entry.notes_reflections) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-else class="space-y-4">
              <div
                v-for="entry in filteredEntries"
                :key="entry.id"
                @click="viewEntry(entry)"
                class="group cursor-pointer bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                <div class="flex items-start gap-6">
                  <!-- Poster -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="entry.media_item?.poster_path || '/default-poster.jpg'" 
                      :alt="entry.media_item?.title"
                      class="w-16 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">
                          {{ entry.title || entry.media_item?.title }}
                        </h3>
                        
                        <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div class="flex items-center gap-2">
                            <div 
                              class="w-3 h-3 rounded-full"
                              :class="getStatusColor(entry.watch_status)"
                            ></div>
                            <span>{{ getStatusLabel(entry.watch_status) }}</span>
                          </div>
                          
                          <span>{{ entry.media_item?.type === 'tv_series' ? 'TV Series' : 'Movie' }}</span>
                          
                          <span v-if="entry.season_number">Season {{ entry.season_number }}</span>
                          
                          <span v-if="entry.watched_date || entry.start_date">
                            {{ formatDate(entry.watched_date || entry.start_date) }}
                          </span>
                        </div>

                        <div v-if="entry.my_rating" class="flex items-center gap-1 mb-3">
                          <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                          <span class="text-sm font-medium">{{ entry.my_rating }}/10</span>
                        </div>

                        <p v-if="entry.notes_reflections" class="text-gray-600 line-clamp-2">
                          {{ stripHtml(entry.notes_reflections) }}
                        </p>
                      </div>

                      <!-- Actions -->
                      <button 
                        @click.stop="editEntry(entry)"
                        class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 transition-all"
                      >
                        <Icon name="mdi:pencil" class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="filteredEntries.length === 0"
              class="text-center py-16"
            >
              <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="mdi:notebook-outline" class="w-12 h-12 text-gray-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">No entries found</h3>
              <p class="text-gray-500 mb-6">
                {{ activeStatus === 'all' 
                   ? 'Start your movie journal by adding your first entry' 
                   : `No ${getStatusLabel(activeStatus).toLowerCase()} entries yet` 
                }}
              </p>
              <button 
                @click="showAddModal = true"
                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Icon name="mdi:plus" class="w-5 h-5" />
                Add First Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <AddJournalEntryModal 
      :is-open="showAddModal"
      @close="closeModal"
      @save="saveEntry"
    />

    <!-- Edit Modal -->
    <EditJournalEntryModal
      v-if="editingEntry"
      :is-open="!!editingEntry"
      :entry="editingEntry"
      @close="closeModal"
      @save="saveEntry"
    />

    <!-- View Entry Modal -->
    <JournalEntryDetailModal
      :is-open="!!viewingEntry"
      :entry="viewingEntry"
      @close="viewingEntry = null"
      @edit="editEntry"
      @delete="deleteEntry"
    />
  </div>
</template>

<script setup lang="ts">
// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

interface MediaItem {
  id: number
  documentId?: string
  title: string
  type: 'movies' | 'tv_series'
  poster_path: string
  releaseDate: string
  trailerUrl?: string
}

interface JournalEntry {
  id: number
  documentId?: string
  title?: string
  watch_status: 'watched' | 'rewatched' | 'planned_to_watch' | 'dropped' | 'paused'
  my_rating?: number
  watched_date?: string
  start_date?: string
  end_date?: string
  season_number?: number
  notes_reflections?: string
  media_item: MediaItem
  user: any
  created_at: string
  updated_at: string
}

const { user } = useAuth()
const config = useRuntimeConfig()

// State
const journalEntries = ref<JournalEntry[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const editingEntry = ref<JournalEntry | null>(null)
const viewingEntry = ref<JournalEntry | null>(null)
const activeStatus = ref('all')
const sortBy = ref('updated_at')
const viewMode = ref<'grid' | 'list'>('grid')

// Status filters
const statusFilters = [
  { key: 'all', label: 'All', color: 'bg-gray-400' },
  { key: 'planned_to_watch', label: 'Planned', color: 'bg-blue-500' },
  { key: 'paused', label: 'Paused', color: 'bg-yellow-500' },
  { key: 'watched', label: 'Watched', color: 'bg-green-500' },
  { key: 'rewatched', label: 'Rewatched', color: 'bg-purple-500' },
  { key: 'dropped', label: 'Dropped', color: 'bg-red-500' }
]

// Helper function for API calls
const strapiCall = async (endpoint: string, options: any = {}) => {
  const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
  const token = useState<string | null>('auth.token')
  
  return await $fetch(`${strapiUrl}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token.value && { Authorization: `Bearer ${token.value}` }),
      ...options.headers
    },
    ...options
  })
}

// Computed
const totalEntries = computed(() => journalEntries.value.length)

const filteredEntries = computed(() => {
  let filtered = journalEntries.value

  // Filter by status
  if (activeStatus.value !== 'all') {
    if (activeStatus.value === 'paused') {
      // For paused, we check if it's an ongoing series that was started but not finished
      filtered = filtered.filter(entry => 
        entry.watch_status === 'watched' && 
        entry.start_date && 
        !entry.end_date && 
        entry.media_item?.type === 'tv_series'
      )
    } else {
      filtered = filtered.filter(entry => entry.watch_status === activeStatus.value)
    }
  }

  // Sort entries
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return (a.title || a.media_item?.title || '').localeCompare(b.title || b.media_item?.title || '')
      case 'my_rating':
        return (b.my_rating || 0) - (a.my_rating || 0)
      case 'watched_date':
        return new Date(b.watched_date || '').getTime() - new Date(a.watched_date || '').getTime()
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'updated_at':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  return filtered
})

// Methods
const getStatusCount = (status: string) => {
  if (status === 'all') return journalEntries.value.length
  if (status === 'paused') {
    return journalEntries.value.filter(entry => 
      entry.watch_status === 'watched' && 
      entry.start_date && 
      !entry.end_date && 
      entry.media_item?.type === 'tv_series'
    ).length
  }
  return journalEntries.value.filter(entry => entry.watch_status === status).length
}

const getStatusLabel = (status: string) => {
  const filter = statusFilters.find(f => f.key === status)
  return filter?.label || status
}

const getStatusColor = (status: string) => {
  const filter = statusFilters.find(f => f.key === status)
  return filter?.color || 'bg-gray-400'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'planned_to_watch': 'bg-blue-500',
    'paused': 'bg-yellow-500',
    'watched': 'bg-green-500',
    'rewatched': 'bg-purple-500',
    'dropped': 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    'planned_to_watch': 'mdi:clock-outline',
    'paused': 'mdi:pause',
    'watched': 'mdi:check',
    'rewatched': 'mdi:refresh',
    'dropped': 'mdi:close'
  }
  return icons[status] || 'mdi:circle'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const stripHtml = (html?: string) => {
  return html?.replace(/<[^>]*>/g, '') || ''
}

const fetchJournalEntries = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await strapiCall('/journal-entries', {
      method: 'GET',
      query: {
        'populate[media_item]': true,
        'populate[user]': true,
        // Temporarily commented out user filter until existing entries have user relationships
        // 'filters[user][id]': user.value.id,
        sort: 'updatedAt:desc'
      }
    }) as { data: JournalEntry[] }
    
    journalEntries.value = response.data || []
  } catch (error) {
    console.error('Error fetching journal entries:', error)
  } finally {
    loading.value = false
  }
}

const viewEntry = (entry: JournalEntry) => {
  viewingEntry.value = entry
}

const editEntry = (entry: JournalEntry) => {
  editingEntry.value = entry
}

const deleteEntry = async (entry: JournalEntry) => {
  if (!confirm('Are you sure you want to delete this entry?')) return
  
  try {
    // Use documentId for the API call, fallback to numeric id
    const entryId = entry.documentId || entry.id
    await strapiCall(`/journal-entries/${entryId}`, {
      method: 'DELETE'
    })
    journalEntries.value = journalEntries.value.filter(e => e.id !== entry.id)
  } catch (error) {
    console.error('Error deleting entry:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingEntry.value = null
}

const saveEntry = async (entryData: Partial<JournalEntry> | JournalEntry) => {
  if (!user.value) return
  
  try {
    if (editingEntry.value) {
      // Update existing entry - the edit modal already handled the API call
      // Just update the entry in our local array
      const index = journalEntries.value.findIndex(e => e.id === editingEntry.value!.id)
      if (index !== -1) {
        journalEntries.value[index] = entryData as JournalEntry
      }
    } else {
      // Add new entry - the add modal already handled the API call via TMDB endpoint
      // Just add it to our local array
      journalEntries.value.unshift(entryData as JournalEntry)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving entry:', error)
  }
}

// Event handlers
const handleTabChange = (tab: string) => {
  console.log('Tab changed to:', tab)
}

const handleSearch = (query: string) => {
  console.log('Searching for:', query)
}

// Lifecycle
onMounted(() => {
  fetchJournalEntries()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
