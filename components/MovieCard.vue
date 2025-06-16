<template>
  <div class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
    <!-- Movie Poster -->
    <div class="relative overflow-hidden">
      <img 
        :src="movie.poster" 
        :alt="movie.title"
        class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      <!-- Rating Badge -->
      <div class="absolute top-3 left-3 bg-black bg-opacity-70 px-2 py-1 rounded-lg">
        <div class="flex items-center gap-1">
          <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
          <span class="text-white text-sm font-medium">{{ movie.rating }}</span>
        </div>
      </div>

      <!-- Favorite Button -->
      <button 
        @click.stop="toggleFavorite"
        class="absolute top-3 right-3 p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
      >
        <Icon 
          :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
          class="w-5 h-5"
          :class="isFavorite ? 'text-red-500' : 'text-white'"
        />
      </button>

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
        <button 
          @click.stop="playTrailer"
          class="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all duration-300 transform scale-75 group-hover:scale-100"
        >
          <Icon name="mdi:play" class="w-6 h-6 text-gray-900" />
        </button>
      </div>
    </div>

    <!-- Movie Info -->
    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {{ movie.title }}
      </h3>
      <div class="flex items-center gap-2 mb-2">
        <span 
          v-for="genre in movie.genres" 
          :key="genre"
          class="text-sm text-gray-500"
        >
          {{ genre }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500">{{ movie.year }}</span>
        <div class="flex items-center gap-1">
          <Icon name="mdi:clock-outline" class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-500">{{ movie.duration }}</span>
        </div>
      </div>
    </div>
  </div>
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
  movie: Movie
}

const props = defineProps<Props>()
const emit = defineEmits(['play-trailer', 'toggle-favorite'])

const isFavorite = ref(false)

const playTrailer = () => {
  emit('play-trailer', props.movie.trailerUrl)
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  emit('toggle-favorite', props.movie.id, isFavorite.value)
}
</script>
