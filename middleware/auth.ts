export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side
  if (!import.meta.client) return
  
  const { isAuthenticated, initAuth } = useAuth()
  
  // Ensure auth is initialized before checking authentication
  await initAuth()
  
  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/welcome']

  // If the route is public, allow access
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // If user is not authenticated, redirect to welcome page with a full reload
  if (!isAuthenticated.value) {
    if (process.client) {
      window.location.href = '/welcome'
      return
    }
    return navigateTo('/welcome', { redirectCode: 301 })
  }
})