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

      <!-- Action Buttons -->
      <div class="absolute top-3 right-3 flex flex-col gap-2">
        <!-- Wishlist Button -->
        <button 
          @click.stop="handleWishlistClick"
          class="p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all group/wishlist"
          :class="{ 'bg-blue-600 bg-opacity-90': inWishlist }"
          :title="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        >
          <Icon 
            :name="inWishlist ? 'mdi:bookmark' : 'mdi:bookmark-outline'" 
            class="w-5 h-5"
            :class="inWishlist ? 'text-white' : 'text-white group-hover/wishlist:text-blue-300'"
          />
        </button>

        <!-- Favorite Button -->
        <button 
          @click.stop="toggleFavorite"
          class="p-2 bg-black bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Icon 
            :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
            class="w-5 h-5"
            :class="isFavorite ? 'text-red-500' : 'text-white'"
          />
        </button>
      </div>

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
      <h3 class="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
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
  tmdb_id?: number
  type?: 'movie' | 'tv'
  poster_path?: string
  backdrop_path?: string
  tmdb_rating?: number
  release_year?: number
  overview?: string
}

interface Props {
  movie: Movie
}

const props = defineProps<Props>()
const emit = defineEmits(['play-trailer', 'toggle-favorite', 'add-to-wishlist'])

const { user } = useAuth()
const { checkInWishlist, removeFromWishlistByTmdbId } = useWishlist()

const isFavorite = ref(false)
const inWishlist = ref(false)
const isCheckingWishlist = ref(false)

// Check if movie is in wishlist
const checkWishlistStatus = async () => {
  if (!user.value || !props.movie.tmdb_id) return
  
  try {
    isCheckingWishlist.value = true
    const result = await checkInWishlist(props.movie.tmdb_id)
    inWishlist.value = result.exists
  } catch (error) {
    console.error('Error checking wishlist status:', error)
  } finally {
    isCheckingWishlist.value = false
  }
}

const playTrailer = () => {
  emit('play-trailer', props.movie.trailerUrl)
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  emit('toggle-favorite', props.movie.id, isFavorite.value)
}

const handleWishlistClick = async () => {
  if (!user.value) {
    // Redirect to login or show login modal
    await navigateTo('/login')
    return
  }

  if (inWishlist.value) {
    // Remove from wishlist
    try {
      if (props.movie.tmdb_id) {
        await removeFromWishlistByTmdbId(props.movie.tmdb_id)
        inWishlist.value = false
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  } else {
    // Show add to wishlist modal
    const movieData = {
      tmdb_id: props.movie.tmdb_id || props.movie.id,
      title: props.movie.title,
      type: props.movie.type || 'movie',
      poster_path: props.movie.poster_path || props.movie.poster.replace('https://image.tmdb.org/t/p/w500', ''),
      backdrop_path: props.movie.backdrop_path,
      tmdb_rating: props.movie.tmdb_rating || props.movie.rating,
      release_year: props.movie.release_year || props.movie.year,
      overview: props.movie.overview,
      genres: props.movie.genres
    }
    
    emit('add-to-wishlist', movieData)
  }
}

// Check wishlist status when component mounts and user changes
onMounted(checkWishlistStatus)
watch(() => user.value, checkWishlistStatus)
watch(() => props.movie.tmdb_id, checkWishlistStatus)
</script>
