export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth()
  
  // Initialize authentication on app startup
  await initAuth()
})