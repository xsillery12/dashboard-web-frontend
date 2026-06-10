<script setup>
import { computed } from 'vue'
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
  metric: { type: String, default: 'count' },
})

const formatShort = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000_000_000) return `Rp${(n / 1_000_000_000_000).toFixed(1)}T`
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}Jt`
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(1)}K`
  return `Rp${n?.toLocaleString()}`
}

const chartData = computed(() => ({
  labels: props.data.map((d) => d.produk),
  datasets: [
    {
      type: 'bar',
      label: props.metric === 'volume' ? 'Total Volume' : 'Total Transaksi',
      data: props.data.map((d) => d.total),
      backgroundColor: '#00A69F',
      borderRadius: 6,
      yAxisID: 'y',
      order: 2,
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#374151',
        font: { weight: 'bold', size: 10 },
        formatter: (v) => formatShort(v),
      },
    },
    {
      type: 'line',
      label: 'Cumulative %',
      data: props.data.map((d) => d.cumulative_pct),
      borderColor: '#F7941D',
      backgroundColor: '#F7941D',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#F7941D',
      tension: 0.3,
      yAxisID: 'y2',
      order: 1,
      datalabels: {
        align: 'top',
        anchor: 'end',
        color: '#F7941D',
        font: { weight: 'bold', size: 10 },
        formatter: (v) => formatShort(v),
      },
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { padding: { top: 20, right: 20 } },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.type === 'line') return `Cumulative: ${ctx.raw}%`
            if (props.metric === 'volume') return `Volume: Rp${ctx.raw.toLocaleString()}`
            return `Total: ${ctx.raw.toLocaleString()}`
          },
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 45,
        minRotation: 30,
        font: { size: 10 },
      },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: props.metric === 'volume' ? 'Volume' : 'Jumlah' },
      grid: { color: '#f1f5f9' },
      ticks: {
        callback: (v) => formatShort(v),
      },
    },
    y1: {
      beginAtZero: true,
      max: 100,
      position: 'right',
      title: { display: true, text: 'Cumulative %' },
      grid: { drawOnChartArea: false },
      ticks: {
        callback: (v) => `${v}%`,
      },
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
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
