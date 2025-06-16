<template>
  <section class="mb-12">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
        <Icon v-if="icon" :name="icon" class="w-6 h-6 text-orange-500" />
      </div>
      <button 
        v-if="showViewAll"
        class="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        @click="$emit('view-all')"
      >
        View all
      </button>
    </div>

    <!-- Movies Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <MovieCard 
        v-for="movie in movies" 
        :key="movie.id"
        :movie="movie"
        @play-trailer="$emit('play-trailer', $event)"
        @toggle-favorite="$emit('toggle-favorite', $event)"
      />
    </div>

    <!-- Empty State -->
    <div 
      v-if="movies.length === 0"
      class="text-center py-12"
    >
      <Icon name="mdi:movie-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">No movies found in this section</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  genres: string[]
  year: number
  duration: string
  trailerUrl: string
}

interface Props {
  title: string
  movies: Movie[]
  icon?: string
  showViewAll?: boolean
}

defineProps<Props>()
defineEmits(['play-trailer', 'toggle-favorite', 'view-all'])
</script>
