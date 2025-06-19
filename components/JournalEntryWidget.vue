<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="mdi:book-open" class="w-5 h-5 text-purple-600" />
        Recent Journal Entries
      </h2>
      <NuxtLink to="/journal" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
        View All
      </NuxtLink>
    </div>
    
    <div class="space-y-4">
      <div 
        v-for="entry in recentEntries" 
        :key="entry.id"
        class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        @click="openEntry(entry)"
      >
        <div class="flex items-start gap-3">
          <img 
            :src="entry.movie.poster" 
            :alt="entry.movie.title"
            class="w-12 h-16 object-cover rounded flex-shrink-0"
          />
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="font-medium text-gray-900 truncate">{{ entry.movie.title }}</h3>
                <p class="text-sm text-gray-500">{{ entry.movie.year }}</p>
              </div>
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                <span>{{ entry.rating }}</span>
              </div>
            </div>
            
            <p class="text-sm text-gray-700 line-clamp-2 mb-2">{{ entry.content }}</p>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ formatDate(entry.createdAt) }}</span>
              <span>{{ entry.wordCount }} words</span>
            </div>
            
            <!-- Mood indicator -->
            <div class="flex items-center gap-1 mt-2">
              <span class="text-xs text-gray-500">Mood:</span>
              <span class="text-xs px-2 py-1 rounded-full" :class="getMoodClass(entry.mood)">
                {{ entry.mood }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Add Button -->
    <button 
      @click="quickAdd"
      class="w-full mt-4 p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
    >
      <Icon name="mdi:plus" class="w-5 h-5" />
      Add New Entry
    </button>
  </div>
</template>

<script setup lang="ts">
interface Movie {
  id: number
  title: string
  year: number
  poster: string
}

interface JournalEntry {
  id: number
  movie: Movie
  rating: number
  content: string
  mood: 'excited' | 'thoughtful' | 'disappointed' | 'amazed' | 'emotional'
  createdAt: Date
  wordCount: number
}

const emit = defineEmits(['open-entry', 'quick-add'])

// Mock recent entries
const recentEntries = ref<JournalEntry[]>([
  {
    id: 1,
    movie: {
      id: 1,
      title: "Oppenheimer",
      year: 2023,
      poster: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=300&fit=crop"
    },
    rating: 4.8,
    content: "Christopher Nolan has outdone himself with this biographical masterpiece. The way he portrays the moral complexity of Oppenheimer's decision and the weight of creating something so destructive is absolutely brilliant. Cillian Murphy's performance is career-defining...",
    mood: 'thoughtful',
    createdAt: new Date('2024-01-15'),
    wordCount: 245
  },
  {
    id: 2,
    movie: {
      id: 2,
      title: "The Bear",
      year: 2022,
      poster: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=300&fit=crop"
    },
    rating: 4.9,
    content: "Season 3 just dropped and I'm already emotional. The character development of Carmy continues to be phenomenal. The way they handle trauma and healing through cooking is so authentic. Every episode feels like a masterclass in storytelling...",
    mood: 'emotional',
    createdAt: new Date('2024-01-12'),
    wordCount: 189
  },
  {
    id: 3,
    movie: {
      id: 3,
      title: "Dune: Part Two",
      year: 2024,
      poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop"
    },
    rating: 4.7,
    content: "Villeneuve has created something truly special. The visual spectacle is breathtaking, and Timothée Chalamet's transformation into Paul is captivating. The way they adapted the book while making it accessible to newcomers is impressive...",
    mood: 'amazed',
    createdAt: new Date('2024-01-10'),
    wordCount: 167
  }
])

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric'
  }).format(date)
}

const getMoodClass = (mood: string) => {
  const moodClasses = {
    excited: 'bg-yellow-100 text-yellow-700',
    thoughtful: 'bg-blue-100 text-blue-700',
    disappointed: 'bg-red-100 text-red-700',
    amazed: 'bg-purple-100 text-purple-700',
    emotional: 'bg-pink-100 text-pink-700'
  }
  return moodClasses[mood as keyof typeof moodClasses] || 'bg-gray-100 text-gray-700'
}

const openEntry = (entry: JournalEntry) => {
  emit('open-entry', entry)
}

const quickAdd = () => {
  emit('quick-add')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
