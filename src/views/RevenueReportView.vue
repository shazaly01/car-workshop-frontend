<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- 1. الشريط العلوي للصفحة -->
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-text-primary">تقرير الإيرادات</h1>
        <p class="text-sm text-text-secondary mt-1">ملخص الأداء المالي للفترة المحددة.</p>
      </div>
      <div class="flex items-center gap-3 mt-4 sm:mt-0">
        <AppButton @click="printReport" variant="outline">
          <PrinterIcon class="w-5 h-5 me-2" />
          <span>طباعة</span>
        </AppButton>
      </div>
    </header>

    <!-- 2. قسم الفلاتر -->
    <div class="bg-surface-section p-4 rounded-lg border border-surface-border mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
        <DateInput label="من تاريخ" v-model="startDate" />
        <DateInput label="إلى تاريخ" v-model="endDate" />
        <AppButton @click="fetchReportData" :is-loading="loading">
          <MagnifyingGlassIcon class="w-5 h-5 me-2" />
          تطبيق الفلاتر
        </AppButton>
      </div>
    </div>

    <!-- 3. قسم الإحصائيات (الآن قابل للنقر) -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="إجمالي الفواتير"
        :value="formatCurrency(summary.total_invoiced)"
        :icon="BanknotesIcon"
        color="primary"
        :to="{
          name: 'invoices',
          query: { status: 'all', start_date: startDate, end_date: endDate },
        }"
      />
      <StatCard
        title="إجمالي المدفوعات"
        :value="formatCurrency(summary.total_paid)"
        :icon="CheckCircleIcon"
        color="success"
        :to="{
          name: 'invoices',
          query: { status: 'paid', start_date: startDate, end_date: endDate },
        }"
      />
      <StatCard
        title="إجمالي الديون"
        :value="formatCurrency(summary.total_outstanding)"
        :icon="ExclamationCircleIcon"
        color="warning"
        :to="{
          name: 'invoices',
          query: { status: 'due', start_date: startDate, end_date: endDate },
        }"
      />
    </div>
    <!-- عرض هياكل عظمية أثناء التحميل -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <!-- 4. قسم عرض البيانات (المدفوعات الأخيرة) -->
    <AppCard>
      <template #header>
        <h2 class="text-lg font-semibold text-text-primary">المدفوعات في الفترة المحددة</h2>
      </template>
      <AppTable
        :headers="paymentsTableHeaders"
        :items="recentPayments"
        :is-loading="loading"
        :row-clickable="false"
      >
        <template #cell-amount="{ item }">
          <span class="font-mono text-success-dark dark:text-success">{{
            formatCurrency(item.amount)
          }}</span>
        </template>
        <template #cell-client="{ item }">
          <span>{{ item.invoice?.client?.name || 'غير متوفر' }}</span>
        </template>
        <template #cell-invoice_number="{ item }">
          <RouterLink
            v-if="item.invoice"
            :to="{ name: 'invoice-details', params: { id: item.invoice.id } }"
            class="text-primary hover:underline"
          >
            {{ item.invoice.number }}
          </RouterLink>
          <span v-else>N/A</span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRevenueReport } from '@/services/financeService'
import { formatCurrency } from '@/utils/formatters'

// استيراد المكونات
import AppButton from '@/components/base/AppButton.vue'
import StatCard from '@/components/base/StatCard.vue'
import AppCard from '@/components/base/AppCard.vue'
import AppTable from '@/components/base/AppTable.vue'
import SkeletonCard from '@/components/base/SkeletonCard.vue'
import DateInput from '@/components/base/DateInput.vue'

// استيراد الأيقونات
import {
  PrinterIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()

// دالة مساعدة للحصول على تاريخ بتنسيق YYYY-MM-DD
const getFormattedDate = (date) => date.toISOString().split('T')[0]

// متغيرات حالة الفلاتر مع قيم افتراضية (أول يوم في الشهر الحالي واليوم الحالي)
const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const startDate = ref(getFormattedDate(firstDayOfMonth))
const endDate = ref(getFormattedDate(today))

// متغيرات حالة البيانات
const summary = ref({})
const recentPayments = ref([])
const loading = ref(true)

// دالة جلب البيانات المحدثة
const fetchReportData = async () => {
  loading.value = true
  try {
    const params = {
      start_date: startDate.value,
      end_date: endDate.value,
    }
    const { data } = await fetchRevenueReport(params)
    summary.value = data.summary
    recentPayments.value = data.recent_payments
  } catch (error) {
    console.error('Failed to fetch revenue report:', error)
  } finally {
    loading.value = false
  }
}

// جلب البيانات عند تحميل المكون لأول مرة
onMounted(fetchReportData)

// تعريف أعمدة جدول المدفوعات
const paymentsTableHeaders = [
  { key: 'payment_date', label: 'تاريخ الدفع' },
  { key: 'invoice_number', label: 'رقم الفاتورة' },
  { key: 'client', label: 'العميل' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'payment_method', label: 'طريقة الدفع' },
]

// دالة الطباعة (تفترض وجود صفحة طباعة تستخدم نفس الـ query params)
const printReport = () => {
  const query = {
    start_date: startDate.value,
    end_date: endDate.value,
  }
  const routeData = router.resolve({ name: 'revenue-report-print', query })
  window.open(routeData.href, '_blank')
}
</script>
