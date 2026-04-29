<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import Dropdown from '@/components/Dropdown.vue'
import PopUp from '@/components/PopUp.vue'
import MapChart from '@/components/MapChart.vue'
import ParetoChart from '@/components/ParetoChart.vue'
import api from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// State
const filters = ref({ regions: [], areas: [], cabangs: [], bulans: [] })
const selectedRegion = ref([])
const selectedArea = ref([])
const selectedCabang = ref([])
const selectedMonthFrom = ref('')
const selectedMonthTo = ref('')

const stats = ref({ total_agen: 0, total_volume: 0, total_jumlah: 0 })
const device = ref([])
const region = ref([])
const aceh = ref([])
const pareto = ref([])
const mapData = ref([])
const top10 = ref([])
const loading = ref(false)
const trend = ref([])
const agenAktif = ref(0)

const now = ref(new Date())
let timer = null

// Format Tanggal dan Waktu
const formattedDate = computed(() => {
  return now.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const formattedTime = computed(() => {
  return now.value.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

onMounted(async () => {
  // Real Timer
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)

  await fetchFilters()
  await fetchAll()
})

onUnmounted(() => {
  clearInterval(timer)
})

// Format Angka
const formatVolume = (n) => {
  if (n >= 1_000_000_000_000) return `Rp${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}Jt`
  return `Rp${n?.toLocaleString()}`
}

const formatCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toLocaleString()
}

// Get Filter Params
const getParams = () => {
  const params = {}
  if (selectedRegion.value.length) params.region = selectedRegion.value.join(',')
  if (selectedArea.value.length) params.area = selectedArea.value.join(',')
  if (selectedCabang.value.length) params.cabang = selectedCabang.value.join(',')
  if (selectedMonthFrom.value) params.month_from = selectedMonthFrom.value
  if (selectedMonthTo.value) params.month_to = selectedMonthTo.value
  return params
}

// Fetch All Data
const fetchAll = async () => {
  loading.value = true
  const params = getParams()
  try {
    const [s, d, r, a, t, m, p, tr, ak] = await Promise.all([
      api.getStats(params),
      api.getChartDevice(params),
      api.getChartRegion(params),
      api.getChartAceh(params),
      api.getTop10(params),
      api.getMap(params),
      api.getPareto(params),
      api.getChartTrend(params),
      api.getAgenAktif(params),
    ])
    stats.value = s.data
    device.value = d.data
    region.value = r.data
    aceh.value = a.data
    top10.value = t.data
    mapData.value = m.data
    pareto.value = p.data
    trend.value = tr.data
    agenAktif.value = ak.data.agen_aktif
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Fetch Filters
const fetchFilters = async () => {
  const res = await api.getFilters()
  filters.value = res.data
}

// Tambah fungsi ini untuk refresh area & cabang
const refreshAreaOptions = async () => {
  selectedArea.value = ''
  selectedCabang.value = ''
  const res = await api.getFilters({ region: selectedRegion.value })
  filters.value.areas = res.data.areas
  filters.value.cabangs = res.data.cabangs
}

const refreshCabangOptions = async () => {
  selectedCabang.value = ''
  const res = await api.getFilters({
    region: selectedRegion.value,
    area: selectedArea.value,
  })
  filters.value.cabangs = res.data.cabangs
}

// Chart Data
const deviceChartData = () => ({
  labels: device.value.map((d) => d.device),
  datasets: [
    {
      label: 'Fee Bank',
      data: device.value.map((d) => d.fee_bank),
      backgroundColor: '#00A69F',
    },
    {
      label: 'Fee Agen',
      data: device.value.map((d) => d.fee_agen),
      backgroundColor: '#34d399',
    },
  ],
})

const regionChartData = () => ({
  labels: region.value.map((r) => r.region),
  datasets: [
    {
      label: 'Fee Bank',
      data: region.value.map((r) => r.fee_bank),
      backgroundColor: '#00A69F',
    },
    {
      label: 'Fee Agen',
      data: region.value.map((r) => r.fee_agen),
      backgroundColor: '#34d399',
    },
  ],
})

const acehChartData = () => ({
  labels: aceh.value.map((a) => a.area),
  datasets: [
    {
      label: 'Fee Bank',
      data: aceh.value.map((a) => a.fee_bank),
      backgroundColor: '#00A69F',
    },
    {
      label: 'Fee Agen',
      data: aceh.value.map((a) => a.fee_agen),
      backgroundColor: '#34d399',
    },
  ],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}

const trendChartData = () => ({
  labels: trend.value.map((t) => t.bulan),
  datasets: [
    {
      label: 'Fee Bank',
      data: trend.value.map((t) => t.fee_bank),
      borderColor: '#00A69F',
      backgroundColor: 'rgba(0, 166, 159, 0.1)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#00A69F',
      fill: true,
      tension: 0.4,
      yAxisID: 'y',
    },
    {
      label: 'Fee Agen',
      data: trend.value.map((t) => t.fee_agen),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#34d399',
      fill: true,
      tension: 0.4,
      yAxisID: 'y2',
    },
  ],
})

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      ticks: { callback: (val) => formatCount(val) },
      grid: { color: '#f1f5f9' },
    },
    y2: {
      type: 'linear',
      position: 'right',
      ticks: { callback: (val) => formatVolume(val) },
      grid: { drawOnChartArea: false },
    },
  },
}

// Region Filter Changes
watch(selectedRegion, async () => {
  selectedArea.value = []
  selectedCabang.value = []
  const res = await api.getFilters({ region: selectedRegion.value.join(',') })
  filters.value.areas = res.data.areas
  filters.value.cabangs = res.data.cabangs
  await fetchAll()
})

watch(selectedArea, async () => {
  selectedCabang.value = []
  const res = await api.getFilters({
    region: selectedRegion.value.join(','),
    area: selectedArea.value.join(','),
  })
  filters.value.cabangs = res.data.cabangs
  await fetchAll()
})

watch([selectedCabang, selectedMonthFrom, selectedMonthTo], fetchAll)

const fetchAllAgen = async () => {
  const res = await api.getAllAgen(getParams())
  return res.data
}

onMounted(async () => {
  await fetchFilters()
  await fetchAll()
})

const sortKey = ref('volume_transaksi')
const sortOrder = ref('desc')

const toogleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const sortedTop10 = computed(() => {
  return [...top10.value].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]
    if (sortOrder.value === 'asc') return valA > valB ? 1 : -1
    else valB < valA ? 1 : -1
  })
})

// Table Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedTop10 = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedTop10.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(top10.value.length / itemsPerPage.value)
})
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="flex items-center justify-between py-2.5 border-b-2 border-gray-300 mb-6">
      <h1 class="font-semibold text-xl md:text-3xl">Dashboard</h1>
      <div class="text-right">
        <p class="text-sm font-semibold text-gray-700">{{ formattedDate }}</p>
        <p class="text-xl font-bold text-[#00A69F] tabular-nums">{{ formattedTime }}</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="bg-linear-to-r from-teal-600 to-teal-400 rounded-xl shadow-sm p-4 mb-6">
      <p class="font-semibold text-white text-xl mb-4">Filter Data</p>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
        <Dropdown
          v-model="selectedRegion"
          :options="filters.regions"
          placeholder="Semua Region"
          :multiple="true"
        />
        <Dropdown
          v-model="selectedArea"
          :options="filters.areas"
          placeholder="Semua Area"
          :multiple="true"
        />
        <Dropdown
          v-model="selectedCabang"
          :options="filters.cabangs"
          placeholder="Semua Cabang"
          :multiple="true"
        />
        <Dropdown
          v-model="selectedMonthFrom"
          :options="filters.bulans"
          placeholder="Dari Bulan"
          labelKey="label"
          valueKey="value"
        />
        <Dropdown
          v-model="selectedMonthTo"
          :options="filters.bulans"
          placeholder="Sampai Bulan"
          labelKey="label"
          valueKey="value"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-400">⏳ Memuat data...</div>

    <div v-else>
      <!-- KPI Cards — 4 kolom -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- Total Agen -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#00A69F]">
          <p class="text-md text-gray-800 uppercase font-bold tracking-wide">Total Agen</p>
          <p class="text-3xl font-bold text-gray-800 mt-2">
            {{ stats.total_agen?.toLocaleString() }}
          </p>
          <p class="text-sm text-gray-400 mt-1">Agen terdaftar</p>
        </div>
        <!-- Total Volume -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#00A69F]">
          <p class="text-md text-gray-800 uppercase font-bold tracking-wide">Total Volume</p>
          <p class="text-3xl font-bold text-gray-800 mt-2">
            {{ formatVolume(stats.total_volume) }}
          </p>
          <p class="text-sm text-gray-400 mt-1">Volume keseluruhan</p>
        </div>
        <!-- Total Jumlah -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#00A69F]">
          <p class="text-md text-gray-800 uppercase font-bold tracking-wide">Total Transaksi</p>
          <p class="text-3xl font-bold text-gray-800 mt-2">{{ formatCount(stats.total_jumlah) }}</p>
          <p class="text-sm text-gray-400 mt-1">Transaksi keseluruhan</p>
        </div>
        <!-- Agen Aktif -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#00A69F]">
          <p class="text-md text-gray-800 uppercase font-bold tracking-wide">Agen Aktif</p>
          <p class="text-3xl font-bold text-gray-800 mt-2">{{ agenAktif?.toLocaleString() }}</p>
          <p class="text-sm text-gray-400 mt-1">Bertransaksi aktif</p>
        </div>
      </div>

      <!-- Chart Device & Region -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Transaksi per Device</p>
            <PopUp name="device" :data="device" filename="transaksi_per_device" />
          </div>
          <div class="h-64">
            <Bar :data="deviceChartData()" :options="chartOptions" />
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Region Luar Aceh</p>
            <PopUp name="region" :data="region" filename="data_region_luar_aceh" />
          </div>
          <div class="h-64">
            <Bar :data="regionChartData()" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Row 2: Bar Aceh | Line Trend -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Area Aceh</p>
            <PopUp name="aceh" :data="aceh" filename="data_area_aceh" />
          </div>
          <div class="h-64"><Bar :data="acehChartData()" :options="chartOptions" /></div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Trend Transaksi Bulanan</p>
            <PopUp name="trend" :data="trend" filename="trend_bulanan" />
          </div>
          <div class="h-64"><Line :data="trendChartData()" :options="trendOptions" /></div>
        </div>
      </div>

      <!-- Pareto -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">📊 Top 10 Produk Berdasarkan Volume Transaksi</p>
          <PopUp name="pareto" :data="pareto" filename="pareto_produk" />
        </div>
        <ParetoChart :data="pareto" />
      </div>

      <!-- Map -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">🗺️ Sebaran Agen per Kecamatan</p>
          <PopUp name="map" :data="mapData" filename="sebaran_agen" />
        </div>
        <MapChart :data="mapData" />
      </div>

      <!-- Top 10 -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">Top 10 Agen Berdasarkan Volume Transaksi</p>
          <PopUp name="all_agen" :fetchData="fetchAllAgen" filename="data_all_agen" />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-175">
            <thead>
              <tr class="bg-[#00A69F] text-white">
                <th class="px-4 py-3 text-left rounded-tl-lg">#</th>
                <th class="px-4 py-3 text-left">Nama Agen</th>
                <th class="px-4 py-3 text-left">Kode Agen</th>
                <th class="px-4 py-3 text-left">Cabang</th>
                <th class="px-4 py-3 text-left">Area</th>
                <th class="px-4 py-3 text-left">Region</th>
                <th class="px-4 py-3 text-left">Kecamatan</th>
                <th
                  @click="toogleSort('jumlah_transaksi')"
                  class="px-4 py-3 text-left cursor-pointer"
                >
                  Jml Transaksi
                  <span>{{
                    sortKey === 'jumlah_transaksi' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
                <th
                  @click="toogleSort('volume_transaksi')"
                  class="px-4 py-3 text-left cursor-pointer"
                >
                  Volume Transaksi
                  <span>{{
                    sortKey === 'volume_transaksi' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
                <th class="px-4 py-3 text-left cursor-pointer">Fee Bank</th>
                <th class="px-4 py-3 text-left rounded-tr-lg cursor-pointer">Fee Agen</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(agen, i) in paginatedTop10"
                :key="agen.kode_agen"
                :class="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                class="hover:bg-teal-50 transition"
              >
                <td class="px-4 py-3 text-gray-400">
                  {{ (currentPage - 1) * itemsPerPage + i + 1 }}
                </td>
                <td class="px-4 py-3 font-medium text-gray-800">{{ agen.nama_agen }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.kode_agen }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.nama_cabang }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.area }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.region }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.kecamatan }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatCount(agen.jumlah_transaksi) }}</td>
                <td class="px-4 py-3 font-semibold text-[#00A69F]">
                  {{ formatVolume(agen.volume_transaksi) }}
                </td>
                <td class="px-4 py-3 font-semibold text-[#00A69F]">
                  {{ formatVolume(agen.fee_bank) }}
                </td>
                <td class="px-4 py-3 font-semibold text-[#00A69F]">
                  {{ formatVolume(agen.fee_agen) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-4 px-2">
          <p class="text-sm text-gray-400">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, sortedTop10.length) }} dari
            {{ sortedTop10.length.toLocaleString() }} agen
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 font-medium">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
