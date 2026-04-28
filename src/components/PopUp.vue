<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  data: { type: Array, default: null },
  fetchData: { type: Function, default: null },
  filename: { type: String, default: 'data' },
})

const isOpen = ref(false)
const isLoading = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const exportCSV = async () => {
  let exportData = props.data

  // Jika ada fetchData, panggil dulu
  if (props.fetchData) {
    isLoading.value = true
    try {
      exportData = await props.fetchData()
    } catch (err) {
      console.error(err)
      isLoading.value = false
      return
    }
    isLoading.value = false
  }

  if (!exportData || exportData.length === 0) return

  const headers = Object.keys(exportData[0]).join(',')
  const rows = exportData.map((row) => Object.values(row).join(',')).join('\n')
  const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${props.filename}.csv`
  link.click()
  isOpen.value = false
}

const handleClickOutside = (e) => {
  if (!e.target.closest(`#chart-menu-${props.name}`)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div id="'chart-menu-${props.name}'" class="relative">
    <button
      @click.stop="toggle"
      class="py-1 px-3 rounded-lg hover:bg-gray-300 hover:text-white transition text-black"
    >
      ⋮
    </button>
    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 w-45 py-1 bg-white border border-gray-200 hover:bg-[#00A69F] hover:text-white rounded-lg shadow-lg z-10"
    >
      <button
        @click="exportCSV"
        class="w-full text-left px-4 py-2 text-sm hover:bg-[#00A69F] hover:text-white cursor-pointer"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Mengunduh...' : 'Export as CSV' }}
      </button>
    </div>
  </div>
</template>
