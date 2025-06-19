<template>
  <div class="bg-white rounded-2xl p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
    
    <div class="space-y-4">
      <div 
        v-for="activity in recentActivity" 
        :key="activity.id"
        class="flex items-center gap-3"
      >
        <!-- Activity Icon -->
        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="getActivityIconBg(activity.action)">
          <Icon :name="getActivityIcon(activity.action)" class="w-5 h-5 text-white" />
        </div>
        
        <!-- Activity Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900">
            <span class="text-gray-600">{{ getActivityDescription(activity.action) }} </span>
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
      v-if="recentActivity.length === 0"
      class="text-center py-8"
    >
      <Icon name="mdi:clock-outline" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No recent activity</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Content {
  id: number
  title: string
  type: 'movie' | 'series'
}

interface Activity {
  id: number
  action: string
  content: Content
  timestamp: Date
}

const recentActivity = ref<Activity[]>([
  {
    id: 1,
    action: "watched",
    content: {
      id: 1,
      title: "Stranger Things",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: 2,
    action: "added_to_journal",
    content: {
      id: 2,
      title: "You",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: 3,
    action: "planned_to_watch",
    content: {
      id: 3,
      title: "The Witcher",
      type: "series"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 4,
    action: "rated",
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

const getActivityDescription = (action: string) => {
  switch (action) {
    case 'watched':
      return 'Finished watching'
    case 'added_to_journal':
      return 'Added to journal'
    case 'planned_to_watch':
      return 'Added to watchlist'
    case 'rated':
      return 'Rated'
    default:
      return action
  }
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'watched':
      return 'mdi:check-circle'
    case 'added_to_journal':
      return 'mdi:notebook-plus'
    case 'planned_to_watch':
      return 'mdi:bookmark-plus'
    case 'rated':
      return 'mdi:star'
    default:
      return 'mdi:circle'
  }
}

const getActivityIconBg = (action: string) => {
  switch (action) {
    case 'watched':
      return 'bg-green-500'
    case 'added_to_journal':
      return 'bg-blue-500'
    case 'planned_to_watch':
      return 'bg-yellow-500'
    case 'rated':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}

const getStatusColor = (action: string) => {
  switch (action) {
    case 'watched':
      return 'bg-green-500'
    case 'added_to_journal':
      return 'bg-blue-500'
    case 'planned_to_watch':
      return 'bg-yellow-500'
    case 'rated':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}
</script>
