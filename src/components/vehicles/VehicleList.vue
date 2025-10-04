<template>
  <AppCard>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-text-primary">سيارات العميل</h3>
      <AppButton size="sm" @click="addNewVehicle"> إضافة سيارة جديدة </AppButton>
    </div>

    <AppTable
      :headers="tableHeaders"
      :items="vehicles"
      :is-loading="isLoading"
      :row-clickable="false"
    >
      <!-- تخصيص خلية حالة أمر العمل -->
      <template #cell-work_order_status="{ item }">
        <span
          v-if="item.open_work_order"
          class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-800"
        >
          {{ item.open_work_order.status_translated }}
        </span>
        <span v-else class="text-text-muted"> لا يوجد </span>
      </template>

      <!-- تخصيص خلية الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-center space-x-2 space-x-reverse">
          <!-- زر إنشاء أمر العمل يظهر فقط إذا لم يكن هناك أمر عمل مفتوح -->
          <AppButton
            v-if="!item.open_work_order"
            variant="success"
            size="sm"
            @click="createWorkOrder(item)"
          >
            إنشاء أمر عمل
          </AppButton>
          <AppButton variant="outline" size="sm" @click="editVehicle(item)"> تعديل </AppButton>
        </div>
      </template>
    </AppTable>
  </AppCard>
</template>

<script setup>
import AppTable from '@/components/base/AppTable.vue'
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'

// --- [تم التبسيط هنا] ---
const props = defineProps({
  vehicles: {
    type: Array,
    required: true,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add-vehicle', 'edit-vehicle', 'create-work-order'])

const tableHeaders = [
  { key: 'plate_number', label: 'رقم اللوحة', class: 'text-right' },
  { key: 'make', label: 'الشركة', class: 'text-right' },
  { key: 'model', label: 'الطراز', class: 'text-right' },
  { key: 'work_order_status', label: 'حالة أمر العمل', class: 'text-center' },
  { key: 'actions', label: 'إجراءات', class: 'text-center', cellClass: 'w-56 text-center' },
]

// --- [تم الحذف] ---
// لم نعد بحاجة لدالة getOpenWorkOrder المعقدة

// إصدار الأحداث عند النقر على الأزرار
const addNewVehicle = () => {
  emit('add-vehicle')
}

const editVehicle = (vehicle) => {
  emit('edit-vehicle', vehicle)
}

const createWorkOrder = (vehicle) => {
  emit('create-work-order', vehicle)
}
</script>
