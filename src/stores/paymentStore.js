// src/stores/paymentStore.js

import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'

export const usePaymentStore = defineStore('payment', () => {
  /**
   * إضافة دفعة جديدة لفاتورة.
   * @param {number} invoiceId - معرف الفاتورة.
   * @param {object} paymentData - بيانات الدفعة (amount, payment_date, etc.).
   * @returns {Promise<object>} - Promise يحل ويعيد كائن الفاتورة المحدث بالكامل.
   */
  async function addPayment(invoiceId, paymentData) {
    try {
      // استدعاء نقطة النهاية في الواجهة الخلفية
      const response = await apiClient.post(`/invoices/${invoiceId}/payments`, paymentData)

      // إرجاع بيانات الفاتورة المحدثة القادمة من الخادم
      return response.data.data
    } catch (error) {
      // في حالة حدوث خطأ، قم بإعادة رميه ليتم التعامل معه في المكون
      console.error('Failed to add payment:', error)
      throw error
    }
  }

  return {
    addPayment,
  }
})
