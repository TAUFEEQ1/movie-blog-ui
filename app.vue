<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Initialize authentication on app startup
const { initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
})
</script>
