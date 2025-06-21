<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
    <!-- Poster Image -->
    <div class="relative aspect-[2/3] overflow-hidden">
      <img 
        :src="getPosterUrl(item.poster_path, 'w342')"
        :alt="getDisplayTitle(item)"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      
      <!-- Media Type Badge -->
      <div class="absolute top-3 left-3">
        <span class="px-2 py-1 bg-black bg-opacity-75 text-white text-xs font-medium rounded-full uppercase">
          {{ item.media_type }}
        </span>
      </div>

      <!-- Rating Badge -->
      <div v-if="item.vote_average > 0" class="absolute top-3 right-3">
        <div class="flex items-center gap-1 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
          <Icon name="mdi:star" class="w-3 h-3 text-yellow-400" />
          <span class="font-semibold">{{ item.vote_average.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
        <button 
          @click="searchTrailer"
          :disabled="isSearchingTrailer"
          class="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <Icon 
            :name="isSearchingTrailer ? 'mdi:loading' : 'mdi:play'" 
            :class="['w-4 h-4', { 'animate-spin': isSearchingTrailer }]" 
          />
          {{ isSearchingTrailer ? 'Loading...' : 'Trailer' }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2" :title="getDisplayTitle(item)">
        {{ getDisplayTitle(item) }}
      </h3>

      <!-- Meta Information -->
      <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>{{ getReleaseYear(item) }}</span>
        <span class="capitalize">{{ item.original_language }}</span>
      </div>

      <!-- Overview -->
      <p class="text-sm text-gray-600 line-clamp-3 mb-4" :title="item.overview">
        {{ item.overview || 'No description available.' }}
      </p>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button 
          @click="searchTrailer"
          :disabled="isSearchingTrailer"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Icon 
            :name="isSearchingTrailer ? 'mdi:loading' : 'mdi:play'" 
            :class="['w-4 h-4', { 'animate-spin': isSearchingTrailer }]" 
          />
          {{ isSearchingTrailer ? 'Loading...' : 'Watch' }}
        </button>

        <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Icon name="mdi:heart-outline" class="w-4 h-4 text-gray-600" />
        </button>

        <button class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <!-- Additional Stats -->
      <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <Icon name="mdi:thumb-up-outline" class="w-3 h-3" />
          <span>{{ Math.round(item.popularity) }}</span>
        </div>
        
        <div v-if="item.vote_count > 0" class="flex items-center gap-1">
          <Icon name="mdi:account-group-outline" class="w-3 h-3" />
          <span>{{ item.vote_count }} votes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TMDBSearchResult } from '~/composables/useSearch'
import { useSearch } from '~/composables/useSearch'

interface Props {
  item: TMDBSearchResult
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'play-trailer': [url: string]
}>()

// Composables
const { getPosterUrl, getReleaseYear, getDisplayTitle, fetchTrailerUrl } = useSearch()

// State
const isSearchingTrailer = ref(false)

// Methods
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}

const searchTrailer = async () => {
  isSearchingTrailer.value = true
  
  try {
    // Fetch the actual trailer URL from the backend
    const trailerUrl = await fetchTrailerUrl(props.item)
    
    if (trailerUrl) {
      // Emit the actual trailer URL
      emit('play-trailer', trailerUrl)
    } else {
      // Fallback to YouTube search if no trailer found
      const searchQuery = encodeURIComponent(`${getDisplayTitle(props.item)} ${getReleaseYear(props.item)} trailer`)
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`
      emit('play-trailer', youtubeSearchUrl)
    }
  } catch (error) {
    console.error('Error finding trailer:', error)
    
    // Fallback to YouTube search on error
    const searchQuery = encodeURIComponent(`${getDisplayTitle(props.item)} ${getReleaseYear(props.item)} trailer`)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`
    emit('play-trailer', youtubeSearchUrl)
  } finally {
    isSearchingTrailer.value = false
  }
}
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
