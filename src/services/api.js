import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 300000,
})

// Request Interception - Attach Token Every Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Request Interception - Handle Token Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // ← Skip interceptor untuk login & refresh endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    // If 401 and not even Entry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        )

        const newToken = res.data.access_token
        localStorage.setItem('access_token', newToken)

        const authStore = useAuthStore()
        authStore.accessToken = newToken

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default {
  // Auth
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },
  getMe() {
    return api.get('/auth/me')
  },

  // Dashboard
  getStats(params = {}) {
    return api.get('/dashboard/stats', { params })
  },
  getFilters(params = {}) {
    return api.get('/dashboard/filters', { params })
  },
  getChartDevice(params = {}) {
    return api.get('/dashboard/chart/device', { params })
  },
  getChartRegion(params = {}) {
    return api.get('/dashboard/chart/region', { params })
  },
  getChartAceh(params = {}) {
    return api.get('/dashboard/chart/aceh', { params })
  },
  getChartTrend(params = {}) {
    return api.get('/dashboard/chart/trend', { params })
  },
  getMap(params = {}) {
    return api.get('/dashboard/map', { params })
  },
  getTop10(params = {}) {
    return api.get('/dashboard/top10', { params })
  },
  getAllAgen(params = {}) {
    return api.get('/dashboard/all-agen', { params })
  },
  getPareto(params = {}) {
    return api.get('/dashboard/chart/pareto', { params })
  },
  getAgenAktif(params = {}) {
    return api.get('/dashboard/stats/agen-aktif', { params })
  },
  getTransaksiFilters(params = {}) {
    return api.get('/dashboard/transaksi/filters', { params })
  },
  getTransaksiStats(params = {}) {
    return api.get('/dashboard/transaksi/stats', { params })
  },
  getTransaksiProduk(params = {}) {
    return api.get('/dashboard/transaksi/produk', { params })
  },
  getTransaksiPerRegion(params = {}) {
    return api.get('/dashboard/transaksi/per-region', { params })
  },
  getTransaksiTraffic(params = {}) {
    return api.get('/dashboard/transaksi/traffic', { params })
  },
  getTransaksiPareto(params = {}) {
    return api.get('/dashboard/transaksi/pareto', { params })
  },
  getTopTransaksiAgen(params = {}) {
    return api.get('/dashboard/transaksi/top-agen', { params })
  },
  getAllTransaksiAgen(params = {}) {
    return api.get('/dashboard/transaksi/all-agen', { params })
  },
  getHomeStats(params = {}) {
    return api.get('/dashboard/home/stats', { params })
  },
  getHomeSummary(params = {}) {
    return api.get('/dashboard/home/summary', { params })
  },
  getHomeTrend(params = {}) {
    return api.get('/dashboard/home/trend', { params })
  },
  getHomeTraffic(params = {}) {
    return api.get('/dashboard/home/traffic', { params })
  },
  getHeartbeatFilters(params = {}) {
    return api.get('/dashboard/heartbeat/filters', { params })
  },
  getHeartbeatStats(params = {}) {
    return api.get('/dashboard/heartbeat/stats', { params })
  },
  getHeartbeatChartRegion(params = {}) {
    return api.get('/dashboard/heartbeat/chart-region', { params })
  },
  getHeartbeatChartKategori(params = {}) {
    return api.get('/dashboard/heartbeat/chart-kategori', { params })
  },
  getHeartbeatMap(params = {}) {
    return api.get('/dashboard/heartbeat/map', { params })
  },
  getHeartbeatDetail(params = {}) {
    return api.get('/dashboard/heartbeat/detail', { params })
  },

  // Upload
  uploadExcel(formData, onProgress) {
    return api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = progressEvent.loaded / progressEvent.total
          onProgress(percent)
        }
      },
    })
  },
  uploadTransaksi(formData, onProgress) {
    return api.post('/upload/transaksi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = progressEvent.loaded / progressEvent.total
          onProgress(percent)
        }
      },
    })
  },
  uploadHeartbeat(formData, onProgress) {
    return api.post('/upload/heartbeat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = progressEvent.loaded / progressEvent.total
          onProgress(percent)
        }
      },
    })
  },
}
