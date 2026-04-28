<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isCollapsed = ref(false)
const isMobileOpen = ref(false)

const menus = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="25" height="25">
      <rect x="3" y="13" width="6" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="9" y="8" width="6" height="12" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="15" y="5" width="6" height="15" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="3" y1="20" x2="21" y2="20" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    name: 'Upload Data',
    path: '/upload',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="25" height="25">
      <path d="M6 16 Q3 16 3 12 Q3 7 8 7 Q8 3 12 3 Q16 3 17 8 Q21 8 21 12 Q21 16 18 16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="21" x2="12" y2="11" stroke-width="1.5" stroke-linecap="round"/>
      <polyline points="8,15 12,11 16,15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
]

const navigateTo = (path) => {
  router.push(path)
  isMobileOpen.value = false
}

defineExpose({ isMobileOpen })

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <!-- ── Mobile Overlay ── -->
  <div
    v-if="isMobileOpen"
    @click="isMobileOpen = false"
    class="fixed inset-0 bg-black/40 z-40 md:hidden"
  />

  <!-- ── Mobile Drawer ── -->
  <div
    :class="[
      'fixed top-0 left-0 h-screen w-64 flex flex-col bg-[#00A69F] shadow-xl z-50 transition-transform duration-300 md:hidden',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center px-4 py-4 border-b border-white/20">
      <img src="../assets/img/logo.png" alt="Logo BSI" class="h-12 object-contain" />
    </div>
    <!-- Menu -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <button
        v-for="menu in menus"
        :key="menu.path"
        @click="navigateTo(menu.path)"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium',
          route.path === menu.path
            ? 'bg-white/20 text-white'
            : 'text-teal-100 hover:bg-white/10 hover:text-white',
        ]"
      >
        <span class="shrink-0" v-html="menu.icon"></span>
        <span class="truncate">{{ menu.name }}</span>
      </button>
    </nav>
    <!-- Profile -->
    <div class="px-2 py-3 border-t border-white/20">
      <div class="flex items-center gap-3 px-3 py-2">
        <img src="../assets/img/user.png" class="w-5 h-5 rounded-lg object-cover shrink-0" />
        <div class="overflow-hidden">
          <p class="text-white text-xs font-semibold truncate">{{ authStore.userName }}</p>
          <p class="text-teal-200 text-xs truncate">{{ authStore.userEmail }}</p>
        </div>
        <!-- Logout Button -->
        <button
          v-if="!isCollapsed"
          @click="handleLogout"
          title="Logout"
          class="p-1.5 ml-10 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition shrink-0"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Desktop Sidebar -->
  <div
    :class="[
      'h-screen sticky top-0 hidden md:flex flex-col transition-all duration-300 bg-[#00A69F] shadow-xl z-50',
      isCollapsed ? 'w-16' : 'w-56',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center px-3 py-4 border-b border-white/20">
      <img
        v-if="!isCollapsed"
        src="../assets/img/logo.png"
        alt="Logo BSI"
        class="h-12 object-contain"
      />
      <img
        v-else
        src="../assets/img/logo_bsi.png"
        alt="Logo BSI"
        class="h-11 w-11 object-contain rounded-lg"
      />
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <button
        v-for="menu in menus"
        :key="menu.path"
        @click="navigateTo(menu.path)"
        :title="isCollapsed ? menu.name : ''"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium',
          route.path === menu.path
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-teal-100 hover:bg-white/10 hover:text-white',
        ]"
      >
        <span class="shrink-0" v-html="menu.icon"></span>
        <span v-if="!isCollapsed" class="truncate">{{ menu.name }}</span>
      </button>
    </nav>

    <!-- Toggle Button -->
    <button
      @click="isCollapsed = !isCollapsed"
      class="absolute -right-3 top-8 w-6 h-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-md flex items-center justify-center transition z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
        <line
          v-if="!isCollapsed"
          x1="9"
          y1="3"
          x2="9"
          y2="21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <line
          v-else
          x1="15"
          y1="3"
          x2="15"
          y2="21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <!-- Profile -->
    <div class="px-2 py-3 border-t border-white/20">
      <div
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-xl',
          isCollapsed ? 'justify-center' : '',
        ]"
      >
        <img src="../assets/img/user.png" class="w-7 h-7 rounded-sm object-cover shrink-0" />
        <div v-if="!isCollapsed" class="flex-1 overflow-hidden">
          <p class="text-white text-xs font-semibold truncate">
            {{ authStore.userName }}
          </p>
          <p class="text-teal-200 text-xs truncate">{{ authStore.userEmail }}</p>
        </div>
        <!-- Logout Button -->
        <button
          v-if="!isCollapsed"
          @click="handleLogout"
          title="Logout"
          class="p-1.5 ml-4 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition shrink-0"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
