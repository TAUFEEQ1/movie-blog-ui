/**
 * Media composable for trailer and movie/TV show data
 */

interface TrailerResponse {
  tmdbId: number
  type: 'movie' | 'tv'
  trailerUrl: string | null
  embedUrl: string | null
}

export const useMedia = () => {
  const fetchTrailer = async (tmdbId: number, type: 'movie' | 'tv'): Promise<TrailerResponse | null> => {
    try {
      const data = await $fetch<TrailerResponse>(`/api/media/${tmdbId}/trailer?type=${type}`)
      return data
    } catch (error) {
      console.error('Error fetching trailer:', error)
      return null
    }
  }

  const getEmbedUrl = (youtubeUrl: string | null): string | null => {
    if (!youtubeUrl) return null
    
    // Convert YouTube watch URL to embed URL
    if (youtubeUrl.includes('watch?v=')) {
      return youtubeUrl.replace('watch?v=', 'embed/')
    }
    
    // If it's already an embed URL, return as is
    if (youtubeUrl.includes('embed/')) {
      return youtubeUrl
    }
    
    return null
  }

  return {
    fetchTrailer,
    getEmbedUrl
  }
}
