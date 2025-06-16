export interface User {
  id: number
  username: string
  email: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  jwt: string
  user: User
}

export interface LoginCredentials {
  identifier: string // email or username
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const token = useState<string | null>('auth.token', () => null)

  // Initialize auth state from cookies
  const initAuth = async () => {
    try {
      const { $strapi } = useNuxtApp()
      if (!$strapi) {
        console.warn('Strapi plugin not available yet')
        return
      }
      
      const strapiAuth = $strapi as any
      const storedToken = strapiAuth.getToken()
      if (storedToken) {
        token.value = storedToken
        try {
          const userData = await strapiAuth.fetchUser()
          user.value = userData
        } catch (error) {
          // Token might be expired, clear it
          console.warn('Token validation failed:', error)
          await logout()
        }
      }
    } catch (error) {
      console.warn('Failed to initialize auth:', error)
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const { $strapi } = useNuxtApp()
      if (!$strapi) {
        throw new Error('Strapi not available')
      }
      
      const strapiAuth = $strapi as any
      const response = await strapiAuth.login(credentials)
      if (response.jwt && response.user) {
        token.value = response.jwt
        user.value = response.user
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const { $strapi } = useNuxtApp()
      if (!$strapi) {
        throw new Error('Strapi not available')
      }
      
      const strapiAuth = $strapi as any
      const response = await strapiAuth.register(credentials)
      if (response.jwt && response.user) {
        token.value = response.jwt
        user.value = response.user
        return true
      }
      return false
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const { $strapi } = useNuxtApp()
      if ($strapi) {
        const strapiAuth = $strapi as any
        await strapiAuth.logout()
      }
    } catch (error) {
      console.warn('Strapi logout failed:', error)
    }
    
    // Always clear local state
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  // Get current user
  const getCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const { $strapi } = useNuxtApp()
      if (!$strapi) {
        console.warn('Strapi not available')
        return null
      }
      
      const strapiAuth = $strapi as any
      const userData = await strapiAuth.fetchUser()
      user.value = userData
      return userData
    } catch (error) {
      console.error('Error fetching user:', error)
      await logout()
      return null
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    initAuth
  }
}