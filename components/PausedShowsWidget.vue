<template>
  <div class="bg-white rounded-2xl p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-900">Paused Shows</h3>
      <span class="text-sm text-gray-500">{{ pausedShows.length }} shows</span>
    </div>
    
    <div class="space-y-4">
      <div 
        v-for="show in pausedShows" 
        :key="show.id"
        class="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
        @click="resumeShow(show)"
      >
        <!-- Poster -->
        <div class="relative flex-shrink-0">
          <img 
            :src="show.poster" 
            :alt="show.title"
            class="w-16 h-20 object-cover rounded-lg shadow-sm"
          />
          <!-- Season Badge -->
          <div class="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Icon name="mdi:pause" class="w-3 h-3" />
            <span>S{{ show.season }}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 space-y-2">
          <!-- Title and Genre -->
          <div>
            <h4 class="font-semibold text-gray-900 truncate text-lg">{{ show.title }}</h4>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ show.genre }}</span>
              <span>•</span>
              <span>{{ show.year }}</span>
            </div>
          </div>

          <!-- Progress Info -->
          <div class="text-right">
            <div class="text-lg font-semibold text-gray-900">
              Season {{ show.season }}, Episode {{ show.episode }}
            </div>
            <div v-if="show.progress" class="text-sm text-gray-500">
              {{ Math.round(show.progress) }}% of season
            </div>
          </div>

          <!-- Status and Last Watched -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-1 text-yellow-600 font-medium">
              <Icon name="mdi:clock-outline" class="w-4 h-4" />
              <span>Paused {{ show.pausedDuration }}</span>
            </div>
            
            <div v-if="show.lastWatched" class="text-gray-500 flex items-center gap-1">
              <span>Last watched:</span>
              <span class="font-medium">{{ formatDate(show.lastWatched) }}</span>
              <button 
                @click.stop="editShow(show)"
                class="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors ml-2"
                title="Edit entry"
              >
                <Icon name="mdi:pencil" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="show.notes" class="text-gray-600 text-sm italic line-clamp-1">
            {{ show.notes }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="pausedShows.length === 0"
      class="text-center py-8"
    >
      <Icon name="mdi:pause-circle-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 mb-2">No paused shows</p>
      <p class="text-gray-400 text-sm">Shows you've started but haven't finished will appear here</p>
    </div>

    <!-- Quick Actions -->
    <div v-if="pausedShows.length > 0" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex justify-between items-center text-sm">
        <button 
          @click="resumeAll"
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          Resume All ({{ pausedShows.length }})
        </button>
        <button 
          @click="showFilterOptions = !showFilterOptions"
          class="text-gray-500 hover:text-gray-700"
        >
          Filter & Sort
        </button>
      </div>

      <!-- Filter Options -->
      <div v-if="showFilterOptions" class="mt-3 p-3 bg-gray-50 rounded-lg">
        <div class="flex gap-4 text-sm">
          <select v-model="sortBy" class="px-2 py-1 border border-gray-300 rounded">
            <option value="lastWatched">Last Watched</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
            <option value="pausedDuration">Paused Duration</option>
          </select>
          
          <select v-model="filterGenre" class="px-2 py-1 border border-gray-300 rounded">
            <option value="">All Genres</option>
            <option v-for="genre in uniqueGenres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PausedShow {
  id: number
  title: string
  poster: string
  genre: string
  year: number
  season: number
  episode: number
  totalSeasons?: number
  progress?: number
  lastWatched?: string
  pausedDuration: string
  notes?: string
  journalEntryId?: number
}

// State
const pausedShows = ref<PausedShow[]>([
  {
    id: 1,
    title: "Stranger Things",
    poster: "https://images.unsplash.com/photo-1489599904472-c34eb5d19877?w=200&h=300&fit=crop",
    genre: "Science Fiction",
    year: 2016,
    season: 3,
    episode: 5,
    totalSeasons: 4,
    progress: 62,
    lastWatched: "2024-03-15",
    pausedDuration: "2 weeks ago",
    notes: "Need to finish this season before the new one comes out!",
    journalEntryId: 1
  },
  {
    id: 2,
    title: "The Bear",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=300&fit=crop",
    genre: "Comedy-Drama",
    year: 2022,
    season: 2,
    episode: 3,
    totalSeasons: 3,
    progress: 30,
    lastWatched: "2024-03-10",
    pausedDuration: "3 weeks ago",
    notes: "Really enjoying this show, just got busy with work",
    journalEntryId: 2
  },
  {
    id: 3,
    title: "House of the Dragon",
    poster: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=300&fit=crop",
    genre: "Fantasy",
    year: 2022,
    season: 1,
    episode: 8,
    totalSeasons: 2,
    progress: 80,
    lastWatched: "2024-02-28",
    pausedDuration: "1 month ago",
    notes: "Almost finished season 1, loving the dragons!",
    journalEntryId: 3
  }
])

const showFilterOptions = ref(false)
const sortBy = ref('lastWatched')
const filterGenre = ref('')

// Computed
const uniqueGenres = computed(() => {
  const genres = pausedShows.value.map(show => show.genre)
  return [...new Set(genres)].sort()
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const resumeShow = (show: PausedShow) => {
  emit('resume-show', show)
  console.log('Resuming:', show.title)
}

const updateStatus = async (show: PausedShow, newStatus: 'watched' | 'dropped') => {
  try {
    // Update in journal
    console.log(`Updating ${show.title} status to ${newStatus}`)
    
    // Remove from paused list if marking as watched/dropped
    pausedShows.value = pausedShows.value.filter(s => s.id !== show.id)
    
    emit('status-updated', { show, status: newStatus })
  } catch (error) {
    console.error('Error updating show status:', error)
  }
}

const editShow = (show: PausedShow) => {
  emit('edit-show', show)
}

const resumeAll = () => {
  emit('resume-all', pausedShows.value)
}

// Watch for sort/filter changes
watch([sortBy, filterGenre], () => {
  // Apply sorting and filtering
  let filtered = [...pausedShows.value]
  
  if (filterGenre.value) {
    filtered = filtered.filter(show => show.genre === filterGenre.value)
  }
  
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'year':
        return b.year - a.year
      case 'pausedDuration':
        // This would need proper date parsing in a real app
        return a.title.localeCompare(b.title) // Fallback to title
      case 'lastWatched':
      default:
        return new Date(b.lastWatched || '').getTime() - new Date(a.lastWatched || '').getTime()
    }
  })
  
  // Update the display order
  pausedShows.value = filtered
})

const emit = defineEmits(['resume-show', 'status-updated', 'edit-show', 'resume-all'])
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>