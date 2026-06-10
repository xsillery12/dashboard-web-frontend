<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import PopUp from '@/components/PopUp.vue'
import Dropdown from '@/components/Dropdown.vue'
import SingleDatePicker from '@/components/SingleDatePicker.vue'
import KPICards from '@/components/KPICards.vue'
import HeartbeatMapChart from '@/components/HeartbeatMap.vue'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// ── State ──────────────────────────────────────────────────────────────────
const filters = ref({ regions: [], areas: [] })
const selectedRegion = ref([])
const selectedArea = ref([])
const dateFrom = ref('')
const dateTo = ref('')

const stats = ref({ total_heartbeat: 0, overall_heartbeat: 0, overall_percent: 0, total_cabang: 0 })
const chartRegion = ref([])
const chartKategori = ref([])
const mapData = ref([])
const detailAgen = ref([])
const loading = ref(false)

// ── Real Time Clock ────────────────────────────────────────────────────────
const now = ref(new Date())
let timer = null

const formattedDate = computed(() =>
  now.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
)
const formattedTime = computed(() =>
  now.value.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
)

// ── Format Angka ───────────────────────────────────────────────────────────
const formatCount = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toLocaleString()
}

// ── Filter Params ──────────────────────────────────────────────────────────
const getParams = () => {
  const params = {}
  if (selectedRegion.value.length) params.region = selectedRegion.value.join(',')
  if (selectedArea.value.length) params.area = selectedArea.value.join(',')
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
}

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  const params = getParams()
  try {
    const [s, cr, ck, m, d] = await Promise.all([
      api.getHeartbeatStats(params),
      api.getHeartbeatChartRegion(params),
      api.getHeartbeatChartKategori(params),
      api.getHeartbeatMap(params),
      api.getHeartbeatDetail(params),
    ])
    stats.value = s.data
    chartRegion.value = cr.data
    chartKategori.value = ck.data
    mapData.value = m.data
    // console.log('Map data:', mapData.value.length, 'items')
    detailAgen.value = d.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchFilters = async () => {
  const res = await api.getHeartbeatFilters()
  filters.value = res.data
}

const fetchAllDetail = async () => {
  const res = await api.getHeartbeatDetail(getParams())
  return res.data
}

// ── Chart Data ─────────────────────────────────────────────────────────────
const regionChartData = computed(() => ({
  labels: chartRegion.value.map((d) => d.region),
  datasets: [
    {
      label: 'Total EDC > 30 Hari',
      data: chartRegion.value.map((d) => d.total_edc),
      backgroundColor: '#F7941D',
    },
  ],
}))

const kategoriChartData = computed(() => ({
  labels: chartKategori.value.map((d) => d.kategori),
  datasets: [
    {
      data: chartKategori.value.map((d) => d.total),
      backgroundColor: ['#00A69F', '#F7941D'],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    datalabels: {
      anchor: 'end',
      align: 'top',
      color: '#374151',
      font: { weight: 'bold', size: 11 },
      formatter: (value) => value.toLocaleString(),
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()}`,
      },
    },
    datalabels: {
      anchor: 'start',
      align: 'start',
      offset: 8,
      color: '#000',
      font: { weight: 'bold', size: 13 },
      formatter: (value, ctx) => {
        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
        const pct = ((value / total) * 100).toFixed(1)
        return `${value.toLocaleString()}\n(${pct}%)`
      },
    },
  },
  cutout: '65%',
}

// ── Watch ──────────────────────────────────────────────────────────────────
watch(selectedRegion, async () => {
  selectedArea.value = []
  const res = await api.getHeartbeatFilters({ region: selectedRegion.value.join(',') })
  filters.value.areas = res.data.areas
  await fetchAll()
})

watch(selectedArea, fetchAll)
watch([dateFrom, dateTo], fetchAll)

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  await fetchFilters()
  await fetchAll()
})

onUnmounted(() => clearInterval(timer))

// ── Sort & Pagination ──────────────────────────────────────────────────────
const sortKey = ref('selisih_hari')
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 10

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const sortedAgen = computed(() => {
  return [...detailAgen.value].sort((a, b) => {
    const valA = a[sortKey.value] ?? 0
    const valB = b[sortKey.value] ?? 0
    if (valA === valB) return 0
    if (sortOrder.value === 'asc') return valA < valB ? 1 : -1
    return valA > valB ? 1 : -1
  })
})

const paginatedAgen = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedAgen.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(sortedAgen.value.length / itemsPerPage))
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between py-2.5 border-b-2 border-gray-300 mb-6">
      <h1 class="font-semibold text-xl md:text-3xl">Heartbeat Mesin EDC</h1>
      <div class="text-right">
        <p class="text-sm font-semibold text-gray-700">{{ formattedDate }}</p>
        <p class="text-xl font-bold text-[#00A69F] tabular-nums">{{ formattedTime }}</p>
      </div>
    </div>

    <!-- Filter -->
    <div
      class="rounded-xl shadow-sm p-4 mb-6"
      style="background: linear-gradient(135deg, #00a69f 55%, #f7941d 100%)"
    >
      <p class="font-semibold text-white text-xl mb-4">Filter Data</p>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
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
        <SingleDatePicker v-model="dateFrom" placeholder="Dari Tanggal" />
        <SingleDatePicker v-model="dateTo" placeholder="Sampai Tanggal" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-400">⏳ Memuat data...</div>

    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICards
          title="Total Heartbeat"
          :value="formatCount(stats.total_heartbeat)"
          subtitle="Semua mesin EDC"
        />
        <KPICards
          title="Overall Heartbeat"
          :value="formatCount(stats.overall_heartbeat)"
          :subtitle="`Aktif ${stats.overall_percent}%`"
          borderColor="#22c55e"
        />
        <KPICards
          title="Total Cabang"
          :value="formatCount(stats.total_cabang)"
          subtitle="Cabang terdaftar"
          borderColor="#F7941D"
        />
      </div>

      <!-- Bar + Pie -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Bar: EDC > 30 Hari per Region -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Total EDC per Region (Status &gt; 30 Hari)</p>
            <PopUp name="region_30" :data="chartRegion" filename="edc_per_region" />
          </div>
          <div id="chart-container-region_30" class="h-64">
            <Bar :data="regionChartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Pie: Kategori 3-12 bulan dan 1-3 bulan -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Total EDC berdasarkan Kategori</p>
            <PopUp name="kategori" :data="chartKategori" filename="edc_kategori" />
          </div>
          <div id="chart-container-kategori" class="h-64">
            <Doughnut :data="kategoriChartData" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- Map Chart -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">Sebaran Mesin EDC</p>
          <PopUp name="map_edc" :data="mapData" filename="sebaran_edc" :is-table="true" />
        </div>
        <div id="chart-container-map_edc">
          <HeartbeatMapChart :data="mapData" />
        </div>
      </div>

      <!-- Tabel Detail Agen -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">Detail Agen</p>
          <PopUp
            name="detail_agen"
            :fetchData="fetchAllDetail"
            filename="detail_heartbeat_agen"
            :is-table="true"
          />
        </div>

        <div id="chart-container-detail_agen" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#00A69F] text-white">
                <th class="px-4 py-3 text-left rounded-tl-lg">#</th>
                <th class="px-4 py-3 text-left">Kode Agen</th>
                <th class="px-4 py-3 text-left">Nama Agen</th>
                <th class="px-4 py-3 text-left">Serial Number</th>
                <th class="px-4 py-3 text-left">Last Heartbeat</th>
                <th
                  @click="toggleSort('selisih_hari')"
                  class="px-4 py-3 text-right cursor-pointer rounded-tr-lg"
                >
                  Selisih Hari
                  <span>{{
                    sortKey === 'selisih_hari' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(agen, i) in paginatedAgen"
                :key="agen.kode_agen + i"
                :class="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                class="hover:bg-teal-50 transition"
              >
                <td class="px-4 py-3 text-gray-400">
                  {{ (currentPage - 1) * itemsPerPage + i + 1 }}
                </td>
                <td class="px-4 py-3 text-gray-500">{{ agen.kode_agen }}</td>
                <td class="px-4 py-3 font-medium text-gray-800">{{ agen.nama_agen }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.serial_number }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.last_heartbeat || '-' }}</td>
                <td
                  class="px-4 py-3 text-right font-semibold"
                  :class="agen.selisih_hari > 30 ? 'text-red-500' : 'text-green-600'"
                >
                  {{ agen.selisih_hari ?? '-' }} hari
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 px-2">
          <p class="text-sm text-gray-400">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, sortedAgen.length) }} dari
            {{ sortedAgen.length.toLocaleString() }} agen
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 font-medium"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
