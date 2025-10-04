<template>
  <div class="flex h-full bg-surface-ground">
    <!-- العمود الأيسر: قائمة أوامر العمل -->
    <div class="w-1/4 min-w-[350px] max-w-[400px] flex-shrink-0">
      <WorkOrderList
        :work-orders="workOrderStore.workOrders"
        :is-loading="workOrderStore.isLoading && workOrderStore.workOrders.length === 0"
        :selected-work-order-id="currentWorkOrder?.id"
        @filter-changed="onFilterChange"
        @work-order-selected="onWorkOrderSelect"
      />
    </div>

    <!-- العمود الأيمن: تفاصيل أمر العمل -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <!-- حالة عدم الاختيار -->
      <div
        v-if="!currentWorkOrder && !workOrderStore.isLoading"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <WrenchScrewdriverIcon class="w-24 h-24 text-gray-300 dark:text-surface-border" />
        <h2 class="mt-4 text-xl font-semibold text-text-secondary">اختر أمر عمل من القائمة</h2>
        <p class="text-text-muted">لعرض تفاصيله وإدارته.</p>
      </div>

      <!-- حالة التحميل -->
      <div
        v-else-if="workOrderStore.isDetailLoading"
        class="flex items-center justify-center h-full"
      >
        <p>جاري تحميل التفاصيل...</p>
      </div>

      <!-- عرض التفاصيل -->
      <div v-else-if="currentWorkOrder" class="space-y-6">
        <!-- بطاقة المعلومات الأساسية مع قائمة تغيير الحالة -->
        <InfoCard
          :work-order="currentWorkOrder"
          @change-status="handleChangeStatus"
          @edit-work-order="openWorkOrderDialog"
        />

        <!-- بطاقة التشخيص مع زر إضافة التشخيص -->
        <DiagnosisCard
          :diagnosis="currentWorkOrder.diagnosis"
          :can-add-diagnosis="canAddDiagnosis"
          @edit-diagnosis="openDiagnosisDialog"
          @add-diagnosis="openDiagnosisDialog"
        />

        <!-- بطاقة عرض السعر مع زر إنشاء عرض السعر -->
        <QuotationCard
          :quotation="currentWorkOrder.quotation"
          :can-create-quote="canCreateQuote"
          :work-order-status="currentWorkOrder.status"
          :work-order-id="currentWorkOrder.id"
          @edit-quotation="openQuotationDialog"
          @create-quote="openQuotationDialog"
          @create-invoice="handleCreateInvoice"
        />

        <!-- بطاقة الفاتورة (بدون تغيير كبير) -->
        <InvoiceCard
          :invoice="currentWorkOrder.invoice"
          @add-payment="openPaymentDialog"
          @edit-invoice="openInvoiceDialog"
          @create-invoice="handleCreateInvoice"
        />
      </div>
    </main>

    <WorkOrderFormDialog
      v-model="isWorkOrderFormVisible"
      :work-order-to-edit="currentWorkOrder"
      @saved="handleDataSaved"
    />
    <!-- النوافذ المنبثقة -->
    <DiagnosisFormDialog
      v-if="currentWorkOrder"
      v-model="isDiagnosisFormVisible"
      :work-order-id="currentWorkOrder.id"
      :diagnosis="currentWorkOrder.diagnosis"
      @diagnosis-saved="handleDataSaved"
    />
    <QuotationFormDialog
      v-model="isQuotationFormVisible"
      :work-order-id="currentWorkOrder?.id"
      :quotation="currentWorkOrder?.quotation"
      @quote-saved="handleDataSaved"
    />

    <PaymentFormDialog
      v-if="isPaymentFormVisible && currentWorkOrder?.invoice"
      v-model="isPaymentFormVisible"
      :invoice="currentWorkOrder.invoice"
      @payment-added="handlePaymentAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWorkOrderStore } from '@/stores/workOrderStore'
import { storeToRefs } from 'pinia'
import WorkOrderList from '@/components/work-orders/WorkOrderList.vue'
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import InfoCard from '@/components/work-orders/cards/InfoCard.vue'
import WorkOrderFormDialog from '@/components/work-orders/WorkOrderForm.vue'
import DiagnosisCard from '@/components/work-orders/cards/DiagnosisCard.vue'
import QuotationCard from '@/components/work-orders/cards/QuotationCard.vue'
import InvoiceCard from '@/components/work-orders/cards/InvoiceCard.vue'
import DiagnosisFormDialog from '@/components/shared/DiagnosisFormDialog.vue'
import QuotationFormDialog from '@/components/shared/QuotationFormDialog.vue'
import PaymentFormDialog from '@/components/shared/PaymentFormDialog.vue'

const workOrderStore = useWorkOrderStore()

// استخدام storeToRefs للحصول على مرجع تفاعلي لـ currentWorkOrder
const { currentWorkOrder } = storeToRefs(workOrderStore)

// الفلتر الافتراضي عند تحميل الصفحة
const activeFilter = ref('active')

// --- متغيرات حالة النوافذ المنبثقة ---
const isWorkOrderFormVisible = ref(false)
const openWorkOrderDialog = () => {
  isWorkOrderFormVisible.value = true
}
const isDiagnosisFormVisible = ref(false)
const openDiagnosisDialog = () => {
  isDiagnosisFormVisible.value = true
}

const isQuotationFormVisible = ref(false)
const openQuotationDialog = () => {
  isQuotationFormVisible.value = true
}

const isPaymentFormVisible = ref(false)
const openPaymentDialog = () => {
  isPaymentFormVisible.value = true
}

const handleCreateInvoice = async () => {
  if (!confirm('هل أنت متأكد من إنشاء فاتورة من عرض السعر الحالي؟...')) {
    return
  }

  try {
    // [تعديل] لا حاجة لإعادة الجلب يدويًا بعد الآن!
    // الـ store سيقوم بالتحديث التفاعلي تلقائيًا.
    await workOrderStore.createInvoice(currentWorkOrder.value.id)

    alert('تم إنشاء الفاتورة بنجاح!')
  } catch (error) {
    alert(error.response?.data?.message || 'فشل في إنشاء الفاتورة.')
    console.error(error)
  }
}

const handlePaymentAdded = (updatedInvoice) => {
  if (currentWorkOrder.value) {
    // تحديث كائن الفاتورة داخل أمر العمل الحالي مباشرة
    // هذا سيؤدي إلى تحديث InvoiceCard تلقائيًا
    currentWorkOrder.value.invoice = updatedInvoice
  }
}

// --- دالة موحدة لمعالجة حفظ البيانات وتحديث الواجهة ---
/**
 * @param {object} updatedWorkOrder - كائن أمر العمل المحدث القادم من النافذة المنبثقة.
 */
const handleDataSaved = async () => {
  // 1. نتأكد من وجود أمر عمل محدد حاليًا
  if (currentWorkOrder.value && currentWorkOrder.value.id) {
    const workOrderId = currentWorkOrder.value.id

    // 2. نعيد جلب بيانات هذا الأمر بالتحديد.
    // هذا سيقوم بتحديث "جزء التفاصيل" بالكامل (العمود الأيمن).
    await workOrderStore.fetchWorkOrder(workOrderId)

    // 3. نعيد جلب القائمة (العمود الأيسر) لضمان تحديث أي تغييرات
    // في الحالة أو الترتيب قد تكون حدثت.
    fetchFilteredWorkOrders(activeFilter.value)
  }

  // 4. إعادة جلب القائمة لتحديث الحالة والترتيب (ضروري إذا تغيرت الحالة)
  fetchFilteredWorkOrders(activeFilter.value)
}

// --- دالة لمعالجة تغيير الحالة يدويًا ---
const handleChangeStatus = async (newStatus) => {
  if (!currentWorkOrder.value) return
  const confirmChange = confirm(`هل أنت متأكد من أنك تريد تغيير حالة أمر العمل إلى "${newStatus}"؟`)
  if (!confirmChange) return
  try {
    // 1. استدعاء الإجراء لتحديث الحالة
    await workOrderStore.updateWorkOrderStatus(currentWorkOrder.value.id, newStatus)

    // 2. [هذه هي الإضافة الحاسمة]
    // بعد النجاح، أعد جلب بيانات أمر العمل بالكامل لضمان أن كل شيء محدث
    await workOrderStore.fetchWorkOrder(currentWorkOrder.value.id)

    alert('تم تحديث الحالة بنجاح.')
  } catch (error) {
    alert(error.response?.data?.message || 'فشل في تحديث الحالة.')
    console.error(error)
  }
}

// --- الخصائص المحسوبة للتحكم في ظهور الأزرار ---

// شرط إمكانية إضافة تشخيص
const canAddDiagnosis = computed(() => {
  const order = currentWorkOrder.value
  if (!order) return false
  return order.status === 'pending_diagnosis' && !order.diagnosis
})

// شرط إمكانية إنشاء عرض سعر
const canCreateQuote = computed(() => {
  const order = currentWorkOrder.value
  if (!order) return false
  const hasDiagnosis = !!order.diagnosis
  const hasQuote = !!order.quotation
  return hasDiagnosis && !hasQuote && order.status === 'pending_quote_approval'
})

// --- دوال جلب البيانات ومعالجة أحداث القائمة ---
const fetchFilteredWorkOrders = (status) => {
  workOrderStore.fetchWorkOrders({ status: status })
}

const onFilterChange = (status) => {
  activeFilter.value = status
  workOrderStore.clearCurrentWorkOrder()
  fetchFilteredWorkOrders(status)
}

// وضع هذا الكود الجديد مكانه:
const onWorkOrderSelect = (order) => {
  // 1. التحديد الفوري من القائمة (بدون طلب شبكة)
  workOrderStore.selectWorkOrderFromList(order)

  // 2. جلب التفاصيل الدقيقة في الخلفية (يستخدم isDetailLoading)
  workOrderStore.fetchWorkOrder(order.id)
}

const openInvoiceDialog = () => {
  console.log('فتح نافذة تعديل الفاتورة - يتطلب إنشاء مكون InvoiceFormDialog.vue')
}

// --- دورة حياة المكون ---
onMounted(() => {
  // عند تحميل المكون لأول مرة، اجلب القائمة بناءً على الفلتر الافتراضي الصحيح
  fetchFilteredWorkOrders(activeFilter.value)
})

onUnmounted(() => {
  // تنظيف الحالة عند مغادرة الصفحة
  workOrderStore.clearCurrentWorkOrder()
})
</script>
