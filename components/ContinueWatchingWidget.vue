<template>
  <div class="bg-white rounded-2xl p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6">Continue watching</h3>
    
    <div class="space-y-4">
      <div 
        v-for="item in continueWatchingItems" 
        :key="item.id"
        class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
        @click="resumeWatching(item)"
      >
        <!-- Thumbnail -->
        <div class="relative flex-shrink-0">
          <img 
            :src="item.thumbnail" 
            :alt="item.title"
            class="w-20 h-12 object-cover rounded-lg"
          />
          <!-- Play Button -->
          <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all">
            <Icon name="mdi:play" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <!-- Progress Bar -->
          <div class="absolute bottom-1 left-1 right-1 h-1 bg-black bg-opacity-30 rounded-full">
            <div 
              class="h-full bg-blue-600 rounded-full"
              :style="{ width: `${item.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-gray-900 truncate">{{ item.title }}</h4>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>{{ item.genre }}</span>
            <span>•</span>
            <span>{{ item.year }}</span>
          </div>
        </div>

        <!-- Progress Info -->
        <div class="text-right flex-shrink-0">
          <div class="text-sm font-medium text-gray-900">{{ Math.round(item.progress) }}%</div>
          <div class="text-xs text-gray-500">{{ item.timeLeft }} left</div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="continueWatchingItems.length === 0"
      class="text-center py-8"
    >
      <Icon name="mdi:play-circle-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No shows to continue watching</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ContinueWatchingItem {
  id: number
  title: string
  thumbnail: string
  genre: string
  year: number
  progress: number
  timeLeft: string
  watchUrl: string
}

const continueWatchingItems = ref<ContinueWatchingItem[]>([
  {
    id: 1,
    title: "Barbie",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=120&fit=crop",
    genre: "Comedy, Fantasy",
    year: 2023,
    progress: 65,
    timeLeft: "45m",
    watchUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM"
  },
  {
    id: 2,
    title: "The Hunger Games",
    thumbnail: "https://images.unsplash.com/photo-1489599904472-c34eb5d19877?w=200&h=120&fit=crop",
    genre: "Science fiction",
    year: 2012,
    progress: 30,
    timeLeft: "1h 50m",
    watchUrl: "https://www.youtube.com/watch?v=mfmrPu43DF8"
  },
  {
    id: 3,
    title: "Iron Man",
    thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=120&fit=crop",
    genre: "Science fiction",
    year: 2008,
    progress: 85,
    timeLeft: "20m",
    watchUrl: "https://www.youtube.com/watch?v=8ugaeA-nMTc"
  }
])

const emit = defineEmits(['resume-watching'])

const resumeWatching = (item: ContinueWatchingItem) => {
  emit('resume-watching', item)
  // You could also navigate directly or open a modal
  console.log('Resuming:', item.title)
}
</script>
