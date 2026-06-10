<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import ParetoChart from '@/components/ParetoChart.vue'
import PopUp from '@/components/PopUp.vue'
import Dropdown from '@/components/Dropdown.vue'
import DatePicker from '@/components/DatePicker.vue'
import SingleDatePicker from '@/components/SingleDatePicker.vue'
import KPICards from '@/components/KPICards.vue'
import api from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
)

// ── State ──────────────────────────────────────────────────────────────────
const filters = ref({ regions: [], areas: [], cabangs: [] })
const selectedRegion = ref([])
const selectedArea = ref([])
const selectedCabang = ref([])
const dateFrom = ref('')
const dateTo = ref('')
const selectedInterval = ref('2')
const selectedDates = ref([])

const statsData = ref({
  total_transaksi: 0,
  total_volume: 0,
  avg_amount: 0,
  comparison_label: '',
  changes: {},
})
const produkData = ref([])
const regionData = ref([])
const trafficData = ref({ labels: [], datasets: [] })
const paretoData = ref([])
const paretoMetric = ref('count')
const topAgen = ref([])
const mapData = ref([])
const loading = ref(false)

let fetchSeq = 0

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
  now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)

// ── Format ──────────────────────────────────────────────────────────────────
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

// ── Params ──────────────────────────────────────────────────────────────────
const getParams = () => {
  const params = {}
  if (selectedRegion.value.length) params.region = selectedRegion.value.join(',')
  if (selectedArea.value.length) params.area = selectedArea.value.join(',')
  if (selectedCabang.value.length) params.cabang = selectedCabang.value.join(',')
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value) params.date_to = dateTo.value
  return params
}

const getTrafficParams = () => {
  const params = { ...getParams(), interval: selectedInterval.value }
  if (selectedDates.value.length) {
    params.dates = selectedDates.value.join(',')
  }
  return params
}

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  const seq = ++fetchSeq
  const params = getParams()
  try {
    const [s, p, r, tr, ta, m, pa] = await Promise.all([
      api.getTransaksiStats(params),
      api.getTransaksiProduk(params),
      api.getTransaksiPerRegion(params),
      api.getTransaksiTraffic(getTrafficParams()),
      api.getAllTransaksiAgen(params),
      api.getMap(params),
      api.getTransaksiPareto({ ...params, metric: paretoMetric.value }),
    ])
    if (seq !== fetchSeq) return
    statsData.value = s.data
    produkData.value = p.data
    regionData.value = r.data
    trafficData.value = tr.data
    topAgen.value = ta.data
    mapData.value = m.data
    paretoData.value = pa.data
  } catch (err) {
    console.error(err)
  } finally {
    if (seq === fetchSeq) loading.value = false
  }
}

const fetchFilters = async () => {
  const res = await api.getTransaksiFilters()
  filters.value = res.data
}

const fetchTraffic = async () => {
  const res = await api.getTransaksiTraffic(getTrafficParams())
  trafficData.value = res.data
}

const fetchAllTopAgen = async () => {
  const res = await api.getAllTransaksiAgen(getParams())
  return res.data
}

const fetchPareto = async () => {
  const res = await api.getTransaksiPareto({ ...getParams(), metric: paretoMetric.value })
  paretoData.value = res.data
}

watch(paretoMetric, fetchPareto)

const intervalOptions = [
  { label: '2 Jam', value: '2' },
  { label: '4 Jam', value: '4' },
  { label: '6 Jam', value: '6' },
]

// ── Chart Data ─────────────────────────────────────────────────────────────
const produkChartData = computed(() => ({
  labels: produkData.value.map((d) => d.kategori),
  datasets: [
    {
      data: produkData.value.map((d) => d.total),
      backgroundColor: ['#00A69F', '#F7941D'],
      borderWidth: 0,
    },
  ],
}))

const regionChartData = computed(() => ({
  labels: regionData.value.map((d) => d.region),
  datasets: [
    {
      label: 'Total Transaksi',
      data: regionData.value.map((d) => d.total_transaksi),
      backgroundColor: '#00A69F',
    },
  ],
}))

const COLORS = ['#00A69F', '#F7941D', '#34d399', '#818cf8', '#f472b6', '#fb923c', '#a3e635']

const trafficChartData = computed(() => {
  const data = trafficData.value
  if (!data || !data.labels) return { labels: [], datasets: [] }
  return {
    labels: data.labels,
    datasets: data.datasets.map((ds, i) => {
      const color = COLORS[i % COLORS.length]
      return {
        label: ds.tanggal,
        data: ds.total,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        pointRadius: 3,
        fill: false,
        tension: 0.4,
      }
    }),
  }
})

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
  layout: {
    padding: 10,
  },
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString()}` } },
    datalabels: {
      anchor: 'end',
      align: 'end',
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

const trafficOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { mode: 'index', intersect: false },
    datalabels: {
      align: 'bottom',
      anchor: 'end',
      color: '#374151',
      font: { weight: '700', size: 15 },
      formatter: (value) => (value > 0 ? value.toLocaleString() : ''), // skip 0
    },
  },
  scales: {
    y: { grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, precision: 0 }, beginAtZero: true },
  },
}

// ── Watch ──────────────────────────────────────────────────────────────────
watch(selectedRegion, async () => {
  selectedArea.value = []
  selectedCabang.value = []
  const res = await api.getTransaksiFilters({ region: selectedRegion.value.join(',') })
  filters.value.areas = res.data.areas
  filters.value.cabangs = res.data.cabangs
  await fetchAll()
})

watch(selectedArea, async (newVal, oldVal) => {
  if (!newVal.length && !oldVal.length) return
  selectedCabang.value = []
  const res = await api.getTransaksiFilters({
    region: selectedRegion.value.join(','),
    area: selectedArea.value.join(','),
  })
  filters.value.cabangs = res.data.cabangs
  await fetchAll()
})

watch(selectedCabang, fetchAll)
watch([dateFrom, dateTo], fetchAll)
watch(selectedInterval, fetchTraffic)
watch(selectedDates, fetchTraffic)

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
const sortKey = ref('total_transaksi')
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

const sortedAgen = computed(() =>
  [...topAgen.value].sort((a, b) => {
    const valA = a[sortKey.value] ?? 0
    const valB = b[sortKey.value] ?? 0
    if (valA === valB) return 0
    if (sortOrder.value === 'asc') return valA < valB ? 1 : -1
    return valA > valB ? 1 : -1
  }),
)

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
      <h1 class="font-semibold text-xl md:text-3xl">Transaksi Agen</h1>
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
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
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
          title="Total Transaksi"
          :value="formatCount(statsData.total_transaksi)"
          subtitle="Semua transaksi"
          :change="statsData.changes?.total_transaksi"
          :comparison="statsData.comparison_label"
        />
        <KPICards
          title="Total Volume"
          :value="formatVolume(statsData.total_volume)"
          subtitle="Volume keseluruhan"
          :change="statsData.changes?.total_volume"
          :comparison="statsData.comparison_label"
        />
        <KPICards
          title="Avg Amount"
          :value="formatVolume(statsData.avg_amount)"
          subtitle="Rata-rata per transaksi"
          :change="statsData.changes?.avg_amount"
          :comparison="statsData.comparison_label"
          borderColor="#F7941D"
        />
      </div>

      <!-- Donut + Bar -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- Donut Tunai vs Kartu -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Perbandingan Tunai vs Kartu</p>
            <PopUp name="produk" :data="produkData" filename="tunai_vs_kartu" />
          </div>
          <div id="chart-container-produk" class="h-64">
            <Doughnut :data="produkChartData" :options="doughnutOptions" />
          </div>
        </div>

        <!-- Bar Perbandingan Region -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <div class="flex justify-between items-center mb-4">
            <p class="font-semibold text-gray-700">Perbandingan Transaksi tiap RO</p>
            <PopUp name="per_region" :data="regionData" filename="transaksi_per_region" />
          </div>
          <div id="chart-container-per_region" class="h-64">
            <Bar :data="regionChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Pareto Top 10 Produk -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
          <p class="font-semibold text-gray-700">Top 10 Produk (Pareto)</p>
          <div class="flex items-center gap-2">
            <div class="w-64">
              <Dropdown
                v-model="paretoMetric"
                :options="paretoMetricOptions"
                labelKey="label"
                valueKey="value"
                placeholder="Pilih Metric"
              />
            </div>
            <PopUp name="pareto" :data="paretoData" filename="top_10_produk" />
          </div>
        </div>
        <div id="chart-container-pareto" class="h-80">
          <ParetoChart :data="paretoData" :metric="paretoMetric" />
        </div>
      </div>

      <!-- Traffic Chart -->
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="hidden md:flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">
            Traffic Transaksi
            <span v-if="selectedDates.length" class="text-sm font-normal text-gray-400">
              - per {{ selectedInterval }} jam
            </span>
          </p>
          <div class="flex items-center gap-2">
            <div class="w-48">
              <DatePicker v-model="selectedDates" />
            </div>
            <div class="w-32">
              <Dropdown
                v-model="selectedInterval"
                :options="intervalOptions"
                labelKey="label"
                valueKey="value"
                placeholder="Interval"
              />
            </div>
            <PopUp name="traffic" :data="trafficData" filename="traffic_transaksi" />
          </div>
        </div>
        <div class="md:hidden mb-4">
          <div class="flex justify-between items-center mb-3">
            <p class="font-semibold text-gray-700">Traffic Transaksi</p>
            <PopUp name="traffic" :data="trafficData" filename="traffic_transaksi" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <DatePicker v-model="selectedDates" />
            <Dropdown
              v-model="selectedInterval"
              :options="intervalOptions"
              labelKey="label"
              valueKey="value"
              placeholder="Interval"
            />
          </div>
        </div>
        <div id="chart-container-traffic" class="h-90">
          <Line :data="trafficChartData" :options="trafficOptions" />
        </div>
      </div>

      <!-- Tabel Top Agen -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex justify-between items-center mb-4">
          <p class="font-semibold text-gray-700">Top Agen Berdasarkan Jumlah Transaksi</p>
          <PopUp
            name="top_transaksi_agen"
            :fetchData="fetchAllTopAgen"
            filename="top_transaksi_agen"
            :is-table="true"
          />
        </div>
        <div id="chart-container-top_transaksi_agen" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-[#00A69F] text-white">
                <th class="px-4 py-3 text-left rounded-tl-lg">#</th>
                <th class="px-4 py-3 text-left">Agent Name</th>
                <th class="px-4 py-3 text-left">Agent Code</th>
                <th class="px-4 py-3 text-left">Nama Outlet</th>
                <th class="px-4 py-3 text-left">Area</th>
                <th class="px-4 py-3 text-left">Region</th>
                <th
                  @click="toggleSort('total_transaksi')"
                  class="px-4 py-3 text-right cursor-pointer"
                >
                  Total Transaksi
                  <span>{{
                    sortKey === 'total_transaksi' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
                <th @click="toggleSort('total_volume')" class="px-4 py-3 text-right cursor-pointer">
                  Volume
                  <span>{{
                    sortKey === 'total_volume' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
                <th
                  @click="toggleSort('avg_amount')"
                  class="px-4 py-3 text-right cursor-pointer rounded-tr-lg"
                >
                  Avg Amount
                  <span>{{
                    sortKey === 'avg_amount' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'
                  }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(agen, i) in paginatedAgen"
                :key="agen.agent_code + i"
                :class="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
                class="hover:bg-teal-50 transition"
              >
                <td class="px-4 py-3 text-gray-400">
                  {{ (currentPage - 1) * itemsPerPage + i + 1 }}
                </td>
                <td class="px-4 py-3 font-medium text-gray-800">{{ agen.agent_name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.agent_code }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.nama_outlet }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.area }}</td>
                <td class="px-4 py-3 text-gray-500">{{ agen.region }}</td>
                <td class="px-4 py-3 text-right font-semibold">
                  {{ formatCount(agen.total_transaksi) }}
                </td>
                <td class="px-4 py-3 text-right text-[#00A69F] font-semibold">
                  {{ formatVolume(agen.total_volume) }}
                </td>
                <td class="px-4 py-3 text-right text-[#F7941D] font-semibold">
                  {{ formatVolume(agen.avg_amount) }}
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
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>
            <span class="text-sm text-gray-400 font-medium"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm border bg-[#00A69F] text-white border-gray-200 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
