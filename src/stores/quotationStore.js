// src/stores/quotationStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

// --- استيراد الخدمة المتخصصة ---
import quotationService from '@/services/quotationService'
import { useWorkOrderStore } from './workOrderStore'

export const useQuotationStore = defineStore('quotation', () => {
  // --- State ---
  // لا نحتاج لقائمة عروض أسعار عامة، لأنها دائمًا ما تكون في سياق أمر عمل معين
  const currentQuotation = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب عرض سعر محدد.
   * @param {number} id - معرف عرض السعر
   */
  async function fetchQuotation(id) {
    isLoading.value = true
    error.value = null
    try {
      const response = await quotationService.getQuotation(id)
      currentQuotation.value = response.data.data
      return currentQuotation.value
    } catch (err) {
      error.value = 'فشل في جلب بيانات عرض السعر.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث بنود أو ملاحظات عرض السعر (قبل الموافقة عليه).
   * @param {number} id - معرف عرض السعر
   * @param {object} data - البيانات المحدثة (مثل items, notes)
   */
  async function updateQuotation(id, data) {
    isLoading.value = true
    error.value = null
    try {
      // --- التعديل هنا: استدعاء الخدمة الصحيحة ---
      const response = await quotationService.updateQuotation(id, data)
      const updatedQuotation = response.data.data

      // تحديث الحالة المحلية
      currentQuotation.value = updatedQuotation

      // تحديث أمر العمل الأب في workOrderStore
      const workOrderStore = useWorkOrderStore()
      if (workOrderStore.currentWorkOrder && workOrderStore.currentWorkOrder.quotation) {
        workOrderStore.currentWorkOrder.quotation = updatedQuotation
      }

      return updatedQuotation
    } catch (err) {
      error.value = 'فشل في تحديث عرض السعر.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تحديث حالة عرض السعر (موافقة أو رفض).
   * @param {number} id - معرف عرض السعر
   * @param {string} status - الحالة الجديدة ('approved' أو 'rejected')
   */
  async function updateQuotationStatus(id, status) {
    const workOrderStore = useWorkOrderStore()

    try {
      // 1. [الحل] استدعاء الدالة الموجودة 'updateQuotation'
      // وتمرير كائن يحتوي على الحالة الجديدة، كما يتوقعه الـ API.
      const response = await quotationService.updateQuotation(id, { status: status })
      const updatedWorkOrder = response.data.data

      // 2. تمرير كائن أمر العمل المحدث مباشرة إلى workOrderStore
      workOrderStore._updateLocalWorkOrder(updatedWorkOrder)
    } catch (error) {
      console.error('Failed to update quotation status:', error)
      throw error
    }
  }

  /**
   * مسح بيانات عرض السعر المحدد عند مغادرة الصفحة.
   */
  function clearCurrentQuotation() {
    currentQuotation.value = null
  }

  return {
    currentQuotation,
    isLoading,
    error,
    fetchQuotation,
    updateQuotation,
    updateQuotationStatus,
    clearCurrentQuotation,
  }
})
