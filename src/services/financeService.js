// src/services/financeService.js

import apiClient from './apiClient'

// *** START: ADD REVENUE REPORT FUNCTION ***
/**
 * [جديد] جلب بيانات تقرير الإيرادات من الواجهة الخلفية.
 * @param {object} params - كائن يحتوي على فلاتر مثل start_date و end_date.
 * @returns {Promise<AxiosResponse>} استجابة axios الكاملة.
 */
export const fetchRevenueReport = (params) => {
  return apiClient.get('/reports/revenue', { params })
}
// *** END: ADD REVENUE REPORT FUNCTION ***

const financeService = {
  /**
   * حذف/إلغاء فاتورة
   * @param {number|string} invoiceId - معرف الفاتورة
   * @returns {Promise}
   */
  deleteInvoice(invoiceId) {
    return apiClient.delete(`/invoices/${invoiceId}`)
  },

  /**
   * إضافة دفعة جديدة لفاتورة
   * @param {number|string} invoiceId - معرف الفاتورة
   * @param {object} paymentData - بيانات الدفعة
   * @returns {Promise}
   */
  addPayment(invoiceId, paymentData) {
    return apiClient.post(`/invoices/${invoiceId}/payments`, paymentData)
  },
}

export default financeService
