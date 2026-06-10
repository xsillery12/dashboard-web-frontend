<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '../services/api'

const file = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadResult = ref(null)
const errorMessage = ref(null)
const progress = ref(0)

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

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

const handleFileChange = (e) => {
  file.value = e.target.files[0]
  uploadResult.value = null
  errorMessage.value = null
}

const handleDrop = (e) => {
  isDragging.value = false
  const dropped = e.dataTransfer.files[0]
  if (dropped && (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.xls'))) {
    file.value = dropped
    uploadResult.value = null
    errorMessage.value = null
  } else {
    errorMessage.value = 'File harus format .xlsx atau .xls'
  }
}

const uploadFile = async () => {
  if (!file.value) return

  isUploading.value = true
  progress.value = 0
  uploadResult.value = null
  errorMessage.value = null

  const formData = new FormData()
  formData.append('file', file.value)

  // ← Simulasi progress saat backend processing
  let processingInterval = null

  try {
    const res = await api.uploadTransaksi(formData, (percent) => {
      // Upload progress: 0% → 50%
      progress.value = Math.round(percent * 50)

      // Saat upload selesai 100%, mulai simulasi processing
      if (percent >= 1 && !processingInterval) {
        processingInterval = setInterval(() => {
          if (progress.value < 95) {
            progress.value += 1
          }
        }, 500) // naik 1% setiap 500ms
      }
    })

    if (processingInterval) clearInterval(processingInterval)
    progress.value = 100
    uploadResult.value = res.data
  } catch (err) {
    if (processingInterval) clearInterval(processingInterval)
    errorMessage.value = err.response?.data?.detail || 'Terjadi error saat upload'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-full md:px-6">
    <!-- Header -->
    <div class="flex items-center justify-between py-2.5 border-b-2 border-gray-300 mb-6">
      <h1 class="font-semibold text-xl md:text-3xl">Upload Transaksi Agen</h1>
      <div class="text-right">
        <p class="text-sm font-semibold text-gray-700">{{ formattedDate }}</p>
        <p class="text-xl font-bold text-[#00A69F] tabular-nums">{{ formattedTime }}</p>
      </div>
    </div>

    <p class="text-gray-500 text-sm mb-6">
      Upload file Excel data transaksi agen untuk memperbarui dashboard transaksi
    </p>

    <!-- Drop Zone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition',
        isDragging ? 'border-[#00A69F] bg-teal-50' : 'border-gray-300 hover:border-[#00A69F]',
      ]"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls"
        class="hidden"
        @change="handleFileChange"
      />

      <div v-if="!file">
        <div class="text-4xl mb-3">📂</div>
        <p class="text-gray-600 font-medium">Drag & drop file Excel di sini</p>
        <p class="text-gray-400 text-sm mt-1">atau klik untuk pilih file</p>
        <p class="text-gray-300 text-xs mt-3">Format: .xlsx / .xls</p>
      </div>

      <div v-else class="text-left">
        <div class="flex items-center gap-3">
          <span class="text-3xl">📊</span>
          <div>
            <p class="font-semibold text-gray-800">{{ file.name }}</p>
            <p class="text-sm text-gray-400">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
          </div>
          <button
            @click.stop="file = null"
            class="ml-auto text-gray-400 hover:text-red-500 cursor-pointer transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="isUploading" class="mt-4">
      <div class="flex justify-between text-sm text-gray-500 mb-1">
        <span>{{ progress < 90 ? 'Mengirim file...' : 'Memproses data di server...' }}</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-[#00A69F] h-2 rounded-full transition-all duration-500"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="text-xs text-gray-400 mt-2">
        ⏳ Mohon tunggu, proses ini memakan waktu beberapa menit...
      </p>
    </div>

    <!-- Success -->
    <div v-if="uploadResult" class="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
      <p class="text-teal-700 font-semibold mb-3">✅ Data transaksi berhasil diupload!</p>
      <div class="grid grid-cols-1 gap-3">
        <div class="bg-white rounded-lg p-3 text-center shadow-sm">
          <p class="text-2xl font-bold text-[#00A69F]">
            {{ uploadResult.total_rows?.toLocaleString() }}
          </p>
          <p class="text-xs text-gray-500 mt-1">Total Baris Transaksi</p>
        </div>
      </div>
      <button
        @click="$router.push('/dashboard/transaksi')"
        class="mt-4 w-full bg-[#00A69F] text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
      >
        📊 Lihat Dashboard Transaksi →
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-600">❌ {{ errorMessage }}</p>
    </div>

    <!-- Upload Button -->
    <button
      v-if="file && !isUploading && !uploadResult"
      @click="uploadFile"
      class="mt-4 w-full bg-[#00A69F] text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition"
    >
      🔄 Proses & Upload Data Transaksi
    </button>
  </div>
</template>
