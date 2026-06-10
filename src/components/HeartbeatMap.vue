<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const mapContainer = ref(null)
let map = null
let markersLayer = null

const KATEGORI_COLOR = {
  Aktif: '#22c55e',
  '1-3 bulan': '#facc15',
  '3-12 bulan': '#f97316',
  '> 1 tahun': '#ef4444',
  'Tidak diketahui': '#94a3b8',
}

const initMap = () => {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value).setView([-2.5, 118], 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
}

const renderMarkers = () => {
  if (!map || !markersLayer) return
  markersLayer.clearLayers()

  props.data.forEach((edc) => {
    const color = KATEGORI_COLOR[edc.kategori] || '#94a3b8'

    const marker = L.circleMarker([edc.latitude, edc.longitude], {
      radius: 6,
      color: '#fff',
      fillColor: color,
      fillOpacity: 0.7,
      border: 2,
      weight: 1,
      opacity: 1,
    })

    marker.bindPopup(`
      <div style="font-family: system-ui; min-width: 200px;">
        <p style="font-weight: 700; color: #1f2937; margin: 0 0 4px 0;">
          ${edc.nama_agen || '-'}
        </p>
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 8px 0;">
          ${edc.kode_agen}
        </p>
        <div style="font-size: 12px; line-height: 1.5;">
          <p style="margin: 0;"><b>Serial:</b> ${edc.serial_number || '-'}</p>
          <p style="margin: 0;"><b>Last HB:</b> ${edc.last_heartbeat || '-'}</p>
          <p style="margin: 0;">
            <b>Selisih:</b>
            <span style="color: ${color}; font-weight: 600;">
              ${edc.selisih_hari ?? '-'} hari
            </span>
          </p>
          <p style="margin: 0;"><b>Kategori:</b>
            <span style="color: ${color}; font-weight: 600;">
              ${edc.kategori}
            </span>
          </p>
          <p style="margin: 0;"><b>Region:</b> ${edc.region || '-'}</p>
          <p style="margin: 0;"><b>Client Group:</b> ${edc.client_group || '-'}</p>
        </div>
      </div>
    `)

    markersLayer.addLayer(marker)
  })
}

onMounted(() => {
  initMap()
  renderMarkers()
})

watch(() => props.data, renderMarkers, { deep: true })

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div>
    <div
      ref="mapContainer"
      style="height: 450px; width: 100%; border-radius: 12px; z-index: 0"
    ></div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-3 mt-3 text-xs">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full" style="background: #22c55e"></span>
        <span class="text-gray-600">Aktif (&lt; 30 hari)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full" style="background: #facc15"></span>
        <span class="text-gray-600">1-3 bulan</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full" style="background: #f97316"></span>
        <span class="text-gray-600">3-12 bulan</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full" style="background: #ef4444"></span>
        <span class="text-gray-600">&gt; 1 tahun</span>
      </div>
    </div>
  </div>
</template>
