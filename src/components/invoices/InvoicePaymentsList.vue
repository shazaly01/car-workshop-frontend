<template>
  <div class="p-6 bg-white dark:bg-surface-section rounded-lg shadow-sm">
    <!-- 1. رأس البطاقة وزر إضافة دفعة -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-800 dark:text-text-primary">سجل الدفعات</h3>
      <AppButton
        v-if="canAddPayment"
        size="sm"
        @click="openPaymentDialog"
        :disabled="store.isActionLoading"
      >
        <PlusIcon class="w-4 h-4 ml-1" />
        إضافة دفعة
      </AppButton>
    </div>

    <!-- 2. قائمة الدفعات -->
    <div v-if="payments && payments.length > 0" class="space-y-3">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="flex items-center justify-between p-3 rounded-lg"
        :class="{
          'bg-gray-50 dark:bg-surface-ground': payment.status === 'active',
          'bg-red-50 dark:bg-red-900/20 text-gray-400 dark:text-gray-500 line-through':
            payment.status === 'voided',
        }"
      >
        <!-- تفاصيل الدفعة -->
        <div class="flex items-center gap-4">
          <span
            class="font-bold text-base"
            :class="{ 'text-gray-800 dark:text-text-primary': payment.status === 'active' }"
          >
            {{ formatCurrency(payment.amount) }}
          </span>
          <div class="text-xs">
            <p
              class="font-medium"
              :class="{ 'text-gray-600 dark:text-text-secondary': payment.status === 'active' }"
            >
              {{ payment.payment_method_translated || payment.payment_method }}
            </p>
            <p v-if="payment.received_by" class="mt-1">بواسطة: {{ payment.received_by.name }}</p>
          </div>
        </div>

        <!-- التاريخ وزر الإلغاء -->
        <div class="flex items-center gap-4">
          <span class="text-xs font-mono">{{ formatDate(payment.payment_date) }}</span>
          <AppButton
            v-if="payment.status === 'active'"
            variant="danger"
            size="sm"
            @click="handleVoidPayment(payment.id)"
            :disabled="store.isActionLoading"
          >
            إلغاء
          </AppButton>
          <span v-else class="text-xs font-bold text-red-500 dark:text-red-400 px-2">ملغاة</span>
        </div>
      </div>
    </div>

    <!-- حالة عدم وجود دفعات -->
    <div v-else class="text-center py-6 text-sm text-gray-400 dark:text-text-muted">
      <p>لم يتم تسجيل أي دفعات بعد.</p>
    </div>

    <!-- 3. نافذة إضافة دفعة -->
    <PaymentFormDialog
      v-if="isPaymentFormVisible"
      v-model="isPaymentFormVisible"
      :invoice="store.currentInvoice"
      @payment-added="handlePaymentAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppButton from '@/components/base/AppButton.vue'
import PaymentFormDialog from '@/components/shared/PaymentFormDialog.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  payments: { type: Array, required: true },
  invoiceId: { type: Number, required: true },
  invoiceStatus: { type: String, default: '' },
})

const store = useInvoiceStore()
const isPaymentFormVisible = ref(false)

// خاصية محسوبة لتحديد ما إذا كان يمكن إضافة دفعة
const canAddPayment = computed(() => {
  return props.invoiceStatus !== 'paid' && props.invoiceStatus !== 'voided'
})

// فتح نافذة إضافة دفعة
const openPaymentDialog = () => {
  isPaymentFormVisible.value = true
}

/**
 * [الحل لمشكلة عدم التحديث]
 * هذه الدالة تستقبل الفاتورة المحدثة من النافذة المنبثقة
 * وتقوم بتحديث الحالة المركزية (store) مباشرة.
 * @param {object} updatedInvoice - كائن الفاتورة المحدث بالكامل.
 */
const handlePaymentAdded = (updatedInvoice) => {
  if (updatedInvoice) {
    store.currentInvoice = updatedInvoice
  }
  isPaymentFormVisible.value = false // إغلاق النافذة
}

// معالجة إلغاء دفعة
const handleVoidPayment = async (paymentId) => {
  if (!confirm('هل أنت متأكد من أنك تريد إلغاء هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء.')) {
    return
  }
  try {
    await store.voidPayment(props.invoiceId, paymentId)
    // لا حاجة لتحديث الواجهة يدويًا هنا، لأن الإجراء في الـ store سيعيد الفاتورة المحدثة
    // ويقوم بتحديث currentInvoice بنفسه.
  } catch (error) {
    alert(error.response?.data?.message || 'فشل في إلغاء الدفعة.')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  // افتراض أن التاريخ القادم هو 'Oct 3, 2025' أو صيغة مشابهة
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
