<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Guest Watchlist</h1>
        <NuxtLink
          to="/welcome"
          class="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Back to Trending
        </NuxtLink>
      </div>
      <p class="text-gray-400 mt-2">
        Your watchlist is stored locally. Create an account to sync across devices!
      </p>
    </div>

    <!-- Watchlist Grid -->
    <div class="max-w-7xl mx-auto">
      <div v-if="guestWatchlist.length === 0" class="text-center py-12">
        <Icon name="mdi:bookmark-outline" class="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p class="text-gray-400 mb-4">Your watchlist is empty!</p>
        <NuxtLink
          to="/welcome"
          class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg text-white"
        >
          <Icon name="mdi:plus" class="w-5 h-5" />
          Add Movies & Shows
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="item in guestWatchlist"
          :key="item.id"
          class="relative group overflow-hidden rounded-xl"
        >
          <img
            :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
            :alt="item.title || item.name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            @error="handleImageError"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-white font-semibold truncate">{{ item.title || item.name }}</h3>
              <p class="text-sm text-gray-300 mb-2">
                {{ item.media_type === 'movie' ? 'Movie' : 'TV Show' }}
              </p>
              <div class="flex items-center gap-2">
                <button
                  @click="openTrailer(item)"
                  class="flex items-center gap-1 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1 rounded"
                >
                  <Icon name="mdi:play" class="w-4 h-4" />
                  Trailer
                </button>
                <button
                  @click="toggleGuestWatchlist(item)"
                  class="flex items-center gap-1 text-sm text-white bg-red-500 hover:bg-red-600 transition-colors px-3 py-1 rounded"
                >
                  <Icon name="mdi:close" class="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoModal
      v-if="showVideoModal"
      :isOpen="showVideoModal"
      :videoUrl="`https://www.youtube.com/watch?v=${selectedVideoKey}`"
      @close="showVideoModal = false"
    />
  </div>
</template>

<script setup lang="ts">
interface TrendingItem {
  id: number
  title?: string
  name?: string
  poster_path: string
  media_type: string
  vote_average: number
  release_date?: string
  first_air_date?: string
}

interface VideoResult {
  results: {
    key: string
    type: string
  }[]
}

const guestWatchlist = ref<TrendingItem[]>([])
const showVideoModal = ref(false)
const selectedVideoKey = ref('')

onMounted(() => {
  // Load guest watchlist from localStorage
  const savedWatchlist = localStorage.getItem('guestWatchlist')
  if (savedWatchlist) {
    guestWatchlist.value = JSON.parse(savedWatchlist)
  }
})

// Guest watchlist functions
const toggleGuestWatchlist = (item: TrendingItem) => {
  const index = guestWatchlist.value.findIndex(i => i.id === item.id)
  if (index === -1) {
    guestWatchlist.value.push(item)
  } else {
    guestWatchlist.value.splice(index, 1)
  }
  localStorage.setItem('guestWatchlist', JSON.stringify(guestWatchlist.value))
}

// Trailer functions
const openTrailer = async (item: TrendingItem) => {
  try {
    const videos = await $fetch<VideoResult>(`https://api.themoviedb.org/3/${item.media_type}/${item.id}/videos`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`
      }
    })
    
    const trailer = videos.results?.find(v => v.type === 'Trailer') || videos.results?.[0]
    if (trailer) {
      selectedVideoKey.value = trailer.key
      showVideoModal.value = true
    }
  } catch (error) {
    console.error('Error fetching trailer:', error)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-poster.jpg' // Make sure to add a default poster image
}
</script>
