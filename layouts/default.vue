<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900">Movie Blog</h1>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <span class="text-gray-700">Welcome, {{ user?.username }}</span>
              <button
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Register
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 px-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
