<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const mapContainer = ref(null)
const mapWrapper = ref(null)
let map = null
let markers = []
const isDownloading = ref(false)

const getColor = (jumlahAgen) => {
  if (jumlahAgen >= 500) return '#00614f'
  if (jumlahAgen >= 200) return '#00836e'
  if (jumlahAgen >= 100) return '#00A69F'
  if (jumlahAgen >= 50) return '#34d399'
  return '#a7f3d8'
}

const getRadius = (jumlahAgen) => {
  if (jumlahAgen >= 500) return 30
  if (jumlahAgen >= 200) return 22
  if (jumlahAgen >= 100) return 16
  if (jumlahAgen >= 50) return 11
  return 7
}

const formatVolume = (n) => {
  if (n >= 1_000_000_000_000) return `Rp${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}Jt`
  return `Rp${n?.toLocaleString()}`
}

const renderMarkers = () => {
  markers.forEach((m) => m.remove())
  markers = []
  if (!map || !props.data.length) return

  props.data.forEach((item) => {
    if (!item.lat || !item.lon) return
    const circle = L.circleMarker([item.lat, item.lon], {
      radius: getRadius(item.jumlah_agen),
      fillColor: getColor(item.jumlah_agen),
      color: '#fff',
      weight: 1.5,
      opacity: 0.9,
      fillOpacity: 0.75,
    })
    circle.bindPopup(`
      <div style="font-family: sans-serif; min-width: 180px;">
        <div style="font-weight: 700; font-size: 14px; color: #00836e; margin-bottom: 6px;">
          ${item.kecamatan}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
          ${item.kab_kota} • ${item.area} • ${item.region}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span style="color: #475569;">Jumlah Agen</span>
          <span style="font-weight: 600;">${item.jumlah_agen?.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
          <span style="color: #475569;">Volume</span>
          <span style="font-weight: 600; color: #00836e;">${formatVolume(item.volume_transaksi)}</span>
        </div>
      </div>
    `)
    circle.addTo(map)
    markers.push(circle)
  })
}

// ── Download CSV ──────────────────────────────────────────────────────────────
const downloadCSV = () => {
  if (!props.data.length) return
  const headers = [
    'kecamatan',
    'kab_kota',
    'area',
    'region',
    'jumlah_agen',
    'jumlah_transaksi',
    'volume_transaksi',
  ]
  const rows = props.data.map((d) => headers.map((h) => d[h] ?? '').join(','))
  const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `sebaran_agen_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

onMounted(() => {
  map = L.map(mapContainer.value, { center: [-2.5, 118], zoom: 5 })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)
  renderMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.data, renderMarkers, { deep: true })
</script>

<template>
  <div ref="mapWrapper">
    <div class="flex justify-end mb-2"></div>

    <!-- Map -->
    <div
      ref="mapContainer"
      style="height: 450px; width: 100%; border-radius: 12px; z-index: 0"
    ></div>
  </div>
</template>
