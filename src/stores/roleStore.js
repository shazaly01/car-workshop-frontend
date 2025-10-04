// src/stores/roleStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import roleService from '@/services/roleService'
import permissionService from '@/services/permissionService' // <-- إضافة

export const useRoleStore = defineStore('roles', () => {
  // --- State ---
  const roles = ref([])
  const permissions = ref({}) // <-- إضافة: لتخزين الصلاحيات المجمعة
  const isLoading = ref(false)
  const error = ref(null)

  // --- Helper ---
  function _updateOrAddInList(updatedRole) {
    const index = roles.value.findIndex((r) => r.id === updatedRole.id)
    if (index !== -1) {
      roles.value[index] = updatedRole
    } else {
      roles.value.unshift(updatedRole)
    }
  }

  // --- Actions ---

  async function fetchRoles() {
    isLoading.value = true
    error.value = null
    try {
      const response = await roleService.getRoles()
      roles.value = response.data.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء جلب الأدوار.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  // <-- إضافة: دالة لجلب الصلاحيات -->
  async function fetchPermissions() {
    // لا داعي لـ isLoading هنا لأنه تحميل في الخلفية
    try {
      const response = await permissionService.getPermissions()
      permissions.value = response.data
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  async function addRole(roleData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await roleService.createRole(roleData)
      _updateOrAddInList(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء إضافة الدور.'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // <-- تعديل: لتحديث الاسم فقط -->
  async function editRoleName(id, roleData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await roleService.updateRole(id, roleData)
      _updateOrAddInList(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء تعديل الدور.'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // <-- إضافة: دالة لتحديث الصلاحيات فقط -->
  async function updateRolePermissions(id, permissionsIds) {
    isLoading.value = true
    error.value = null
    try {
      // الآن نستدعي الدالة الصحيحة من السيرفس
      // ونرسل البيانات بالتنسيق الذي يتوقعه الـ Backend
      const response = await roleService.updatePermissions(id, { permissions: permissionsIds })
      _updateOrAddInList(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = 'حدث خطأ أثناء تحديث الصلاحيات.'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeRole(id) {
    isLoading.value = true
    error.value = null
    try {
      await roleService.deleteRole(id)
      roles.value = roles.value.filter((role) => role.id !== id)
    } catch (err) {
      error.value = 'حدث خطأ أثناء حذف الدور.'
      console.error(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    roles,
    permissions, // <-- إضافة
    isLoading,
    error,
    fetchRoles,
    fetchPermissions, // <-- إضافة
    addRole,
    editRoleName, // <-- تعديل
    updateRolePermissions, // <-- إضافة
    removeRole,
  }
})
