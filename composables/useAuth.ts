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
  const isInitializing = useState<boolean>('auth.initializing', () => false)
  const config = useRuntimeConfig()

  // Direct API calls to Strapi
  const apiCall = async (endpoint: string, options: any = {}) => {
    const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
    
    return await $fetch(`${strapiUrl}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token.value && { Authorization: `Bearer ${token.value}` }),
        ...options.headers
      },
      ...options
    })
  }

  // Check if Strapi is available
  const checkStrapiConnection = async (): Promise<boolean> => {
    try {
      const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
      await $fetch(strapiUrl)
      return true
    } catch (error) {
      return false
    }
  }

  // Initialize auth state from localStorage
  const initAuth = async () => {
    if (!import.meta.client) return
    
    // Prevent multiple initialization calls
    if (isInitializing.value) return
    isInitializing.value = true
    
    try {
      const storedToken = localStorage.getItem('strapi-jwt')
      if (storedToken) {
        token.value = storedToken
        
        // Verify token is still valid by fetching user
        try {
          const userData = await apiCall('/users/me') as User
          user.value = userData
          console.log('Auth initialized successfully', { user: userData.username })
        } catch (error) {
          console.warn('Stored token is invalid, clearing auth state')
          // Token is invalid, clear it
          await logout()
        }
      }
    } catch (error) {
      console.warn('Failed to initialize auth:', error)
    } finally {
      isInitializing.value = false
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/local', {
        method: 'POST',
        body: credentials
      }) as AuthResponse

      if (response.jwt && response.user) {
        token.value = response.jwt
        user.value = response.user
        
        // Store token in localStorage
        if (import.meta.client) {
          localStorage.setItem('strapi-jwt', response.jwt)
        }
        
        return true
      }
      return false
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle Strapi's 400 error for invalid credentials
      if (error.status === 400 || error.statusCode === 400) {
        throw new Error('Invalid email/username or password. Please check your credentials.')
      }
      
      // Handle other errors
      if (error.status === 500 || error.statusCode === 500) {
        throw new Error('Server error. Please try again later.')
      }
      
      throw new Error(error.message || 'Login failed. Please check your connection to the server.')
    }
  }

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const response = await apiCall('/auth/local/register', {
        method: 'POST',
        body: credentials
      }) as AuthResponse

      if (response.jwt && response.user) {
        token.value = response.jwt
        user.value = response.user
        
        // Store token in localStorage
        if (import.meta.client) {
          localStorage.setItem('strapi-jwt', response.jwt)
        }
        
        return true
      }
      return false
    } catch (error: any) {
      console.error('Registration error:', error)
      
      // Handle Strapi's 400 error for validation issues
      if (error.status === 400 || error.statusCode === 400) {
        if (error.message && error.message.includes('email')) {
          throw new Error('Email is already taken or invalid. Please use a different email.')
        }
        if (error.message && error.message.includes('username')) {
          throw new Error('Username is already taken. Please choose a different username.')
        }
        throw new Error('Registration failed. Please check your information.')
      }
      
      throw new Error(error.message || 'Registration failed. Please try again.')
    }
  }

  // Logout function
  const logout = async () => {
    try {
      console.log('Starting logout process...')
      
      // Clear local state first
      token.value = null
      user.value = null
      
      // Clear localStorage only on client side
      if (import.meta.client) {
        try {
          localStorage.removeItem('strapi-jwt')
          console.log('Token removed from localStorage')
        } catch (localStorageError) {
          console.warn('Failed to remove token from localStorage:', localStorageError)
        }
      }
      
      console.log('User logged out successfully')
      
      // Navigate to login page
      await navigateTo('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, ensure state is cleared
      token.value = null
      user.value = null
      if (import.meta.client) {
        try {
          localStorage.removeItem('strapi-jwt')
        } catch (localStorageError) {
          console.warn('Failed to clear localStorage during error recovery:', localStorageError)
        }
      }
      // Still navigate to login even if there was an error
      try {
        await navigateTo('/login')
      } catch (navError) {
        console.error('Failed to navigate to login:', navError)
        // If navigation fails, try using window.location as fallback
        if (import.meta.client) {
          window.location.href = '/login'
        }
      }
    }
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  // Test authentication by calling a protected endpoint
  const testAuth = async () => {
    if (!token.value) return false
    
    try {
      await apiCall('/users/me')
      return true
    } catch (error) {
      console.error('Auth test failed:', error)
      return false
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const userData = await apiCall('/users/me') as User
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
    initAuth,
    checkStrapiConnection,
    testAuth
  }
}