<template>
  <section class="hero-section relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 mb-8">
    <div class="absolute inset-0 bg-black bg-opacity-30"></div>
    
    <!-- Carousel Navigation -->
    <div class="absolute top-4 left-4 z-20 flex gap-2">
      <button
        v-for="(movie, index) in topPickMovies"
        :key="movie.id"
        @click="setActiveMovie(index)"
        :class="[
          'w-3 h-3 rounded-full transition-all duration-300',
          currentMovieIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
        ]"
      ></button>
    </div>

    <!-- Auto-play control -->
    <button
      @click="toggleAutoPlay"
      class="absolute top-4 right-16 z-20 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-lg transition-colors group"
      :title="isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'"
    >
      <Icon 
        :name="isAutoPlaying ? 'mdi:pause' : 'mdi:play'" 
        class="w-5 h-5 text-white group-hover:scale-110 transition-transform"
      />
    </button>

    <div class="relative z-10 h-full flex items-center px-4 md:px-8">
      <div class="max-w-2xl">
        <!-- Top Pick Badge -->
        <div class="flex items-center gap-2 mb-3 md:mb-4">
          <Icon name="mdi:star" class="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          <span class="text-white font-medium text-sm md:text-base">Top Pick #{{ currentMovieIndex + 1 }}</span>
        </div>

        <!-- Genre Tags -->
        <div class="flex gap-2 mb-3 md:mb-4">
          <span class="px-2 md:px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs md:text-sm text-white">
            {{ currentMovie.genre1 }}
          </span>
          <span class="px-2 md:px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs md:text-sm text-white">
            {{ currentMovie.genre2 }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
          {{ currentMovie.title }}
        </h1>

        <!-- Description -->
        <p class="text-sm md:text-lg text-white mb-4 md:mb-6 max-w-xl opacity-90 line-clamp-3 md:line-clamp-none">
          {{ currentMovie.description }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
          <button 
            @click="playTrailer"
            class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base w-full sm:w-auto"
          >
            <Icon name="mdi:play" class="w-4 h-4 md:w-5 md:h-5" />
            Watch Trailer
          </button>
          <button 
            @click="addToJournal"
            class="flex items-center justify-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base w-full sm:w-auto"
          >
            <Icon name="mdi:plus" class="w-4 h-4 md:w-5 md:h-5" />
            Add to Journal
          </button>
          <button 
            @click="toggleFavorite"
            :class="[
              'p-2 md:p-3 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center',
              currentMovie.isFavorite 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white bg-opacity-20 hover:bg-opacity-30'
            ]"
          >
            <Icon 
              :name="currentMovie.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
              class="w-4 h-4 md:w-5 md:h-5 text-white" 
            />
          </button>
        </div>

        <!-- Rating -->
        <div class="absolute top-6 right-6 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <div class="flex items-center gap-1">
            <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
            <span class="text-white font-medium">{{ currentMovie.rating }}</span>
          </div>
        </div>

        <!-- Journal Status -->
        <div v-if="currentMovie.journalStatus" class="absolute bottom-6 left-6 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <div class="flex items-center gap-2">
            <Icon 
              :name="getStatusIcon(currentMovie.journalStatus)" 
              class="w-4 h-4 text-white" 
            />
            <span class="text-white text-sm">{{ getStatusLabel(currentMovie.journalStatus) }}</span>
          </div>
        </div>

        <!-- Personal Rating -->
        <div class="absolute bottom-6 right-6 flex items-center gap-2">
          <div class="bg-black bg-opacity-50 px-3 py-2 rounded-lg">
            <div class="flex items-center gap-2">
              <Icon name="mdi:account" class="w-4 h-4 text-white" />
              <span class="text-white text-sm">Personal Pick</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Image with Transition -->
    <Transition name="fade" mode="out-in">
      <img 
        :key="currentMovie.id"
        :src="currentMovie.backgroundImage" 
        :alt="currentMovie.title"
        class="absolute inset-0 w-full h-full object-cover opacity-50"
      />
    </Transition>

    <!-- Progress Bar -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
      <div 
        class="h-full bg-blue-600 transition-all duration-300 ease-linear"
        :style="{ width: `${autoPlayProgress}%` }"
      ></div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 768px) {
  .line-clamp-3 {
    display: block;
    overflow: visible;
  }
}
</style>

<script setup lang="ts">
interface Movie {
  id: number
  title: string
  description: string
  genre1: string
  genre2: string
  rating: number
  backgroundImage: string
  trailerUrl: string
  isFavorite?: boolean
  journalStatus?: string
}

// Top pick movies for the carousel
const topPickMovies = ref<Movie[]>([
  {
    id: 1,
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    genre1: "Science fiction",
    genre2: "Adventure", 
    rating: 4.8,
    backgroundImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    isFavorite: false,
    journalStatus: "planned_to_watch"
  },
  {
    id: 2,
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    genre1: "Biography",
    genre2: "Drama",
    rating: 4.9,
    backgroundImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    isFavorite: true,
    journalStatus: "watched"
  },
  {
    id: 3,
    title: "Spider-Man: Into the Spider-Verse",
    description: "Teen Miles Morales becomes the Spider-Man of his universe and joins other Spider-People from other dimensions.",
    genre1: "Animation",
    genre2: "Adventure",
    rating: 4.7,
    backgroundImage: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&h=600&fit=crop",
    trailerUrl: "https://www.youtube.com/watch?v=tg52up16eq0",
    isFavorite: false,
    journalStatus: "rewatched"
  }
])

// Carousel state
const currentMovieIndex = ref(0)
const isAutoPlaying = ref(true)
const autoPlayProgress = ref(0)
const autoPlayInterval = 5000 // 5 seconds

let autoPlayTimer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

// Computed
const currentMovie = computed(() => topPickMovies.value[currentMovieIndex.value])

// Methods
const setActiveMovie = (index: number) => {
  currentMovieIndex.value = index
  autoPlayProgress.value = 0
  resetAutoPlay()
}

const nextMovie = () => {
  currentMovieIndex.value = (currentMovieIndex.value + 1) % topPickMovies.value.length
  autoPlayProgress.value = 0
}

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value
  if (isAutoPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

const startAutoPlay = () => {
  if (!isAutoPlaying.value) return
  
  // Start progress animation
  let progress = 0
  const progressStep = 100 / (autoPlayInterval / 100)
  
  progressTimer = setInterval(() => {
    progress += progressStep
    autoPlayProgress.value = Math.min(progress, 100)
  }, 100)

  // Auto advance to next movie
  autoPlayTimer = setTimeout(() => {
    nextMovie()
    startAutoPlay() // Continue the cycle
  }, autoPlayInterval)
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
    autoPlayTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const resetAutoPlay = () => {
  stopAutoPlay()
  if (isAutoPlaying.value) {
    startAutoPlay()
  }
}

const getStatusIcon = (status: string) => {
  const icons = {
    'planned_to_watch': 'mdi:clock-outline',
    'watched': 'mdi:check-circle',
    'rewatched': 'mdi:refresh-circle',
    'paused': 'mdi:pause-circle',
    'dropped': 'mdi:close-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi:circle'
}

const getStatusLabel = (status: string) => {
  const labels = {
    'planned_to_watch': 'Planned',
    'watched': 'Watched',
    'rewatched': 'Rewatched',
    'paused': 'Paused',
    'dropped': 'Dropped'
  }
  return labels[status as keyof typeof labels] || status
}

const emit = defineEmits(['play-trailer', 'add-to-journal'])

const playTrailer = () => {
  emit('play-trailer', currentMovie.value.trailerUrl)
}

const addToJournal = () => {
  emit('add-to-journal', currentMovie.value)
}

const toggleFavorite = () => {
  const movie = topPickMovies.value[currentMovieIndex.value]
  movie.isFavorite = !movie.isFavorite
  console.log('Toggle favorite for:', movie.title, movie.isFavorite)
}

// Lifecycle
onMounted(() => {
  if (isAutoPlaying.value) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
})

// Pause auto-play when user is interacting
const handleUserInteraction = () => {
  if (isAutoPlaying.value) {
    resetAutoPlay()
  }
}

// Add event listeners for user interaction
onMounted(() => {
  const heroSection = document.querySelector('.hero-section')
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => {
      if (isAutoPlaying.value) {
        stopAutoPlay()
      }
    })
    heroSection.addEventListener('mouseleave', () => {
      if (isAutoPlaying.value) {
        startAutoPlay()
      }
    })
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
