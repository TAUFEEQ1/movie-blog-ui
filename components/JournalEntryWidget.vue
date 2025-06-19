<template>
  <div class="bg-white rounded-2xl p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-900">My Movie Journal</h3>
      <button 
        @click="showAddModal = true"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Icon name="mdi:plus" class="w-4 h-4" />
        Add Entry
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6 border-b border-gray-200">
      <button
        v-for="status in watchStatuses"
        :key="status.key"
        @click="activeStatus = status.key"
        :class="[
          'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
          activeStatus === status.key
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ status.label }}
        <span class="ml-1 text-xs opacity-75">({{ getStatusCount(status.key) }})</span>
      </button>
    </div>

    <!-- Journal Entries -->
    <div class="space-y-4">
      <div 
        v-for="entry in filteredEntries" 
        :key="entry.id"
        class="flex items-center gap-4 p-4 rounded-xl border hover:border-gray-300 transition-colors cursor-pointer group"
        @click="viewEntry(entry)"
      >
        <!-- Poster -->
        <div class="relative flex-shrink-0">
          <img 
            :src="entry.media_item?.poster_path || '/default-poster.jpg'" 
            :alt="entry.media_item?.title"
            class="w-16 h-24 object-cover rounded-lg"
          />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
            <Icon name="mdi:eye" class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-semibold text-gray-900 truncate">{{ entry.title || entry.media_item?.title }}</h4>
            <span :class="getStatusBadgeClass(entry.watch_status)" class="px-2 py-1 rounded-full text-xs font-medium">
              {{ getStatusLabel(entry.watch_status) }}
            </span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{{ entry.media_item?.type === 'tv_series' ? 'TV Series' : 'Movie' }}</span>
            <span v-if="entry.media_item?.releaseDate">•</span>
            <span v-if="entry.media_item?.releaseDate">{{ new Date(entry.media_item.releaseDate).getFullYear() }}</span>
            <span v-if="entry.season_number">• Season {{ entry.season_number }}</span>
          </div>

          <div class="flex items-center gap-4 text-sm">
            <div v-if="entry.my_rating" class="flex items-center gap-1">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
              <span class="font-medium">{{ entry.my_rating }}/10</span>
            </div>
            <div v-if="entry.watched_date" class="text-gray-500">
              Watched: {{ formatDate(entry.watched_date) }}
            </div>
            <div v-if="entry.start_date && entry.watch_status === 'planned_to_watch'" class="text-gray-500">
              Planned: {{ formatDate(entry.start_date) }}
            </div>
          </div>

          <p v-if="entry.notes_reflections" class="text-gray-600 text-sm mt-2 line-clamp-2">
            {{ stripHtml(entry.notes_reflections) }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            @click.stop="editEntry(entry)"
            class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit entry"
          >
            <Icon name="mdi:pencil" class="w-4 h-4" />
          </button>
          <button 
            @click.stop="deleteEntry(entry)"
            class="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete entry"
          >
            <Icon name="mdi:delete" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="filteredEntries.length === 0"
      class="text-center py-8"
    >
      <Icon name="mdi:notebook-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 mb-2">No {{ getStatusLabel(activeStatus).toLowerCase() }} entries</p>
      <button 
        @click="showAddModal = true"
        class="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Add your first entry
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <JournalEntryModal 
      v-if="showAddModal || editingEntry"
      :is-open="showAddModal || !!editingEntry"
      :entry="editingEntry"
      @close="closeModal"
      @save="saveEntry"
    />
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  id: number
  title: string
  type: 'movies' | 'tv_series'
  poster_path: string
  releaseDate: string
  trailerUrl?: string
}

interface JournalEntry {
  id: number
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
}

const { user } = useAuth()
const config = useRuntimeConfig()

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

// Reactive state
const activeStatus = ref<string>('planned_to_watch')
const journalEntries = ref<JournalEntry[]>([])
const showAddModal = ref(false)
const editingEntry = ref<JournalEntry | null>(null)
const loading = ref(false)

const watchStatuses = [
  { key: 'planned_to_watch', label: 'Planned to Watch' },
  { key: 'paused', label: 'Paused' },
  { key: 'watched', label: 'Watched' },
  { key: 'rewatched', label: 'Rewatched' },
  { key: 'dropped', label: 'Dropped' }
]

// Computed
const filteredEntries = computed(() => {
  return journalEntries.value.filter(entry => {
    if (activeStatus.value === 'paused') {
      // For paused, we need to check if it's an ongoing series that was started but not finished
      return entry.watch_status === 'watched' && entry.start_date && !entry.end_date && entry.media_item?.type === 'tv_series'
    }
    return entry.watch_status === activeStatus.value
  })
})

// Methods
const getStatusCount = (status: string) => {
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
  return watchStatuses.find(s => s.key === status)?.label || status
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'planned_to_watch': 'bg-blue-100 text-blue-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'watched': 'bg-green-100 text-green-800',
    'rewatched': 'bg-purple-100 text-purple-800',
    'dropped': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const stripHtml = (html: string) => {
  return html?.replace(/<[^>]*>/g, '') || ''
}

const fetchJournalEntries = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await strapiCall('/journal-entries', {
      method: 'GET',
      query: {
        populate: 'media_item,user',
        'filters[user][id]': user.value.id
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
  // Navigate to detailed view or open modal
  console.log('View entry:', entry)
}

const editEntry = (entry: JournalEntry) => {
  editingEntry.value = entry
}

const deleteEntry = async (entry: JournalEntry) => {
  if (!confirm('Are you sure you want to delete this entry?')) return
  
  try {
    await strapiCall(`/journal-entries/${entry.id}`, {
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

const saveEntry = async (entryData: Partial<JournalEntry>) => {
  if (!user.value) return
  
  try {
    if (editingEntry.value) {
      // Update existing entry
      const response = await strapiCall(`/journal-entries/${editingEntry.value.id}`, {
        method: 'PUT',
        body: entryData
      })
      const index = journalEntries.value.findIndex(e => e.id === editingEntry.value!.id)
      if (index !== -1) {
        journalEntries.value[index] = (response as any).data
      }
    } else {
      // Create new entry
      const response = await strapiCall('/journal-entries', {
        method: 'POST',
        body: {
          ...entryData,
          user: user.value.id
        }
      })
      journalEntries.value.push((response as any).data)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving entry:', error)
  }
}

// Lifecycle
onMounted(() => {
  fetchJournalEntries()
})

// Emit events for parent components
const emit = defineEmits(['entry-updated', 'status-changed'])

watch(activeStatus, (newStatus) => {
  emit('status-changed', newStatus)
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
</style>