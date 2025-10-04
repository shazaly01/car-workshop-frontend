// src/services/catalogService.js

import apiClient from './apiClient'

const catalogService = {
  /**
   * جلب قائمة بنود الكتالوج مع دعم للبحث والتصفح
   * @param {object} params - e.g., { page: 1, search: 'oil filter', type: 'part' }
   * @returns {Promise}
   */
  getItems(params) {
    return apiClient.get('/catalog-items', { params })
  },

  /**
   * جلب بند واحد من الكتالوج
   * @param {number|string} id - معرف البند
   * @returns {Promise}
   */
  getItem(id) {
    return apiClient.get(`/catalog-items/${id}`)
  },

  /**
   * إنشاء بند جديد في الكتالوج
   * @param {object} itemData - بيانات البند
   * @returns {Promise}
   */
  createItem(itemData) {
    return apiClient.post('/catalog-items', itemData)
  },

  /**
   * تحديث بند موجود
   * @param {number|string} id - معرف البند
   * @param {object} itemData - البيانات المحدثة
   * @returns {Promise}
   */
  updateItem(id, itemData) {
    return apiClient.put(`/catalog-items/${id}`, itemData)
  },

  /**
   * حذف بند من الكتالوج
   * @param {number|string} id - معرف البند
   * @returns {Promise}
   */
  deleteItem(id) {
    return apiClient.delete(`/catalog-items/${id}`)
  },
}

export default catalogService
