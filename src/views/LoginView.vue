<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  event?.preventDefault()

  if (!email.value || !password.value) {
    error.value = 'Email atau Password Harus Diisi'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/home')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Email atau Password Salah'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Left Panel -->
    <div
      class="hidden lg:flex w-1/2 bg-[#00A69F] flex-col items-center justify-center p-12 relative overflow-hidden"
    >
      <!-- Background Decoration -->
      <div
        class="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
      ></div>
      <div
        class="absolute top-1/2 right-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
      ></div>

      <!-- Content -->
      <div class="relative z-10 text-center">
        <img src="../assets/img/logo.png" alt="Logo BSI" class="h-16 object-contain mx-auto mb-8" />
        <h1 class="text-3xl font-bold text-white mb-4">Dashboard Monitoring BSI Agen</h1>
        <p class="text-lg text-teal-100 mb-8 max-w-md">
          Platform Monitoring & Analitik Bank Syariah Indonesia
        </p>

        <!-- Features -->
        <!-- <div class="space-y-3 text-left">
          <div v-for="item in features" :key="item" class="flex items-center gap-3 text-white">
            <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
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
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span class="text-sm">{{ item }}</span>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Right Panel -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-100">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <img src="../assets/img/logo-bsi.png" alt="Logo BSI" class="h-14 mx-auto mb-3" />
          <p class="text-gray-500 text-sm">Dashboard Monitoring BSI Agen</p>
        </div>
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="mb-8 text-center">
            <h2 class="text-3xl font-semibold text-black">Selamat Datang</h2>
            <p class="text-gray-500 text-sm mt-1">Masuk ke Akun BSI mu</p>
          </div>
          <!-- Error Handling -->
          <div
            v-if="error"
            class="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-red-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Email Form -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="youremail@bsi.co.id"
                @keyup.enter.prevent="handleLogin"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A69F] focus:border-transparent transition"
              />
            </div>

            <!-- Password Form -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="••••••••"
                  @keyup.enter.prevent="handleLogin"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00A69F] focus:border-transparent transition pr-12"
                />
                <button
                  @click="showPass = !showPass"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <svg
                    v-if="!showPass"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Login Submit Button -->
            <button
              type="button"
              @click.prevent="handleLogin"
              :disabled="loading"
              class="w-full bg-[#00A69F] hover:bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg
                  class="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Masuk...
              </span>
              <span v-else>Masuk</span>
            </button>
          </div>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">
          © 2026 PT. Bank Syariah Indonesia Tbk. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
