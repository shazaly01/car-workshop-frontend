// src/services/roleService.js

import apiClient from './apiClient'

const roleService = {
  /**
   * جلب قائمة بجميع الأدوار
   * @returns {Promise}
   */
  getRoles() {
    return apiClient.get('/roles')
  },

  /**
   * إنشاء دور جديد
   * @param {object} roleData - بيانات الدور (e.g., { name: 'New Role', permissions: [1, 2, 3] })
   * @returns {Promise}
   */
  createRole(roleData) {
    return apiClient.post('/roles', roleData)
  },

  /**
   * تحديث دور موجود (الاسم فقط)
   * @param {number|string} id - معرف الدور
   * @param {object} roleData - { name: 'New Name' }
   * @returns {Promise}
   */
  updateRole(id, roleData) {
    return apiClient.put(`/roles/${id}`, roleData)
  },

  /**
   * [إضافة جديدة] تحديث صلاحيات دور موجود
   * @param {number|string} id - معرف الدور
   * @param {object} permissionsData - { permissions: [1, 2, 3] }
   * @returns {Promise}
   */
  updatePermissions(id, permissionsData) {
    return apiClient.put(`/roles/${id}/permissions`, permissionsData)
  },

  /**
   * حذف دور
   * @param {number|string} id - معرف الدور
   * @returns {Promise}
   */
  deleteRole(id) {
    return apiClient.delete(`/roles/${id}`)
  },
}

export default roleService
