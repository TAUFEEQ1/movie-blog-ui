<template>
  <div v-if="shouldShowStatus" class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
    <div class="flex items-center gap-3">
      <!-- Status Icon -->
      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="statusIconBg">
        <Icon :name="statusIcon" class="w-4 h-4 text-white" />
      </div>
      
      <!-- Status Info -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-white">{{ statusMessage }}</p>
        <p v-if="statusSubMessage" class="text-xs text-gray-300">{{ statusSubMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

// Strapi connection state
const isConnected = ref(false)
const isLoading = ref(true)
const connectionError = ref('')

// Check Strapi connection
const checkStrapiConnection = async () => {
  try {
    isLoading.value = true
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    // Try to fetch trending data to test connection
    const response = await $fetch(`${strapiUrl}/api/trendings?pagination[pageSize]=1`) as any
    
    if (response && response.data) {
      isConnected.value = true
      connectionError.value = ''
    } else {
      isConnected.value = false
      connectionError.value = 'Invalid response from server'
    }
  } catch (error: any) {
    isConnected.value = false
    connectionError.value = error.message || 'Unable to connect to backend'
  } finally {
    isLoading.value = false
  }
}

// Computed properties for status display
const shouldShowStatus = computed(() => {
  // Only show if there's an error or if loading
  return isLoading.value || !isConnected.value
})

const statusIcon = computed(() => {
  if (isLoading.value) return 'mdi:loading'
  if (isConnected.value) return 'mdi:check-circle'
  return 'mdi:alert-circle'
})

const statusIconBg = computed(() => {
  if (isLoading.value) return 'bg-blue-500/80'
  if (isConnected.value) return 'bg-green-500/80'
  return 'bg-red-500/80'
})

const statusMessage = computed(() => {
  if (isLoading.value) return 'Connecting to backend...'
  if (isConnected.value) return 'Backend connected'
  return 'Backend connection failed'
})

const statusSubMessage = computed(() => {
  if (isLoading.value) return ''
  if (isConnected.value) return ''
  return connectionError.value || 'Please check if the backend server is running'
})

// Check connection on mount
onMounted(() => {
  checkStrapiConnection()
})
</script>
