import apiClient from './apiClient'

const paymentService = {
  /**
   * إضافة دفعة جديدة لفاتورة
   * @param {number} invoiceId - معرف الفاتورة
   * @param {object} paymentData - بيانات الدفعة (amount, payment_date, etc.)
   * @returns {Promise}
   */
  addPayment(invoiceId, paymentData) {
    return apiClient.post(`/invoices/${invoiceId}/payments`, paymentData)
  },
}

export default paymentService
