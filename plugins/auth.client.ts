export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth()
  
  // Initialize authentication state from stored tokens
  if (import.meta.client) {
    await initAuth()
  }
})
