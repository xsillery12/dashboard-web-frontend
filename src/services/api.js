import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 300000,
})

export default {
  // Upload
  uploadExcel(formData, onProgress) {
    return api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000,
      onUploadProgress: (e) => {
        if (onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total)
          onProgress(percent)
        }
      },
    })
  },

  // Dashboard
  getStats(params = {}) {
    return api.get('/dashboard/stats', { params })
  },
  getStatsComparison(params = {}) {
    return api.get('/dashboard/stats/comparison', { params })
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
  getPareto(params = {}) {
    return api.get('/dashboard/chart/pareto', { params })
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
  login(email, password) {
    return api.post('/auth/login', { email, password })
  },
  getMe() {
    return api.get('/auth/me')
  },
  getChartTrend(params = {}) {
    return api.get('/dashboard/chart/trend', { params })
  },
  getAgenAktif(params = {}) {
    return api.get('/dashboard/stats/agen-aktif', { params })
  },
}
