<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
    <!-- Poster -->
    <div class="relative aspect-[2/3] overflow-hidden">
      <img
        v-if="item.poster_path"
        :src="`https://image.tmdb.org/t/p/w500${item.poster_path}`"
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <div
        v-else
        class="w-full h-full bg-gray-200 flex items-center justify-center"
      >
        <Icon name="mdi:movie" class="w-12 h-12 text-gray-400" />
      </div>

      <!-- Priority Badge -->
      <div
        class="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white"
        :class="getPriorityColor(item.priority)"
      >
        {{ getPriorityLabel(item.priority) }}
      </div>

      <!-- Status Badge -->
      <div
        class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white"
        :class="getStatusColor(item.status)"
      >
        {{ getStatusLabel(item.status) }}
      </div>

      <!-- Overlay Actions -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div class="flex gap-2">
          <button
            @click="$emit('update', item, { status: getNextStatus(item.status) })"
            class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            :title="`Mark as ${getStatusLabel(getNextStatus(item.status))}`"
          >
            <Icon name="mdi:check" class="w-5 h-5 text-white" />
          </button>
          <button
            @click="showEditModal = true"
            class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            title="Edit"
          >
            <Icon name="mdi:pencil" class="w-5 h-5 text-white" />
          </button>
          <button
            @click="confirmRemove"
            class="p-2 bg-red-500 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
            title="Remove from wishlist"
          >
            <Icon name="mdi:delete" class="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ item.title }}</h3>
      
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm text-gray-600 capitalize">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
        <span v-if="item.release_year" class="text-sm text-gray-500">• {{ item.release_year }}</span>
        <div v-if="item.tmdb_rating" class="flex items-center gap-1 ml-auto">
          <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
          <span class="text-sm text-gray-700">{{ item.tmdb_rating.toFixed(1) }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="tag in item.tags.slice(0, 3)"
          :key="tag.id"
          class="inline-block px-2 py-1 text-xs font-medium text-white rounded-full"
          :style="{ backgroundColor: tag.color }"
        >
          {{ tag.name }}
        </span>
        <span
          v-if="item.tags.length > 3"
          class="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full"
        >
          +{{ item.tags.length - 3 }}
        </span>
      </div>

      <!-- Notes -->
      <p
        v-if="item.notes"
        class="text-sm text-gray-600 line-clamp-2"
      >
        {{ item.notes }}
      </p>

      <!-- Date Added -->
      <div class="text-xs text-gray-500 mt-2">
        Added {{ formatDate(item.date_added) }}
      </div>
    </div>

    <!-- Edit Modal -->
    <WishlistEditModal
      v-if="showEditModal"
      :is-open="showEditModal"
      :item="item"
      @close="showEditModal = false"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import type { WishlistItem } from '~/composables/useWishlist'

interface Props {
  item: WishlistItem
}

interface Emits {
  (e: 'remove', item: WishlistItem): void
  (e: 'update', item: WishlistItem, updates: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showEditModal = ref(false)

// Methods
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'High'
    case 'medium': return 'Med'
    case 'low': return 'Low'
    default: return priority
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'want_to_watch': return 'bg-blue-500'
    case 'watching': return 'bg-orange-500'
    case 'completed': return 'bg-green-500'
    case 'on_hold': return 'bg-yellow-500'
    case 'dropped': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'want_to_watch': return 'Want to Watch'
    case 'watching': return 'Watching'
    case 'completed': return 'Completed'
    case 'on_hold': return 'On Hold'
    case 'dropped': return 'Dropped'
    default: return status
  }
}

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case 'want_to_watch': return 'watching'
    case 'watching': return 'completed'
    case 'completed': return 'want_to_watch'
    case 'on_hold': return 'watching'
    case 'dropped': return 'want_to_watch'
    default: return 'want_to_watch'
  }
}

const confirmRemove = () => {
  if (confirm(`Remove "${props.item.title}" from your wishlist?`)) {
    emit('remove', props.item)
  }
}

const handleUpdated = (updatedItem: WishlistItem) => {
  showEditModal.value = false
  // The parent component will handle the update through the API
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
  return `${Math.ceil(diffDays / 365)} years ago`
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
