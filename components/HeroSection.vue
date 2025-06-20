<template>
  <section class="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
    <!-- Video Background -->
    <div class="absolute inset-0">
      <iframe
        v-if="currentTopPick.trailerEmbedUrl"
        :src="currentTopPick.trailerEmbedUrl + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + getVideoId(currentTopPick.trailerEmbedUrl)"
        class="w-full h-full object-cover"
        frameborder="0"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
      <img 
        v-else
        :src="currentTopPick.backgroundImage" 
        :alt="currentTopPick.title"
        class="w-full h-full object-cover"
      />
    </div>
    
    <div class="absolute inset-0 bg-black bg-opacity-40"></div>
    
    <div class="relative z-10 h-full flex items-center px-8">
      <div class="max-w-2xl">
        <!-- Top Pick Badge -->
        <div class="flex items-center gap-2 mb-4">
          <span class="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-medium">
            #{{ currentTopPick.rank }} Top Pick
          </span>
          <span class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-white">
            {{ currentTopPick.type }}
          </span>
        </div>

        <!-- Genre Tags -->
        <div class="flex gap-2 mb-4">
          <span v-for="genre in currentTopPick.genres" :key="genre" 
                class="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm text-white">
            {{ genre }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
          {{ currentTopPick.title }}
        </h1>

        <!-- Description -->
        <p class="text-lg text-white mb-6 max-w-xl opacity-90">
          {{ currentTopPick.description }}
        </p>

        <!-- Action Buttons -->
        <div class="flex gap-4 items-center">
          <button 
            @click="addToWatchlist"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Icon name="mdi:plus" class="w-5 h-5" />
            Add to Watchlist
          </button>
          <button 
            @click="markAsWatched"
            class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Icon name="mdi:check" class="w-5 h-5" />
            Mark Watched
          </button>
          <button 
            @click="playFullTrailer"
            class="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Icon name="mdi:play" class="w-5 h-5 text-white" />
          </button>
        </div>

        <!-- Rating & Release Info -->
        <div class="absolute top-6 right-6 space-y-2">
          <div class="bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <div class="flex items-center gap-1">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
              <span class="text-white font-medium">{{ currentTopPick.rating }}</span>
            </div>
          </div>
          <div class="bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <span class="text-white text-sm">{{ currentTopPick.releaseYear }}</span>
          </div>
        </div>

        <!-- Auto-rotating indicator -->
        <div class="absolute bottom-6 right-6 flex items-center gap-2">
          <div class="flex gap-1">
            <div 
              v-for="(pick, index) in topPicks" 
              :key="pick.id"
              class="w-2 h-2 rounded-full transition-colors"
              :class="index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-40'"
            ></div>
          </div>
          <span class="text-white text-sm">Auto-rotating picks</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TopPick {
  id: number
  title: string
  description: string
  genres: string[]
  rating: number
  backgroundImage: string
  trailerEmbedUrl?: string
  trailerUrl: string
  type: 'Movie' | 'TV Show'
  rank: number
  releaseYear: number
}

// Sample top picks data (this would come from your scraping bot)
const topPicks = ref<TopPick[]>([
  {
    id: 1,
    title: "The Bear",
    description: "A young chef from the fine dining world returns to Chicago to run his deceased brother's Italian beef shop.",
    genres: ["Drama", "Comedy"],
    rating: 4.9,
    backgroundImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop",
    trailerEmbedUrl: "https://www.youtube.com/embed/y-cqqAJIXhs",
    trailerUrl: "https://www.youtube.com/watch?v=y-cqqAJIXhs",
    type: "TV Show",
    rank: 1,
    releaseYear: 2022
  },
  {
    id: 2,
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    genres: ["Biography", "Drama", "History"],
    rating: 4.8,
    backgroundImage: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=600&fit=crop",
    trailerEmbedUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    type: "Movie",
    rank: 2,
    releaseYear: 2023
  },
  {
    id: 3,
    title: "Wednesday",
    description: "Follows Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
    genres: ["Comedy", "Crime", "Fantasy"],
    rating: 4.7,
    backgroundImage: "https://images.unsplash.com/photo-1509803874385-db7c23652552?w=1200&h=600&fit=crop",
    trailerEmbedUrl: "https://www.youtube.com/embed/Q73aPqQmAuM",
    trailerUrl: "https://www.youtube.com/watch?v=Q73aPqQmAuM",
    type: "TV Show",
    rank: 3,
    releaseYear: 2022
  }
])

const currentIndex = ref(0)
const currentTopPick = computed(() => topPicks.value[currentIndex.value])

const emit = defineEmits(['play-trailer', 'add-to-watchlist', 'mark-as-watched'])

// Auto-rotate picks every 2 minutes
onMounted(() => {
  setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % topPicks.value.length
  }, 120000)
})

const getVideoId = (url: string) => {
  const match = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : ''
}

const addToWatchlist = () => {
  emit('add-to-watchlist', currentTopPick.value)
  console.log('Added to watchlist:', currentTopPick.value.title)
}

const markAsWatched = () => {
  emit('mark-as-watched', currentTopPick.value)
  console.log('Marked as watched:', currentTopPick.value.title)
}

const playFullTrailer = () => {
  emit('play-trailer', currentTopPick.value.trailerUrl)
}
</script>
