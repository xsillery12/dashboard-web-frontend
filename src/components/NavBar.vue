<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'

onMounted(() => {
  initFlowbite()
})

const router = useRouter()
const route = useRoute()

const menus = ref([
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Upload', path: '/upload' },
])

const isMenuOpen = ref(false)

const navigateTo = (path) => {
  router.push(path)
  isMenuOpen.value = false
}
</script>

<template>
  <nav
    class="w-full bg-linear-to-r from-teal-600 to-teal-400 drop-shadow-md px-6 py-3 flex items-center justify-between"
  >
    <!-- Bagian Kiri -->

    <div class="flex items-center gap-6">
      <!-- <button class="md:hidden">☰</button> -->

      <!-- Logo BSI -->
      <div>
        <img src="../assets/img/logo.png" alt="Logo" class="w-32 md:w-40" />
      </div>

      <ul
        class="hidden md:flex items-center text-gray-500 font-medium border border-gray-200 rounded-xl px-4 py-3"
      >
        <li
          v-for="item in menus"
          :key="item.name"
          @click="navigateTo(item.path)"
          class="px-4 flex items-center gap-2 cursor-pointer transition"
          :class="
            route.path === item.path ? 'text-white font-semibold' : 'text-white hover:text-black'
          "
        >
          <span v-if="route.path === item.path" class="w-1 h-1 bg-white rounded-full"></span>
          {{ item.name }}
        </li>
      </ul>
    </div>

    <!-- Bagian Kanan -->
    <div class="flex items-center gap-4">
      <!-- Notification -->
      <button
        class="w-9 h-9 flex items-center justify-center border border-white rounded-lg relative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          class="w-6 h-6 text-white hover:text-black"
          fill="currentColor"
        >
          <path
            d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"
          />
        </svg>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- Search -->
      <div class="relative hidden md:block">
        <!-- ICON -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          class="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="currentColor"
        >
          <path
            d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
          />
        </svg>

        <!-- INPUT -->
        <input
          type="text"
          placeholder="Search..."
          class="pl-10 pr-4 py-2 border text-white border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white w-full"
        />
      </div>

      <!-- Profile -->
      <div class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <button
          type="button"
          class="flex text-sm bg-neutral-primary rounded-xl md:me-0 focus:ring-4 focus:ring-neutral-tertiary"
          id="user-menu-button"
          aria-expanded="false"
          data-dropdown-toggle="user-dropdown"
          data-dropdown-placement="bottom"
          data-dropdown-offset-distance="10"
        >
          <span class="sr-only">Open user menu</span>
          <img
            class="w-9.5 h-9.5 rounded-xl"
            src="../assets/img/profile-picture-5.jpg"
            alt="user photo"
          />
        </button>
        <!-- Dropdown menu -->
        <div class="z-50 hidden bg-white rounded-md shadow-lg w-44" id="user-dropdown">
          <div class="px-4 py-3 text-sm border-default">
            <span class="block text-heading font-medium">Joseph McFall</span>
            <span class="block text-body truncate">name@flowbite.com</span>
          </div>
          <ul class="p-2 text-sm text-body font-medium" aria-labelledby="user-menu-button">
            <li>
              <a
                href="#"
                class="inline-flex items-center w-full px-3 py-2 hover:bg-red-500 hover:text-white rounded"
                >Sign out</a
              >
            </li>
          </ul>
        </div>
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-base md:hidden hover:bg-neutral-secondary-soft"
        >
          <span class="sr-only">Open main menu</span>
          <svg
            class="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="M5 7h14M5 12h14M5 17h14"
            />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <div
    :class="[
      'md:hidden top-0 left-0 w-full drop-shadow-md z-50 px-6 py-1 pb-4 bg-white rounded-b-lg',
      isMenuOpen ? 'block' : 'hidden',
    ]"
  >
    <ul class="flex flex-col gap-3 text-gray-600 font-medium mt-5">
      <li
        v-for="item in menus"
        :key="item.name"
        class="cursor-pointer hover:bg-[#00A69F] hover:text-white rounded-lg px-2 py-2 transition"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
