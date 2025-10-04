// src/services/vehicleService.js

import apiClient from './apiClient'

const vehicleService = {
  /**
   * جلب قائمة السيارات
   * @param {object} params - e.g., { page: 1, client_id: 5 }
   * @returns {Promise}
   */
  getVehicles(params) {
    return apiClient.get('/vehicles', { params })
  },

  /**
   * جلب سيارة واحدة
   * @param {number|string} id - معرف السيارة
   * @returns {Promise}
   */
  getVehicle(id) {
    return apiClient.get(`/vehicles/${id}`, { params: { include: 'client' } })
  },

  /**
   * إنشاء سيارة جديدة
   * @param {object} vehicleData - بيانات السيارة
   * @returns {Promise}
   */
  createVehicle(vehicleData) {
    return apiClient.post('/vehicles', vehicleData)
  },

  /**
   * تحديث سيارة
   * @param {number|string} id - معرف السيارة
   * @param {object} vehicleData - البيانات المحدثة
   * @returns {Promise}
   */
  updateVehicle(id, vehicleData) {
    return apiClient.put(`/vehicles/${id}`, vehicleData)
  },

  /**
   * حذف سيارة
   * @param {number|string} id - معرف السيارة
   * @returns {Promise}
   */
  deleteVehicle(id) {
    return apiClient.delete(`/vehicles/${id}`)
  },
}

export default vehicleService
