export default defineEventHandler(async (event) => {
  const tmdbId = getRouterParam(event, 'tmdbId')
  const query = getQuery(event)
  const type = query.type as 'movie' | 'tv'

  if (!tmdbId || !type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'TMDB ID and type are required'
    })
  }

  try {
    // TMDB API configuration
    const TMDB_API_KEY = process.env.TMDB_API_KEY
    
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your-tmdb-api-key') {
      console.warn('TMDB API key not configured. Please set TMDB_API_KEY environment variable.')
      return {
        tmdbId: parseInt(tmdbId),
        type,
        trailerUrl: null,
        embedUrl: null
      }
    }
    
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
    
    // Fetch videos/trailers from TMDB
    const response = await $fetch<{
      results: Array<{
        key: string
        site: string
        type: string
        name: string
        official: boolean
        published_at: string
      }>
    }>(`${TMDB_BASE_URL}/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}`)

    // Find the best trailer (prefer official YouTube trailers)
    const trailers = response.results.filter(video => 
      video.site === 'YouTube' && 
      video.type === 'Trailer'
    )

    let bestTrailer = trailers.find(trailer => trailer.official) || trailers[0]

    if (!bestTrailer) {
      // Also check for teasers if no trailers found
      const teasers = response.results.filter(video => 
        video.site === 'YouTube' && 
        video.type === 'Teaser'
      )
      bestTrailer = teasers.find(teaser => teaser.official) || teasers[0]
    }

    if (bestTrailer) {
      const trailerUrl = `https://www.youtube.com/watch?v=${bestTrailer.key}`
      const embedUrl = `https://www.youtube.com/embed/${bestTrailer.key}`
      
      return {
        tmdbId: parseInt(tmdbId),
        type,
        trailerUrl,
        embedUrl
      }
    }

    return {
      tmdbId: parseInt(tmdbId),
      type,
      trailerUrl: null,
      embedUrl: null
    }

  } catch (error) {
    console.error('Error fetching trailer from TMDB:', error)
    
    return {
      tmdbId: parseInt(tmdbId),
      type,
      trailerUrl: null,
      embedUrl: null
    }
  }
})
