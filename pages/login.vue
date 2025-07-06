<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400 to-yellow-500 rounded-full opacity-20 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-10 animate-ping" style="animation-delay: 4s;"></div>
    </div>

    <div class="relative z-10 min-h-screen flex">
      <!-- Left Side - Trending Showcase -->
      <div class="hidden lg:flex lg:w-2/3 flex-col justify-center p-12">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
            <h1 class="text-4xl font-bold text-white">TrendingNow</h1>
          </div>
          <p class="text-xl text-gray-300 max-w-lg">
            Discover the highest-rated movies and TV shows trending right now. Join thousands of users exploring the best content available.
          </p>
        </div>

        <!-- Top Rated Content Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl">
          <div 
            v-for="(item, index) in displayTrendingItems" 
            :key="`trending-${item.tmdb_id || index}`"
            class="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 cursor-pointer animate-slide-up"
            :style="{ animationDelay: `${index * 150}ms` }"
            @click="playTrailer(item)"
          >
            <!-- Movie Poster -->
            <div class="aspect-[2/3] overflow-hidden">
              <img 
                :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                @error="handleImageError"
              />
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Play Button -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Icon name="mdi:play" class="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>

            <!-- Content Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="font-bold text-lg mb-1 line-clamp-2">{{ item.title }}</h3>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300 capitalize">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
                <div class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                  <Icon name="mdi:star" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm font-bold text-white">{{ item.tmdb_rating?.toFixed(1) || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Top Rated Rank Badge -->
            <div class="absolute top-3 left-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
              <span class="text-white text-sm font-bold">★{{ index + 1 }}</span>
            </div>

            <!-- Type Badge -->
            <div class="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
              <span class="text-white text-xs font-medium uppercase">{{ item.type === 'movie' ? 'Movie' : 'TV' }}</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-12 grid grid-cols-3 gap-8 max-w-md">
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">{{ trendingStats.totalItems }}+</div>
            <div class="text-gray-400 text-sm">Top Rated Items</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">{{ trendingStats.avgRating }}</div>
            <div class="text-gray-400 text-sm">Avg Rating</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">24h</div>
            <div class="text-gray-400 text-sm">Fresh Updates</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="w-full lg:w-1/3 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <!-- Mobile Header (shown only on mobile) -->
          <div class="lg:hidden text-center mb-8">
            <div class="flex items-center justify-center gap-3 mb-4">
              <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
              <h1 class="text-3xl font-bold text-white">TrendingNow</h1>
            </div>
            <p class="text-gray-300">
              Discover top-rated trending content
            </p>
          </div>

          <!-- Login Card -->
          <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p class="text-gray-300 text-sm">
                Sign in to access trending movies and TV shows
              </p>
            </div>

            <!-- Strapi Status Warning -->
            <div class="mb-6">
              <StrapiStatus />
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label for="identifier" class="block text-sm font-medium text-gray-300 mb-2">
                    Email or Username
                  </label>
                  <input
                    id="identifier"
                    v-model="form.identifier"
                    name="identifier"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email or username"
                  />
                </div>
                
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    v-model="form.password"
                    name="password"
                    type="password"
                    required
                    class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p class="text-red-200 text-sm">{{ error }}</p>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <Icon name="mdi:loading" class="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
                <span v-else>Sign In</span>
              </button>
            </form>

            <!-- Register Link -->
            <div class="mt-6 text-center">
              <p class="text-gray-300 text-sm">
                Don't have an account?
                <NuxtLink 
                  to="/register" 
                  class="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Sign up here
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal for Trailers -->
    <VideoModal 
      :is-open="isVideoModalOpen"
      :video-url="currentVideoUrl"
      @close="closeVideoModal"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

// Import composables
const { login, isAuthenticated } = useAuth()
const { getAllTrending } = useTrending()
const router = useRouter()

// Check if user is already logged in and redirect
onMounted(async () => {
  if (isAuthenticated.value) {
    console.log('User already authenticated, redirecting to home')
    await router.push('/')
    return
  }
  
  fetchTrendingShowcase()
})

// Form state
const form = reactive({
  identifier: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

// Trending content state
const trendingItems = ref<any[]>([])
const displayTrendingItems = ref<any[]>([])
const trendingStats = ref({
  totalItems: 0,
  avgRating: '0.0'
})

// Video modal state
const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')

// Animation state
let animationInterval: NodeJS.Timeout | null = null

// Fetch trending content for showcase
const fetchTrendingShowcase = async () => {
  try {
    const response = await getAllTrending()
    trendingItems.value = response.data || []
    
    // Get top 5 trending items sorted by rating
    const topRated = [...trendingItems.value]
      .filter(item => item.tmdb_rating && item.poster_path)
      .sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      .slice(0, 5)
    
    displayTrendingItems.value = topRated
    
    // Calculate stats
    trendingStats.value = {
      totalItems: trendingItems.value.length,
      avgRating: trendingItems.value.length > 0 
        ? (trendingItems.value.reduce((sum, item) => sum + (item.tmdb_rating || 0), 0) / trendingItems.value.length).toFixed(1)
        : '0.0'
    }
    
    // Start rotation animation
    startTrendingRotation()
  } catch (error) {
    console.error('Error fetching trending showcase:', error)
    // Use fallback data if API fails
    setFallbackData()
  }
}

// Set fallback data if API is not available
const setFallbackData = () => {
  displayTrendingItems.value = [
    {
      tmdb_id: 1,
      title: "Popular Movie",
      type: "movie",
      poster_path: "/placeholder1.jpg",
      tmdb_rating: 8.5,
      trailer_url: ""
    },
    {
      tmdb_id: 2,
      title: "Trending Show",
      type: "tv",
      poster_path: "/placeholder2.jpg",
      tmdb_rating: 9.0,
      trailer_url: ""
    }
  ]
  
  trendingStats.value = {
    totalItems: 50,
    avgRating: '8.2'
  }
}

// Start trending content rotation animation
const startTrendingRotation = () => {
  if (animationInterval) clearInterval(animationInterval)
  
  animationInterval = setInterval(() => {
    if (trendingItems.value.length > 5) {
      // Rotate to show different top-rated trending items
      const currentIds = new Set(displayTrendingItems.value.map(item => item.tmdb_id))
      const availableItems = trendingItems.value.filter(item => 
        !currentIds.has(item.tmdb_id) && item.poster_path && item.tmdb_rating
      )
      .sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0)) // Keep sorted by rating
      
      if (availableItems.length > 0) {
        // Replace the lowest rated item currently shown with a higher rated one
        const lowestRatedIndex = displayTrendingItems.value.reduce((minIndex, item, index, arr) => 
          (item.tmdb_rating || 0) < (arr[minIndex].tmdb_rating || 0) ? index : minIndex, 0)
        
        displayTrendingItems.value[lowestRatedIndex] = availableItems[0]
        
        // Re-sort the display items by rating to maintain top-rated order
        displayTrendingItems.value.sort((a, b) => (b.tmdb_rating || 0) - (a.tmdb_rating || 0))
      }
    }
  }, 10000) // Rotate every 10 seconds
}

// Handle login
const handleLogin = async () => {
  if (!form.identifier || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const success = await login({
      identifier: form.identifier,
      password: form.password
    })

    if (success) {
      await router.push('/')
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

// Video modal methods
const playTrailer = (item: any) => {
  if (item.trailer_url) {
    currentVideoUrl.value = item.trailer_url
    isVideoModalOpen.value = true
  }
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
}

// Handle image loading errors
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // Use a default placeholder or hide the image
  target.style.display = 'none'
}

// Cleanup on unmount
onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
})
</script>

<style scoped>
/* Animated entrance for trending items */
.grid > div {
  animation: slideInUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Floating animation for background elements */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* Pulse animation for trending badges */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(251, 146, 60, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(251, 146, 60, 0.8);
  }
}

/* Gradient animation for buttons */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Apply animations */
.absolute.w-80.h-80,
.absolute.w-96.h-96,
.absolute.w-64.h-64 {
  animation: float 6s ease-in-out infinite;
}

.absolute.w-96.h-96 {
  animation-delay: 2s;
}

.absolute.w-64.h-64 {
  animation-delay: 4s;
}

/* Trending rank badge glow */
.bg-gradient-to-br.from-orange-400.to-red-500 {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Gradient button animation */
.bg-gradient-to-r.from-blue-600.to-purple-600 {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* Stagger animation delays for grid items */
.grid > div:nth-child(1) { 
  animation-delay: 0ms; 
  /* Add special glow for #1 rated */
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}
.grid > div:nth-child(2) { 
  animation-delay: 150ms;
  /* Add special glow for #2 rated */
  box-shadow: 0 0 25px rgba(255, 165, 0, 0.25);
}
.grid > div:nth-child(3) { 
  animation-delay: 300ms;
  /* Add special glow for #3 rated */
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.2);
}
.grid > div:nth-child(4) { animation-delay: 450ms; }
.grid > div:nth-child(5) { animation-delay: 600ms; }

/* Hover effects for top-rated items */
.grid > div:nth-child(1):hover { 
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.5);
  border-color: rgba(255, 215, 0, 0.8) !important;
}
.grid > div:nth-child(2):hover { 
  box-shadow: 0 0 35px rgba(255, 165, 0, 0.4);
  border-color: rgba(255, 165, 0, 0.7) !important;
}
.grid > div:nth-child(3):hover { 
  box-shadow: 0 0 30px rgba(255, 140, 0, 0.35);
  border-color: rgba(255, 140, 0, 0.6) !important;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive improvements */
@media (max-width: 1024px) {
  .grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5 {
    grid-template-columns: repeat(2, 1fr);
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5 {
    grid-template-columns: repeat(1, 1fr);
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>
