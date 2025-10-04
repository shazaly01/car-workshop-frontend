<template>
  <div v-if="clientStore.isLoading && !client" class="text-center p-10">
    <p>جاري تحميل بيانات العميل...</p>
  </div>

  <div v-else-if="clientStore.error" class="text-center p-10 text-danger">
    <p>{{ clientStore.error }}</p>
    <AppButton @click="goBack" class="mt-4">العودة إلى القائمة</AppButton>
  </div>

  <div v-else-if="client" class="space-y-6">
    <!-- بطاقة معلومات العميل الأساسية -->
    <AppCard>
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-text-primary">{{ client.name }}</h2>
          <p class="text-text-secondary">{{ client.type === 'company' ? 'شركة' : 'فرد' }}</p>
        </div>
        <AppButton variant="secondary" @click="openEditClientDialog"> تعديل البيانات </AppButton>
      </div>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <strong class="block text-text-muted">رقم الهاتف</strong>
          <span class="text-text-secondary">{{ client.phone }}</span>
        </div>
        <div>
          <strong class="block text-text-muted">البريد الإلكتروني</strong>
          <span class="text-text-secondary">{{ client.email || 'لا يوجد' }}</span>
        </div>
        <div>
          <strong class="block text-text-muted">العنوان</strong>
          <span class="text-text-secondary">{{ client.address || 'لا يوجد' }}</span>
        </div>
        <div>
          <strong class="block text-text-muted">تاريخ التسجيل</strong>
          <span class="text-text-secondary">{{ client.registered_at }}</span>
        </div>
      </div>
    </AppCard>

    <!-- قائمة سيارات العميل -->
    <VehicleList
      :vehicles="client.vehicles || []"
      :work-orders="client.work_orders || []"
      @add-vehicle="openAddVehicleDialog"
      @edit-vehicle="openEditVehicleDialog"
      @create-work-order="openCreateWorkOrderDialog"
    />

    <!-- نافذة تعديل بيانات العميل -->
    <AppDialog v-model="isClientFormVisible" title="تعديل بيانات العميل">
      <ClientForm :client-to-edit="client" @close="isClientFormVisible = false" />
    </AppDialog>

    <!-- نافذة إضافة/تعديل سيارة -->
    <AppDialog v-if="isVehicleFormVisible" v-model="isVehicleFormVisible" :title="vehicleFormTitle">
      <VehicleForm
        :client-id="client.id"
        :vehicle-to-edit="selectedVehicle"
        @close="isVehicleFormVisible = false"
        @vehicle-saved="onVehicleSaved"
      />
    </AppDialog>

    <!-- نافذة إنشاء أمر عمل -->
    <AppDialog
      v-if="isWorkOrderFormVisible"
      v-model="isWorkOrderFormVisible"
      title="إنشاء أمر عمل جديد"
    >
      <WorkOrderForm
        v-if="selectedVehicle"
        :client-id="client.id"
        :vehicle-id="selectedVehicle.id"
        @close="isWorkOrderFormVisible = false"
        @work-order-created="onWorkOrderCreated"
      />
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppDialog from '@/components/base/AppDialog.vue'
import VehicleList from '@/components/vehicles/VehicleList.vue'
import ClientForm from './ClientForm.vue'
import VehicleForm from '@/components/vehicles/VehicleForm.vue'
import WorkOrderForm from '@/components/work-orders/WorkOrderForm2.vue'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

const client = computed(() => clientStore.currentClient)

// إدارة حالة النوافذ المنبثقة
const isClientFormVisible = ref(false)
const isVehicleFormVisible = ref(false)
const isWorkOrderFormVisible = ref(false)
const selectedVehicle = ref(null)

const vehicleFormTitle = computed(() =>
  selectedVehicle.value ? 'تعديل بيانات السيارة' : 'إضافة سيارة جديدة',
)

onMounted(() => {
  const clientId = route.params.id
  // تأكد من أن clientService.js يطلب 'vehicles,workOrders'
  clientStore.fetchClient(clientId)
})

// --- دوال إدارة نافذة العميل ---
const openEditClientDialog = () => {
  isClientFormVisible.value = true
}

// --- دوال إدارة نافذة السيارة ---
const openAddVehicleDialog = () => {
  selectedVehicle.value = null
  isVehicleFormVisible.value = true
}

const openEditVehicleDialog = (vehicle) => {
  selectedVehicle.value = vehicle
  isVehicleFormVisible.value = true
}

const onVehicleSaved = (savedVehicle) => {
  if (!client.value.vehicles) {
    client.value.vehicles = []
  }
  const index = client.value.vehicles.findIndex((v) => v.id === savedVehicle.id)
  if (index !== -1) {
    client.value.vehicles[index] = savedVehicle
  } else {
    client.value.vehicles.unshift(savedVehicle)
  }
}

// --- دوال إدارة نافذة أمر العمل ---
const openCreateWorkOrderDialog = (vehicle) => {
  selectedVehicle.value = vehicle
  isWorkOrderFormVisible.value = true
}

const onWorkOrderCreated = (newWorkOrder) => {
  // الخطوة 1: استدعاء الـ action المركزي لتحديث الحالة
  clientStore.addWorkOrderToCurrentClient(newWorkOrder)

  // الخطوة 2: إغلاق النافذة المنبثقة
  isWorkOrderFormVisible.value = false
  window.location.reload()
}

// --- دوال التنقل ---
const goBack = () => {
  router.push({ name: 'clients' })
}
</script>
