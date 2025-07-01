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

      <!-- Type Badge -->
      <div class="absolute bottom-3 left-3 bg-blue-600 bg-opacity-90 px-2 py-1 rounded-lg">
        <span class="text-white text-xs font-medium uppercase">{{ item.type }}</span>
      </div>

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
        <div class="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <button 
            v-if="item.trailer_url"
            @click.stop="$emit('play-trailer', item.trailer_url)"
            class="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all duration-300"
          >
            <Icon name="mdi:play" class="w-5 h-5 text-gray-900" />
          </button>
          
          <button 
            @click.stop="$emit('add-to-wishlist', item)"
            class="bg-blue-600 bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all duration-300 relative"
          >
            <span class="block group-hover:hidden">
              <Icon name="mdi:bookmark-outline" class="w-5 h-5 text-white" />
            </span>
            <span class="hidden group-hover:block">
              <Icon name="mdi:bookmark-check-outline" class="w-5 h-5 text-white" />
            </span>
          </button>
        </div>
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

const props = defineProps<{
  item: TrendingItem
}>()

defineEmits<{
  'play-trailer': [url: string]
  'add-to-wishlist': [item: TrendingItem]
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
