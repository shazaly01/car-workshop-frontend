import { defineStore } from 'pinia'
import { ref } from 'vue'
import clientService from '@/services/clientService' // استيراد الخدمة

export const useClientStore = defineStore('client', () => {
  // --- State ---
  const clients = ref([])
  const currentClient = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // --- Actions ---

  /**
   * جلب قائمة العملاء من الخادم
   */
  async function fetchClients() {
    isLoading.value = true
    error.value = null
    try {
      const response = await clientService.getClients()
      clients.value = response.data.data // البيانات موجودة داخل .data.data بسبب التصفح (pagination)
    } catch (err) {
      error.value = 'فشل في جلب بيانات العملاء.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * [جديد] جلب عميل واحد مع بياناته المرتبطة
   * @param {number} id - معرف العميل
   */
  async function fetchClient(id) {
    isLoading.value = true
    error.value = null
    currentClient.value = null // إعادة التعيين قبل الجلب
    try {
      const response = await clientService.getClient(id)
      currentClient.value = response.data.data
      return currentClient.value // إرجاع العميل للمكون الذي طلبه
    } catch (err) {
      error.value = `فشل في جلب بيانات العميل ${id}.`
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إنشاء عميل جديد
   * @param {object} clientData - بيانات العميل الجديد
   */
  async function createClient(clientData) {
    // لا نحتاج لـ isLoading هنا لأن الجدول لا يزال معروضًا
    error.value = null
    try {
      const response = await clientService.createClient(clientData)
      // إضافة العميل الجديد إلى بداية القائمة في الواجهة
      clients.value.unshift(response.data.data)
    } catch (err) {
      error.value = 'فشل في إنشاء العميل.'
      console.error(err)
      // إعادة رمي الخطأ ليتم التعامل معه في النموذج (لعرض أخطاء الحقول)
      throw err
    }
  }

  /**
   * تحديث بيانات عميل موجود
   * @param {number} id - معرف العميل
   * @param {object} clientData - البيانات المحدثة
   */
  async function updateClient(id, clientData) {
    error.value = null
    try {
      const response = await clientService.updateClient(id, clientData)
      // تحديث العميل في القائمة
      const index = clients.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        clients.value[index] = response.data.data
      }
    } catch (err) {
      error.value = 'فشل في تحديث بيانات العميل.'
      console.error(err)
      throw err
    }
  }

  /**
   * حذف عميل
   * @param {number} id - معرف العميل
   */
  async function deleteClient(id) {
    error.value = null
    try {
      await clientService.deleteClient(id)
      // إزالة العميل من القائمة في الواجهة
      clients.value = clients.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = 'فشل في حذف العميل.'
      console.error(err)
      throw err
    }
  }

  // --- [الخطوة 1: إضافة الـ Action الجديد هنا] ---
  /**
   * يضيف أمر عمل جديد إلى العميل الحالي المعروض ويحدّث السيارة المرتبطة به.
   * @param {object} newWorkOrder - كائن أمر العمل الجديد القادم من الـ API.
   */
  function addWorkOrderToCurrentClient(newWorkOrder) {
    // نتأكد أن هناك عميل معروض وأن أمر العمل يخصه
    if (!currentClient.value || currentClient.value.id !== newWorkOrder.client_id) {
      return
    }

    // 1. نجد السيارة الصحيحة في قائمة سيارات العميل الحالي
    const vehicle = currentClient.value.vehicles.find((v) => v.id === newWorkOrder.vehicle_id)

    // 2. إذا وجدت السيارة، نحدّث خاصية `open_work_order`
    if (vehicle) {
      // هذا التعديل المباشر على الـ state داخل action مضمون أنه سيكون تفاعليًا
      vehicle.open_work_order = {
        id: newWorkOrder.id,
        status: newWorkOrder.status,
        status_translated: newWorkOrder.status_translated || 'قيد الانتظار',
      }
    }

    // 3. (اختياري) نضيف أمر العمل لقائمة أوامر عمل العميل
    if (!currentClient.value.work_orders) {
      currentClient.value.work_orders = []
    }
    currentClient.value.work_orders.unshift(newWorkOrder)
  }

  return {
    clients,
    currentClient,
    isLoading,
    error,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    addWorkOrderToCurrentClient,
  }
})
