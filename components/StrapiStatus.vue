<template>
  <div v-if="showStrapiInfo" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-red-800">
          Strapi Backend Not Available
        </h3>
        <div class="mt-2 text-sm text-red-700">
          <p>
            Cannot connect to Strapi server. Please ensure your Strapi server is running at:
            <br>
            <code class="bg-red-200 px-1 rounded">{{ strapiUrl }}</code>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { checkStrapiConnection } = useAuth()
const config = useRuntimeConfig()

const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
const isConnected = ref(false)
const showStrapiInfo = ref(false)

onMounted(async () => {
  if (import.meta.client) {
    isConnected.value = await checkStrapiConnection()
    showStrapiInfo.value = !isConnected.value
  }
})
</script>
