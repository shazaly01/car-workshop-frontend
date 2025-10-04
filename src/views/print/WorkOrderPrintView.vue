<template>
  <!-- زر الطباعة (يختفي عند الطباعة) -->
  <div class="print-hide fixed top-4 right-4 z-50">
    <AppButton @click="triggerPrint" shadow="lg">
      <PrinterIcon class="w-5 h-5 ml-2" />
      اطبع التقرير
    </AppButton>
  </div>

  <!-- الخلفية الرمادية للصفحة -->
  <div class="bg-gray-100 min-h-screen p-4 sm:p-8">
    <!-- جسم التقرير الرئيسي بحجم A4 -->
    <div
      v-if="isLoading"
      class="w-a4 h-a4 mx-auto bg-white flex items-center justify-center shadow-lg"
    >
      <p class="text-gray-500 animate-pulse">جاري تجهيز التقرير...</p>
    </div>
    <div
      v-else-if="error"
      class="w-a4 h-a4 mx-auto bg-white flex items-center justify-center shadow-lg text-red-500"
    >
      {{ error }}
    </div>
    <div
      v-else-if="workOrder"
      id="report-to-print"
      class="w-a4 h-a4 mx-auto bg-white flex flex-col shadow-lg"
    >
      <!-- الشريط اللوني العلوي -->
      <div class="h-2 bg-primary"></div>

      <!-- المحتوى الرئيسي للتقرير -->
      <main class="flex-grow p-10 relative">
        <!-- ... (كل الأقسام الأخرى تبقى كما هي) ... -->

        <!-- رأس التقرير -->
        <header class="flex justify-between items-start pb-6 border-b">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-full"
            >
              <WrenchScrewdriverIcon class="w-8 h-8" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">شركة الأمل لصيانة السيارات</h1>
              <p class="text-sm text-gray-500">الرياض، المملكة العربية السعودية</p>
            </div>
          </div>
          <div class="text-left">
            <h2 class="text-3xl font-extrabold text-gray-800">أمر عمل</h2>
            <p class="font-mono text-primary mt-1">{{ workOrder.number }}</p>
          </div>
        </header>

        <!-- معلومات أساسية -->
        <section class="mt-6 grid grid-cols-2 gap-6">
          <div class="flex items-center gap-3">
            <CalendarDaysIcon class="w-6 h-6 text-gray-400" />
            <div>
              <p class="text-xs text-gray-500">تاريخ الإنشاء</p>
              <p class="font-semibold text-gray-700">{{ formatDate(workOrder.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <TagIcon class="w-6 h-6 text-gray-400" />
            <div>
              <p class="text-xs text-gray-500">الحالة</p>
              <p class="font-bold text-primary">{{ workOrder.status_translated }}</p>
            </div>
          </div>
        </section>

        <!-- 3. بطاقات العميل والسيارة (مع التصحيح) -->
        <section class="mt-6 grid grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="font-bold text-gray-700 mb-3">بيانات العميل</h3>
            <!-- [بداية التصحيح] التحقق من وجود workOrder و workOrder.client -->
            <div v-if="workOrder && workOrder.client" class="space-y-2 text-sm">
              <p class="flex items-center gap-2">
                <UserIcon class="w-4 h-4 text-gray-400" /> {{ workOrder.client.name }}
              </p>
              <p class="flex items-center gap-2">
                <PhoneIcon class="w-4 h-4 text-gray-400" /> {{ workOrder.client.phone }}
              </p>
            </div>
            <!-- [نهاية التصحيح] -->
          </div>
          <div class="bg-gray-50 p-4 rounded-lg border">
            <h3 class="font-bold text-gray-700 mb-3">بيانات السيارة</h3>
            <!-- [بداية التصحيح] التحقق من وجود workOrder و workOrder.vehicle -->
            <div v-if="workOrder && workOrder.vehicle" class="space-y-2 text-sm">
              <p class="flex items-center gap-2">
                <TruckIcon class="w-4 h-4 text-gray-400" /> {{ workOrder.vehicle.make }}
                {{ workOrder.vehicle.model }} ({{ workOrder.vehicle.year }})
              </p>
              <p class="flex items-center gap-2">
                <IdentificationIcon class="w-4 h-4 text-gray-400" />
                {{ workOrder.vehicle.plate_number }}
              </p>
            </div>
            <!-- [نهاية التصحيح] -->
          </div>
        </section>

        <!-- ... (بقية القالب يبقى كما هو) ... -->

        <!-- شكوى العميل والتشخيص -->
        <section class="mt-6">
          <div class="border rounded-lg p-4">
            <h3 class="font-bold text-gray-700 mb-3">ملخص المشكلة والتشخيص</h3>
            <p class="text-sm text-gray-600 mb-2">
              <strong>شكوى العميل:</strong> {{ workOrder.client_complaint }}
            </p>
            <div v-if="workOrder.diagnosis" class="text-sm text-gray-600 pt-2 border-t">
              <strong>نتائج الفحص:</strong> {{ workOrder.diagnosis.manual_inspection_results }}
            </div>
          </div>
        </section>

        <!-- عرض السعر -->
        <section
          v-if="
            workOrder.quotation && workOrder.quotation.items && workOrder.quotation.items.length > 0
          "
          class="mt-8"
        >
          <h3 class="text-lg font-bold text-gray-800 mb-3">تفاصيل عرض السعر</h3>
          <div class="overflow-hidden border rounded-lg">
            <table class="w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right font-semibold text-gray-600">البند</th>
                  <th class="p-3 text-center font-semibold text-gray-600">الكمية</th>
                  <th class="p-3 text-center font-semibold text-gray-600">سعر الوحدة</th>
                  <th class="p-3 text-left font-semibold text-gray-600">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="item in workOrder.quotation.items"
                  :key="item.id"
                  class="hover:bg-gray-50"
                >
                  <td class="p-3 text-gray-800">{{ item.description }}</td>
                  <td class="p-3 text-center text-gray-600 font-mono">{{ item.quantity }}</td>
                  <td class="p-3 text-center text-gray-600 font-mono">
                    {{ formatCurrency(item.unit_price) }}
                  </td>
                  <td class="p-3 text-left text-gray-800 font-semibold font-mono">
                    {{ formatCurrency(item.quantity * item.unit_price) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- المجاميع -->
          <div class="w-full max-w-xs ml-auto mt-4 text-sm">
            <div class="space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span
                ><span>{{ formatCurrency(workOrder.quotation.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>الضريبة ({{ workOrder.quotation.tax_amount }}%):</span
                ><span>{{ formatCurrency(workOrder.quotation.tax_amount) }}</span>
              </div>
              <div class="border-t my-2"></div>
              <div class="flex justify-between items-center text-base font-bold text-primary">
                <span>الإجمالي النهائي:</span
                ><span>{{ formatCurrency(workOrder.quotation.total_amount) }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- تذييل الصفحة -->
      <footer class="p-6 text-center text-xs text-gray-400 border-t">
        <p>شكرًا لثقتكم في خدماتنا. هذا التقرير تم إنشاؤه بواسطة نظام إدارة الورشة.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
// ... (السكربت يبقى كما هو بدون أي تغيير)
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import workOrderService from '@/services/workOrderService'
import AppButton from '@/components/base/AppButton.vue'
import { formatCurrency } from '@/utils/formatters.js'
import {
  PrinterIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  PhoneIcon,
  TruckIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const workOrder = ref(null)
const isLoading = ref(true)
const error = ref(null)

watch(workOrder, (newVal) => {
  if (newVal && !isLoading.value) {
    setTimeout(() => window.print(), 500)
  }
})

const fetchPrintData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await workOrderService.getPrintData(route.params.id)
    workOrder.value = response.data.data
  } catch (err) {
    console.error('Error fetching print data:', err) // أضف هذا السطر لرؤية أي أخطاء في الكونسول
    error.value = err.response?.data?.message || 'فشل في تحميل بيانات أمر العمل.'
  } finally {
    isLoading.value = false
  }
}

const triggerPrint = () => window.print()
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG')

onMounted(() => {
  fetchPrintData()
})
</script>

<style>
/* ... (الستايل يبقى كما هو بدون أي تغيير) ... */
.w-a4 {
  width: 210mm;
}
.h-a4 {
  min-height: 297mm;
}

@media print {
  .print-hide {
    display: none !important;
  }
  body {
    background-color: white !important;
  }
  .w-a4,
  .h-a4 {
    width: 100% !important;
    height: 100% !important;
    min-height: unset !important;
  }
  #report-to-print {
    position: absolute;
    left: 0;
    top: 0;
    box-shadow: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }
  body * {
    visibility: hidden;
  }
  #report-to-print,
  #report-to-print * {
    visibility: visible;
  }
  .bg-primary,
  .bg-gray-100,
  .bg-gray-50,
  .hover\:bg-gray-50:hover {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
