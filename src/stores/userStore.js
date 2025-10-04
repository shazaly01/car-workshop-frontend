import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/apiClient' // نفترض وجود هذا الملف لإدارة طلبات API

export const useUserStore = defineStore('user', () => {
  // --- STATE (الحالة) ---
  const users = ref([])
  const roles = ref([])
  const pagination = ref({
    total: 0,
    currentPage: 1,
    perPage: 15,
    lastPage: 1,
  })
  const isLoading = ref(false)
  const error = ref(null)

  // --- ACTIONS (الإجراءات) ---

  /**
   * جلب قائمة المستخدمين من الـ API مع دعم الفلترة والـ pagination.
   * @param {object} params - بارامترات الطلب (مثل page, search).
   */
  async function fetchUsers(params = { page: 1 }) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/users', { params })
      users.value = response.data.data
      pagination.value = {
        total: response.data.meta.total,
        currentPage: response.data.meta.current_page,
        perPage: response.data.meta.per_page,
        lastPage: response.data.meta.last_page,
      }
    } catch (err) {
      error.value = err
      console.error('Failed to fetch users:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب قائمة الأدوار المتاحة من الـ API.
   */
  async function fetchRoles() {
    // لا تجلب الأدوار إذا كانت موجودة بالفعل لتجنب الطلبات المتكررة
    if (roles.value.length > 0) return

    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/roles')
      roles.value = response.data.data
    } catch (err) {
      error.value = err
      console.error('Failed to fetch roles:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب بيانات مستخدم واحد.
   * @param {string|number} id - معرف المستخدم.
   * @returns {Promise<object|null>} بيانات المستخدم.
   */
  async function fetchUser(id) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get(`/users/${id}`)
      return response.data.data
    } catch (err) {
      error.value = err
      console.error(`Failed to fetch user ${id}:`, err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إنشاء مستخدم جديد.
   * @param {object} userData - بيانات المستخدم الجديد.
   */
  async function createUser(userData) {
    isLoading.value = true
    error.value = null
    // لا حاجة لـ try/catch هنا إذا كان apiClient يعالج الأخطاء ويرجعها
    // سيتم التعامل مع الخطأ في المكون الذي يستدعي الدالة
    await apiClient.post('/users', userData)
    isLoading.value = false
  }

  /**
   * تحديث بيانات مستخدم موجود.
   * @param {string|number} id - معرف المستخدم.
   * @param {object} userData - بيانات المستخدم المحدثة.
   */
  async function updateUser(id, userData) {
    isLoading.value = true
    error.value = null
    await apiClient.put(`/users/${id}`, userData)
    isLoading.value = false
  }

  /**
   * حذف مستخدم.
   * @param {string|number} id - معرف المستخدم.
   */
  async function deleteUser(id) {
    isLoading.value = true
    error.value = null
    await apiClient.delete(`/users/${id}`)
    // بعد الحذف، أعد جلب القائمة المحدثة
    await fetchUsers({ page: pagination.value.currentPage })
    isLoading.value = false
  }

  // --- إرجاع الحالة والإجراءات ---
  return {
    users,
    roles,
    pagination,
    isLoading,
    error,
    fetchUsers,
    fetchRoles,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  }
})
