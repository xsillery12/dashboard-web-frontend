import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value)
  const userName = computed(() => user.value?.nama || '')
  const userEmail = computed(() => user.value?.email || '')
  const userFoto = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || '')

  // Action
  const login = async (email, password) => {
    const res = await api.login(email, password)
    accessToken.value = res.data.access_token
    refreshToken.value = res.data.refresh_token
    user.value = res.data.user

    // Save to LocalStorage
    localStorage.setItem('access_token', accessToken.value)
    localStorage.setItem('refresh_token', refreshToken.value)
    localStorage.setItem('user', JSON.stringify(user.value))

    return res.data
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  const initFromStorage = () => {
    // Restore data From LocalStorage
    const Token = localStorage.getItem('access_token')
    const rToken = localStorage.getItem('refresh_token')
    const userData = localStorage.getItem('user')

    if (Token) {
      accessToken.value = Token
      refreshToken.value = rToken
      user.value = userData ? JSON.parse(userData) : null
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoggedIn,
    userName,
    userEmail,
    userFoto,
    userRole,
    login,
    logout,
    initFromStorage,
  }
})
