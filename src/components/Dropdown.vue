<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Array], default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Pilih...' },
  multiple: { type: Boolean, default: false },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const getLabel = (opt) => (typeof opt === 'object' ? opt[props.labelKey] : opt)
const getValue = (opt) => (typeof opt === 'object' ? opt[props.valueKey] : opt)

const selectedValues = computed(() => {
  if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : []
  return props.modelValue
})

const displayText = computed(() => {
  if (props.multiple) {
    if (!selectedValues.value.length) return props.placeholder
    if (selectedValues.value.length === 1) {
      const opt = props.options.find((o) => getValue(o) === selectedValues.value[0])
      return opt ? getLabel(opt) : selectedValues.value[0]
    }
    return `${selectedValues.value.length} dipilih`
  }
  if (!props.modelValue) return props.placeholder
  const opt = props.options.find((o) => getValue(o) === props.modelValue)
  return opt ? getLabel(opt) : props.modelValue
})

const isSelected = (opt) => {
  const val = getValue(opt)
  if (props.multiple) return selectedValues.value.includes(val)
  return props.modelValue === val
}

const toggleOption = (opt) => {
  const val = getValue(opt)
  if (props.multiple) {
    const current = [...selectedValues.value]
    const idx = current.indexOf(val)
    if (idx === -1) current.push(val)
    else current.splice(idx, 1)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', val)
    isOpen.value = false
  }
}

const clearAll = () => {
  emit('update:modelValue', props.multiple ? [] : '')
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Trigger -->
    <div
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#00A69F] transition text-sm"
      :class="isOpen ? 'border-[#00A69F] ring-1 ring-[#00A69F]' : ''"
    >
      <span
        :class="displayText === placeholder ? 'text-gray-400' : 'text-gray-700'"
        class="truncate"
      >
        {{ displayText }}
      </span>
      <div class="flex items-center gap-1 flex-shrink-0">
        <!-- Clear button -->
        <button
          v-if="multiple ? selectedValues.length > 0 : modelValue"
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
        <!-- Arrow -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-gray-400 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <!-- Select All (hanya untuk multiple) -->
      <div
        v-if="multiple && options.length > 0"
        @click="
          selectedValues.length === options.length
            ? clearAll()
            : emit(
                'update:modelValue',
                options.map((o) => getValue(o)),
              )
        "
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      >
        <div
          :class="[
            'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
            selectedValues.length === options.length
              ? 'bg-[#00A69F] border-[#00A69F]'
              : 'border-gray-300',
          ]"
        >
          <svg
            v-if="selectedValues.length === options.length"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div v-else-if="selectedValues.length > 0" class="w-2 h-2 bg-[#00A69F] rounded-sm"></div>
        </div>
        <span class="text-sm font-medium text-gray-600">Pilih Semua</span>
      </div>

      <!-- Options -->
      <div
        v-for="opt in options"
        :key="getValue(opt)"
        @click="toggleOption(opt)"
        class="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 cursor-pointer transition"
      >
        <!-- Checkbox untuk multiple -->
        <div
          v-if="multiple"
          :class="[
            'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition',
            isSelected(opt) ? 'bg-[#00A69F] border-[#00A69F]' : 'border-gray-300',
          ]"
        >
          <svg
            v-if="isSelected(opt)"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <!-- Dot untuk single -->
        <div v-else class="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <div v-if="isSelected(opt)" class="w-2 h-2 rounded-full bg-[#00A69F]"></div>
        </div>
        <span class="text-sm text-gray-700">{{ getLabel(opt) }}</span>
      </div>

      <div v-if="options.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
        Tidak ada pilihan
      </div>
    </div>
  </div>
</template>
