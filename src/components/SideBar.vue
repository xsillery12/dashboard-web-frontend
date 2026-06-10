<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const openMenus = ref([])

const toggleMenu = (menuKey) => {
  if (openMenus.value.includes(menuKey)) {
    openMenus.value = openMenus.value.filter((k) => k !== menuKey)
  } else {
    openMenus.value.push(menuKey)
  }
}

const isMenuOpen = (menuKey) => openMenus.value.includes(menuKey)

const menus = [
  {
    key: 'home',
    name: 'Home',
    path: '/home',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="25" height="25">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`,
  },
  {
    key: 'dashboard',
    name: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="25" height="25">
      <rect x="3" y="13" width="6" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="9" y="8" width="6" height="12" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="15" y="5" width="6" height="15" rx="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="3" y1="20" x2="21" y2="20" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    children: [
      { name: 'Agen', path: '/dashboard/monitoring-agen' },
      { name: 'Transaksi Agen', path: '/dashboard/transaksi' },
      { name: 'Heartbeat EDC', path: '/dashboard/heartbeat' },
    ],
  },
  {
    key: 'upload',
    name: 'Upload Data',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="25" height="25">
      <path d="M6 16 Q3 16 3 12 Q3 7 8 7 Q8 3 12 3 Q16 3 17 8 Q21 8 21 12 Q21 16 18 16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="21" x2="12" y2="11" stroke-width="1.5" stroke-linecap="round"/>
      <polyline points="8,15 12,11 16,15" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    children: [
      { name: 'Data Monitoring Agen', path: '/upload/agen' },
      { name: 'Data Transaksi Agen', path: '/upload/transaksi' },
      { name: 'Data Heartbeat EDC', path: '/upload/heartbeat' },
    ],
  },
]

const navigateTo = (path) => {
  router.push(path)
  isMobileOpen.value = false
}

const isChildActive = (children) => {
  return children.some((child) => route.path === child.path)
}

const showLogoutModal = ref(false)

// const handleLogout = () => {
//   authStore.logout()
//   router.push('/login')
// }

const confirmLogout = () => {
  authStore.logout()
  router.push('/login')
}

defineExpose({ isMobileOpen })
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
      'fixed top-0 left-0 h-screen w-64 flex flex-col shadow-xl z-50 transition-transform duration-300 md:hidden',
      isMobileOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
    style="background: linear-gradient(to bottom, #00a69f 32%, #f7941d 100%)"
  >
    <!-- Logo -->
    <div class="flex items-center px-4 py-4 border-b border-white/20">
      <img src="../assets/img/logo.png" alt="Logo BSI" class="h-12 object-contain" />
    </div>

    <!-- Menu Mobile -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <div v-for="menu in menus" :key="menu.key">
        <!-- Menu tanpa children (langsung navigate) -->
        <button
          v-if="!menu.children"
          @click="navigateTo(menu.path)"
          :class="[
            'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition text-md font-medium',
            route.path === menu.path
              ? 'bg-[#f7941d] text-white'
              : 'text-white hover:bg-[#f7941d] hover:text-white',
          ]"
        >
          <span class="shrink-0" v-html="menu.icon"></span>
          <span class="flex-1 text-left truncate">{{ menu.name }}</span>
        </button>

        <!-- Menu dengan children (dropdown) -->
        <template v-else>
          <button
            @click="toggleMenu(menu.key)"
            :class="[
              'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition text-md font-medium',
              isChildActive(menu.children)
                ? 'bg-[#f7941d] text-white'
                : 'text-white hover:bg-[#f7941d] hover:text-white',
            ]"
          >
            <span class="shrink-0" v-html="menu.icon"></span>
            <span class="flex-1 text-left truncate">{{ menu.name }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 transition-transform shrink-0"
              :class="isMenuOpen(menu.key) ? 'rotate-180' : ''"
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
          </button>

          <!-- Children -->
          <div v-if="isMenuOpen(menu.key)" class="ml-4 mt-1 space-y-1 pl-3">
            <button
              v-for="child in menu.children"
              :key="child.path"
              @click="navigateTo(child.path)"
              :class="[
                'w-full flex items-center gap-4 px-3 py-3 rounded-lg transition text-sm font-medium mt-2',
                route.path === child.path
                  ? 'bg-[#f7941d] text-white'
                  : 'text-white hover:bg-[#f7941d] hover:text-white',
              ]"
            >
              <span class="truncate">{{ child.name }}</span>
            </button>
          </div>
        </template>
      </div>
    </nav>

    <!-- Profile Mobile — tetap sama -->
    <div class="px-2 py-3 border-t border-white/20">
      <div class="flex items-center gap-3 px-3 py-2">
        <img src="../assets/img/user.png" class="w-5 h-5 rounded-lg object-cover shrink-0" />
        <div class="overflow-hidden">
          <p class="text-white text-xs font-semibold truncate">{{ authStore.userName }}</p>
          <p class="text-teal-200 text-xs truncate">{{ authStore.userEmail }}</p>
        </div>
        <button
          @click="handleLogout"
          title="Logout"
          class="p-1.5 ml-10 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition"
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
      'h-screen sticky top-0 hidden md:flex flex-col transition-all duration-300 shadow-xl z-50',
      isCollapsed ? 'w-16' : 'w-56',
    ]"
    style="background: linear-gradient(to bottom, #00a69f 30%, #f7941d 100%)"
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
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <div v-for="menu in menus" :key="menu.key">
        <button
          v-if="!menu.children"
          @click="navigateTo(menu.path)"
          :title="isCollapsed ? menu.name : ''"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium cursor-pointer',
            route.path === menu.path
              ? 'bg-[#f7941d] backdrop-blur-lg text-white'
              : 'text-white hover:bg-[#f7941d] hover:backdrop-blur-sm hover:text-white',
          ]"
        >
          <span class="shrink-0" v-html="menu.icon"></span>
          <span v-if="!isCollapsed" class="flex-1 text-left truncate">{{ menu.name }}</span>
        </button>

        <!-- Parent Menu -->
        <template v-else>
          <button
            @click="isCollapsed ? navigateTo(menu.children[0].path) : toggleMenu(menu.key)"
            :title="isCollapsed ? menu.name : ''"
            :class="[
              'w-full flex items-center gap-4 px-3 py-3 rounded-xl transition text-md font-medium mt-2 cursor-pointer',
              isChildActive(menu.children)
                ? 'bg-[#f7941d] backdrop-blur-lg text-white'
                : 'text-white hover:bg-[#f7941d] hover:backdrop-blur-sm hover:text-white',
            ]"
          >
            <span class="shrink-0" v-html="menu.icon"></span>
            <span v-if="!isCollapsed" class="flex-1 text-left truncate">{{ menu.name }}</span>
            <!-- Arrow -->
            <svg
              v-if="!isCollapsed"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 transition-transform shrink-0"
              :class="isMenuOpen(menu.key) ? 'rotate-180' : ''"
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
          </button>

          <!-- Children -->
          <div v-if="!isCollapsed && isMenuOpen(menu.key)" class="ml-4 mt-1 space-y-1 pl-3">
            <button
              v-for="child in menu.children"
              :key="child.path"
              @click="navigateTo(child.path)"
              :class="[
                'w-full flex items-center gap-4 px-3 py-3 rounded-lg transition text-sm font-medium mt-2 cursor-pointer',
                route.path === child.path
                  ? 'bg-[#f7941d]/50 backdrop-blur-xl text-white'
                  : 'text-white hover:bg-[#f7941d]/50 hover:backdrop-blur-xl hover:text-white',
              ]"
            >
              <span class="truncate">{{ child.name }}</span>
            </button>
          </div>
        </template>
      </div>
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
          @click="showLogoutModal = true"
          title="Logout"
          class="p-1.5 ml-4 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white transition shrink-0 cursor-pointer"
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

        <!-- Modal Konfirmasi Logout -->
        <div
          v-if="showLogoutModal"
          class="fixed inset-0 bg-black/50 z-100 flex items-center justify-center"
        >
          <div class="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4">
            <div class="text-center mb-4">
              <div
                class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 text-red-500"
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
              </div>
              <h3 class="text-gray-800 font-semibold text-lg">Konfirmasi Logout</h3>
              <p class="text-gray-500 text-sm mt-1">
                Apakah kamu yakin ingin keluar dari dashboard?
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="showLogoutModal = false"
                class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-[#00a69f] hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                @click="confirmLogout()"
                class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
