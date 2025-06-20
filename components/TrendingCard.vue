<template>
  <div class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
    <!-- Movie Poster -->
    <div class="relative overflow-hidden">
      <img 
        :src="posterUrl" 
        :alt="item.title"
        class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      
      <!-- TMDB Rating Badge -->
      <div class="absolute top-3 left-3 bg-black bg-opacity-70 px-2 py-1 rounded-lg">
        <div class="flex items-center gap-1">
          <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
          <span class="text-white text-sm font-medium">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
        </div>
      </div>

      <!-- User Rating Badge -->
      <div 
        v-if="userRating" 
        class="absolute top-3 right-3 bg-green-600 bg-opacity-90 px-2 py-1 rounded-lg"
      >
        <div class="flex items-center gap-1">
          <Icon name="mdi:account-star" class="w-4 h-4 text-white" />
          <span class="text-white text-sm font-medium">{{ userRating.rating.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Notable/Unfavorable Indicators -->
      <div class="absolute bottom-3 right-3 flex gap-1">
        <div 
          v-if="userRating?.is_notable" 
          class="bg-purple-600 bg-opacity-90 p-1 rounded-full"
          title="Notable"
        >
          <Icon name="mdi:bookmark" class="w-4 h-4 text-white" />
        </div>
        <div 
          v-if="userRating?.is_unfavorable" 
          class="bg-red-600 bg-opacity-90 p-1 rounded-full"
          title="Unfavorable"
        >
          <Icon name="mdi:thumb-down" class="w-4 h-4 text-white" />
        </div>
      </div>

      <!-- Type Badge -->
      <div class="absolute bottom-3 left-3 bg-blue-600 bg-opacity-90 px-2 py-1 rounded-lg">
        <span class="text-white text-xs font-medium uppercase">{{ item.type }}</span>
      </div>

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
        <button 
          v-if="item.trailer_url"
          @click.stop="$emit('play-trailer', item.trailer_url)"
          class="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all duration-300 transform scale-75 group-hover:scale-100"
        >
          <Icon name="mdi:play" class="w-6 h-6 text-gray-900" />
        </button>
      </div>
    </div>

    <!-- Movie Info -->
    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-2 leading-tight">
        {{ item.title }}
      </h3>
      
      <div class="flex items-center gap-2 mb-2">
        <span 
          v-for="genre in displayGenres" 
          :key="genre"
          class="text-sm text-gray-500"
        >
          {{ genre }}
        </span>
      </div>
      
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500">{{ item.release_year }}</span>
        <span class="text-sm text-gray-500">{{ item.platform }}</span>
      </div>

      <!-- Rating Button -->
      <button
        @click="$emit('rate', item)"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Icon :name="userRating ? 'mdi:star' : 'mdi:star-outline'" class="w-4 h-4" />
        {{ userRating ? 'Update Rating' : 'Rate' }}
      </button>

      <!-- User Comment Preview -->
      <div v-if="userRating?.comment" class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2">
        "{{ userRating.comment }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TrendingItem {
  id: number
  title: string
  tmdb_id: number
  type: 'movie' | 'tv'
  platform: string
  tmdb_rating?: number
  tmdb_vote_count?: number
  genres?: string[]
  poster_path?: string
  backdrop_path?: string
  release_year?: number
  release_date?: string
  trailer_url?: string
  overview?: string
  runtime?: number
  language?: string
  popularity?: number
  trending_score?: number
  trending_rank?: number
  is_active: boolean
  expires_at?: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

interface TrendingRating {
  id: number
  user: number
  tmdb_id: number
  type: 'movie' | 'tv'
  rating: number
  comment?: string
  is_notable: boolean
  is_unfavorable: boolean
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  item: TrendingItem
  userRating?: TrendingRating | null
}>()

defineEmits<{
  rate: [item: TrendingItem]
  'play-trailer': [url: string]
}>()

// Computed properties
const posterUrl = computed(() => {
  if (props.item.poster_path) {
    return `https://image.tmdb.org/t/p/w500${props.item.poster_path}`
  }
  return '/default-poster.jpg' // Fallback image
})

const displayGenres = computed(() => {
  if (Array.isArray(props.item.genres)) {
    return props.item.genres.slice(0, 2) // Show only first 2 genres
  }
  return []
})

// Methods
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/default-poster.jpg'
}
</script>
