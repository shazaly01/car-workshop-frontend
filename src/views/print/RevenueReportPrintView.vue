<template>
  <div class="p-10 bg-white font-sans">
    <!-- 1. ترويسة التقرير -->
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold">تقرير الإيرادات</h1>
        <p class="text-gray-600">
          الفترة من: {{ formatDate(query.start_date) }} إلى: {{ formatDate(query.end_date) }}
        </p>
      </div>
      <div class="text-left">
        <h2 class="text-xl font-bold">AutoCare</h2>
        <p class="text-sm text-gray-500">تاريخ الطباعة: {{ new Date().toLocaleDateString() }}</p>
      </div>
    </div>

    <!-- 2. ملخص الإحصائيات -->
    <div class="grid grid-cols-3 gap-6 mb-10 text-center">
      <div class="p-4 bg-gray-100 rounded-lg">
        <h3 class="text-sm font-bold text-gray-500 uppercase">إجمالي الفواتير</h3>
        <p class="text-2xl font-bold mt-1">{{ formatCurrency(query.total_invoiced) }}</p>
      </div>
      <div class="p-4 bg-green-100 rounded-lg">
        <h3 class="text-sm font-bold text-green-700 uppercase">إجمالي المدفوعات</h3>
        <p class="text-2xl font-bold text-green-800 mt-1">{{ formatCurrency(query.total_paid) }}</p>
      </div>
      <div class="p-4 bg-red-100 rounded-lg">
        <h3 class="text-sm font-bold text-red-700 uppercase">إجمالي الديون الحالية</h3>
        <p class="text-2xl font-bold text-red-800 mt-1">
          {{ formatCurrency(query.total_outstanding) }}
        </p>
      </div>
    </div>

    <!-- 3. ملاحظات أو تفاصيل إضافية -->
    <div class="mt-12">
      <p class="text-xs text-gray-500">
        ملاحظات: إجمالي الفواتير والمدفوعات محسوب للفترة المحددة فقط. إجمالي الديون يمثل كل المبالغ
        المستحقة على العملاء حتى تاريخه.
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

// استقبال بيانات التقرير كـ props من الراوتر
const props = defineProps({
  query: {
    type: Object,
    required: true,
  },
})

// طباعة تلقائية عند تحميل الصفحة
onMounted(() => {
  // تأخير بسيط لضمان تحميل كل الأنماط
  setTimeout(() => {
    window.print()
  }, 500)
})
</script>

<style>
/* يمكن إضافة أنماط خاصة بالطباعة هنا إذا لزم الأمر */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
