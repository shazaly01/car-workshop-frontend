<template>
  <div class="p-6 bg-white dark:bg-surface-section rounded-lg shadow-sm">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
      <!-- معلومات الفاتورة والعميل -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-text-primary">
          فاتورة #{{ invoice.number }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-text-muted">
          للعميل:
          <RouterLink
            :to="{ name: 'client-details', params: { id: invoice.client.id } }"
            class="font-semibold text-primary hover:underline"
          >
            {{ invoice.client.name }}
          </RouterLink>
        </p>
      </div>

      <!-- الحالة والتواريخ -->
      <div class="text-left text-sm w-full sm:w-auto flex-shrink-0">
        <div class="flex justify-end mb-2">
          <span
            class="px-3 py-1 text-xs font-bold rounded-full"
            :class="getStatusClass(invoice.status)"
          >
            {{ invoice.status_translated || invoice.status }}
          </span>
        </div>
        <div class="grid grid-cols-[auto_1fr] gap-x-3 text-gray-600 dark:text-text-secondary">
          <span class="font-semibold">تاريخ الإصدار:</span>
          <span class="font-mono">{{ formatDate(invoice.issue_date) }}</span>
          <span class="font-semibold">تاريخ الاستحقاق:</span>
          <span class="font-mono">{{ formatDate(invoice.due_date) }}</span>
        </div>
      </div>
    </div>

    <!-- الإجراءات -->
    <div
      class="mt-6 pt-4 border-t border-gray-200 dark:border-surface-border flex justify-end gap-2"
    >
      <AppButton variant="outline" size="sm" @click="openPrintPage">
        <PrinterIcon class="w-4 h-4 ml-1" />
        طباعة
      </AppButton>
      <AppButton
        v-if="canBeVoided"
        variant="danger"
        size="sm"
        @click="voidInvoice"
        :disabled="isVoiding"
      >
        <span v-if="isVoiding" class="flex items-center">
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          جاري الإلغاء...
        </span>
        <span v-else class="flex items-center">
          <NoSymbolIcon class="w-4 h-4 ml-1" />
          إلغاء الفاتورة
        </span>
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppButton from '@/components/base/AppButton.vue'
import { PrinterIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'
import { useInvoiceStore } from '@/stores/invoiceStore' // <-- [مُحدَّث] استيراد

const props = defineProps({
  invoice: { type: Object, required: true },
})

const store = useInvoiceStore() // <-- [مُحدَّث] استخدام
const isVoiding = computed(() => store.isActionLoading) // <-- [مُحدَّث] ربط حالة التحميل

const canBeVoided = computed(() => {
  return props.invoice && !['paid', 'voided'].includes(props.invoice.status)
})

const openPrintPage = () => {
  // [الحل هنا] استخدم الفاتورة الحالية من الـ store
  const invoiceId = store.currentInvoice?.id
  if (!invoiceId) {
    alert('لا يمكن طباعة الفاتورة. خطأ في جلب المعرف.')
    return
  }

  // بناء رابط صفحة الطباعة
  const printUrl = `/print/invoice/${invoiceId}`

  // فتح الرابط في نافذة جديدة
  window.open(printUrl, '_blank')
}

const voidInvoice = async () => {
  if (confirm('هل أنت متأكد من إلغاء هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.')) {
    try {
      // [مُحدَّث] استدعاء الإجراء الفعلي من الـ store
      await store.voidInvoice(props.invoice.id)
      alert('تم إلغاء الفاتورة بنجاح.')
    } catch (error) {
      alert(error.response?.data?.message || 'فشل في إلغاء الفاتورة.')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('ar-SA')
}

const getStatusClass = (status) => {
  const classes = {
    unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    voided: 'bg-gray-500 text-white',
  }
  return classes[status] || 'bg-gray-200'
}
</script>
