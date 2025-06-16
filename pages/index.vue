<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex gap-6 p-6">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <div class="flex-1">
        <!-- Top Navigation -->
        <TopBar 
          @tab-change="handleTabChange"
          @search="handleSearch"
        />

        <!-- Hero Section -->
        <HeroSection @play-trailer="openVideoModal" />

        <!-- Content Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Movie Sections -->
          <div class="lg:col-span-2 space-y-8">
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
            <ContinueWatchingWidget @resume-watching="resumeWatching" />
            
            <!-- Friends Activity -->
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
// Protect this page with authentication middleware
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()

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
const trendingMovies = ref<Movie[]>([
  {
    id: 1,
    title: "Openheimer",
    poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    rating: 4.8,
    genres: ["Thriller", "Detective"],
    year: 2023,
    duration: "2h 57m",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  {
    id: 2,
    title: "The Witcher",
    poster: "https://images.unsplash.com/photo-1489599904472-c34eb5d19877?w=400&h=600&fit=crop",
    rating: 4.2,
    genres: ["Drama", "Adventure"],
    year: 2023,
    duration: "1h 45m",
    trailerUrl: "https://www.youtube.com/watch?v=ndl1W4ltcmg"
  },
  {
    id: 3,
    title: "The Marvels",
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    rating: 3.5,
    genres: ["Action", "Adventure"],
    year: 2023,
    duration: "1h 45m",
    trailerUrl: "https://www.youtube.com/watch?v=wS_qbDztgVY"
  }
])

const comingSoonMovies = ref<Movie[]>([
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
])

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
const handleTabChange = (tab: string) => {
  console.log('Tab changed to:', tab)
  // Implement tab filtering logic
}

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

const resumeWatching = (item: any) => {
  console.log('Resuming:', item.title)
  openVideoModal(item.watchUrl)
}

// View All Functions
const viewAllTrending = () => {
  navigateTo('/movies/trending')
}

const viewAllComingSoon = () => {
  navigateTo('/movies/coming-soon')
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
</script>
