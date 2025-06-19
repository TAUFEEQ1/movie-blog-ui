<template>
  <div class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
    <div class="flex gap-4">
      <!-- Movie Poster -->
      <div class="flex-shrink-0">
        <img 
          :src="movie.poster" 
          :alt="movie.title"
          class="w-16 h-24 object-cover rounded-lg"
        />
      </div>
      
      <!-- Movie Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-gray-900 truncate">{{ movie.title }}</h3>
          <div class="flex items-center gap-1 text-sm text-gray-500">
            <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
            <span>{{ movie.userRating }}</span>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-2">{{ movie.year }} • {{ movie.genres.join(', ') }}</p>
        
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>Watched on {{ formatDate(movie.watchedDate) }}</span>
          <span v-if="movie.rewatchCount > 1" class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {{ movie.rewatchCount }}x watched
          </span>
        </div>
        
        <!-- Journal Entry Preview -->
        <div v-if="movie.journalEntry" class="bg-gray-50 rounded-lg p-3 mb-3">
          <p class="text-sm text-gray-700 line-clamp-3">{{ movie.journalEntry }}</p>
        </div>
        
        <!-- Tags -->
        <div v-if="movie.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
          <span 
            v-for="tag in movie.tags" 
            :key="tag"
            class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <button 
              @click="editJournal"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {{ movie.journalEntry ? 'Edit Journal' : 'Add Journal' }}
            </button>
            <button 
              @click="markRewatch"
              class="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Rewatch
            </button>
          </div>
          
          <div class="flex items-center gap-1">
            <button @click="toggleFavorite" class="p-1 hover:bg-gray-100 rounded">
              <Icon 
                :name="movie.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
                class="w-4 h-4"
                :class="movie.isFavorite ? 'text-red-500' : 'text-gray-400'"
              />
            </button>
            <button @click="showMore" class="p-1 hover:bg-gray-100 rounded">
              <Icon name="mdi:dots-horizontal" class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface WatchedMovie {
  id: number
  title: string
  year: number
  genres: string[]
  poster: string
  userRating: number
  watchedDate: Date
  rewatchCount: number
  journalEntry?: string
  tags: string[]
  isFavorite: boolean
}

interface Props {
  movie: WatchedMovie
}

const props = defineProps<Props>()
const emit = defineEmits(['edit-journal', 'mark-rewatch', 'toggle-favorite'])

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const editJournal = () => {
  emit('edit-journal', props.movie)
}

const markRewatch = () => {
  emit('mark-rewatch', props.movie)
}

const toggleFavorite = () => {
  emit('toggle-favorite', props.movie)
}

const showMore = () => {
  // Show more options menu
  console.log('Show more options for:', props.movie.title)
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
