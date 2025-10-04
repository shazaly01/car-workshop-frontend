<template>
  <AppCard class="!p-4 relative z-10">
    <div class="flex justify-between items-center">
      <!-- 1. معلومات أمر العمل -->
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold text-text-primary">{{ workOrder.number }}</h2>
        <span class="text-sm font-bold px-3 py-1 rounded-full" :class="statusClass">
          {{ workOrder.status_translated }}
        </span>
      </div>

      <!-- 2. أزرار الإجراءات الديناميكية -->
      <div class="flex items-center gap-2">
        <!-- زر إضافة تشخيص -->
        <AppButton v-if="canAddDiagnosis" @click="$emit('add-diagnosis')" variant="success">
          <PlusIcon class="w-5 h-5 ml-1" />
          إضافة تشخيص
        </AppButton>

        <!-- زر إنشاء عرض سعر -->
        <AppButton v-if="canCreateQuote" @click="$emit('create-quote')" variant="success">
          <PlusIcon class="w-5 h-5 ml-1" />
          إنشاء عرض سعر
        </AppButton>

        <!-- زر إنشاء فاتورة -->
        <AppButton
          v-if="canCreateInvoice"
          @click="$emit('create-invoice')"
          variant="success"
          :disabled="isCreatingInvoice"
        >
          <span v-if="isCreatingInvoice">جاري الإنشاء...</span>
          <span v-else class="flex items-center">
            <PlusIcon class="w-5 h-5 ml-1" />
            إنشاء فاتورة
          </span>
        </AppButton>

        <!-- قائمة تغيير الحالة -->
        <AppDropdown v-if="canChangeStatus">
          <template #trigger>
            <AppButton variant="secondary">
              <Cog6ToothIcon class="w-5 h-5 ml-1" />
              تغيير الحالة
            </AppButton>
          </template>
          <template #content="{ closeDropdown }">
            <div class="py-1">
              <button
                v-for="status in availableStatuses"
                :key="status.value"
                @click="handleChangeStatus(status.value, closeDropdown)"
                class="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-surface-hover"
              >
                {{ status.label }}
              </button>
            </div>
          </template>
        </AppDropdown>

        <!-- قائمة إجراءات المدير -->
        <AdminActionsDropdown
          :work-order="workOrder"
          @action="(actionName) => $emit('admin-action', actionName)"
        />
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppDropdown from '@/components/base/AppDropdown.vue'
import { PlusIcon, Cog6ToothIcon } from '@heroicons/vue/24/solid'
import AdminActionsDropdown from '@/components/shared/AdminActionsDropdown.vue'

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
  isCreatingInvoice: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'add-diagnosis',
  'create-quote',
  'create-invoice',
  'change-status',
  'admin-action',
])

const authStore = useAuthStore()

// --- دالة مساعدة لمعالجة النقر داخل القائمة المنسدلة ---
const handleChangeStatus = (status, closeDropdown) => {
  emit('change-status', status)
  closeDropdown()
}

// --- الخصائص المحسوبة لتحديد الأزرار التي يجب عرضها ---

const canAddDiagnosis = computed(() => {
  return props.workOrder.status === 'pending_diagnosis' && !props.workOrder.diagnosis
})

const canCreateQuote = computed(() => {
  const hasDiagnosis = !!props.workOrder.diagnosis
  const hasQuote = props.workOrder.quotations && props.workOrder.quotations.length > 0
  return hasDiagnosis && !hasQuote && props.workOrder.status !== 'quote_rejected'
})

const canCreateInvoice = computed(() => {
  const isReadyForDelivery = props.workOrder.status === 'ready_for_delivery'
  const hasInvoice = !!props.workOrder.invoice
  return isReadyForDelivery && !hasInvoice
})

const canChangeStatus = computed(() => {
  const nonChangeableStatuses = ['completed', 'cancelled']
  return !nonChangeableStatuses.includes(props.workOrder.status)
})

// قائمة الحالات المتاحة للتغيير
const availableStatuses = computed(() => {
  const allStatuses = [
    { value: 'in_progress', label: 'قيد الإصلاح' },
    { value: 'pending_parts', label: 'بانتظار قطع غيار' },
    { value: 'quality_check', label: 'فحص الجودة' },
    { value: 'ready_for_delivery', label: 'جاهز للتسليم' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ]

  return allStatuses.filter((s) => s.value !== props.workOrder.status)
})

// خاصية لتلوين الحالة
const statusClass = computed(() => {
  const classes = {
    pending_diagnosis: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-300',
    in_progress: 'bg-blue-200 text-blue-800 dark:bg-blue-700/30 dark:text-blue-300',
    ready_for_delivery: 'bg-green-200 text-green-800 dark:bg-green-700/30 dark:text-green-300',
    completed: 'bg-gray-400 text-white dark:bg-gray-600',
    cancelled: 'bg-red-200 text-red-800 dark:bg-red-700/30 dark:text-red-300',
    quote_approved: 'bg-teal-200 text-teal-800 dark:bg-teal-700/30 dark:text-teal-300',
    pending_quote_approval:
      'bg-orange-200 text-orange-800 dark:bg-orange-700/30 dark:text-orange-300',
  }
  return classes[props.workOrder.status] || 'bg-indigo-200 text-indigo-800'
})
</script>
