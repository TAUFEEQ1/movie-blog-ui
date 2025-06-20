<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Your Stats</h2>
      <select v-model="selectedPeriod" class="text-sm border border-gray-200 rounded-lg px-3 py-1">
        <option value="thisMonth">This Month</option>
        <option value="last30Days">Last 30 Days</option>
        <option value="thisYear">This Year</option>
        <option value="allTime">All Time</option>
      </select>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Movies Watched -->
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ stats.moviesWatched }}</div>
        <div class="text-sm text-blue-600 font-medium">Movies</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.movieHours }}h watched</div>
      </div>
      
      <!-- TV Episodes -->
      <div class="text-center p-4 bg-purple-50 rounded-lg">
        <div class="text-2xl font-bold text-purple-600">{{ stats.episodesWatched }}</div>
        <div class="text-sm text-purple-600 font-medium">Episodes</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.showsWatched }} shows</div>
      </div>
      
      <!-- Journal Entries -->
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ stats.journalEntries }}</div>
        <div class="text-sm text-green-600 font-medium">Journal Entries</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.avgWordsPerEntry }} avg words</div>
      </div>
      
      <!-- Rewatched -->
      <div class="text-center p-4 bg-orange-50 rounded-lg">
        <div class="text-2xl font-bold text-orange-600">{{ stats.rewatched }}</div>
        <div class="text-sm text-orange-600 font-medium">Rewatched</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.rewatchRatio }}% ratio</div>
      </div>
    </div>
    
    <!-- Favorite Genres -->
    <div class="mt-6">
      <h3 class="text-sm font-medium text-gray-900 mb-3">Top Genres</h3>
      <div class="space-y-2">
        <div 
          v-for="genre in stats.topGenres" 
          :key="genre.name"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-gray-700">{{ genre.name }}</span>
          <div class="flex items-center gap-2">
            <div class="w-16 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full" 
                :style="{ width: `${genre.percentage}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 w-8">{{ genre.count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Achievement -->
    <div v-if="stats.recentAchievement" class="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-center gap-2">
        <Icon name="mdi:trophy" class="w-5 h-5 text-yellow-600" />
        <div>
          <div class="text-sm font-medium text-yellow-800">{{ stats.recentAchievement.title }}</div>
          <div class="text-xs text-yellow-700">{{ stats.recentAchievement.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GenreStats {
  name: string
  count: number
  percentage: number
}

interface Achievement {
  title: string
  description: string
}

interface Stats {
  moviesWatched: number
  movieHours: number
  episodesWatched: number
  showsWatched: number
  journalEntries: number
  avgWordsPerEntry: number
  rewatched: number
  rewatchRatio: number
  topGenres: GenreStats[]
  recentAchievement?: Achievement
}

const selectedPeriod = ref('thisMonth')

// Mock data - this would come from your backend
const statsData = {
  thisMonth: {
    moviesWatched: 12,
    movieHours: 28,
    episodesWatched: 45,
    showsWatched: 6,
    journalEntries: 8,
    avgWordsPerEntry: 150,
    rewatched: 3,
    rewatchRatio: 25,
    topGenres: [
      { name: 'Drama', count: 8, percentage: 40 },
      { name: 'Sci-Fi', count: 6, percentage: 30 },
      { name: 'Comedy', count: 4, percentage: 20 },
      { name: 'Thriller', count: 2, percentage: 10 }
    ],
    recentAchievement: {
      title: 'Movie Marathon!',
      description: 'Watched 10+ movies this month'
    }
  },
  last30Days: {
    moviesWatched: 15,
    movieHours: 35,
    episodesWatched: 52,
    showsWatched: 7,
    journalEntries: 11,
    avgWordsPerEntry: 145,
    rewatched: 4,
    rewatchRatio: 27,
    topGenres: [
      { name: 'Drama', count: 9, percentage: 38 },
      { name: 'Sci-Fi', count: 7, percentage: 29 },
      { name: 'Comedy', count: 5, percentage: 21 },
      { name: 'Action', count: 3, percentage: 12 }
    ],
    recentAchievement: {
      title: 'Journal Master',
      description: 'Wrote journal entries for 10+ movies'
    }
  },
  thisYear: {
    moviesWatched: 142,
    movieHours: 298,
    episodesWatched: 487,
    showsWatched: 28,
    journalEntries: 89,
    avgWordsPerEntry: 165,
    rewatched: 23,
    rewatchRatio: 16,
    topGenres: [
      { name: 'Drama', count: 52, percentage: 35 },
      { name: 'Comedy', count: 38, percentage: 25 },
      { name: 'Sci-Fi', count: 31, percentage: 20 },
      { name: 'Action', count: 21, percentage: 20 }
    ],
    recentAchievement: {
      title: 'Century Club',
      description: 'Watched 100+ movies this year!'
    }
  },
  allTime: {
    moviesWatched: 856,
    movieHours: 1847,
    episodesWatched: 2341,
    showsWatched: 156,
    journalEntries: 445,
    avgWordsPerEntry: 172,
    rewatched: 127,
    rewatchRatio: 15,
    topGenres: [
      { name: 'Drama', count: 287, percentage: 32 },
      { name: 'Comedy', count: 195, percentage: 22 },
      { name: 'Sci-Fi', count: 143, percentage: 16 },
      { name: 'Action', count: 121, percentage: 14 },
      { name: 'Thriller', count: 89, percentage: 10 }
    ],
    recentAchievement: {
      title: 'Legendary Viewer',
      description: 'Reached 800+ movies watched!'
    }
  }
}

const stats = computed(() => statsData[selectedPeriod.value as keyof typeof statsData])
</script>
