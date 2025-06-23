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
  const config = useRuntimeConfig()
  
  const fetchTrailer = async (tmdbId: number, type: 'movie' | 'tv'): Promise<TrailerResponse | null> => {
    console.log('Fetching trailer for TMDB ID:', tmdbId, 'Type:', type)
    try {
      const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
      const data = await $fetch<{ data: { id: number; type: string; trailer_url: string | null; has_trailer: boolean } }>(`${strapiUrl}/api/journal-entries/tmdb/trailer/${type}/${tmdbId}`)
      
      if (data?.data?.trailer_url) {
        // Convert YouTube watch URL to embed URL if needed
        let embedUrl = data.data.trailer_url
        if (embedUrl.includes('watch?v=')) {
          embedUrl = embedUrl.replace('watch?v=', 'embed/')
        }
        
        return {
          tmdbId: data.data.id,
          type: data.data.type as 'movie' | 'tv',
          trailerUrl: data.data.trailer_url,
          embedUrl: embedUrl
        }
      }
      
      return {
        tmdbId,
        type,
        trailerUrl: null,
        embedUrl: null
      }
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
