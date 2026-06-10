<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { toPng } from 'html-to-image'

const props = defineProps({
  name: { type: String, required: true },
  data: { type: Array, default: null },
  fetchData: { type: Function, default: null },
  filename: { type: String, default: 'data' },
  chartRef: { type: Object, default: null },
  isTable: { type: Boolean, default: false },
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

const exportPNG = () => {
  // Find the container chart
  const container = document.getElementById(`chart-container-${props.name}`)
  if (!container) {
    console.warn('Container tidak ditemukan untuk chart:', props.name)
    return
  }

  // Find Canvas from container
  let canvas = null

  if (props.chartRef) {
    canvas = props.chartRef.$el?.querySelector('canvas') ?? props.chartRef?.canvas ?? props.chartRef
  }

  if (!canvas) {
    canvas = container.querySelector('canvas')
  }

  if (!canvas) {
    console.warn('Canvas tidak ditemukan untuk chart:', props.name)
    return
  }

  // Find Title
  let title = props.filename
  const parent = container.closest('.bg-white')
  if (parent) {
    const titleEl = parent.querySelector('p.font-semibold')
    if (titleEl) title = titleEl.innerText.trim()
  }

  // Setup Dimensions
  const paddingTop = 30
  const paddingBottom = 30
  const paddingLeft = 50
  const paddingRight = 50
  const titleHeight = 50
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvas.width + paddingLeft + paddingRight
  exportCanvas.height = canvas.height + titleHeight + paddingTop + paddingBottom
  const ctx = exportCanvas.getContext('2d')

  //White Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

  // Draw title
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 20px Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, paddingLeft, paddingTop + titleHeight / 2)

  // Draw garis pemisah tipis
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(paddingLeft, paddingTop + titleHeight)
  ctx.lineTo(exportCanvas.width - paddingRight, paddingTop + titleHeight)
  ctx.stroke()

  // Chart pict on top
  ctx.drawImage(canvas, paddingLeft, paddingTop + titleHeight)

  const link = document.createElement('a')
  link.href = exportCanvas.toDataURL('image/png')
  link.download = `${props.filename}.png`
  link.click()
  isOpen.value = false
}

const exportTablePNG = async () => {
  const container = document.getElementById(`chart-container-${props.name}`)
  if (!container) {
    console.warn('Container tabel tidak ditemukan:', props.name)
    return
  }

  // Cari title
  let title = props.filename
  const parent = container.closest('.bg-white')
  if (parent) {
    const titleEl = parent.querySelector('p.font-semibold')
    if (titleEl) title = titleEl.innerText.trim()
  }

  isLoading.value = true
  try {
    // Render tabel ke data URL
    const dataUrl = await toPng(container, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    })

    // Load ke Image untuk dapat dimensi
    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // Buat canvas final dengan title
    const padding = 20
    const titleHeight = 50
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = img.width
    exportCanvas.height = img.height + titleHeight + padding * 2
    const ctx = exportCanvas.getContext('2d')

    // Background putih
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Draw title
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 28px Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, padding, padding + titleHeight / 2)

    // Draw tabel di bawah title
    ctx.drawImage(img, 0, titleHeight + padding)

    const link = document.createElement('a')
    link.href = exportCanvas.toDataURL('image/png')
    link.download = `${props.filename}.png`
    link.click()
  } catch (err) {
    console.error('Error export tabel:', err)
  } finally {
    isLoading.value = false
    isOpen.value = false
  }
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
      class="absolute right-0 mt-1 w-45 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
    >
      <!-- Export CSV -->
      <button
        @click="exportCSV"
        class="w-full text-left px-4 py-2 text-sm hover:bg-[#00A69F] hover:text-white cursor-pointer"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Mengunduh...' : 'Export as CSV' }}
      </button>

      <!-- Export PNG -->
      <button
        @click="props.isTable ? exportTablePNG() : exportPNG()"
        class="w-full text-left px-4 py-2 text-sm hover:bg-[#00A69F] hover:text-white cursor-pointer"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Mengunduh...' : 'Export as PNG' }}
      </button>
    </div>
  </div>
</template>
