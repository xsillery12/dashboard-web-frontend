import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import UploadView from '../views/UploadView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/dashboard',
      redirect: '/dashboard/monitoring-agen',
    },
    {
      path: '/dashboard/monitoring-agen',
      name: 'monitoring-agen',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, title: 'Dashboard BSI Agen' },
    },
    {
      path: '/upload/agen',
      name: 'upload-agen',
      component: () => import('../views/UploadView.vue'),
      meta: { requiresAuth: true, title: 'Upload Data Monitoring Agen' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, title: 'Login - Dashboard BSI Agen' },
    },
    {
      path: '/dashboard/transaksi',
      name: 'transaksi',
      component: () => import('../views/DashboardTransaksiView.vue'),
      meta: { requiresAuth: true, title: 'Transaksi - Dashboard BSI Agen' },
    },
    {
      path: '/upload/transaksi',
      name: 'upload-transaksi',
      component: () => import('../views/UploadTransaksiView.vue'),
      meta: { requiresAuth: true, title: 'Upload Data Transaksi' },
    },
    {
      path: '/home',
      name: '/home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true, title: 'Home - Dashboard BSI Agen' },
    },
    {
      path: '/dashboard/heartbeat',
      name: 'heartbeat',
      component: () => import('../views/DashboardHeartbeatView.vue'),
      meta: { requiresAuth: true, title: 'Heartbeat EDC — BSI Agen Dashboard' },
    },
    {
      path: '/upload/heartbeat',
      name: 'upload-heartbeat',
      component: () => import('../views/UploadHeartbeatView.vue'),
      meta: { requiresAuth: true, title: 'Upload Heartbeat EDC' },
    },
  ],
})

// Dynamical Page Title
router.afterEach((to) => {
  document.title = to.meta.title
})

// Route Guard
router.beforeEach((to, from) => {
  const token = localStorage.getItem('access_token')
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !token) {
    // Not Logging In -> Redirect to Login Page
    return { name: 'login' }
  } else if (to.name === 'login' && token) {
    // Logging In -> redirect to Dashboard Page
    return { name: '/home' }
  }
  return true
})

export default router
