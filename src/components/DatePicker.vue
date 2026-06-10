<script setup>
import { ref, computed } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const selectedDates = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const displayText = computed(() => {
  if (!selectedDates.value.length) return 'Pilih Tanggal'
  if (selectedDates.value.length === 1) {
    return new Date(selectedDates.value[0]).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  return `${selectedDates.value.length} tanggal dipilih`
})

const handleDayClick = (day) => {
  const dateStr = day.id // format YYYY-MM-DD
  const current = [...selectedDates.value]
  const idx = current.indexOf(dateStr)
  if (idx === -1) {
    current.push(dateStr)
  } else {
    current.splice(idx, 1)
  }
  current.sort()
  emit('update:modelValue', current)
}

const clearAll = () => {
  emit('update:modelValue', [])
  isOpen.value = false
}

// Highlight selected dates
const attributes = computed(() => [
  {
    highlight: { color: 'teal', fillMode: 'solid' },
    dates: selectedDates.value.map((d) => new Date(d)),
  },
])
</script>

<template>
  <div class="relative" ref="pickerRef">
    <!-- Trigger -->
    <div
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#00A69F] transition text-sm"
      :class="isOpen ? 'border-[#00A69F] ring-1 ring-[#00A69F]' : ''"
    >
      <span :class="!selectedDates.length ? 'text-gray-400' : 'text-gray-700'" class="truncate">
        {{ displayText }}
      </span>
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="selectedDates.length"
          @click.stop="clearAll"
          class="text-gray-400 hover:text-gray-600 p-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Desktop Calendar Popup -->
    <div
      v-if="isOpen"
      class="hidden md:block absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-100"
    >
      <DatePicker
        :attributes="attributes"
        @dayclick="handleDayClick"
        color="teal"
        :first-day-of-week="1"
      />
      <div class="px-3 pb-3 mt-2 flex justify-between items-center">
        <span class="text-xs text-gray-400">
          {{ selectedDates.length }} tanggal dipilih
          <span v-if="selectedDates.length > 7" class="text-orange-500 font-medium">
            (agregasi per minggu)
          </span>
        </span>
        <button
          @click="isOpen = false"
          class="text-xs px-3 py-1.5 bg-[#00A69F] text-white rounded-lg"
        >
          Selesai
        </button>
      </div>
    </div>

    <!-- Mobile Full Screen Modal -->
    <Teleport to="body">
      <div v-if="isOpen" class="md:hidden fixed inset-0 z-[100] flex flex-col bg-white">
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
          style="background: linear-gradient(to right, #00a69f, #f7941d)"
        >
          <p class="text-white font-semibold">Pilih Tanggal</p>
          <button @click="isOpen = false" class="text-white p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Calendar -->
        <div class="flex-1 overflow-auto flex items-start justify-center pt-4">
          <DatePicker
            :attributes="attributes"
            @dayclick="handleDayClick"
            color="teal"
            :first-day-of-week="1"
            expanded
          />
        </div>

        <!-- Footer -->
        <div class="px-4 py-4 border-t border-gray-100 bg-white">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm text-gray-500">
              {{ selectedDates.length }} tanggal dipilih
              <span v-if="selectedDates.length > 7" class="text-orange-500 font-medium">
                (agregasi per minggu)
              </span>
            </span>
            <button @click="clearAll" class="text-sm text-red-400 hover:text-red-600">
              Hapus Semua
            </button>
          </div>
          <!-- Selected dates chips -->
          <div
            v-if="selectedDates.length"
            class="flex flex-wrap gap-1 mb-3 max-h-20 overflow-y-auto"
          >
            <span
              v-for="d in selectedDates"
              :key="d"
              class="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200"
            >
              {{ new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}
            </span>
          </div>
          <button
            @click="isOpen = false"
            class="w-full py-3 text-white font-semibold rounded-xl"
            style="background: linear-gradient(to right, #00a69f, #f7941d)"
          >
            Terapkan
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
