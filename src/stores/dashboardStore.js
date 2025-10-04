// src/stores/dashboardStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/apiClient' // نفترض أن هذا هو ملف axios instance

export const useDashboardStore = defineStore('dashboard', () => {
  // --- State ---
  const stats = ref({
    work_orders_in_progress: 0,
    pending_invoices: 0,
    work_orders_completed_today: 0,
  })
  const latestWorkOrders = ref([])
  const topClients = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/dashboard')
      const data = response.data

      // تعبئة الحالة بالبيانات الحقيقية
      stats.value = data.stats
      latestWorkOrders.value = data.latest_work_orders
      topClients.value = data.top_clients
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      error.value = 'فشل في جلب بيانات لوحة التحكم.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    stats,
    latestWorkOrders,
    topClients,
    isLoading,
    error,
    fetchDashboardData,
  }
})
