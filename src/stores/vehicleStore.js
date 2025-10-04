// src/stores/vehicleStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import vehicleService from '@/services/vehicleService'

export const useVehicleStore = defineStore('vehicle', () => {
  // --- State ---
  const vehicles = ref([])
  const currentVehicle = ref(null) // تم تغيير الاسم إلى currentVehicle للوضوح
  const pagination = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب قائمة السيارات (مع دعم للتصفح والفلترة)
   * @param {object} params - بارامترات مثل page, per_page, filter, etc.
   */
  async function fetchVehicles(params) {
    isLoading.value = true
    error.value = null
    try {
      const response = await vehicleService.getVehicles(params)
      vehicles.value = response.data.data
      pagination.value = response.data.meta // لتخزين معلومات التصفح
    } catch (err) {
      error.value = 'فشل في جلب بيانات السيارات.'
      console.error('Failed to fetch vehicles:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب بيانات سيارة واحدة محددة
   * @param {number} id - معرف السيارة
   */
  async function fetchVehicle(id) {
    isLoading.value = true
    error.value = null
    currentVehicle.value = null // إعادة تعيين القيمة الحالية
    try {
      const response = await vehicleService.getVehicle(id) // يفترض وجود هذه الدالة في الخدمة
      currentVehicle.value = response.data.data
      return currentVehicle.value
    } catch (err) {
      error.value = 'فشل في جلب بيانات السيارة.'
      console.error(`Failed to fetch vehicle ${id}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إنشاء سيارة جديدة
   * @param {object} data - بيانات السيارة الجديدة
   */
  async function createVehicle(data) {
    error.value = null
    try {
      const response = await vehicleService.createVehicle(data)
      // لا نضيفها إلى القائمة العامة تلقائيًا، لأن القائمة قد تكون لعميل آخر
      // المكون الذي يستدعي هذه الدالة هو المسؤول عن تحديث قائمته
      return response.data.data
    } catch (err) {
      error.value = 'فشل في إنشاء السيارة.'
      console.error('Failed to create vehicle:', err)
      throw err // إعادة رمي الخطأ للنموذج
    }
  }

  /**
   * تحديث بيانات سيارة موجودة
   * @param {number} id - معرف السيارة
   * @param {object} data - البيانات المحدثة
   */
  async function updateVehicle(id, data) {
    error.value = null
    try {
      const response = await vehicleService.updateVehicle(id, data) // يفترض وجود هذه الدالة في الخدمة
      const updatedVehicle = response.data.data

      // تحديث السيارة في القائمة العامة إذا كانت موجودة
      const index = vehicles.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        vehicles.value[index] = updatedVehicle
      }

      // تحديث السيارة الحالية إذا كانت هي التي تم تعديلها
      if (currentVehicle.value && currentVehicle.value.id === id) {
        currentVehicle.value = updatedVehicle
      }

      return updatedVehicle
    } catch (err) {
      error.value = 'فشل في تحديث بيانات السيارة.'
      console.error(`Failed to update vehicle ${id}:`, err)
      throw err // إعادة رمي الخطأ للنموذج
    }
  }

  /**
   * حذف سيارة
   * @param {number} id - معرف السيارة
   */
  async function deleteVehicle(id) {
    error.value = null
    try {
      await vehicleService.deleteVehicle(id) // يفترض وجود هذه الدالة في الخدمة
      // إزالة السيارة من القائمة العامة
      vehicles.value = vehicles.value.filter((v) => v.id !== id)
    } catch (err) {
      error.value = 'فشل في حذف السيارة.'
      console.error(`Failed to delete vehicle ${id}:`, err)
      throw err
    }
  }

  return {
    vehicles,
    currentVehicle,
    pagination,
    isLoading,
    error,
    fetchVehicles,
    fetchVehicle, // <-- إضافة جديدة
    createVehicle,
    updateVehicle, // <-- إضافة جديدة
    deleteVehicle, // <-- إضافة جديدة
  }
})
