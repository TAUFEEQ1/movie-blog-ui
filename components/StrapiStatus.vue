<template>
  <div class="bg-white rounded-2xl p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6">Friends activity</h3>
    
    <div class="space-y-4">
      <div 
        v-for="activity in friendsActivity" 
        :key="activity.id"
        class="flex items-center gap-3"
      >
        <!-- Friend Avatar -->
        <img 
          :src="activity.user.avatar" 
          :alt="activity.user.name"
          class="w-10 h-10 rounded-full flex-shrink-0"
        />
        
        <!-- Activity Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900">
            <span class="font-medium">{{ activity.user.name }}</span>
            <span class="text-gray-600"> {{ activity.action }} </span>
            <span class="font-medium text-blue-600">{{ activity.content.title }}</span>
          </p>
          <p class="text-xs text-gray-500">{{ formatTimeAgo(activity.timestamp) }}</p>
        </div>

        <!-- Status Indicator -->
        <div 
          class="w-2 h-2 rounded-full flex-shrink-0"
          :class="getStatusColor(activity.action)"
        ></div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="friendsActivity.length === 0"
      class="text-center py-8"
    >
      <Icon name="mdi:account-group-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No recent friend activity</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  avatar: string
}

interface Content {
  id: number
  title: string
  type: 'movie' | 'series'
}

interface Activity {
  id: number
  user: User
  action: string
  content: Content
  timestamp: Date
}

const friendsActivity = ref<Activity[]>([
  {
    id: 1,
    user: {
      id: 1,
      name: "James Banistor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    action: "is now watching",
    content: {
      id: 1,
      title: "Stranger Things",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Jenna Barbera",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b4f0?w=40&h=40&fit=crop&crop=face"
    },
    action: "is now watching",
    content: {
      id: 2,
      title: "You",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Sara Cameron",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face"
    },
    action: "is now watching",
    content: {
      id: 3,
      title: "The Witcher",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "Jonathan Paul",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    action: "is now watching",
    content: {
      id: 4,
      title: "Dune",
      type: "movie"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  }
])

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}

const getStatusColor = (action: string) => {
  switch (action) {
    case 'is now watching':
      return 'bg-green-500'
    case 'finished watching':
      return 'bg-blue-500'
    case 'added to watchlist':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}
</script>
