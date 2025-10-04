<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">جميع السيارات</h1>
      <!-- لا يوجد زر إضافة هنا عن قصد -->
    </div>

    <!-- جدول عرض السيارات -->
    <AppTable
      :headers="tableHeaders"
      :items="vehicleStore.vehicles"
      :is-loading="vehicleStore.isLoading"
      :row-clickable="true"
      @row-click="viewClientDetails"
    >
      <!-- تخصيص خلية المالك لجعلها قابلة للنقر -->
      <template #cell-owner="{ item }">
        <span v-if="item.owner" class="text-primary hover:underline cursor-pointer">
          {{ item.owner.name }}
        </span>
        <span v-else class="text-text-muted"> غير محدد </span>
      </template>

      <!-- تخصيص خلية الإجراءات -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-center">
          <AppButton variant="outline" size="sm" @click.stop="viewClientDetails(item)">
            عرض العميل
          </AppButton>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicleStore } from '@/stores/vehicleStore'
import AppTable from '@/components/base/AppTable.vue'
import AppButton from '@/components/base/AppButton.vue'

const router = useRouter()
const vehicleStore = useVehicleStore()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'plate_number', label: 'رقم اللوحة', class: 'text-right' },
  { key: 'make', label: 'الشركة', class: 'text-right' },
  { key: 'model', label: 'الطراز', class: 'text-right' },
  { key: 'year', label: 'سنة الصنع', class: 'text-right' },
  { key: 'owner', label: 'المالك', class: 'text-right' }, // عمود جديد لعرض المالك
  { key: 'actions', label: 'إجراءات', class: 'text-center', cellClass: 'w-40 text-center' },
]

// جلب البيانات عند تحميل المكون
onMounted(() => {
  // استدعاء fetchVehicles بدون بارامترات لجلب كل السيارات
  // مع تضمين بيانات العميل (owner)
  vehicleStore.fetchVehicles({ include: 'client' })
})

// دالة للانتقال لصفحة تفاصيل العميل عند النقر على الصف أو الزر
const viewClientDetails = (vehicle) => {
  if (vehicle.owner && vehicle.owner.id) {
    router.push({ name: 'client-details', params: { id: vehicle.owner.id } })
  }
}
</script>
