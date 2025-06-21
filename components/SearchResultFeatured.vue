<template>
  <div class="relative overflow-hidden">
    <!-- Background Image -->
    <div 
      class="absolute inset-0 bg-cover bg-center"
      :style="`background-image: url('${getBackdropUrl(item.backdrop_path)}')`"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col lg:flex-row items-start gap-8 p-8 min-h-[400px]">
      <!-- Poster -->
      <div class="flex-shrink-0">
        <img 
          :src="getPosterUrl(item.poster_path)"
          :alt="getDisplayTitle(item)"
          class="w-48 h-72 object-cover rounded-xl shadow-2xl"
          @error="handleImageError"
        />
      </div>

      <!-- Details -->
      <div class="flex-1 text-white">
        <!-- Title and Meta -->
        <div class="mb-4">
          <h2 class="text-4xl font-bold mb-2">{{ getDisplayTitle(item) }}</h2>
          <div class="flex items-center gap-4 text-sm opacity-90">
            <span class="px-2 py-1 bg-blue-600 rounded-full text-xs font-medium uppercase">
              {{ item.media_type }}
            </span>
            <span>{{ getReleaseYear(item) }}</span>
            <div class="flex items-center gap-1">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
              <span class="font-semibold">{{ item.vote_average.toFixed(1) }}</span>
              <span class="opacity-75">({{ item.vote_count }} votes)</span>
            </div>
            <span class="capitalize">{{ item.original_language }}</span>
          </div>
        </div>

        <!-- Overview -->
        <p class="text-lg leading-relaxed mb-6 max-w-3xl opacity-90">
          {{ item.overview || 'No description available.' }}
        </p>

        <!-- Action Buttons -->
        <div class="flex items-center gap-4">
          <button 
            @click="searchTrailer"
            :disabled="isSearchingTrailer"
            class="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon 
              :name="isSearchingTrailer ? 'mdi:loading' : 'mdi:play'" 
              :class="['w-5 h-5', { 'animate-spin': isSearchingTrailer }]" 
            />
            {{ isSearchingTrailer ? 'Finding Trailer...' : 'Watch Trailer' }}
          </button>

          <button class="bg-blue-600 bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-colors flex items-center gap-2 backdrop-blur-sm">
            <Icon name="mdi:information-outline" class="w-5 h-5" />
            More Info
          </button>

          <button class="bg-white bg-opacity-10 text-white p-3 rounded-xl hover:bg-opacity-20 transition-colors backdrop-blur-sm">
            <Icon name="mdi:heart-outline" class="w-5 h-5" />
          </button>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 flex flex-wrap items-center gap-6 text-sm opacity-75">
          <div class="flex items-center gap-2">
            <Icon name="mdi:thumb-up-outline" class="w-4 h-4" />
            <span>{{ Math.round(item.popularity) }} popularity</span>
          </div>
          
          <div v-if="item.adult !== undefined" class="flex items-center gap-2">
            <Icon name="mdi:shield-outline" class="w-4 h-4" />
            <span>{{ item.adult ? '18+' : 'Family Friendly' }}</span>
          </div>
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
const { getPosterUrl, getBackdropUrl, getReleaseYear, getDisplayTitle, fetchTrailerUrl } = useSearch()

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
