<template>
  <Teleport to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      @click="closeModal"
    >
      <div 
        class="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden"
        @click.stop
      >
        <!-- Close Button -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
        >
          <Icon name="mdi:close" class="w-6 h-6" />
        </button>

        <!-- Video Container -->
        <div class="relative w-full" style="padding-bottom: 56.25%">
          <iframe
            v-if="videoId"
            :src="`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Video Info -->
        <div v-if="videoInfo" class="p-6 bg-gray-900 text-white">
          <h3 class="text-xl font-bold mb-2">{{ videoInfo.title }}</h3>
          <p class="text-gray-300 mb-4">{{ videoInfo.description }}</p>
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span>{{ videoInfo.genre }}</span>
            <span>•</span>
            <span>{{ videoInfo.year }}</span>
            <span>•</span>
            <span>{{ videoInfo.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface VideoInfo {
  title: string
  description: string
  genre: string
  year: number
  duration: string
}

interface Props {
  isOpen: boolean
  videoUrl: string
  videoInfo?: VideoInfo
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const videoId = computed(() => {
  if (!props.videoUrl) return null
  
  // Extract YouTube video ID from various URL formats
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = props.videoUrl.match(regex)
  return match ? match[1] : null
})

const closeModal = () => {
  emit('close')
}

// Close modal on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})
</script>
