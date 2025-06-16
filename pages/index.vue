<template>
  <div>
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Movie Blog!
        </h1>
        <p class="text-gray-600 mb-6">
          This is your authenticated movie blog dashboard. Here you can manage your movie reviews and discover new films.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Movie cards will go here -->
          <div class="bg-gray-100 rounded-lg p-6 text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Latest Reviews</h3>
            <p class="text-gray-600">Your movie reviews will appear here</p>
          </div>
          
          <div class="bg-gray-100 rounded-lg p-6 text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Watchlist</h3>
            <p class="text-gray-600">Movies you want to watch</p>
          </div>
          
          <div class="bg-gray-100 rounded-lg p-6 text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Favorites</h3>
            <p class="text-gray-600">Your favorite movies</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
</script>
