export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side
  if (!import.meta.client) return
  
  const { isAuthenticated, initAuth } = useAuth()
  
  // Ensure auth is initialized before checking authentication
  await initAuth()
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})