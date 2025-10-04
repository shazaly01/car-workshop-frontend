<template>
  <AppCard>
    <!-- [جديد] إضافة div مخفي لتشغيل خاصية التصحيح -->
    <div v-show="false">{{ debugInfoCardStatus }}</div>

    <div class="flex justify-between items-center mb-4 border-b border-surface-border pb-2">
      <h3 class="text-lg font-bold text-text-primary">المعلومات الأساسية</h3>

      <!-- قائمة تغيير الحالة المنسدلة -->
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
} from '@heroicons/vue/24/solid'

const props = defineProps({
  workOrder: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['change-status'])

// خطوة التتبع رقم 3: مراقبة البيانات داخل المكون الابن
const debugInfoCardStatus = computed(() => {
  const status = props.workOrder?.status
  console.log('--- [InfoCard] خطوة 3: الحالة التي يراها المكون الابن ---')
  console.log(status)
  return status
})

const handleChangeStatus = (status, closeDropdown) => {
  emit('change-status', status)
  closeDropdown()
}

const canChangeStatus = computed(() => {
  if (!props.workOrder?.status) {
    return false
  }
  const nonChangeableStatuses = ['completed', 'cancelled']
  return !nonChangeableStatuses.includes(props.workOrder.status)
})

const availableStatuses = computed(() => {
  if (!props.workOrder?.status) {
    return []
  }
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
</script>
