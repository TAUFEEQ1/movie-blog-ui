<template>
  <Teleport to="body">
    <div 
      v-if="isOpen && entry"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      @click="closeModal"
    >
      <div 
        class="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="relative">
          <!-- Background Image -->
          <div v-if="entry.media_item?.poster_path" class="h-48 bg-gradient-to-r from-gray-200 to-gray-300 overflow-hidden">
            <img 
              :src="entry.media_item.poster_path" 
              :alt="entry.media_item.title"
              class="w-full h-full object-cover opacity-20"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          
          <!-- Header Content -->
          <div class="absolute inset-0 flex items-end p-8">
            <div class="flex items-end gap-6 w-full">
              <!-- Poster -->
              <div class="flex-shrink-0">
                <img 
                  :src="entry.media_item?.poster_path || '/default-poster.jpg'" 
                  :alt="entry.media_item?.title"
                  class="w-32 h-48 object-cover rounded-xl shadow-lg border-4 border-white"
                />
              </div>
              
              <!-- Title & Info -->
              <div class="flex-1 text-white mb-4">
                <h1 class="text-3xl font-bold mb-2">
                  {{ entry.title || entry.media_item?.title }}
                </h1>
                <div class="flex items-center gap-4 text-lg">
                  <div 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusBadgeClass(entry.watch_status)"
                  >
                    {{ getStatusLabel(entry.watch_status) }}
                  </div>
                  <span>{{ entry.media_item?.type === 'tv_series' ? 'TV Series' : 'Movie' }}</span>
                  <span v-if="entry.season_number">Season {{ entry.season_number }}</span>
                </div>
              </div>

              <!-- Close Button -->
              <button 
                @click="closeModal"
                class="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
              >
                <Icon name="mdi:close" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Rating -->
              <div v-if="entry.my_rating" class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">My Rating</h3>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <Icon 
                      v-for="i in 10" 
                      :key="i"
                      name="mdi:star" 
                      :class="[
                        'w-6 h-6',
                        i <= Math.floor(entry.my_rating) ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                    />
                  </div>
                  <span class="text-2xl font-bold text-gray-900">{{ entry.my_rating }}/10</span>
                </div>
              </div>

              <!-- Notes & Reflections -->
              <div v-if="entry.notes_reflections" class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Notes & Reflections</h3>
                <div 
                  class="prose max-w-none text-gray-700"
                  v-html="entry.notes_reflections"
                ></div>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button 
                  @click="editEntry"
                  class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <Icon name="mdi:pencil" class="w-5 h-5" />
                  Edit Entry
                </button>
                <button 
                  @click="deleteEntry"
                  class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <Icon name="mdi:delete" class="w-5 h-5" />
                  Delete Entry
                </button>
              </div>
            </div>

            <!-- Sidebar Info -->
            <div class="space-y-6">
              <!-- Details -->
              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div class="space-y-3">
                  <div v-if="entry.watched_date">
                    <div class="text-sm text-gray-500">Watched Date</div>
                    <div class="font-medium">{{ formatDate(entry.watched_date) }}</div>
                  </div>
                  
                  <div v-if="entry.start_date">
                    <div class="text-sm text-gray-500">Start Date</div>
                    <div class="font-medium">{{ formatDate(entry.start_date) }}</div>
                  </div>
                  
                  <div v-if="entry.end_date">
                    <div class="text-sm text-gray-500">End Date</div>
                    <div class="font-medium">{{ formatDate(entry.end_date) }}</div>
                  </div>
                  
                  <div v-if="entry.season_number">
                    <div class="text-sm text-gray-500">Season</div>
                    <div class="font-medium">Season {{ entry.season_number }}</div>
                  </div>
                  
                  <div>
                    <div class="text-sm text-gray-500">Added to Journal</div>
                    <div class="font-medium">{{ formatDate(entry.created_at) }}</div>
                  </div>
                  
                  <div v-if="entry.updated_at !== entry.created_at">
                    <div class="text-sm text-gray-500">Last Updated</div>
                    <div class="font-medium">{{ formatDate(entry.updated_at) }}</div>
                  </div>
                </div>
              </div>

              <!-- Media Info -->
              <div v-if="entry.media_item" class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Media Information</h3>
                <div class="space-y-3">
                  <div>
                    <div class="text-sm text-gray-500">Title</div>
                    <div class="font-medium">{{ entry.media_item.title }}</div>
                  </div>
                  
                  <div>
                    <div class="text-sm text-gray-500">Type</div>
                    <div class="font-medium">{{ entry.media_item.type === 'tv_series' ? 'TV Series' : 'Movie' }}</div>
                  </div>
                  
                  <div v-if="entry.media_item.releaseDate">
                    <div class="text-sm text-gray-500">Release Date</div>
                    <div class="font-medium">{{ formatDate(entry.media_item.releaseDate) }}</div>
                  </div>
                  
                  <div v-if="entry.media_item.trailerUrl">
                    <button 
                      @click="playTrailer"
                      class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Icon name="mdi:play" class="w-4 h-4" />
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>

              <!-- Quick Status Change -->
              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="status in quickStatusOptions"
                    :key="status.key"
                    @click="updateStatus(status.key)"
                    :disabled="entry.watch_status === status.key"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      entry.watch_status === status.key
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    ]"
                  >
                    {{ status.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
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
  created_at: string
  updated_at: string
}

interface Props {
  isOpen: boolean
  entry?: JournalEntry | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'edit', 'delete', 'status-updated'])

const quickStatusOptions = [
  { key: 'planned_to_watch', label: 'Plan to Watch' },
  { key: 'watched', label: 'Watched' },
  { key: 'rewatched', label: 'Rewatch' },
  { key: 'dropped', label: 'Drop' }
]

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'planned_to_watch': 'Planned to Watch',
    'paused': 'Paused',
    'watched': 'Watched',
    'rewatched': 'Rewatched',
    'dropped': 'Dropped'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'planned_to_watch': 'bg-blue-500 text-white',
    'paused': 'bg-yellow-500 text-white',
    'watched': 'bg-green-500 text-white',
    'rewatched': 'bg-purple-500 text-white',
    'dropped': 'bg-red-500 text-white'
  }
  return classes[status] || 'bg-gray-500 text-white'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const closeModal = () => {
  emit('close')
}

const editEntry = () => {
  emit('edit', props.entry)
  closeModal()
}

const deleteEntry = () => {
  if (confirm('Are you sure you want to delete this entry?')) {
    emit('delete', props.entry)
    closeModal()
  }
}

const updateStatus = (newStatus: string) => {
  emit('status-updated', { entry: props.entry, status: newStatus })
}

const playTrailer = () => {
  if (props.entry?.media_item?.trailerUrl) {
    window.open(props.entry.media_item.trailerUrl, '_blank')
  }
}

// Close modal on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})
</script>

<style scoped>
.prose {
  color: inherit;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: inherit;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul, .prose ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
}
</style>
