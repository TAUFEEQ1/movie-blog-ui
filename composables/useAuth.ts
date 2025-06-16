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
    
    try {
      const storedToken = localStorage.getItem('strapi-jwt')
      if (storedToken) {
        token.value = storedToken
        
        // Verify token is still valid by fetching user
        try {
          const userData = await apiCall('/users/me') as User
          user.value = userData
        } catch (error) {
          // Token is invalid, clear it
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
    // Clear local state and localStorage
    token.value = null
    user.value = null
    
    if (import.meta.client) {
      localStorage.removeItem('strapi-jwt')
    }
    
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
    checkStrapiConnection
  }
}