<template>
  <AppCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-text-primary">المعلومات الأساسية</h3>

        <div class="flex items-center space-x-2 space-x-reverse">
          <!-- [جديد] زر الطباعة -->
          <AppButton variant="outline" size="sm" @click="openPrintPage">
            <PrinterIcon class="w-4 h-4 ml-1" />
            طباعة
          </AppButton>

          <!-- قائمة تغيير الحالة -->
          <AppDropdown v-if="canChangeStatus">
            <template #trigger>
              <AppButton variant="secondary" size="sm">
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
        </div>
      </div>
    </template>

    <div v-if="workOrder" class="space-y-6">
      <!-- قسم العميل -->
      <div>
        <h4 class="font-semibold text-text-secondary mb-2">العميل</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div class="flex items-center">
            <UserIcon class="w-4 h-4 ml-2 text-text-muted" />
            <RouterLink
              :to="{ name: 'client-details', params: { id: workOrder.client.id } }"
              class="text-primary hover:underline"
            >
              {{ workOrder.client.name }}
            </RouterLink>
          </div>
          <div class="flex items-center">
            <PhoneIcon class="w-4 h-4 ml-2 text-text-muted" />
            <span>{{ workOrder.client.phone }}</span>
          </div>
        </div>
      </div>

      <!-- قسم السيارة -->
      <div>
        <h4 class="font-semibold text-text-secondary mb-2">السيارة</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div class="flex items-center">
            <TruckIcon class="w-4 h-4 ml-2 text-text-muted" />
            <span
              >{{ workOrder.vehicle.make }} {{ workOrder.vehicle.model }} ({{
                workOrder.vehicle.year
              }})</span
            >
          </div>
          <div class="flex items-center">
            <IdentificationIcon class="w-4 h-4 ml-2 text-text-muted" />
            <span>{{ workOrder.vehicle.plate_number }}</span>
          </div>
          <div class="flex items-center col-span-full">
            <KeyIcon class="w-4 h-4 ml-2 text-text-muted" />
            <span class="font-mono text-xs">{{ workOrder.vehicle.vin }}</span>
          </div>
        </div>
      </div>

      <!-- قسم الشكوى -->
      <div>
        <h4 class="font-semibold text-text-secondary mb-2">شكوى العميل</h4>
        <p class="text-sm bg-surface-ground p-3 rounded-lg whitespace-pre-wrap">
          {{ workOrder.client_complaint }}
        </p>
      </div>

      <!-- قسم ملاحظات الفحص الأولي -->
      <div v-if="workOrder.initial_inspection_notes">
        <h4 class="font-semibold text-text-secondary mb-2">ملاحظات الفحص الأولي</h4>
        <p class="text-sm bg-surface-ground p-3 rounded-lg whitespace-pre-wrap">
          {{ workOrder.initial_inspection_notes }}
        </p>
      </div>
    </div>

    <!-- قسم الفوتر لوضع زر التعديل -->
    <template #footer>
      <div
        class="flex justify-end p-3 bg-surface-ground border-t border-surface-border rounded-b-lg"
      >
        <AppButton variant="outline" size="sm" @click="$emit('edit-work-order')">
          <PencilIcon class="w-4 h-4 ml-1" />
          تعديل
        </AppButton>
      </div>
    </template>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue'
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppDropdown from '@/components/base/AppDropdown.vue'
import {
  UserIcon,
  PhoneIcon,
  TruckIcon,
  IdentificationIcon,
  KeyIcon,
  Cog6ToothIcon,
  PencilIcon,
  PrinterIcon, // <-- 1. استيراد أيقونة الطباعة
} from '@heroicons/vue/24/solid'

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['change-status', 'edit-work-order'])

// --- [جديد] دالة فتح صفحة الطباعة ---
const openPrintPage = () => {
  if (!props.workOrder) return

  // بناء رابط صفحة الطباعة باستخدام معرف أمر العمل
  const printUrl = `/print/work-order/${props.workOrder.id}`

  // فتح الرابط في نافذة جديدة فارغة
  window.open(printUrl, '_blank')
}
// --- نهاية الإضافة ---

const handleChangeStatus = (status, closeDropdown) => {
  emit('change-status', status)
  if (closeDropdown) {
    closeDropdown()
  }
}

const canChangeStatus = computed(() => {
  if (!props.workOrder?.status) {
    return false
  }
  const earlyStageStatuses = ['pending_diagnosis', 'pending_quote_approval']
  return !earlyStageStatuses.includes(props.workOrder.status)
})

const availableStatuses = computed(() => {
  if (!props.workOrder?.status) {
    return []
  }
  const currentStatus = props.workOrder.status
  const allStatuses = [
    { value: 'in_progress', label: 'قيد الإصلاح' },
    { value: 'pending_parts', label: 'بانتظار قطع غيار' },
    { value: 'quality_check', label: 'فحص الجودة' },
    { value: 'ready_for_delivery', label: 'جاهز للتسليم' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ]

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return [{ value: 'in_progress', label: 'إعادة فتح (قيد الإصلاح)' }]
  }

  return allStatuses.filter((s) => s.value !== currentStatus)
})
</script>
