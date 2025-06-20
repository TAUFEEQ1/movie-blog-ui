<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="showMobileMenu" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="showMobileMenu = false"
    ></div>

    <div class="flex gap-0 lg:gap-6 p-3 lg:p-6">
      <!-- Mobile Menu Toggle -->
      <button
        @click="showMobileMenu = !showMobileMenu"
        class="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md"
      >
        <Icon name="mdi:menu" class="w-6 h-6 text-gray-700" />
      </button>

      <!-- Sidebar -->
      <div :class="[
        'fixed lg:relative inset-y-0 left-0 z-40 lg:z-0 transform transition-transform duration-300 ease-in-out lg:transform-none',
        showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]">
        <Sidebar @close-mobile="showMobileMenu = false" />
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 w-full lg:ml-0">
        <!-- Top Navigation -->
        <TopBar 
          @search="handleSearch"
        />

        <!-- Hero Section -->
        <HeroSection 
          @play-trailer="openVideoModal"
          @add-to-journal="openJournalModal"
        />

        <!-- Content Sections -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main Movie Sections -->
          <div class="xl:col-span-2 space-y-8">
            <!-- Journal Entry Widget -->
            <JournalEntryWidget 
              ref="journalWidget"
            />

            <!-- Trending Now -->
            <MovieSection 
              title="Trending now"
              icon="mdi:fire"
              :movies="trendingMovies"
              :show-view-all="true"
              @play-trailer="openVideoModal"
              @toggle-favorite="handleToggleFavorite"
              @view-all="viewAllTrending"
            />

            <!-- Coming Soon -->
            <MovieSection 
              title="Coming soon"
              :movies="comingSoonMovies"
              :show-view-all="true"
              @play-trailer="openVideoModal"
              @toggle-favorite="handleToggleFavorite"
              @view-all="viewAllComingSoon"
            />

            <!-- Recently Watched Blog Posts -->
            <MovieSection 
              title="Recently Watched (Blog)"
              :movies="recentlyWatchedMovies"
              :show-view-all="true"
              @play-trailer="openVideoModal"
              @toggle-favorite="handleToggleFavorite"
              @view-all="viewAllRecentlyWatched"
            />

            <!-- Top 10 This Month -->
            <MovieSection 
              title="Top 10 This Month"
              :movies="topMoviesThisMonth"
              :show-view-all="true"
              @play-trailer="openVideoModal"
              @toggle-favorite="handleToggleFavorite"
              @view-all="viewAllTopMovies"
            />

            <!-- System Recommendations -->
            <MovieSection 
              title="Recommended for You"
              :movies="recommendedMovies"
              :show-view-all="true"
              @play-trailer="openVideoModal"
              @toggle-favorite="handleToggleFavorite"
              @view-all="viewAllRecommended"
            />
          </div>

          <!-- Sidebar Widgets -->
          <div class="space-y-6">
            <!-- Continue Watching -->
            <ContinueWatchingWidget 
              ref="continueWatchingWidget"
              @resume-watching="resumeWatching" 
            />
            
            <!-- Paused Shows -->
            <PausedShowsWidget 
              ref="pausedShowsWidget"
              @resume-show="resumeShow"
              @status-updated="handleShowStatusUpdate"
              @edit-show="editShow"
            />
            
            <!-- Recent Activity -->
            <StrapiStatus />
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <VideoModal 
      :is-open="isVideoModalOpen"
      :video-url="currentVideoUrl"
      :video-info="currentVideoInfo"
      @close="closeVideoModal"
    />
  </div>
</template>

<script setup lang="ts">
// Import composables explicitly
import { useTrending } from '~/composables/useTrending'

// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

// Import composables
const { user } = useAuth()
const { getTrendingMovies } = useTrending()
const { getComingSoonItems, getTmdbPosterUrl } = useComingSoon()

// Mobile Menu State
const showMobileMenu = ref(false)

// Video Modal State
interface VideoInfo {
  title: string
  description: string
  genre: string
  year: number
  duration: string
}

const isVideoModalOpen = ref(false)
const currentVideoUrl = ref('')
const currentVideoInfo = ref<VideoInfo | undefined>(undefined)

// Movie data interface
interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  genres: string[]
  year: number
  duration: string
  trailerUrl: string
}

// Sample movie data - replace with API calls later
const trendingMovies = ref<Movie[]>([])
const comingSoonMovies = ref<Movie[]>([])

// Convert Coming Soon API data to Movie interface format
const convertComingSoonToMovie = (comingSoonItem: any): Movie => {
  return {
    id: comingSoonItem.id,
    title: comingSoonItem.title,
    poster: getTmdbPosterUrl(comingSoonItem.poster_path),
    rating: comingSoonItem.tmdb_rating || 0,
    genres: comingSoonItem.genres || [],
    year: new Date(comingSoonItem.release_date).getFullYear(),
    duration: comingSoonItem.runtime ? `${Math.floor(comingSoonItem.runtime / 60)}h ${comingSoonItem.runtime % 60}m` : 'TBA',
    trailerUrl: comingSoonItem.trailer_url || ''
  }
}

// Load trending data on mount
onMounted(async () => {
  try {
    // Load trending movies
    const trending = await getTrendingMovies(6) // Get 6 trending movies
    trendingMovies.value = trending

    // Load coming soon movies
    const comingSoon = await getComingSoonItems({ limit: 6, sortBy: 'release_date' })
    comingSoonMovies.value = comingSoon.map(convertComingSoonToMovie)
  } catch (error) {
    console.error('Error loading movies:', error)
    // Fallback to hardcoded data if API fails
    trendingMovies.value = [
      {
        id: 1,
        title: "Openheimer",
        poster:"https://www.themoviedb.org/t/p/w1280/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        rating: 4.8,
        genres: ["Thriller", "Detective"],
        year: 2023,
        duration: "2h 57m",
        trailerUrl: "https://youtu.be/bK6ldnjE3Y0"
      },
      {
        id: 2,
        title: "The Witcher",
        poster:"https://www.themoviedb.org/t/p/w1280/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg",
        rating: 4.2,
        genres: ["Drama", "Adventure"],
        year: 2023,
        duration: "1h 45m",
        trailerUrl: "https://www.youtube.com/watch?v=ndl1W4ltcmg"
      },
      {
        id: 3,
        title: "The Marvels",
        poster:"https://www.themoviedb.org/t/p/w1280/DqK9Hag8E6bGl4W0aps2n7GJvbY.jpg",
        rating: 3.8,
        genres: ["Action", "Sci-Fi"],
        year: 2023,
        duration: "1h 45m",
        trailerUrl: "https://www.youtube.com/watch?v=wS_qbDztgVY"
      }
    ]

    // Fallback data for coming soon movies
    comingSoonMovies.value = [
      {
        id: 4,
        title: "Deadpool 3",
        poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
        rating: 4.6,
        genres: ["Action", "Comedy"],
        year: 2024,
        duration: "2h 10m",
        trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk"
      },
      {
        id: 5,
        title: "Avatar 3",
        poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
        rating: 4.2,
        genres: ["Sci-Fi", "Adventure"],
        year: 2024,
        duration: "2h 30m",
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0"
      },
      {
        id: 6,
        title: "Spider-Man 4",
        poster: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=600&fit=crop",
        rating: 4.5,
        genres: ["Action", "Adventure"],
        year: 2024,
        duration: "2h 15m",
        trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA"
      }
    ]
  }
})

const recentlyWatchedMovies = ref<Movie[]>([
  {
    id: 7,
    title: "Barbie",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    rating: 4.1,
    genres: ["Comedy", "Fantasy"],
    year: 2023,
    duration: "1h 54m",
    trailerUrl: "https://www.youtube.com/watch?v=pBk4NYhWNMM"
  },
  {
    id: 8,
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    rating: 4.8,
    genres: ["Sci-Fi", "Adventure"],
    year: 2024,
    duration: "2h 46m",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
  }
])

const topMoviesThisMonth = ref<Movie[]>([
  {
    id: 9,
    title: "Guardians of the Galaxy Vol. 3",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    rating: 4.7,
    genres: ["Action", "Comedy"],
    year: 2023,
    duration: "2h 30m",
    trailerUrl: "https://www.youtube.com/watch?v=u3V5KDHRQvk"
  },
  {
    id: 10,
    title: "Fast X",
    poster: "https://images.unsplash.com/photo-1489599904472-c34eb5d19877?w=400&h=600&fit=crop",
    rating: 4.0,
    genres: ["Action", "Thriller"],
    year: 2023,
    duration: "2h 21m",
    trailerUrl: "https://www.youtube.com/watch?v=aOb15GVFZYs"
  }
])

const recommendedMovies = ref<Movie[]>([
  {
    id: 11,
    title: "The Flash",
    poster: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=600&fit=crop",
    rating: 3.8,
    genres: ["Action", "Sci-Fi"],
    year: 2023,
    duration: "2h 24m",
    trailerUrl: "https://www.youtube.com/watch?v=hebWYacbdvc"
  },
  {
    id: 12,
    title: "Indiana Jones 5",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    rating: 4.1,
    genres: ["Adventure", "Action"],
    year: 2023,
    duration: "2h 34m",
    trailerUrl: "https://www.youtube.com/watch?v=eQfMbSe7F2g"
  }
])

// Event Handlers
const handleSearch = (query: string) => {
  console.log('Searching for:', query)
  // Implement search functionality
}

const openVideoModal = (videoUrl: string, videoInfo?: any) => {
  currentVideoUrl.value = videoUrl
  currentVideoInfo.value = videoInfo
  isVideoModalOpen.value = true
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  currentVideoUrl.value = ''
  currentVideoInfo.value = undefined
}

const handleToggleFavorite = (movieId: number, isFavorite: boolean) => {
  console.log(`Movie ${movieId} favorite status:`, isFavorite)
  // Implement favorite toggle logic
}

const resumeWatching = (entry: any) => {
  // Navigate to journal page with the entry selected for editing
  navigateTo(`/journal?entry=${entry.id}`)
}

// View All Functions
const viewAllTrending = () => {
  navigateTo('/movies/trending')
}

const viewAllComingSoon = () => {
  navigateTo('/coming-soon')
}

const viewAllRecentlyWatched = () => {
  navigateTo('/blog/recently-watched')
}

const viewAllTopMovies = () => {
  navigateTo('/movies/top-this-month')
}

const viewAllRecommended = () => {
  navigateTo('/movies/recommended')
}

// Journal Integration Methods
const journalWidget = ref<{ refetch?: () => void } | null>(null)
const continueWatchingWidget = ref<{ refetch?: () => void } | null>(null)
const pausedShowsWidget = ref<{ refetch?: () => void } | null>(null)

const openJournalModal = (movie: any) => {
  console.log('Adding to journal:', movie.title)
  // Navigate to journal page to add entry for this movie
  navigateTo('/journal?add=true&movie=' + encodeURIComponent(movie.title))
}

const handleJournalUpdate = (entry: any) => {
  console.log('Journal entry updated:', entry)
  // Refresh all widgets to show latest data
  if (journalWidget.value?.refetch) {
    journalWidget.value.refetch()
  }
  if (continueWatchingWidget.value?.refetch) {
    continueWatchingWidget.value.refetch()
  }
  if (pausedShowsWidget.value?.refetch) {
    pausedShowsWidget.value.refetch()
  }
}

const handleStatusChange = (status: string) => {
  console.log('Journal status filter changed to:', status)
  // Update UI based on status filter
}

// Paused Shows Methods
const resumeShow = (show: any) => {
  // Navigate to journal page with the entry selected for editing
  navigateTo(`/journal?entry=${show.id}`)
}

const handleShowStatusUpdate = (data: any) => {
  console.log('Show status updated:', data)
  // Refresh all relevant widgets when a show status changes
  if (pausedShowsWidget.value?.refetch) {
    pausedShowsWidget.value.refetch()
  }
  if (journalWidget.value?.refetch) {
    journalWidget.value.refetch()
  }
}

const editShow = (show: any) => {
  // Navigate to journal page with the entry selected for editing
  navigateTo(`/journal?entry=${show.id}`)
}
</script>
