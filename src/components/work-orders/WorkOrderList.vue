<template>
  <div class="flex flex-col h-full bg-surface-section border-l border-surface-border">
    <!-- 1. رأس القائمة والفلترة -->
    <div class="p-4 border-b border-surface-border">
      <h2 class="text-lg font-bold mb-4">أوامر العمل</h2>
      <div class="flex space-x-1 space-x-reverse bg-surface-ground p-1 rounded-lg">
        <!-- [تم التحديث هنا] استخدام الفلاتر الجديدة -->
        <button
          v-for="filter in filters"
          :key="filter.status"
          @click="applyFilter(filter.status)"
          :class="[
            'w-full px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200',
            activeFilter === filter.status
              ? 'bg-primary text-white shadow'
              : 'text-text-secondary hover:bg-surface-hover',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 2. قائمة أوامر العمل -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-4 text-center text-text-muted">جاري تحميل الأوامر...</div>
      <div v-else-if="workOrders.length === 0" class="p-4 text-center text-text-muted">
        لا توجد أوامر عمل تطابق هذا الفلتر.
      </div>
      <ul v-else class="divide-y divide-surface-border">
        <li
          v-for="order in workOrders"
          :key="order.id"
          @click="selectWorkOrder(order)"
          class="p-4 cursor-pointer transition-colors duration-200"
          :class="[selectedWorkOrderId === order.id ? 'bg-primary/10' : 'hover:bg-surface-hover']"
        >
          <div class="flex justify-between items-center">
            <span class="font-bold text-text-primary">{{ order.number }}</span>
            <span class="text-xs px-2 py-1 rounded-full" :class="getStatusClass(order.status)">
              {{ order.status_translated }}
            </span>
          </div>
          <p class="text-sm text-text-secondary mt-1">{{ order.client.name }}</p>
          <p class="text-xs text-text-muted mt-2">
            {{ order.vehicle.make }} {{ order.vehicle.model }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  workOrders: { type: Array, required: true },
  isLoading: { type: Boolean, default: false },
  selectedWorkOrderId: { type: Number, default: null },
})

const emit = defineEmits(['filter-changed', 'work-order-selected'])

// 1. تعريف الفلاتر الجديدة المبسطة
const filters = ref([
  { label: 'غير مكتمل', status: 'active' }, // يمثل كل الحالات النشطة
  { label: 'مكتمل', status: 'completed' },
])

// 2. تحديد الفلتر الافتراضي ليكون "غير مكتمل"
const activeFilter = ref('active')

const applyFilter = (status) => {
  activeFilter.value = status
  emit('filter-changed', status)
}

const selectWorkOrder = (order) => {
  emit('work-order-selected', order)
}

// دالة تلوين الحالة (تبقى كما هي لتعمل مع الحالات التفصيلية القادمة من الـ API)
const getStatusClass = (status) => {
  const classes = {
    pending_diagnosis: 'bg-yellow-200 text-yellow-800',
    pending_quote_approval: 'bg-orange-200 text-orange-800',
    in_progress: 'bg-blue-200 text-blue-800',
    ready_for_delivery: 'bg-green-200 text-green-800',
    completed: 'bg-gray-200 text-gray-800',
    cancelled: 'bg-red-200 text-red-800',
  }
  return classes[status] || 'bg-indigo-200 text-indigo-800'
}
</script>
