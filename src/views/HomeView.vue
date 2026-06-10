<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import MapChart from '@/components/MapChart.vue'
import KPICards from '@/components/KPICards.vue'
import api from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// ── State ──────────────────────────────────────────────────────────────────
const homeStats = ref({
  total_agen: 0,
  agen_aktif: 0,
  total_transaksi: 0,
  total_volume: 0,
  avg_amount: 0,
  total_fee_bank: 0,
  total_fee_agen: 0,
})
const summary = ref({
  top_region: { nama: '-', nilai: 0 },
  top_area: { nama: '-', nilai: 0 },
  top_produk: { nama: '-', nilai: 0 },
})
const trendData = ref([])
const trafficData = ref({ tanggal: '', data: [] })
const selectedYear = ref(null)
const mapData = ref([])
const loading = ref(false)
const authStore = useAuthStore()

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
const formatVolume = (n) => {
  if (!n) return 'Rp0'
  if (n >= 1_000_000_000_000) return `Rp${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}Jt`
  return `Rp${n?.toLocaleString()}`
}

const formatCount = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n?.toLocaleString()
}

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  try {
    const trafficParams = selectedYear.value ? { year: selectedYear.value } : {}
    const [s, su, tr, tf, m] = await Promise.all([
      api.getHomeStats(),
      api.getHomeSummary(),
      api.getHomeTrend(),
      api.getHomeTraffic(trafficParams),
      api.getMap(),
    ])
    homeStats.value = s.data
    summary.value = su.data
    trendData.value = tr.data
    trafficData.value = tf.data
    mapData.value = m.data

    // Set Year to default if no data
    if (!selectedYear.value && tf.data.year) {
      selectedYear.value = tf.data.year
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Only Fetchtraffic
const fetchTraffic = async () => {
  const params = selectedYear.value ? { year: selectedYear.value } : {}
  const res = await api.getHomeTraffic(params)
  trafficData.value = res.data
}

watch(selectedYear, fetchTraffic)

// ── Chart Data ─────────────────────────────────────────────────────────────
const trendChartData = computed(() => ({
  labels: trendData.value.map((d) => d.bulan),
  datasets: [
    {
      label: 'Fee Bank',
      data: trendData.value.map((d) => d.fee_bank),
      borderColor: '#00A69F',
      backgroundColor: 'rgba(0, 166, 159, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.4,
    },
  ],
}))

const trafficChartData = computed(() => ({
  labels: trafficData.value.data?.map((d) => d.bulan) || [],
  datasets: [
    {
      label: 'Total Transaksi',
      data: trafficData.value.data?.map((d) => d.total) || [],
      borderColor: '#00A69F',
      backgroundColor: 'rgba(0, 166, 159, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.4,
    },
  ],
}))

const miniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 10 }, callback: (v) => formatCount(v) },
    },
  },
}

const trafficChartOptions = {
  ...miniChartOptions,
  plugins: {
    legend: { display: true, position: 'bottom', labels: { font: { size: 10 } } },
    tooltip: { mode: 'index', intersect: false },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: { stepSize: 1, precision: 0, font: { size: 10 } },
    },
  },
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
  await fetchAll()
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex items-center justify-between py-2.5 border-b-2 border-gray-300 mb-6">
      <div>
        <h1 class="font-semibold text-xl md:text-3xl">Assalamualaikum, {{ authStore.userName }}</h1>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold text-gray-700">{{ formattedDate }}</p>
        <p class="text-xl font-bold text-[#00A69F] tabular-nums">{{ formattedTime }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-gray-400">⏳ Memuat data...</div>

    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICards
          title="Total Agen"
          :value="homeStats.total_agen?.toLocaleString()"
          subtitle="Agen terdaftar"
        />
        <KPICards
          title="Agen Aktif"
          :value="homeStats.agen_aktif?.toLocaleString()"
          subtitle="Bertransaksi aktif"
          borderColor="#00A69F"
        />
        <KPICards
          title="Total Transaksi"
          :value="formatCount(homeStats.total_transaksi)"
          subtitle="Semua transaksi"
        />
        <KPICards
          title="Jumlah Rata-Rata"
          :value="formatVolume(homeStats.avg_amount)"
          subtitle="Rata-rata transaksi"
          borderColor="#F7941D"
        />
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Top Region -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#00A69F]">
          <p class="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">🏆 Top Region</p>
          <p class="font-bold text-gray-800 text-lg truncate">{{ summary.top_region.nama }}</p>
          <p class="text-sm text-[#00A69F] font-semibold mt-1">
            {{ formatVolume(summary.top_region.nilai) }}
          </p>
          <p class="text-xs text-gray-400 mt-0.5">Fee Bank tertinggi</p>
        </div>

        <!-- Top Area -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#F7941D]">
          <p class="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">📍 Top Area</p>
          <p class="font-bold text-gray-800 text-lg truncate">{{ summary.top_area.nama }}</p>
          <p class="text-sm text-[#F7941D] font-semibold mt-1">
            {{ formatCount(summary.top_area.nilai) }} transaksi
          </p>
          <p class="text-xs text-gray-400 mt-0.5">Transaksi terbanyak</p>
        </div>

        <!-- Top Channel -->
        <div class="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-400">
          <p class="text-xs text-gray-400 uppercase font-bold tracking-wide mb-2">📡 Top Channel</p>
          <p class="font-bold text-gray-800 text-lg truncate">{{ summary.top_produk.nama }}</p>
          <p class="text-sm text-purple-500 font-semibold mt-1">
            {{ formatCount(summary.top_produk.nilai) }} transaksi
          </p>
          <p class="text-xs text-gray-400 mt-0.5">Produk terbanyak</p>
        </div>
      </div>

      <!-- Map -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">🗺️ Sebaran Agen per Kecamatan</p>
        </div>
        <MapChart :data="mapData" />
      </div>

      <!-- Mini Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Trend Fee Bank -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <p class="font-semibold text-gray-700 mb-4">📈 Trend Fee Bank Bulanan</p>
          <div id="chart-container-home-trend" class="h-52">
            <Line :data="trendChartData" :options="miniChartOptions" />
          </div>
        </div>

        <!-- Traffic Hari Ini -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Traffic Transaksi perbulan</p>
            <select
              v-model="selectedYear"
              class="text-xs bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A69F]"
            >
              <option v-for="y in trafficData.years_available" :key="y" value="y">{{ y }}</option>
            </select>
          </div>
          <div id="chart-container-home-traffic" class="h-52">
            <Line :data="trafficChartData" :options="trafficChartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
