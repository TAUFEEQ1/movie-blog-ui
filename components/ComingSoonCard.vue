<template>
  <div class="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer">
    <!-- Poster Image -->
    <div class="aspect-[2/3] overflow-hidden">
      <img
        :src="getTmdbPosterUrl(item.poster_path)"
        :alt="item.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <!-- Play Button -->
          <div v-if="item.trailer_url" class="flex justify-center mb-2">
            <div class="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l7-5z"/>
              </svg>
            </div>
          </div>
          
          <!-- Quick Info -->
          <div class="text-center">
            <div class="text-sm text-white/80 mb-1">{{ getTimeUntilRelease(item.release_date) }}</div>
            <div v-if="item.tmdb_rating" class="flex items-center justify-center space-x-1">
              <span class="text-yellow-400 text-sm">★</span>
              <span class="text-white text-sm">{{ item.tmdb_rating.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Card Content -->
    <div class="p-4">
      <!-- Status Badge -->
      <div class="flex items-center justify-between mb-2">
        <span :class="getStatusColor(item.status || 'announced')" class="px-2 py-1 rounded-full text-xs font-medium text-white">
          {{ getStatusLabel(item.status || 'announced') }}
        </span>
        <span class="text-xs text-gray-400 uppercase">{{ item.type }}</span>
      </div>
      
      <!-- Title -->
      <h3 class="text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
        {{ item.title }}
      </h3>
      
      <!-- Release Date -->
      <div class="text-sm text-gray-400 mb-2">
        {{ formatReleaseDate(item.release_date) }}
      </div>
      
      <!-- Time Until Release -->
      <div class="text-sm font-medium text-blue-400">
        {{ getTimeUntilRelease(item.release_date) }}
      </div>
      
      <!-- Rating -->
      <div v-if="item.tmdb_rating" class="flex items-center space-x-1 mt-2">
        <span class="text-yellow-400 text-sm">★</span>
        <span class="text-sm text-gray-300">{{ item.tmdb_rating.toFixed(1) }}</span>
        <span v-if="item.tmdb_vote_count" class="text-xs text-gray-500">({{ formatVoteCount(item.tmdb_vote_count) }})</span>
      </div>
      
      <!-- Anticipation Score -->
      <div v-if="item.anticipation_score && item.anticipation_score > 0" class="mt-2">
        <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Anticipation</span>
          <span>{{ item.anticipation_score.toFixed(0) }}%</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-1">
          <div 
            class="bg-blue-500 h-1 rounded-full" 
            :style="{ width: `${Math.min(item.anticipation_score, 100)}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Genres (if available) -->
      <div v-if="item.genres && item.genres.length > 0" class="mt-2">
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="genre in item.genres.slice(0, 2)" 
            :key="genre"
            class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
          >
            {{ genre }}
          </span>
          <span 
            v-if="item.genres.length > 2"
            class="text-xs text-gray-500"
          >
            +{{ item.genres.length - 2 }} more
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComingSoonItem } from '~/composables/useComingSoon'

// Props
interface Props {
  item: ComingSoonItem
}

defineProps<Props>()

// Composables
const { 
  getTmdbPosterUrl,
  formatReleaseDate,
  getTimeUntilRelease,
  getStatusColor,
  getStatusLabel
} = useComingSoon()

// Format vote count
const formatVoteCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
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
</style>
