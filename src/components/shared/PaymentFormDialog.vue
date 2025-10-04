<template>
  <AppDialog v-model="isOpen" title="تسجيل دفعة جديدة" @update:modelValue="closeDialog">
    <!-- [جديد] قسم معلومات الفاتورة -->
    <div
      v-if="invoice"
      class="p-4 mb-4 bg-gray-50 dark:bg-surface-ground rounded-lg border dark:border-surface-border text-sm"
    >
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-gray-500 dark:text-text-muted">المبلغ الإجمالي</p>
          <p class="font-bold text-base text-gray-800 dark:text-text-primary">
            {{ formatCurrency(invoice.total_amount) }}
          </p>
        </div>
        <div>
          <p class="text-gray-500 dark:text-text-muted">المدفوع سابقًا</p>
          <p class="font-bold text-base text-green-600 dark:text-green-400">
            {{ formatCurrency(invoice.paid_amount) }}
          </p>
        </div>
        <div>
          <p class="text-gray-500 dark:text-text-muted">المبلغ المتبقي</p>
          <p class="font-bold text-base text-red-600 dark:text-red-400">
            {{ formatCurrency(remainingAmount) }}
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- مبلغ الدفعة -->
      <div>
        <AppInput
          id="payment_amount"
          label="المبلغ"
          type="number"
          v-model.number="form.amount"
          required
          step="0.01"
          placeholder="0.00"
        />
        <!-- [جديد] رسالة خطأ فورية -->
        <p v-if="amountError" class="text-xs text-red-500 mt-1">{{ amountError }}</p>
      </div>

      <!-- [جديد] زر مساعد لملء المبلغ المتبقي -->
      <div class="text-left">
        <button
          type="button"
          @click="fillRemainingAmount"
          class="text-sm text-primary hover:underline"
        >
          دفع المبلغ المتبقي بالكامل
        </button>
      </div>

      <!-- تاريخ الدفعة -->
      <AppInput
        id="payment_date"
        label="تاريخ الدفعة"
        type="date"
        v-model="form.payment_date"
        required
      />

      <!-- طريقة الدفع -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
          >طريقة الدفع</label
        >
        <select
          v-model="form.payment_method"
          required
          class="w-full rounded-md border-gray-300 dark:bg-surface-ground dark:border-surface-border"
        >
          <option value="cash">نقدي (Cash)</option>
          <option value="card">بطاقة (Card)</option>
          <option value="bank_transfer">تحويل بنكي (Bank Transfer)</option>
        </select>
      </div>

      <!-- ملاحظات (اختياري) -->
      <AppTextarea id="payment_notes" label="ملاحظات (اختياري)" v-model="form.notes" rows="3" />

      <!-- رسالة خطأ الخادم -->
      <div v-if="serverError" class="bg-danger/20 text-danger p-3 rounded-lg text-sm">
        <p>{{ serverError }}</p>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex justify-end space-x-3 space-x-reverse pt-4">
        <AppButton type="button" variant="outline" @click="closeDialog" :disabled="isSubmitting">
          إلغاء
        </AppButton>
        <!-- [جديد] تعطيل الزر عند وجود خطأ في المبلغ -->
        <AppButton type="submit" :disabled="isSubmitting || !!amountError">
          <span v-if="isSubmitting">جاري الحفظ...</span>
          <span v-else>حفظ الدفعة</span>
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppDialog from '@/components/base/AppDialog.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppTextarea from '@/components/base/AppTextarea.vue'
import AppButton from '@/components/base/AppButton.vue'
import { usePaymentStore } from '@/stores/paymentStore'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  modelValue: Boolean,
  // [تعديل] استقبال كائن الفاتورة بالكامل بدلاً من المعرف فقط
  invoice: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'payment-added'])

const paymentStore = usePaymentStore()
const isOpen = ref(props.modelValue)
const isSubmitting = ref(false)
const serverError = ref(null) // خطأ من الخادم
const amountError = ref(null) // خطأ في الواجهة الأمامية

const getTodayDate = () => new Date().toISOString().split('T')[0]

const form = ref({
  amount: null,
  payment_date: getTodayDate(),
  payment_method: 'cash',
  notes: '',
})

// [جديد] خاصية محسوبة للمبلغ المتبقي
const remainingAmount = computed(() => {
  if (!props.invoice) return 0
  return Math.max(0, props.invoice.total_amount - props.invoice.paid_amount)
})

// [جديد] مراقبة حقل المبلغ للتحقق الفوري
watch(
  () => form.value.amount,
  (newAmount) => {
    amountError.value = null
    if (newAmount === null || newAmount === '') return
    if (newAmount <= 0) {
      amountError.value = 'يجب أن يكون المبلغ أكبر من صفر.'
    } else if (newAmount > remainingAmount.value + 0.001) {
      // إضافة هامش صغير للأخطاء العشرية
      amountError.value = `المبلغ المدخل أكبر من المتبقي (${formatCurrency(remainingAmount.value)}).`
    }
  },
)

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue
    if (newValue) {
      form.value = {
        amount: null,
        payment_date: getTodayDate(),
        payment_method: 'cash',
        notes: '',
      }
      serverError.value = null
      amountError.value = null
    }
  },
)

// [جديد] دالة الزر المساعد
const fillRemainingAmount = () => {
  form.value.amount = remainingAmount.value
}

const handleSubmit = async () => {
  if (amountError.value) return // لا ترسل إذا كان هناك خطأ
  isSubmitting.value = true
  serverError.value = null
  try {
    // استدعاء المخزن وتمرير المعرف والبيانات
    const updatedInvoice = await paymentStore.addPayment(props.invoice.id, form.value)
    // [تعديل] إطلاق الحدث مع الفاتورة المحدثة
    emit('payment-added', updatedInvoice)
    closeDialog()
  } catch (error) {
    serverError.value = error.response?.data?.message || 'فشل في إضافة الدفعة.'
  } finally {
    isSubmitting.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>
