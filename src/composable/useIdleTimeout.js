import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useIdleTimeout(minutes = 30) {
  const router = useRouter()
  const authStore = useAuthStore()

  let idleTimer = null
  const TIMEOUT_MS = minutes * 60 * 1000

  const resetTimer = () => {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      handleLogout()
    }, TIMEOUT_MS)
  }

  const handleLogout = () => {
    alert(`Anda telah idle selama ${minutes} menit. Sesi Akan diakhiri.`)
    authStore.logout()
    router.push('/login')
  }

  const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click']

  onMounted(() => {
    resetTimer()
    events.forEach((e) => window.addEventListener(e, resetTimer))
  })

  onUnmounted(() => {
    clearTimeout(idleTimer)
    events.forEach((e) => window.removeEventListener(e, resetTimer))
  })
}
