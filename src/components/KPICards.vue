<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  subtitle: { type: String, default: '' },
  change: { type: Number, default: null },
  comparison: { type: String, default: 'vs 30 Days' },
  borderColor: { type: String, default: '#00A69F' },
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-5 border-l-4" :style="`border-color: ${borderColor}`">
    <p class="text-xs text-gray-500 uppercase font-bold tracking-wide">{{ title }}</p>
    <p class="text-3xl font-bold text-gray-800 mt-2">{{ value }}</p>

    <!-- Change Indicator -->
    <div class="flex items-center gap-1 mt-2">
      <template v-if="change !== null">
        <span
          :class="[
            'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
            change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
          ]"
        >
          <svg
            v-if="change >= 0"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 15l7-7 7 7"
            />
          </svg>
          <!-- Icon turun -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span>{{ Math.abs(change) }}%</span>
        </span>
        <span class="text-xs text-gray-400">{{ comparison }}</span>
      </template>
      <span v-else class="text-xs text-gray-400">{{ subtitle }}</span>
    </div>
  </div>
</template>
