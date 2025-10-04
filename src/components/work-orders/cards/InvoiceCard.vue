<template>
  <!-- [تحسين UX]: تم إزالة v-if من هنا -->
  <AppCard>
    <template #header>
      <!-- العنوان يظهر فقط إذا كانت هناك فاتورة -->
      <h3 v-if="invoice" class="text-lg font-bold text-text-primary">
        الفاتورة #{{ invoice.number }}
      </h3>
      <h3 v-else class="text-lg font-bold text-text-primary">الفاتورة</h3>
    </template>

    <div v-if="invoice">
      <!-- ... (محتوى البطاقة لم يتغير) ... -->
      <div class="flex justify-between items-center mb-4">
        <span
          class="text-sm font-bold px-3 py-1 rounded-full"
          :class="getStatusClass(invoice.status)"
        >
          {{ invoice.status }}
        </span>
      </div>
      <div class="space-y-6">
        <!-- جدول البنود -->
        <div class="overflow-x-auto border border-surface-border rounded-lg">
          <table class="min-w-full text-sm">
            <thead class="bg-surface-ground">
              <tr>
                <th class="p-3 text-right font-semibold">البند/الخدمة</th>
                <th class="p-3 text-center font-semibold">الكمية</th>
                <th class="p-3 text-center font-semibold">سعر الوحدة</th>
                <th class="p-3 text-left font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border">
              <tr v-for="item in invoice.items" :key="item.id">
                <td class="p-3">{{ item.description }}</td>
                <td class="p-3 text-center">{{ item.quantity }}</td>
                <td class="p-3 text-center">{{ formatCurrency(item.unit_price) }}</td>
                <td class="p-3 text-left">{{ formatCurrency(item.total_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- قسم الإجماليات والمدفوعات -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-4 border-t border-surface-border">
          <div class="text-text-secondary">المجموع الفرعي:</div>
          <div class="text-left font-semibold">{{ formatCurrency(invoice.subtotal) }}</div>
          <div class="text-text-secondary">الضريبة ({{ invoice.tax_percentage }}%):</div>
          <div class="text-left font-semibold">{{ formatCurrency(invoice.tax_amount) }}</div>
          <div class="text-text-primary font-bold text-base border-t border-dashed pt-2 mt-2">
            المجموع الإجمالي:
          </div>
          <div class="text-left font-bold text-base border-t border-dashed pt-2 mt-2">
            {{ formatCurrency(invoice.total_amount) }}
          </div>
          <div class="text-green-600 dark:text-green-400 font-bold">المبلغ المدفوع:</div>
          <div class="text-left font-bold text-green-600 dark:text-green-400">
            {{ formatCurrency(invoice.paid_amount) }}
          </div>
          <div class="text-danger font-bold border-t border-dashed pt-2 mt-2">المبلغ المتبقي:</div>
          <div class="text-left font-bold text-danger border-t border-dashed pt-2 mt-2">
            {{ formatCurrency(invoice.total_amount - invoice.paid_amount) }}
          </div>
        </div>
        <!-- قسم المدفوعات المسجلة -->
        <div
          v-if="invoice.payments && invoice.payments.length > 0"
          class="pt-4 border-t border-surface-border"
        >
          <h4 class="font-semibold text-text-secondary mb-2 text-sm">المدفوعات المسجلة</h4>
          <ul class="space-y-2 text-xs">
            <li
              v-for="payment in invoice.payments"
              :key="payment.id"
              class="flex justify-between items-center bg-surface-ground p-2 rounded-md"
            >
              <div>
                <span class="font-bold">{{ formatCurrency(payment.amount) }}</span>
                <span class="text-text-muted mx-2">|</span>
                <span>{{ payment.payment_method }}</span>
              </div>
              <div class="text-text-muted">
                {{ payment.payment_date }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-text-muted">
      <p>لم يتم إنشاء فاتورة بعد.</p>
    </div>

    <!-- [تعديل] الـ footer يحتوي الآن على أزرار متعددة -->
    <template #footer v-if="invoice">
      <div
        class="flex justify-between items-center p-3 bg-surface-ground border-t border-surface-border rounded-b-lg"
      >
        <!-- زر التعديل (يظهر إذا لم تكن الفاتورة مدفوعة بالكامل أو ملغاة) -->
        <AppButton
          v-if="!['paid', 'voided'].includes(invoice.status)"
          variant="outline"
          size="sm"
          @click="$emit('edit-invoice')"
        >
          تعديل الفاتورة
        </AppButton>
        <div v-else></div>

        <!-- زر إضافة دفعة -->
        <AppButton
          v-if="invoice.status !== 'paid'"
          @click="$emit('add-payment')"
          variant="success"
          size="sm"
        >
          + إضافة دفعة
        </AppButton>
      </div>
    </template>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  invoice: {
    type: Object,
    default: null,
  },
})

// [تعديل] تعريف الأحداث الجديدة
defineEmits(['add-payment', 'edit-invoice'])

const getStatusClass = (status) => {
  const classes = {
    unpaid: 'bg-yellow-200 text-yellow-800',
    partially_paid: 'bg-blue-200 text-blue-800',
    paid: 'bg-green-200 text-green-800',
    overdue: 'bg-red-200 text-red-800',
    voided: 'bg-gray-500 text-white',
  }
  return classes[status] || 'bg-indigo-200 text-indigo-800'
}
</script>
