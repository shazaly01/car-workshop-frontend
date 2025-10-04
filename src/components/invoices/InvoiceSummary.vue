<template>
  <div class="p-6 bg-white dark:bg-surface-section rounded-lg shadow-sm">
    <h3 class="text-lg font-bold text-gray-800 dark:text-text-primary mb-4">الملخص المالي</h3>
    <div class="space-y-4 text-sm">
      <!-- المجموع الإجمالي -->
      <div class="flex justify-between items-baseline">
        <span class="text-gray-600 dark:text-text-secondary">المبلغ الإجمالي:</span>
        <span class="text-xl font-bold text-gray-800 dark:text-text-primary font-mono">{{
          formatCurrency(invoice.total_amount)
        }}</span>
      </div>

      <!-- المبلغ المدفوع -->
      <div class="flex justify-between items-baseline">
        <span class="text-gray-600 dark:text-text-secondary">المبلغ المدفوع:</span>
        <span class="font-semibold text-green-600 dark:text-green-400 font-mono">{{
          formatCurrency(invoice.paid_amount)
        }}</span>
      </div>

      <!-- المبلغ المتبقي -->
      <div
        class="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200 dark:border-surface-border"
      >
        <span class="font-bold text-gray-700 dark:text-text-secondary">المبلغ المتبقي:</span>
        <span class="text-lg font-bold text-red-600 dark:text-red-500 font-mono">{{
          formatCurrency(remainingAmount)
        }}</span>
      </div>

      <!-- شريط التقدم -->
      <div class="pt-2">
        <div class="w-full bg-gray-200 dark:bg-surface-ground rounded-full h-2.5">
          <div
            class="bg-primary h-2.5 rounded-full"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <p class="text-xs text-center mt-1 text-gray-500 dark:text-text-muted">
          تم سداد {{ progressPercentage.toFixed(0) }}% من الفاتورة
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  invoice: { type: Object, required: true },
})

const remainingAmount = computed(() => {
  return Math.max(0, props.invoice.total_amount - props.invoice.paid_amount)
})

const progressPercentage = computed(() => {
  if (!props.invoice || props.invoice.total_amount <= 0) {
    return 0
  }
  return (props.invoice.paid_amount / props.invoice.total_amount) * 100
})
</script>
