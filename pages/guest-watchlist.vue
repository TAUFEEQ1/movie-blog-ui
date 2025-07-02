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
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            @error="handleImageError"
          />
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 class="font-bold text-lg mb-2 line-clamp-2">{{ item.title }}</h3>
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-300 capitalize">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                <div class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                  <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm font-bold text-white">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="openTrailer(item)"
                  class="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded"
                >
                  <Icon name="mdi:play" class="w-4 h-4" />
                  Trailer
                </button>
                <button
                  @click="removeFromGuestWatchlist(item)"
                  class="flex-1 flex items-center justify-center gap-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors px-3 py-1.5 rounded"
                >
                  <Icon name="mdi:bookmark-remove" class="w-4 h-4" />
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
import { onMounted, ref } from 'vue'

const guestWatchlist = ref<TrendingItem[]>([])
const showVideoModal = ref(false)
const selectedVideoKey = ref('')

onMounted(() => {
  if (process.client) {
    guestWatchlist.value = JSON.parse(localStorage.getItem('guestWatchlist') || '[]')
  }
})

function removeFromGuestWatchlist(item: TrendingItem) {
  if (process.client) {
    guestWatchlist.value = guestWatchlist.value.filter(i => i.id !== item.id)
    localStorage.setItem('guestWatchlist', JSON.stringify(guestWatchlist.value))
  }
}

// Trailer functions
const openTrailer = (item: TrendingItem) => {
  if (item.trailer_url) {
    const videoId = extractYoutubeId(item.trailer_url)
    if (videoId) {
      showVideoModal.value = true
      selectedVideoKey.value = videoId
    } else {
      alert('Invalid trailer URL format')
    }
  } else {
    alert('No trailer available for this title')
  }
}

// Helper function to extract YouTube video ID
function extractYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-poster.jpg' // Make sure to add a default poster image
}
</script>
