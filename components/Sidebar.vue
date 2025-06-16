<template>
  <aside class="w-64 bg-white rounded-2xl p-6 h-fit sticky top-6">
    <!-- Logo -->
    <div class="flex items-center gap-2 mb-8">
      <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Icon name="mdi:film" class="w-5 h-5 text-white" />
      </div>
      <span class="text-xl font-bold text-gray-900">FilScreen</span>
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
          <div class="font-medium text-gray-900">John Doe</div>
          <div class="text-sm text-gray-500">Premium Member</div>
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

interface NavigationItem {
  name: string
  path: string
  icon: string
  badge?: number
}

const navigationItems: NavigationItem[] = [
  { name: 'Home', path: '/', icon: 'mdi:home' },
  { name: 'Categories', path: '/categories', icon: 'mdi:grid' },
  { name: 'Favorites', path: '/favorites', icon: 'mdi:heart' },
  { name: 'Downloads', path: '/downloads', icon: 'mdi:download', badge: 1 },
  { name: 'Friends', path: '/friends', icon: 'mdi:account-group' },
  { name: 'Community', path: '/community', icon: 'mdi:forum', badge: 2 },
  { name: 'History', path: '/history', icon: 'mdi:history' },
  { name: 'Settings', path: '/settings', icon: 'mdi:cog' }
]

const isActive = (path: string) => {
  return route.path === path
}

const logout = () => {
  // Logout logic
  console.log('Logging out...')
  navigateTo('/login')
}
</script>
