import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import UploadView from '../views/UploadView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
  ],
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
    return { name: 'dashboard' }
  }
  return true
})

export default router
