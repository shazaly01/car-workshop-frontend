import axios from 'axios'
import { useAuthStore } from '@/stores/authStore' // سننشئ هذا المخزن لاحقًا
import router from '@/router' // استيراد الـ router لإعادة التوجيه

// 1. تحديد عنوان الـ API الأساسي من متغيرات البيئة أو استخدام قيمة افتراضية
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// 2. إنشاء نسخة axios مهيأة
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 3. معترض الطلبات: لإضافة توكن المصادقة تلقائيًا
apiClient.interceptors.request.use(
  (config) => {
    // لا يمكن استدعاء Pinia store هنا على مستوى الجذر، يجب استدعاؤه داخل الدالة
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 4. معترض الاستجابات: للتعامل مع خطأ 401 (توكن غير صالح)
apiClient.interceptors.response.use(
  (response) => {
    // أي رمز حالة يقع ضمن نطاق 2xx يسبب تشغيل هذه الدالة
    return response
  },
  (error) => {
    // أي رمز حالة يقع خارج نطاق 2xx يسبب تشغيل هذه الدالة
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      console.error('API Error 401: Unauthorized. Logging out...')

      // استدعاء دالة تسجيل الخروج من مخزن Pinia
      authStore.logout()

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push('/login')
    }

    // أرجع الخطأ ليتم التعامل معه في المكون الذي استدعى الـ API
    return Promise.reject(error)
  },
)

export default apiClient
