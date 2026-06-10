<script setup>
import { ref, computed, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Pilih Tanggal' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const pendingDate = ref(props.modelValue ? new Date(props.modelValue) : null)

// Sync pending dengan modelValue saat berubah dari luar
watch(
  () => props.modelValue,
  (val) => {
    pendingDate.value = val ? new Date(val) : null
  },
)

const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder
  return new Date(props.modelValue).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

const handleDayClick = (day) => {
  pendingDate.value = new Date(day.id)
}

const applyDate = () => {
  if (pendingDate.value) {
    const yyyy = pendingDate.value.getFullYear()
    const mm = String(pendingDate.value.getMonth() + 1).padStart(2, '0')
    const dd = String(pendingDate.value.getDate()).padStart(2, '0')
    emit('update:modelValue', `${yyyy}-${mm}-${dd}`)
  }
  isOpen.value = false
}

const clearDate = () => {
  pendingDate.value = null
  emit('update:modelValue', '')
  isOpen.value = false
}

const cancelDate = () => {
  // Reset pending ke value asli
  pendingDate.value = props.modelValue ? new Date(props.modelValue) : null
  isOpen.value = false
}

const attributes = computed(() => {
  if (!pendingDate.value) return []
  return [
    {
      highlight: { color: 'teal', fillMode: 'solid' },
      dates: [pendingDate.value],
    },
  ]
})
</script>

<template>
  <div class="relative">
    <!-- Trigger -->
    <div
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#00A69F] transition text-sm"
      :class="isOpen ? 'border-[#00A69F] ring-1 ring-[#00A69F]' : ''"
    >
      <span :class="!modelValue ? 'text-gray-400' : 'text-gray-700'" class="truncate">
        {{ displayText }}
      </span>
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="modelValue"
          @click.stop="clearDate"
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
      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 p-2 border-t border-gray-100">
        <button
          @click="cancelDate"
          class="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
        >
          Batal
        </button>
        <button
          @click="applyDate"
          :disabled="!pendingDate"
          class="px-4 py-1.5 text-sm bg-[#00A69F] text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          OK
        </button>
      </div>
    </div>

    <!-- Mobile Full Screen Modal -->
    <Teleport to="body">
      <div v-if="isOpen" class="md:hidden fixed inset-0 z-[100] flex flex-col bg-white">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
          style="background: linear-gradient(to right, #00a69f, #f7941d)"
        >
          <p class="text-white font-semibold">{{ placeholder }}</p>
          <button @click="cancelDate" class="text-white p-1">
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
        <div class="flex-1 overflow-auto flex items-start justify-center pt-4">
          <DatePicker
            :attributes="attributes"
            @dayclick="handleDayClick"
            color="teal"
            :first-day-of-week="1"
            expanded
          />
        </div>
        <div class="flex gap-2 p-3 border-t border-gray-100">
          <button
            @click="cancelDate"
            class="flex-1 px-3 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg"
          >
            Batal
          </button>
          <button
            @click="applyDate"
            :disabled="!pendingDate"
            class="flex-1 px-3 py-2.5 text-sm bg-[#00A69F] text-white rounded-lg disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
