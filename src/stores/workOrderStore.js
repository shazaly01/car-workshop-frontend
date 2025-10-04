import { defineStore } from 'pinia'
import { ref } from 'vue'

// --- استيراد الخدمات المتخصصة ---
import workOrderService from '@/services/workOrderService'
import quotationService from '@/services/quotationService'
import invoiceService from '@/services/invoiceService'
import paymentService from '@/services/paymentService' // خدمة افتراضية للمدفوعات

export const useWorkOrderStore = defineStore('workOrder', () => {
  // --- State ---
  const workOrders = ref([])
  const currentWorkOrder = ref(null)
  const pagination = ref({})
  const isLoading = ref(false)
  const isDetailLoading = ref(false)
  const error = ref(null)

  // --- Helper ---
  /**
   * دالة مساعدة لتحديث أمر العمل في الحالة المحلية (القائمة والتفاصيل)
   * @param {object} updatedOrder - كائن أمر العمل المحدث القادم من الـ API
   */
  function _updateLocalWorkOrder(updatedOrder) {
    // تحديث الكائن في القائمة
    const index = workOrders.value.findIndex((wo) => wo.id === updatedOrder.id)
    if (index !== -1) {
      workOrders.value[index] = { ...workOrders.value[index], ...updatedOrder }
    }

    // تحديث الكائن الحالي إذا كان هو المفتوح
    if (currentWorkOrder.value && currentWorkOrder.value.id === updatedOrder.id) {
      // **التحسين الرئيسي**: استخدام Object.assign للحفاظ على مرجع الكائن الأصلي
      // هذا يضمن تحديثًا تفاعليًا أكثر سلاسة في المكونات الفرعية.
      Object.assign(currentWorkOrder.value, updatedOrder)
    }
  }

  // --- Actions ---

  /**
   * جلب قائمة أوامر العمل
   */
  async function fetchWorkOrders(params) {
    isLoading.value = true
    error.value = null
    try {
      const response = await workOrderService.getWorkOrders(params)
      workOrders.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب أوامر العمل.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب أمر عمل واحد وتخزينه في الحالة
   */
  async function fetchWorkOrder(id) {
    isLoading.value = true
    isDetailLoading.value = true
    error.value = null
    currentWorkOrder.value = null // مسح القديم قبل جلب الجديد
    try {
      const response = await workOrderService.getWorkOrder(id)
      currentWorkOrder.value = response.data.data
      return currentWorkOrder.value
    } catch (err) {
      error.value = `فشل في جلب أمر العمل #${id}.`
    } finally {
      isLoading.value = false
      isDetailLoading.value = false
    }
  }

  function selectWorkOrderFromList(order) {
    const existingOrder = workOrders.value.find((wo) => wo.id === order.id)
    if (existingOrder) {
      currentWorkOrder.value = existingOrder
    } else {
      currentWorkOrder.value = order
    }
  }

  /**
   * إنشاء أمر عمل جديد
   */
  async function createWorkOrder(data) {
    error.value = null
    try {
      const response = await workOrderService.createWorkOrder(data)
      const newOrder = response.data.data
      workOrders.value.unshift(newOrder)
      return newOrder
    } catch (err) {
      error.value = 'فشل في إنشاء أمر العمل.'
      throw err
    }
  }

  /**
   * تحديث البيانات الأساسية لأمر العمل
   */
  async function updateWorkOrder(id, data) {
    error.value = null
    try {
      const response = await workOrderService.updateWorkOrder(id, data)
      const updated = response.data.data
      _updateLocalWorkOrder(updated)
      return updated // إرجاع البيانات المحدثة
    } catch (err) {
      error.value = 'فشل في تحديث أمر العمل.'
      throw err
    }
  }

  /**
   * تحديث حالة أمر عمل
   */
  async function updateWorkOrderStatus(id, status) {
    error.value = null
    try {
      const response = await workOrderService.updateStatus(id, status)
      _updateLocalWorkOrder(response.data.data)
    } catch (err) {
      error.value = 'فشل في تحديث حالة أمر العمل.'
      throw err
    }
  }

  /**
   * إضافة تشخيص لأمر عمل
   */
  async function addDiagnosis(workOrderId, diagnosisData) {
    error.value = null
    try {
      const response = await workOrderService.addDiagnosis(workOrderId, diagnosisData)
      const updated = response.data.data
      _updateLocalWorkOrder(updated)
      return updated // إرجاع البيانات المحدثة
    } catch (err) {
      error.value = 'فشل في إضافة التشخيص.'
      throw err
    }
  }

  /**
   * تحديث تشخيص موجود
   */
  async function updateDiagnosis(diagnosisId, diagnosisData) {
    error.value = null
    try {
      const response = await workOrderService.updateDiagnosis(diagnosisId, diagnosisData)
      const updated = response.data.data
      _updateLocalWorkOrder(updated)
      return updated // إرجاع البيانات المحدثة
    } catch (err) {
      error.value = 'فشل في تحديث التشخيص.'
      throw err
    }
  }

  /**
   * إنشاء عرض سعر لأمر عمل
   */
  async function createQuotation(workOrderId, quotationData) {
    error.value = null
    try {
      const response = await quotationService.createFromWorkOrder(workOrderId, quotationData)
      const updated = response.data.data
      _updateLocalWorkOrder(updated)
      return updated // إرجاع البيانات المحدثة
    } catch (err) {
      error.value = 'فشل في إنشاء عرض السعر.'
      throw err
    }
  }

  /**
   * إنشاء فاتورة من أمر عمل
   */
  async function createInvoice(workOrderId) {
    error.value = null
    try {
      // [تعديل] الآن هذا الإجراء سيعيد استجابة تحتوي على أمر العمل المحدث
      const response = await invoiceService.createFromWorkOrder(workOrderId)

      // [تعديل] استدعاء الدالة المساعدة لتحديث الحالة المحلية فورًا
      _updateLocalWorkOrder(response.data.work_order)

      // [تعديل] إرجاع أمر العمل المحدث ليتم استخدامه في المكون
      return response.data.work_order
    } catch (err) {
      error.value = 'فشل في إنشاء الفاتورة.'
      throw err
    }
  }

  /**
   * إضافة دفعة للفاتورة
   */
  async function addPaymentToInvoice(invoiceId, paymentData) {
    error.value = null
    try {
      const response = await paymentService.createPayment(invoiceId, paymentData)
      const updated = response.data.data // نفترض أن الـ API يعيد أمر العمل المحدث
      _updateLocalWorkOrder(updated)
      return updated // إرجاع البيانات المحدثة
    } catch (err) {
      error.value = 'فشل في إضافة الدفعة.'
      throw err
    }
  }

  /**
   * مسح بيانات أمر العمل المحدد عند مغادرة الصفحة
   */
  function clearCurrentWorkOrder() {
    currentWorkOrder.value = null
  }

  return {
    // State
    workOrders,
    currentWorkOrder,
    pagination,
    isLoading,
    error,
    // Actions
    fetchWorkOrders,
    fetchWorkOrder,
    selectWorkOrderFromList,
    createWorkOrder,
    updateWorkOrder,
    updateWorkOrderStatus,
    addDiagnosis,
    updateDiagnosis,
    createQuotation,
    createInvoice,
    addPaymentToInvoice,
    clearCurrentWorkOrder,
    // Helpers
    _updateLocalWorkOrder,
  }
})
