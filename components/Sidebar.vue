<template>
  <aside class="w-64 bg-white rounded-2xl p-6 h-fit sticky top-6">
    <!-- Logo -->
    <div class="flex items-center gap-2 mb-8">
      <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
        <Icon name="mdi:notebook" class="w-5 h-5 text-white" />
      </div>
      <span class="text-xl font-bold text-gray-900">CineJournal</span>
    </div>

    <!-- Navigation -->
    <nav class="space-y-2">
      <NuxtLink 
        v-for="item in navigationItems" 
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'"
      >
        <Icon :name="item.icon" class="w-5 h-5" />
        <span class="font-medium">{{ item.name }}</span>
        <span 
          v-if="item.badge" 
          class="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <!-- User Profile -->
    <div class="mt-8 pt-6 border-t border-gray-100">
      <div class="flex items-center gap-3 mb-4">
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
          alt="User Avatar"
          class="w-10 h-10 rounded-full"
        />
        <div>
          <div class="font-medium text-gray-900">{{ user?.username || 'Movie Enthusiast' }}</div>
          <div class="text-sm text-gray-500">{{ user?.email || 'Personal Journal' }}</div>
        </div>
      </div>
      
      <button 
        @click="logout"
        class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors w-full"
      >
        <Icon name="mdi:logout" class="w-4 h-4" />
        <span class="text-sm">Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const { logout: authLogout, user } = useAuth()

interface NavigationItem {
  name: string
  path: string
  icon: string
  badge?: number
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', path: '/', icon: 'mdi:view-dashboard' },
  { name: 'My Journal', path: '/journal', icon: 'mdi:book-open' },
  { name: 'Watchlist', path: '/watchlist', icon: 'mdi:playlist-plus' },
  { name: 'Watched', path: '/watched', icon: 'mdi:check-circle', badge: 42 },
  { name: 'Recently Watched', path: '/recent', icon: 'mdi:clock-outline' },
  { name: 'Rewatched', path: '/rewatched', icon: 'mdi:repeat' },
  { name: 'Top Picks', path: '/top-picks', icon: 'mdi:trophy' },
  { name: 'Monthly Favorites', path: '/monthly', icon: 'mdi:calendar-star' },
  { name: 'Paused Shows', path: '/paused', icon: 'mdi:pause-circle', badge: 3 },
  { name: 'Upcoming Releases', path: '/upcoming', icon: 'mdi:calendar-clock' },
  { name: 'New Seasons', path: '/seasons', icon: 'mdi:television-play', badge: 5 },
  { name: 'Stats', path: '/stats', icon: 'mdi:chart-line' },
  { name: 'Settings', path: '/settings', icon: 'mdi:cog' }
]

const isActive = (path: string) => {
  return route.path === path
}

const logout = async () => {
  console.log('Logging out...')
  await authLogout()
}
</script>
