import apiClient from './apiClient'

export default {
  // لإنشاء فاتورة من أمر عمل
  createFromWorkOrder(workOrderId) {
    return apiClient.post(`/work-orders/${workOrderId}/invoices`)
  },
  // لجلب قائمة الفواتير
  getInvoices(params) {
    return apiClient.get('/invoices', { params })
  },
  // لجلب فاتورة واحدة
  getInvoice(id) {
    return apiClient.get(`/invoices/${id}`)
  },

  /**
   * [تم التحديث هنا]
   * إلغاء فاتورة موجودة (تغيير حالتها إلى 'voided').
   * @param {number} id - معرف الفاتورة
   * @returns {Promise}
   */
  voidInvoice(id) {
    // هذا يستدعي DELETE /api/invoices/{id} الذي ينفذ دالة destroy في المتحكم
    return apiClient.delete(`/invoices/${id}`)
  },
}
