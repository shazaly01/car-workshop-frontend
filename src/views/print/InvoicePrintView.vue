<template>
  <div class="bg-gray-100 min-h-screen font-sans print:bg-white">
    <!-- شريط الإجراءات (يختفي عند الطباعة) -->
    <div class="max-w-5xl mx-auto p-4 print-hide">
      <div class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
        <h3 class="font-bold text-gray-700">معاينة طباعة الفاتورة (تصميم هندسي)</h3>
        <AppButton @click="triggerPrint" :disabled="isLoading" variant="primary">
          <PrinterIcon class="w-5 h-5 ml-2" />
          اطبع الآن
        </AppButton>
      </div>
    </div>

    <!-- رسائل التحميل والخطأ -->
    <div
      v-if="isLoading || error"
      class="text-center p-10 max-w-5xl mx-auto bg-white my-4 rounded-lg shadow"
    >
      <p v-if="isLoading" class="text-gray-600">جاري نحت الفاتورة...</p>
      <p v-else class="text-red-500 font-semibold">{{ error }}</p>
    </div>

    <!-- تصميم الفاتورة بالترويسة الهندسية -->
    <div
      v-else-if="invoice"
      id="invoice-to-print"
      class="max-w-5xl mx-auto my-4 bg-white rounded-lg shadow-lg overflow-hidden relative"
    >
      <!-- 1. [التحسين الرئيسي] رأس الفاتورة الهندسي -->
      <header
        class="absolute top-0 left-0 right-0 h-64 overflow-hidden print:relative print:h-auto print:bg-primary"
      >
        <!-- الشكل الهندسي المائل كخلفية -->
        <div class="shape-bg absolute w-full h-full bg-primary print:hidden"></div>
        <div class="relative flex justify-between items-start p-8 md:p-10 text-white">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-white/20 flex items-center justify-center rounded-lg backdrop-blur-sm border border-white/20"
            >
              <WrenchScrewdriverIcon class="w-8 h-8" />
            </div>
            <div>
              <h2 class="text-3xl font-bold">AutoCare</h2>
              <p class="text-sm opacity-80">بنغازى - السلمانى</p>
            </div>
          </div>
          <div class="text-right">
            <h1 class="text-4xl font-extrabold uppercase tracking-wider">فاتورة</h1>
            <p class="font-mono opacity-80 mt-1">{{ invoice.number }}</p>
          </div>
        </div>
      </header>

      <!-- المحتوى الرئيسي يبدأ بعد الترويسة -->
      <div class="relative mt-48 print:mt-0 p-8 md:p-10">
        <!-- 2. بطاقات معلومات بتأثير زجاجي -->
        <section
          class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-white/60 backdrop-blur-md border border-gray-200/80 p-6 rounded-lg shadow-md print:bg-transparent print:shadow-none print:border-none print:p-0"
        >
          <div class="md:col-span-2">
            <p class="text-sm font-semibold text-gray-500 uppercase mb-2">فاتورة إلى:</p>
            <p class="text-lg font-bold text-gray-800">{{ invoice.client.name }}</p>
            <p class="text-gray-600 font-mono">{{ invoice.client.phone }}</p>
          </div>
          <div class="text-sm space-y-2 text-gray-700">
            <div class="flex justify-between">
              <span class="font-semibold">تاريخ الإصدار:</span>
              <span class="text-gray-600">{{ formatDate(invoice.issue_date) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">تاريخ الاستحقاق:</span>
              <span class="text-gray-600">{{ formatDate(invoice.due_date) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">الحالة:</span>
              <span
                class="font-bold py-1 px-3 rounded-full text-xs"
                :class="getStatusClass(invoice.status)"
              >
                {{ getStatusText(invoice.status) }}
              </span>
            </div>
          </div>
        </section>

        <!-- 3. جدول البنود الاحترافي (بدون تغيير) -->
        <section>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">تفاصيل الفاتورة</h3>
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="w-full text-right">
              <thead class="bg-gray-50 text-sm text-gray-600 uppercase">
                <tr>
                  <th class="py-3 px-4 font-semibold w-1/2">الوصف</th>
                  <th class="py-3 px-4 font-semibold text-center">الكمية</th>
                  <th class="py-3 px-4 font-semibold text-center">سعر الوحدة</th>
                  <th class="py-3 px-4 font-semibold text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="item in invoice.items"
                  :key="item.id"
                  class="text-sm text-gray-700 odd:bg-white even:bg-gray-50"
                >
                  <td class="py-4 px-4 font-medium">{{ item.description }}</td>
                  <td class="py-4 px-4 font-mono text-center">{{ item.quantity }}</td>
                  <td class="py-4 px-4 font-mono text-center">
                    {{ formatCurrency(item.unit_price) }}
                  </td>
                  <td class="py-4 px-4 text-left font-mono font-bold text-gray-800">
                    {{ formatCurrency(item.total_price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4. قسم المجاميع والدفعات المدمج (بدون تغيير) -->
        <section class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-gray-800">سجل الدفعات</h3>
            <div v-if="invoice.payments && invoice.payments.length > 0" class="space-y-2">
              <div
                v-for="payment in invoice.payments"
                :key="payment.id"
                class="flex justify-between items-center text-sm p-2 rounded-md bg-green-50 border border-green-200"
              >
                <span class="font-mono font-bold text-green-800">{{
                  formatCurrency(payment.amount)
                }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(payment.payment_date) }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 pt-2">لا توجد دفعات مسجلة.</p>
          </div>
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span class="text-gray-600">المجموع الفرعي:</span>
              <span class="font-medium font-mono">{{ formatCurrency(invoice.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">الضريبة ({{ invoice.tax_percentage }}%):</span>
              <span class="font-medium font-mono">{{ formatCurrency(invoice.tax_amount) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 font-bold">
              <span>المبلغ الإجمالي:</span>
              <span class="font-mono">{{ formatCurrency(invoice.total_amount) }}</span>
            </div>
            <div class="flex justify-between text-green-600">
              <span class="font-semibold">المبلغ المدفوع:</span>
              <span class="font-bold font-mono">{{ formatCurrency(invoice.paid_amount) }}</span>
            </div>
            <div
              class="flex justify-between items-center mt-2 pt-2 border-t-2 border-dashed border-gray-300 bg-red-50 p-3 rounded-lg"
            >
              <span class="font-bold text-base text-red-600">المبلغ المتبقي:</span>
              <span class="font-bold text-xl font-mono text-red-600">{{
                formatCurrency(invoice.total_amount - invoice.paid_amount)
              }}</span>
            </div>
          </div>
        </section>

        <!-- 5. تذييل الفاتورة -->
        <footer class="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            شكرًا لتعاملكم معنا. إذا كان لديكم أي استفسار بخصوص هذه الفاتورة، يرجى التواصل معنا.
          </p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- الكود هنا لم يتغير عن الإصدار السابق ---
import { onMounted, computed } from 'vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import AppButton from '@/components/base/AppButton.vue'
import { PrinterIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { formatCurrency, formatDate } from '@/utils/formatters.js'

const props = defineProps({ id: { type: [String, Number], required: true } })
const store = useInvoiceStore()

const invoice = computed(() => store.currentInvoice)
const isLoading = computed(() => store.isDetailLoading)
const error = computed(() => store.error)

onMounted(() => {
  store.fetchInvoice(props.id)
})

const triggerPrint = () => window.print()

const getStatusText = (status) =>
  ({
    unpaid: 'غير مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    paid: 'مدفوعة',
    voided: 'ملغاة',
  })[status] || status

const getStatusClass = (status) =>
  ({
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-yellow-100 text-yellow-800',
    partially_paid: 'bg-blue-100 text-blue-800',
    voided: 'bg-gray-200 text-gray-800',
  })[status] || 'bg-gray-200'
</script>

<style>
/* --- الأنماط هنا تغيرت لدعم التصميم الجديد --- */
:root {
  --color-primary: #4f46e5; /* Indigo-600 */
  --color-primary-dark: #3730a3; /* Indigo-800 */
}

/* الشكل الهندسي للترويسة */
.shape-bg {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  /* هذا هو السر: clip-path يصنع الشكل المائل */
  clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);
}

@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
  }
  #invoice-to-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  .print\:bg-primary {
    background-color: var(--color-primary) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print\:mt-0 {
    margin-top: 0 !important;
  }
  .print\:relative {
    position: relative !important;
  }
  .print\:h-auto {
    height: auto !important;
  }
  .print\:p-0 {
    padding: 0 !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:border-none {
    border: none !important;
  }
  .print\:bg-transparent {
    background-color: transparent !important;
  }

  /* ضمان طباعة ألوان الخلفية للجدول والحالات */
  .bg-gray-50,
  .bg-green-50,
  .bg-red-50,
  .bg-green-100,
  .bg-yellow-100,
  .bg-blue-100 {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .odd\:bg-white {
    background-color: white !important;
  }
  .even\:bg-gray-50 {
    background-color: #f9fafb !important;
  }
}
</style>
