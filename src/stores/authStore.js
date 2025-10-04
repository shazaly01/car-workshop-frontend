import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService' // <-- 1. استيراد الخدمة
import router from '@/router' // <-- 2. استيراد الراوتر

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value)

  function hasPermission(permissionName) {
    if (!user.value || !user.value.permissions) return false
    return user.value.permissions.includes(permissionName)
  }

  // --- Actions ---

  function setAuthData(userData, apiToken) {
    user.value = userData
    token.value = apiToken
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', apiToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // لا تقم بإعادة التوجيه من هنا، بل من المكان الذي تم استدعاء الدالة فيه
  }

  // --- [الإضافة الجديدة] ---
  async function handleLogin(credentials) {
    // ببساطة قم بتنفيذ المنطق مباشرة
    const response = await authService.login(credentials)
    const apiToken = response.data.token
    const userData = response.data.user

    setAuthData(userData, apiToken)

    await router.push({ name: 'dashboard' })
  }
  // --- [نهاية الإضافة] ---

  return {
    token,
    user,
    isAuthenticated,
    setAuthData,
    logout,
    handleLogin, // <-- 3. تصدير الدالة
    hasPermission,
  }
})
