<!-- في src/views/InvoicesView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- رأس الصفحة -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-text-primary">إدارة الفواتير</h1>
    </div>

    <!-- بطاقة المحتوى -->
    <AppCard>
      <!-- قسم الفلترة والبحث -->
      <div class="p-4 border-b border-surface-border grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppInput
          id="search"
          v-model="filters.search"
          placeholder="ابحث برقم الفاتورة أو اسم العميل..."
          @keydown.enter="applyFilters"
        />
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="w-full rounded-md border-gray-300 dark:bg-surface-ground dark:border-surface-border"
        >
          <option value="all">كل الحالات</option>
          <option value="due">مستحقة</option>
          <!-- أضفنا هذه الحالة -->
          <option value="unpaid">غير مدفوعة</option>
          <option value="partially_paid">مدفوعة جزئياً</option>
          <option value="paid">مدفوعة بالكامل</option>
          <option value="voided">ملغاة</option>
        </select>
        <AppButton @click="applyFilters" :is-loading="invoiceStore.isLoading">
          <span v-if="invoiceStore.isLoading">جاري البحث...</span>
          <span v-else>تطبيق الفلاتر</span>
        </AppButton>
      </div>

      <!-- جدول عرض الفواتير -->
      <AppTable
        :headers="tableHeaders"
        :items="invoiceStore.invoices"
        :is-loading="invoiceStore.isLoading"
        :pagination="invoiceStore.pagination"
        @page-changed="handlePageChange"
      >
        <!-- ... (قوالب الخلايا تبقى كما هي) ... -->
        <template #cell-client="{ item }">
          <span v-if="item.client">{{ item.client.name }}</span>
          <span v-else class="text-text-muted">N/A</span>
        </template>
        <template #cell-status="{ item }">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full"
            :class="getStatusClass(item.status)"
          >
            {{ getStatusText(item.status) }}
          </span>
        </template>
        <template #cell-total_amount="{ item }">
          <span class="font-mono">{{ formatCurrency(item.total_amount) }}</span>
        </template>
        <template #cell-paid_amount="{ item }">
          <span class="font-mono text-green-600">{{ formatCurrency(item.paid_amount) }}</span>
        </template>
        <template #cell-actions="{ item }">
          <AppButton size="sm" @click="viewInvoiceDetails(item.id)"> عرض التفاصيل </AppButton>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' // *** استيراد useRoute ***
import { useInvoiceStore } from '@/stores/invoiceStore'
import AppCard from '@/components/base/AppCard.vue'
import AppTable from '@/components/base/AppTable.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'
import { formatCurrency } from '@/utils/formatters.js'

const router = useRouter()
const route = useRoute() // *** تهيئة route ***
const invoiceStore = useInvoiceStore()

// فلاتر البحث (تبقى كما هي)
const filters = ref({
  search: '',
  status: 'all',
  start_date: '', // *** إضافة فلاتر التاريخ ***
  end_date: '',
})

// --- *** START: NEW LOGIC TO SYNC FILTERS WITH URL *** ---

// دالة لمزامنة حالة الفلاتر من الـ URL
const syncFiltersFromUrl = () => {
  filters.value.status = route.query.status || 'all'
  filters.value.search = route.query.search || ''
  filters.value.start_date = route.query.start_date || ''
  filters.value.end_date = route.query.end_date || ''
}

// مراقبة التغيرات في الـ URL. إذا تغير، قم بمزامنة الفلاتر وجلب البيانات.
watch(
  () => route.query,
  () => {
    syncFiltersFromUrl()
    invoiceStore.fetchInvoices({ ...filters.value, page: route.query.page || 1 })
  },
  { immediate: true, deep: true },
) // immediate: true لتشغيله عند تحميل المكون لأول مرة

// --- *** END: NEW LOGIC *** ---

// تعريف أعمدة الجدول (تبقى كما هي)
const tableHeaders = [
  { key: 'number', label: 'رقم الفاتورة' },
  { key: 'client', label: 'العميل' },
  { key: 'status', label: 'الحالة' },
  { key: 'total_amount', label: 'المبلغ الإجمالي' },
  { key: 'paid_amount', label: 'المدفوع' },
  { key: 'issue_date', label: 'تاريخ الإصدار' },
  { key: 'actions', label: 'إجراءات' },
]

// دوال معالجة الأحداث (مُعدَّلة لتحديث الـ URL)
const applyFilters = () => {
  // عند تطبيق الفلاتر يدويًا، قم بتحديث الـ URL
  // الـ watcher سيهتم ببقية العملية (جلب البيانات)
  router.push({ query: { ...filters.value, page: 1 } })
}

const handlePageChange = (page) => {
  // عند تغيير الصفحة، قم بتحديث الـ URL
  router.push({ query: { ...route.query, page } })
}

const viewInvoiceDetails = (id) => {
  router.push({ name: 'invoice-details', params: { id } })
}

const getStatusClass = (status) => {
  const classes = {
    paid: 'bg-success/10 text-success-dark',
    unpaid: 'bg-danger/10 text-danger-dark',
    partially_paid: 'bg-warning/10 text-warning-dark',
    voided: 'bg-gray-200/50 text-gray-500',
  }
  return classes[status] || 'bg-gray-200 text-gray-600'
}
const getStatusText = (status) => {
  const texts = {
    paid: 'مدفوعة',
    unpaid: 'غير مدفوعة',
    partially_paid: 'مدفوعة جزئيًا',
    voided: 'ملغاة',
  }
  return texts[status] || status
}
</script>
