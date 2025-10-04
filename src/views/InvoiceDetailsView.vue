<!-- في src/views/InvoiceDetailsView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- حالة التحميل -->
    <div v-if="store.isDetailLoading" class="text-center py-10">
      <p>جاري تحميل تفاصيل الفاتورة...</p>
    </div>
    <!-- حالة الخطأ -->
    <div v-else-if="store.error" class="text-center py-10 text-danger">
      <p>{{ store.error }}</p>
    </div>
    <!-- عرض التفاصيل -->
    <div v-else-if="invoice" class="space-y-6">
      <InvoiceHeader :invoice="invoice" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <InvoiceItemsTable :items="invoice.items" :totals="invoice" />
        </div>
        <div class="space-y-6">
          <InvoiceSummary :invoice="invoice" />
          <InvoicePaymentsList :payments="invoice.payments" :invoice-id="invoice.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import InvoiceHeader from '@/components/invoices/InvoiceHeader.vue'
import InvoiceSummary from '@/components/invoices/InvoiceSummary.vue'
import InvoiceItemsTable from '@/components/invoices/InvoiceItemsTable.vue'
import InvoicePaymentsList from '@/components/invoices/InvoicePaymentsList.vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const store = useInvoiceStore()
const invoice = computed(() => store.currentInvoice)

onMounted(() => {
  store.fetchInvoice(props.id)
})
</script>
