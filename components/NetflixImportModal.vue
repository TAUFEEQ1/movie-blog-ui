<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200 dark:border-gray-700">
      <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none">
        <Icon name="mdi:close" class="w-6 h-6" />
      </button>
      <h2 class="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Icon name="mdi:netflix" class="text-red-600 w-7 h-7" />
        Import Netflix Watchlist
      </h2>
      <form @submit.prevent="handleUpload" class="space-y-4">
        <label class="block">
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Netflix CSV file</span>
          <input type="file" accept=".csv" @change="onFileChange" class="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
        </label>
        <button type="submit" :disabled="loading || !file" class="w-full py-2 px-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60 disabled:cursor-not-allowed">
          <span v-if="loading">
            <Icon name="mdi:loading" class="inline w-5 h-5 animate-spin mr-2" /> Uploading...
          </span>
          <span v-else>Upload</span>
        </button>
      </form>
      <div v-if="result" class="mt-6 bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
        <p class="font-semibold text-blue-700 dark:text-blue-300">Imported: {{ result.imported }}</p>
        <ul class="max-h-40 overflow-y-auto mt-2 text-sm text-gray-800 dark:text-gray-200">
          <li v-for="item in result.items" :key="item.id">
            {{ item.title }} ({{ item.type }}) - {{ item.watched_date }}
          </li>
        </ul>
      </div>
      <div v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWatchlist, type NetflixImportResponse } from '~/composables/useWatchlist'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close', 'imported'])

const file = ref<File | null>(null)
const loading = ref(false)
const result = ref<NetflixImportResponse | null>(null)
const error = ref('')

const { uploadNetflixWatchlist } = useWatchlist()

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  file.value = target.files?.[0] || null
}

async function handleUpload() {
  if (!file.value) return
  loading.value = true
  error.value = ''
  result.value = null
  try {
    result.value = await uploadNetflixWatchlist(file.value)
    emit('imported')
  } catch (e: any) {
    error.value = e?.message || 'Failed to import.'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
  file.value = null
  result.value = null
  error.value = ''
}

watch(() => props.show, (val) => {
  if (!val) {
    file.value = null
    result.value = null
    error.value = ''
  }
})
</script>

