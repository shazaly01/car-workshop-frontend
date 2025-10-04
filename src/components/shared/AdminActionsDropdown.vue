<template>
  <!-- القائمة المنسدلة بأكملها تظهر فقط إذا كان المستخدم يملك الصلاحية -->
  <AppDropdown v-if="canPerformAdminActions">
    <template #trigger>
      <AppButton variant="danger">
        <ShieldExclamationIcon class="w-5 h-5 ml-1" />
        إجراءات إدارية
      </AppButton>
    </template>
    <template #content="{ closeDropdown }">
      <div class="py-1">
        <!-- إجراء: إلغاء الفاتورة -->
        <button
          v-if="canVoidInvoice"
          @click="handleAction('void-invoice', closeDropdown)"
          class="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-surface-hover"
        >
          إلغاء الفاتورة الحالية
        </button>

        <!-- إجراء: إعادة فتح أمر العمل -->
        <button
          v-if="canReopenWorkOrder"
          @click="handleAction('reopen-work-order', closeDropdown)"
          class="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-surface-hover"
        >
          إعادة فتح أمر العمل
        </button>

        <!-- يمكن إضافة إجراءات أخرى هنا في المستقبل -->
      </div>
    </template>
  </AppDropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppDropdown from '@/components/base/AppDropdown.vue'
import AppButton from '@/components/base/AppButton.vue'
import { ShieldExclamationIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['action'])

const authStore = useAuthStore()

// --- دالة مساعدة لمعالجة النقر ---
const handleAction = (actionName, closeDropdown) => {
  emit('action', actionName)
  closeDropdown()
}

// --- الخصائص المحسوبة لتحديد الإجراءات المتاحة ---

// هل يمكن للمستخدم عرض هذه القائمة من الأساس؟
const canPerformAdminActions = computed(() => {
  // يمكن تعديل هذه الصلاحية لتكون أكثر تحديدًا
  return authStore.hasPermission('void invoices') || authStore.hasPermission('edit work-orders')
})

// هل يمكن إلغاء الفاتورة؟
const canVoidInvoice = computed(() => {
  // يجب أن تكون هناك فاتورة، ويجب ألا تكون ملغاة بالفعل
  return props.workOrder.invoice && props.workOrder.invoice.status !== 'voided'
})

// هل يمكن إعادة فتح أمر العمل؟
const canReopenWorkOrder = computed(() => {
  // يجب أن يكون أمر العمل مكتملًا أو ملغيًا
  return ['completed', 'cancelled'].includes(props.workOrder.status)
})
</script>
