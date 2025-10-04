// src/services/workOrderService.js

import apiClient from './apiClient'

const workOrderService = {
  /**
   * جلب قائمة أوامر العمل مع إمكانية الفلترة والترتيب.
   * @param {object} params - معاملات الاستعلام (e.g., { page: 1, status: 'in_progress' })
   * @returns {Promise}
   */
  getWorkOrders(params) {
    return apiClient.get('/work-orders', { params })
  },

  /**
   * جلب تفاصيل أمر عمل واحد.
   * ملاحظة: يجب أن تقوم الواجهة الخلفية (WorkOrderController@show) بتحميل العلاقات اللازمة.
   * @param {number|string} id - معرف أمر العمل
   * @returns {Promise}
   */
  getWorkOrder(id) {
    // تم حذف بارامتر `include` من هنا، لأن الواجهة الخلفية هي المسؤولة عن تحميل العلاقات بشكل ثابت.
    return apiClient.get(`/work-orders/${id}`)
  },

  /**
   * جلب البيانات الكاملة لأمر عمل بغرض الطباعة.
   * @param {number|string} id - معرف أمر العمل
   * @returns {Promise}
   */
  getPrintData(id) {
    return apiClient.get(`/work-orders/${id}/print`)
  },

  /**
   * إنشاء أمر عمل جديد.
   * @param {object} workOrderData - بيانات أمر العمل (client_id, vehicle_id, client_complaint)
   * @returns {Promise}
   */
  createWorkOrder(workOrderData) {
    return apiClient.post('/work-orders', workOrderData)
  },

  /**
   * تحديث البيانات الأساسية لأمر عمل موجود.
   * @param {number|string} id - معرف أمر العمل
   * @param {object} workOrderData - البيانات المحدثة (e.g., { client_complaint })
   * @returns {Promise}
   */
  updateWorkOrder(id, workOrderData) {
    return apiClient.put(`/work-orders/${id}`, workOrderData)
  },

  /**
   * حذف أمر عمل.
   * @param {number|string} id - معرف أمر العمل
   * @returns {Promise}
   */
  deleteWorkOrder(id) {
    return apiClient.delete(`/work-orders/${id}`)
  },

  // --- الإجراءات المتفرعة التي تبدأ من أمر العمل ---

  /**
   * تحديث حالة أمر العمل.
   * @param {number|string} id - معرف أمر العمل
   * @param {string} status - الحالة الجديدة
   * @returns {Promise}
   */
  updateStatus(id, status) {
    return apiClient.put(`/work-orders/${id}/status`, { status })
  },

  /**
   * إضافة تشخيص لأمر عمل.
   * (هذه تبقى هنا لأن التشخيص لا يُدار بشكل مستقل، بل هو دائمًا تابع لأمر عمل)
   * @param {number|string} workOrderId - معرف أمر العمل
   * @param {object} diagnosisData - بيانات التشخيص
   * @returns {Promise}
   */
  addDiagnosis(workOrderId, diagnosisData) {
    return apiClient.post(`/work-orders/${workOrderId}/diagnoses`, diagnosisData)
  },

  /**
   * [جديد] تحديث تشخيص موجود.
   * @param {number|string} diagnosisId - معرف التشخيص نفسه.
   * @param {object} diagnosisData - بيانات التشخيص المحدثة.
   * @returns {Promise}
   */
  updateDiagnosis(diagnosisId, diagnosisData) {
    // هذا يستدعي المسار الذي أنشأناه في الواجهة الخلفية: PUT /api/diagnoses/{id}
    return apiClient.put(`/diagnoses/${diagnosisId}`, diagnosisData)
  },
  /*
   * تم نقل الدوال التالية إلى خدماتها المتخصصة لضمان فصل المسؤوليات:
   *
   * - addQuotation (أصبحت createFromWorkOrder في quotationService.js)
   * - updateQuotation (أصبحت updateQuotation في quotationService.js)
   * - createInvoice (أصبحت createFromWorkOrder في invoiceService.js)
   */
}

export default workOrderService
