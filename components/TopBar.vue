<template>
  <header class="flex items-center justify-between mb-8">
    <!-- Page Title -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Welcome back! Here's what's happening with your movies and shows.</p>
    </div>

    <!-- Search and Notifications -->
    <div class="flex items-center gap-4">
      <!-- Search Bar -->
      <div class="relative">
        <Icon name="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search movies, shows..." 
          class="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          @keyup.enter="performSearch"
        />
      </div>

      <!-- Notifications -->
      <button class="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
        <Icon name="mdi:bell-outline" class="w-6 h-6 text-gray-600" />
        <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          3
        </span>
      </button>

      <!-- User Profile -->
      <div class="flex items-center gap-3">
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
          alt="User Avatar"
          class="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
          @click="showUserMenu = !showUserMenu"
        />
        
        <!-- User Dropdown Menu -->
        <div 
          v-if="showUserMenu"
          class="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
        >
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Profile</a>
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-50">Settings</a>
          <hr class="my-2 border-gray-100">
          <a href="#" class="block px-4 py-2 text-red-600 hover:bg-red-50">Sign Out</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// State
const searchQuery = ref('')
const showUserMenu = ref(false)

const emit = defineEmits(['search'])

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}

// Close user menu when clicking outside
const closeUserMenu = () => {
  showUserMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>
