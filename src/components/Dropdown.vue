<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String,
  options: Array,
  placeholder: String,
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const search = ref('')

const normalizedOptions = computed(() =>
  props.options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o)),
)

const filteredOptions = computed(() =>
  normalizedOptions.value.filter((o) => o.label.toLowerCase().includes(search.value.toLowerCase())),
)

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find((o) => o.value === props.modelValue)
  return found ? found.label : props.placeholder
})

const select = (val) => {
  emit('update:modelValue', val)
  open.value = false
  search.value = ''
}

const toggle = () => {
  open.value = !open.value
  if (open.value) search.value = ''
}
</script>

<template>
  <div class="relative" @click.stop>
    <!-- Trigger -->
    <button
      type="button"
      @click="toggle"
      class="w-full flex justify-between items-center border border-gray-200 rounded-lg px-3 py-4 text-sm bg-white hover:border-[#00A69F] transition"
      :class="modelValue ? 'text-gray-800' : 'text-black'"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <span
        class="ml-2 text-black transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        >▾</span
      >
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl"
    >
      <!-- Search -->
      <div class="px-3 pt-3 pb-2">
        <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <span class="text-black">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="Cari..."
            class="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            @click.stop
          />
        </div>
      </div>

      <!-- Options -->
      <div class="max-h-52 overflow-auto pb-2">
        <!-- Reset -->
        <div
          @click="select('')"
          class="px-4 py-2 text-sm text-black hover:bg-[#00A69F] hover:text-white cursor-pointer"
        >
          {{ placeholder }}
        </div>

        <!-- No result -->
        <div v-if="filteredOptions.length === 0" class="px-4 py-3 text-sm text-black text-center">
          Tidak ditemukan
        </div>

        <!-- Items -->
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          @click="select(opt.value)"
          class="flex justify-between items-center px-4 py-2 text-sm cursor-pointer transition"
          :class="
            opt.value === modelValue
              ? 'bg-teal-50 text-[#00A69F] font-semibold'
              : 'text-black hover:bg-[#00A69F] hover:text-white'
          "
        >
          <span>{{ opt.label }}</span>
          <span v-if="opt.value === modelValue" class="text-[#00A69F]">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>
