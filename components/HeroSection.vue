<template>
  <section class="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 mb-8">
    <div class="absolute inset-0 bg-black bg-opacity-30"></div>
    <div class="relative z-10 h-full flex items-center px-8">
      <div class="max-w-2xl">
        <!-- Genre Tags -->
        <div class="flex gap-2 mb-4">
          <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-white">
            {{ currentMovie.genre1 }}
          </span>
          <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-white">
            {{ currentMovie.genre2 }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
          {{ currentMovie.title }}
        </h1>

        <!-- Description -->
        <p class="text-lg text-white mb-6 max-w-xl opacity-90">
          {{ currentMovie.description }}
        </p>

        <!-- Action Buttons -->
        <div class="flex gap-4 items-center">
          <button 
            @click="playTrailer"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Icon name="mdi:play" class="w-5 h-5" />
            Watch
          </button>
          <button 
            @click="toggleFavorite"
            class="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Icon name="mdi:heart-outline" class="w-5 h-5 text-white" />
          </button>
        </div>

        <!-- Rating -->
        <div class="absolute top-6 right-6 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <div class="flex items-center gap-1">
            <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
            <span class="text-white font-medium">{{ currentMovie.rating }}</span>
          </div>
        </div>

        <!-- Friends Watching -->
        <div class="absolute bottom-6 right-6 flex items-center gap-2">
          <div class="flex -space-x-2">
            <img 
              v-for="friend in currentMovie.friendsWatching" 
              :key="friend.id"
              :src="friend.avatar" 
              :alt="friend.name"
              class="w-8 h-8 rounded-full border-2 border-white"
            />
          </div>
          <span class="text-white text-sm">Friends are watching</span>
        </div>
      </div>
    </div>

    <!-- Background Image -->
    <img 
      :src="currentMovie.backgroundImage" 
      :alt="currentMovie.title"
      class="absolute inset-0 w-full h-full object-cover opacity-50"
    />
  </section>
</template>

<script setup lang="ts">
interface Friend {
  id: number
  name: string
  avatar: string
}

interface Movie {
  id: number
  title: string
  description: string
  genre1: string
  genre2: string
  rating: number
  backgroundImage: string
  trailerUrl: string
  friendsWatching: Friend[]
}

const currentMovie = ref<Movie>({
  id: 1,
  title: "Dune: Part Two",
  description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  genre1: "Science fiction",
  genre2: "Adventure", 
  rating: 4.8,
  backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
  trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
  friendsWatching: [
    { id: 1, name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b4f0?w=40&h=40&fit=crop&crop=face" },
    { id: 2, name: "Mike", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" },
    { id: 3, name: "Anna", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face" }
  ]
})

const emit = defineEmits(['play-trailer'])

const playTrailer = () => {
  emit('play-trailer', currentMovie.value.trailerUrl)
}

const toggleFavorite = () => {
  // Add to favorites logic
  console.log('Toggle favorite for:', currentMovie.value.title)
}
</script>
