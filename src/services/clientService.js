// src/services/clientService.js

import apiClient from './apiClient'

const clientService = {
  /**
   * جلب قائمة العملاء مع دعم للبحث والتصفح
   * @param {object} params - e.g., { page: 1, search: 'John Doe' }
   * @returns {Promise}
   */
  getClients(params) {
    return apiClient.get('/clients', { params })
  },

  /**
   * جلب عميل واحد مع بياناته المرتبطة (سيارات، أوامر عمل)
   * @param {number|string} id - معرف العميل
   * @returns {Promise}
   */
  getClient(id) {
    // نفترض أن الـ API يدعم تحميل العلاقات
    return apiClient.get(`/clients/${id}`, {
      params: { include: 'vehicles.openWorkOrder' },
    })
  },

  /**
   * إنشاء عميل جديد
   * @param {object} clientData - بيانات العميل
   * @returns {Promise}
   */
  createClient(clientData) {
    return apiClient.post('/clients', clientData)
  },

  /**
   * تحديث بيانات عميل موجود
   * @param {number|string} id - معرف العميل
   * @param {object} clientData - البيانات المحدثة
   * @returns {Promise}
   */
  updateClient(id, clientData) {
    return apiClient.put(`/clients/${id}`, clientData)
  },

  /**
   * حذف عميل
   * @param {number|string} id - معرف العميل
   * @returns {Promise}
   */
  deleteClient(id) {
    return apiClient.delete(`/clients/${id}`)
  },
}

export default clientService
