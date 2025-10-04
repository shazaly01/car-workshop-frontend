<template>
  <!-- منطقة المحتوى القابلة للتمرير -->
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- حالة التحميل -->
    <div v-if="dashboardStore.isLoading" class="text-center py-16">
      <p>جاري تحميل بيانات لوحة التحكم...</p>
    </div>
    <!-- حالة الخطأ -->
    <div v-else-if="dashboardStore.error" class="text-center py-16 text-danger">
      <p>{{ dashboardStore.error }}</p>
    </div>

    <!-- المحتوى الرئيسي عند نجاح التحميل -->
    <div v-else>
      <!-- قسم الإحصائيات (Widgets) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="أوامر عمل نشطة"
          :value="dashboardStore.stats.work_orders_in_progress"
          :icon="WrenchScrewdriverIcon"
          color="primary"
        />
        <StatCard
          title="فواتير معلقة"
          :value="dashboardStore.stats.pending_invoices"
          :icon="BanknotesIcon"
          color="warning"
        />
        <StatCard
          title="أوامر مكتملة اليوم"
          :value="dashboardStore.stats.work_orders_completed_today"
          :icon="CheckCircleIcon"
          color="success"
        />
      </div>

      <!-- قسم الجداول والرسوم البيانية -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- العمود الأيسر: أوامر العمل الأخيرة -->
        <div class="lg:col-span-3">
          <AppCard>
            <template #header>
              <h3 class="text-lg font-bold">أحدث أوامر العمل</h3>
            </template>
            <AppTable :headers="tableHeaders" :items="dashboardStore.latestWorkOrders">
              <!-- تخصيص خلية الحالة (Status) -->
              <template #cell-status="{ item }">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    getStatusClass(item.status),
                  ]"
                >
                  {{ item.status_translated }}
                </span>
              </template>
            </AppTable>
          </AppCard>
        </div>

        <!-- العمود الأيمن: أكثر الجهات نشاطاً -->
        <div class="lg:col-span-2">
          <AppCard>
            <template #header>
              <h3 class="text-lg font-bold">أكثر العملاء نشاطاً</h3>
            </template>
            <div class="space-y-4">
              <div
                v-for="client in dashboardStore.topClients"
                :key="client.name"
                class="flex items-center justify-between"
              >
                <p class="font-medium text-text-secondary">{{ client.name }}</p>
                <p class="font-bold text-text-primary">{{ client.orders_count }} أمر عمل</p>
              </div>
              <div
                v-if="dashboardStore.topClients.length === 0"
                class="text-center text-text-muted py-4"
              >
                لا توجد بيانات كافية لعرضها.
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'

// استيراد المكونات الأساسية (تأكد من أن المسارات صحيحة لمشروعك)
import StatCard from '@/components/base/StatCard.vue'
import AppCard from '@/components/base/AppCard.vue'
import AppTable from '@/components/base/AppTable.vue'

// استيراد الأيقونات
import { WrenchScrewdriverIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

// استخدام الـ store
const dashboardStore = useDashboardStore()

// جلب البيانات عند تحميل المكون
onMounted(() => {
  dashboardStore.fetchDashboardData()
})

// بيانات ترويسة الجدول
const tableHeaders = [
  { key: 'number', label: 'رقم الأمر' },
  { key: 'vehicle_name', label: 'السيارة' },
  { key: 'client_name', label: 'العميل' },
  { key: 'status', label: 'الحالة' },
]

// دالة لتلوين الحالة في الجدول
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
