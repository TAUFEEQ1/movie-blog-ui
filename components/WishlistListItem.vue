<template>
  <div class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
    <div class="flex gap-4">
      <!-- Poster -->
      <div class="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          v-if="item.poster_path"
          :src="`https://image.tmdb.org/t/p/w200${item.poster_path}`"
          :alt="item.title"
          class="w-full h-full object-cover"
        >
        <div
          v-else
          class="w-full h-full bg-gray-200 flex items-center justify-center"
        >
          <Icon name="mdi:movie" class="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="capitalize">{{ item.type === 'movie' ? 'Movie' : 'TV Show' }}</span>
              <span v-if="item.release_year">• {{ item.release_year }}</span>
              <div v-if="item.tmdb_rating" class="flex items-center gap-1">
                • <Icon name="mdi:star" class="w-4 h-4 text-yellow-500" />
                <span>{{ item.tmdb_rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="$emit('view', item)"
              class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="View Details"
            >
              <Icon name="mdi:eye" class="w-5 h-5" />
            </button>
            <button
              @click="$emit('update', item, { wish_status: getNextStatus(item.wish_status) })"
              class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              :title="`Mark as ${getStatusLabel(getNextStatus(item.wish_status))}`"
            >
              <Icon name="mdi:check" class="w-5 h-5" />
            </button>
            <button
              @click="showEditModal = true"
              class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Icon name="mdi:pencil" class="w-5 h-5" />
            </button>
            <button
              @click="confirmRemove"
              class="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Remove from wishlist"
            >
              <Icon name="mdi:delete" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex items-center gap-2 mb-2">
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            :class="getStatusColor(item.wish_status)"
          >
            {{ getStatusLabel(item.wish_status) }}
          </span>
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            :class="getPriorityColor(item.priority)"
          >
            {{ getPriorityLabel(item.priority) }} Priority
          </span>
        </div>

        <!-- Tags -->
        <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
          <span
            v-for="tag in item.tags"
            :key="tag.id"
            class="inline-block px-2 py-1 text-xs font-medium text-white rounded-full"
            :style="{ backgroundColor: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>

        <!-- Notes and Date -->
        <div class="text-sm text-gray-600">
          <p v-if="item.notes" class="mb-1">{{ item.notes }}</p>
          <p class="text-xs text-gray-500">Added {{ formatDate(item.date_added) }}</p>
        </div>
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
  (e: 'view', item: WishlistItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showEditModal = ref(false)

// Methods (same as WishlistCard)
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
    case 'medium': return 'Medium'
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
