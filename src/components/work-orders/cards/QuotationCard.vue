<template>
  <AppCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold">عرض السعر</h3>
        <span v-if="quotation" class="text-sm font-mono px-2 py-1 rounded" :class="statusClass">
          <!-- [تحسين] استخدام الترجمة إن وجدت -->
          {{ quotation.status_translated || quotation.status }}
        </span>
      </div>
    </template>

    <!-- عرض تفاصيل عرض السعر إذا كان موجودًا -->
    <div v-if="quotation">
      <!-- جدول البنود (لا تغيير) -->
      <div class="overflow-x-auto -mx-6 -mb-6 border-t border-surface-border">
        <table class="min-w-full text-sm">
          <thead class="bg-surface-ground/50">
            <tr>
              <th class="p-3 text-right font-semibold w-2/5">البند</th>
              <th class="p-3 text-center font-semibold">الكمية</th>
              <th class="p-3 text-center font-semibold">سعر الوحدة</th>
              <th class="p-3 text-left font-semibold">الإجمالي</th>
            </tr>
          </thead>
          <tbody
            v-if="quotation.items && quotation.items.length > 0"
            class="divide-y divide-surface-border"
          >
            <tr v-for="item in quotation.items" :key="item.id">
              <td class="p-3">{{ item.description }}</td>
              <td class="p-3 text-center">{{ item.quantity }}</td>
              <td class="p-3 text-center font-mono">{{ formatCurrency(item.unit_price) }}</td>
              <td class="p-3 text-left font-mono">{{ formatCurrency(item.total_price) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="4" class="p-8 text-center text-text-muted">
                لم يتم العثور على بنود في عرض السعر.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- الإجماليات والملاحظات (لا تغيير) -->
      <div class="mt-4 pt-4 border-t border-surface-border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 class="font-semibold text-sm mb-1">ملاحظات:</h4>
          <p class="text-sm text-text-secondary whitespace-pre-wrap">
            {{ quotation.notes || 'لا توجد ملاحظات.' }}
          </p>
        </div>
        <div class="space-y-2 text-sm p-4 bg-surface-ground rounded-lg">
          <div class="flex justify-between">
            <span class="text-text-secondary">المجموع الفرعي:</span>
            <span class="font-bold font-mono">{{ formatCurrency(quotation.subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-secondary">الضريبة (15%):</span>
            <span class="font-bold font-mono">{{ formatCurrency(quotation.tax_amount) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold border-t border-dashed pt-2 mt-2">
            <span>المجموع الإجمالي:</span>
            <span class="font-mono">{{ formatCurrency(quotation.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- عرض زر "إنشاء عرض سعر" إذا لم يكن موجودًا (لا تغيير) -->
    <div v-else-if="canCreateQuote" class="py-8 text-center">
      <AppButton variant="success" @click="$emit('create-quote')">
        <PlusIcon class="w-5 h-5 ml-1" />
        إنشاء عرض سعر
      </AppButton>
      <p class="text-xs text-text-muted mt-2">يمكنك إنشاء عرض سعر بعد إضافة تشخيص لأمر العمل.</p>
    </div>

    <!-- رسالة بديلة (لا تغيير) -->
    <div v-else class="py-8 text-center text-text-muted">
      <p>لا يمكن إنشاء عرض سعر في هذه المرحلة.</p>
    </div>

    <!-- [بداية التعديل الرئيسي] -->
    <!-- الـ footer يظهر فقط إذا كان عرض السعر موجودًا -->
    <template #footer v-if="quotation">
      <div
        class="flex justify-between items-center p-3 bg-surface-ground border-t border-surface-border rounded-b-lg"
      >
        <!-- زر الطباعة (يبقى كما هو) -->
        <AppButton variant="outline" size="sm" @click="openPrintPage">
          <PrinterIcon class="w-4 h-4 ml-1" />
          طباعة
        </AppButton>

        <!-- مجموعة الأزرار على اليمين -->
        <div class="flex items-center space-x-2 space-x-reverse">
          <!-- زر تعديل عرض السعر -->
          <AppButton
            v-if="canEditQuote"
            variant="outline"
            size="sm"
            @click="$emit('edit-quotation')"
          >
            <PencilIcon class="w-4 h-4 ml-1" />
            تعديل
          </AppButton>

          <!-- زر "إنشاء فاتورة" -->
          <AppButton
            v-if="canCreateInvoice"
            variant="primary"
            size="sm"
            @click="$emit('create-invoice')"
          >
            <DocumentPlusIcon class="w-4 h-4 ml-1" />
            إنشاء فاتورة
          </AppButton>
        </div>
      </div>
    </template>
    <!-- [نهاية التعديل الرئيسي] -->
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
import { PlusIcon, PencilIcon, PrinterIcon, DocumentPlusIcon } from '@heroicons/vue/24/solid'
import { formatCurrency } from '@/utils/formatters.js'

const props = defineProps({
  // --- [تعديل] Props محدثة ---
  quotation: { type: Object, default: null },
  invoice: { type: Object, default: null }, // <-- استقبال الفاتورة
  canCreateQuote: { type: Boolean, default: false },
  workOrderId: { type: Number, required: true }, // <-- نحتاجه للطباعة
})

// --- [تعديل] الأحداث المحدثة ---
defineEmits(['edit-quotation', 'create-quote', 'create-invoice'])

// --- [تعديل] الشروط المحدثة ---

// شرط تعديل عرض السعر: يمكن التعديل طالما الفاتورة غير موجودة أو ليست مدفوعة بالكامل
const canEditQuote = computed(() => {
  if (!props.quotation) return false
  return !props.invoice || props.invoice.status !== 'paid'
})

// شرط إنشاء الفاتورة: يجب أن يكون هناك عرض سعر، ويجب ألا تكون هناك فاتورة
const canCreateInvoice = computed(() => {
  return props.quotation && !props.invoice
})

// --- (الكود الحالي بدون تغيير) ---

const openPrintPage = () => {
  if (!props.workOrderId) return
  const printUrl = `/print/work-order/${props.workOrderId}`
  window.open(printUrl, '_blank')
}

const statusClass = computed(() => {
  if (!props.quotation) return ''
  const classes = {
    pending: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    approved: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    rejected: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  }
  return (
    classes[props.quotation.status] ||
    'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  )
})
</script>
