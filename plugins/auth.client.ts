export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    // Wait for the next tick to ensure all plugins are loaded
    await nextTick()
    
    // Add a small delay to ensure Strapi is ready
    setTimeout(async () => {
      try {
        const { initAuth } = useAuth()
        await initAuth()
      } catch (error) {
        console.warn('Auth initialization failed:', error)
      }
    }, 200)
  }
})
