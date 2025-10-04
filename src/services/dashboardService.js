// src/services/dashboardService.js

import apiClient from './apiClient'

const dashboardService = {
  /**
   * جلب إحصائيات لوحة التحكم
   * @returns {Promise}
   */
  getStats() {
    return apiClient.get('/dashboard')
  },
}

export default dashboardService
