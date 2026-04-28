<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

const props = defineProps({
  data: { type: Array, default: () => [] },
})

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

const chartData = computed(() => ({
  labels: props.data.map((d) => d.produk),
  datasets: [
    {
      type: 'bar',
      label: 'Volume Transaksi',
      data: props.data.map((d) => d.volume_transaksi),
      backgroundColor: '#00A69F',
      yAxisID: 'y',
      order: 2,
    },
    {
      type: 'line',
      label: 'total %',
      data: props.data.map((d) => d.total_persentase),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#f59e0b',
      pointRadius: 4,
      fill: false,
      yAxisID: 'y2',
      order: 1,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          if (ctx.dataset.type === 'line') {
            return `total: ${ctx.raw}%`
          }
          return `Volume: ${formatVolume(ctx.raw)}`
        },
      },
    },
  },
  scales: {
    y: {
      type: 'linear',
      position: 'left',
      ticks: {
        callback: (val) => formatVolume(val),
      },
      grid: { color: '#f1f5f9' },
    },
    y2: {
      type: 'linear',
      position: 'right',
      min: 0,
      max: 100,
      ticks: {
        callback: (val) => `${val}%`,
      },
      grid: { drawOnChartArea: false },
    },
  },
}))

// Export CSV
const exportCSV = () => {
  if (!props.data.length) return
  const headers = ['Produk', 'Volume Transaksi', 'Jumlah Transaksi', 'Persentase', 'total %']
  const rows = props.data.map((d) =>
    [d.produk, d.volume_transaksi, d.jumlah_transaksi, d.persentase, d.total_persentase].join(','),
  )
  const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `pareto_produk_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

const isMenuOpen = ref(false)
const handleClickOutside = (e) => {
  if (!e.target.closest('#pareto-menu')) isMenuOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
</script>

<template>
  <div>
    <!-- Chart -->
    <!-- <div class="h-72 mb-6">
      <Bar :data="chartData" :options="chartOptions" />
    </div> -->

    <!-- Tabel -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-[#00A69F] text-white">
            <th class="px-4 py-3 text-left rounded-tl-lg">#</th>
            <th class="px-4 py-3 text-left">Produk</th>
            <th class="px-4 py-3 text-right">Volume Transaksi</th>
            <th class="px-4 py-3 text-right">Jumlah Transaksi</th>
            <th class="px-4 py-3 text-right">Persentase</th>
            <th class="px-4 py-3 text-right rounded-tr-lg">total %</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in data"
            :key="item.produk"
            :class="i % 2 === 0 ? 'bg-gray-50' : 'bg-white'"
            class="hover:bg-teal-50 transition"
          >
            <td class="px-4 py-3 text-gray-400">{{ i + 1 }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.produk }}</td>
            <td class="px-4 py-3 text-right font-semibold text-[#00A69F]">
              {{ formatVolume(item.volume_transaksi) }}
            </td>
            <td class="px-4 py-3 text-right text-gray-500">
              {{ formatCount(item.jumlah_transaksi) }}
            </td>
            <td class="px-4 py-3 text-right text-gray-500">{{ item.persentase }}%</td>
            <td class="px-4 py-3 text-right">
              <span
                class="font-semibold"
                :class="item.total_persentase >= 80 ? 'text-amber-500' : 'text-gray-700'"
              >
                {{ item.total_persentase }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
