// src/services/permissionService.js

import apiClient from './apiClient'

const permissionService = {
  /**
   * جلب قائمة بجميع الصلاحيات المتاحة في النظام
   * @returns {Promise}
   */
  getPermissions() {
    return apiClient.get('/permissions')
  },
}

export default permissionService
