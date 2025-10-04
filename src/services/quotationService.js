// src/services/quotationService.js

import apiClient from './apiClient'

const quotationService = {
  /**
   * إنشاء عرض سعر جديد مرتبط بأمر عمل.
   * (هذه الدالة كانت سابقًا 'addQuotation' في workOrderService)
   * @param {number|string} workOrderId - معرف أمر العمل
   * @param {object} quotationData - بيانات عرض السعر (البنود، الملاحظات، إلخ)
   * @returns {Promise}
   */
  createFromWorkOrder(workOrderId, quotationData) {
    // المسار: POST /api/work-orders/{workOrderId}/quotations
    return apiClient.post(`/work-orders/${workOrderId}/quotations`, quotationData)
  },

  /**
   * جلب تفاصيل عرض سعر واحد.
   * (مفيد إذا أردنا عرض صفحة مخصصة لعرض السعر)
   * @param {number|string} id - معرف عرض السعر
   * @returns {Promise}
   */
  getQuotation(id) {
    // المسار: GET /api/quotations/{id} (يفترض وجود هذا المسار)
    return apiClient.get(`/quotations/${id}`)
  },

  /**
   * تحديث عرض سعر موجود.
   * يستخدم لتعديل البنود، أو لتحديث الحالة (موافقة/رفض).
   * (هذه الدالة تم نقلها من workOrderService)
   * @param {number|string} id - معرف عرض السعر
   * @param {object} quotationData - البيانات المحدثة (e.g., { items: [...] } or { status: 'approved' })
   * @returns {Promise}
   */
  updateQuotation(id, quotationData) {
    // المسار: PUT /api/quotations/{id}
    return apiClient.put(`/quotations/${id}`, quotationData)
  },

  // يمكن إضافة دوال أخرى هنا في المستقبل، مثل:
  // deleteQuotation(id) { ... }
}

export default quotationService
