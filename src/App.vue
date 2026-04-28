<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import SideBar from './components/SideBar.vue'

const route = useRoute()
const authStore = useAuthStore()
const sidebarRef = ref(null)

const showSideBar = computed(() => route.name !== 'login' && route.name !== 'register')

onMounted(() => {
  authStore.initFromStorage()
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <SideBar v-if="showSideBar" ref="sidebarRef" />

    <div class="flex-1 overflow-auto">
      <!-- Mobile topbar -->
      <div
        v-if="showSideBar"
        class="md:hidden flex items-center gap-3 bg-[#00A39D] px-4 py-3 shadow-sm"
      >
        <button @click="sidebarRef.isMobileOpen = true" class="p-1.5 rounded-lg hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <line x1="3" y1="6" x2="21" y2="6" stroke-width="2" stroke-linecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" stroke-width="2" stroke-linecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <img src="@/assets/img/logo.png" alt="BSI" class="h-8 object-contain" />
      </div>

      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
