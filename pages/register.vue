<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400 to-yellow-500 rounded-full opacity-20 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-10 animate-ping" style="animation-delay: 4s;"></div>
    </div>

    <div class="relative z-10 min-h-screen flex">
      <!-- Left Side - Welcome Content -->
      <div class="hidden lg:flex lg:w-2/3 flex-col justify-center p-12">
        <!-- Header -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
            <h1 class="text-4xl font-bold text-white">TrendingNow</h1>
          </div>
          <p class="text-xl text-gray-300 max-w-lg">
            Join our community and start discovering the highest-rated movies and TV shows trending right now. Create your account to unlock personalized recommendations and track your watchlist.
          </p>
        </div>

        <!-- Feature Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-400/60 transition-all duration-300">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Icon name="mdi:trending-up" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-xl font-bold text-white">Trending Content</h3>
            </div>
            <p class="text-gray-300">
              Discover what's hot right now with our curated trending lists updated daily.
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-400/60 transition-all duration-300">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Icon name="mdi:heart" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-xl font-bold text-white">Personal Watchlist</h3>
            </div>
            <p class="text-gray-300">
              Save movies and shows to your personalized watchlist and track what you've watched.
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-yellow-400/60 transition-all duration-300">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Icon name="mdi:star" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-xl font-bold text-white">Rate & Review</h3>
            </div>
            <p class="text-gray-300">
              Share your opinions and discover what others think about your favorite content.
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-pink-400/60 transition-all duration-300">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Icon name="mdi:account-group" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-xl font-bold text-white">Join Community</h3>
            </div>
            <p class="text-gray-300">
              Connect with fellow movie and TV enthusiasts and share your recommendations.
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-12 grid grid-cols-3 gap-8 max-w-md">
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">1000+</div>
            <div class="text-gray-400 text-sm">Active Users</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">50K+</div>
            <div class="text-gray-400 text-sm">Movies & Shows</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-white mb-1">24/7</div>
            <div class="text-gray-400 text-sm">Fresh Updates</div>
          </div>
        </div>
      </div>

      <!-- Right Side - Register Form -->
      <div class="w-full lg:w-1/3 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <!-- Mobile Header (shown only on mobile) -->
          <div class="lg:hidden text-center mb-8">
            <div class="flex items-center justify-center gap-3 mb-4">
              <Icon name="mdi:fire" class="w-8 h-8 text-orange-400" />
              <h1 class="text-3xl font-bold text-white">TrendingNow</h1>
            </div>
            <p class="text-gray-300">
              Join the community of movie & TV enthusiasts
            </p>
          </div>

          <!-- Register Card -->
          <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p class="text-gray-300 text-sm">
                Join thousands discovering trending content
              </p>
            </div>

            <!-- Strapi Status Warning -->
            <div class="mb-6">
              <StrapiStatus />
            </div>

            <!-- Register Form -->
            <form @submit.prevent="handleRegister" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    v-model="form.username"
                    name="username"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    v-model="form.email"
                    name="email"
                    type="email"
                    required
                    class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email address"
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
                    placeholder="Create a secure password"
                  />
                  <p class="mt-1 text-xs text-gray-400">Must be at least 6 characters long</p>
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
                  Creating account...
                </span>
                <span v-else>Create Account</span>
              </button>
            </form>

            <!-- Login Link -->
            <div class="mt-6 text-center">
              <p class="text-gray-300 text-sm">
                Already have an account?
                <NuxtLink 
                  to="/login" 
                  class="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in here
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (!form.username || !form.email || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const success = await register({
      username: form.username,
      email: form.email,
      password: form.password
    })

    if (success) {
      await router.push('/')
    } else {
      error.value = 'Registration failed'
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
