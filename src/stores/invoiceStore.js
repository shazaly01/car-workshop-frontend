import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/apiClient'

export const useInvoiceStore = defineStore('invoice', () => {
  // --- State ---
  const invoices = ref([])
  const pagination = ref({})
  const currentInvoice = ref(null)
  const isLoading = ref(false)
  const isDetailLoading = ref(false)
  const isActionLoading = ref(false) // <-- [جديد] حالة تحميل للإجراءات
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب قائمة الفواتير مع الفلترة والترقيم.
   * @param {object} params
   */
  async function fetchInvoices(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/invoices', { params })
      invoices.value = response.data.data
      pagination.value = response.data.meta
    } catch (err) {
      error.value = 'فشل في جلب الفواتير.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * جلب تفاصيل فاتورة واحدة.
   * @param {number|string} id
   */
  async function fetchInvoice(id) {
    isDetailLoading.value = true
    currentInvoice.value = null
    error.value = null
    try {
      const response = await apiClient.get(`/invoices/${id}`)
      currentInvoice.value = response.data.data
    } catch (err) {
      error.value = `فشل في جلب الفاتورة #${id}.`
      console.error(err)
    } finally {
      isDetailLoading.value = false
    }
  }

  /**
   * [جديد] إلغاء فاتورة بالكامل.
   * @param {number|string} invoiceId
   */
  async function voidInvoice(invoiceId) {
    isActionLoading.value = true
    try {
      // لا نحتاج للاستجابة هنا لأن الإلغاء لا يعيد بيانات
      await apiClient.delete(`/invoices/${invoiceId}`)
      // تحديث الحالة في الواجهة يدويًا
      if (currentInvoice.value && currentInvoice.value.id === invoiceId) {
        currentInvoice.value.status = 'voided'
      }
    } catch (error) {
      console.error('Failed to void invoice:', error)
      throw error // أعد رمي الخطأ ليتمكن المكون من التعامل معه
    } finally {
      isActionLoading.value = false
    }
  }

  /**
   * [جديد] إلغاء دفعة محددة.
   * @param {number|string} paymentId
   */
  async function voidPayment(paymentId) {
    isActionLoading.value = true
    try {
      // استدعاء المسار الجديد الذي يعيد الفاتورة المحدثة بالكامل
      const response = await apiClient.delete(`/payments/${paymentId}`)
      // [الحل الذكي] تحديث الفاتورة الحالية بالكامل بالبيانات الجديدة
      currentInvoice.value = response.data.data
    } catch (error) {
      console.error('Failed to void payment:', error)
      throw error
    } finally {
      isActionLoading.value = false
    }
  }

  return {
    invoices,
    pagination,
    currentInvoice,
    isLoading,
    isDetailLoading,
    isActionLoading, // <-- [جديد]
    error,
    fetchInvoices,
    fetchInvoice,
    voidInvoice, // <-- [جديد]
    voidPayment, // <-- [جديد]
  }
})
