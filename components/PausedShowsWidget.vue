<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:pause-circle" class="w-5 h-5 text-orange-600" />
        Paused Shows
      </h2>
      <div class="text-sm text-gray-500">{{ pausedShows.length }} shows</div>
    </div>
    
    <div class="space-y-4">
      <div 
        v-for="show in pausedShows" 
        :key="show.id"
        class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start gap-3">
          <img 
            :src="show.poster" 
            :alt="show.title"
            class="w-12 h-16 object-cover rounded flex-shrink-0"
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-medium text-gray-900">{{ show.title }}</h3>
                <p class="text-sm text-gray-500">
                  Season {{ show.currentSeason }} • Episode {{ show.currentEpisode }}
                </p>
              </div>
              <div class="text-xs text-gray-500">
                {{ getDaysAgo(show.pausedDate) }} ago
              </div>
            </div>
            
            <div class="bg-gray-100 rounded-full h-2 mb-2">
              <div 
                class="bg-orange-500 h-2 rounded-full" 
                :style="{ width: `${show.progress}%` }"
              ></div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-600 mb-3">
              <span>{{ show.watchedEpisodes }}/{{ show.totalEpisodes }} episodes</span>
              <span>{{ show.progress }}% complete</span>
            </div>
            
            <div v-if="show.reason" class="text-sm text-gray-600 mb-3 italic">
              "{{ show.reason }}"
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="continueWatching(show)"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                <Icon name="mdi:play" class="w-4 h-4" />
                Continue
              </button>
              <button 
                @click="editReason(show)"
                class="flex items-center gap-1 border border-gray-200 hover:bg-gray-50 px-3 py-1 rounded text-sm transition-colors"
              >
                <Icon name="mdi:pencil" class="w-4 h-4" />
                Edit
              </button>
              <button 
                @click="dropShow(show)"
                class="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1 rounded text-sm transition-colors"
              >
                <Icon name="mdi:close" class="w-4 h-4" />
                Drop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="pausedShows.length === 0" class="text-center py-8 text-gray-500">
      <Icon name="mdi:television-play" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
      <p>No paused shows</p>
      <p class="text-sm">All caught up! 🎉</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PausedShow {
  id: number
  title: string
  poster: string
  currentSeason: number
  currentEpisode: number
  totalEpisodes: number
  watchedEpisodes: number
  progress: number
  pausedDate: Date
  reason?: string
}

const emit = defineEmits(['continue-watching', 'edit-reason', 'drop-show'])

// Mock paused shows data
const pausedShows = ref<PausedShow[]>([
  {
    id: 1,
    title: "House of the Dragon",
    poster: "https://images.unsplash.com/photo-1478720568477-b emanation-5cf6?w=200&h=300&fit=crop",
    currentSeason: 2,
    currentEpisode: 4,
    totalEpisodes: 20,
    watchedEpisodes: 12,
    progress: 60,
    pausedDate: new Date('2024-01-10'),
    reason: "Got too intense, needed a break"
  },
  {
    id: 2,
    title: "The Crown",
    poster: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=200&h=300&fit=crop",
    currentSeason: 5,
    currentEpisode: 2,
    totalEpisodes: 60,
    watchedEpisodes: 42,
    progress: 70,
    pausedDate: new Date('2024-01-05'),
    reason: "Season got depressing"
  },
  {
    id: 3,
    title: "Succession",
    poster: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=200&h=300&fit=crop",
    currentSeason: 3,
    currentEpisode: 8,
    totalEpisodes: 39,
    watchedEpisodes: 27,
    progress: 69,
    pausedDate: new Date('2023-12-28'),
    reason: "Lost interest in the characters"
  }
])

const getDaysAgo = (date: Date) => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day'
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
  return `${Math.floor(diffDays / 30)} months`
}

const continueWatching = (show: PausedShow) => {
  emit('continue-watching', show)
}

const editReason = (show: PausedShow) => {
  emit('edit-reason', show)
}

const dropShow = (show: PausedShow) => {
  emit('drop-show', show)
}
</script>
