<template>
  <div class="bg-white dark:bg-surface-section rounded-lg shadow-sm overflow-hidden">
    <div class="p-6">
      <h3 class="text-lg font-bold text-gray-800 dark:text-text-primary">بنود الفاتورة</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 dark:bg-surface-ground">
          <tr>
            <th class="py-3 px-6 text-right font-semibold text-gray-600 dark:text-text-secondary">
              البند/الخدمة
            </th>
            <th class="py-3 px-6 text-center font-semibold text-gray-600 dark:text-text-secondary">
              الكمية
            </th>
            <th class="py-3 px-6 text-center font-semibold text-gray-600 dark:text-text-secondary">
              سعر الوحدة
            </th>
            <th class="py-3 px-6 text-left font-semibold text-gray-600 dark:text-text-secondary">
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-surface-border">
          <tr v-for="item in items" :key="item.id">
            <td class="py-4 px-6 text-gray-800 dark:text-text-primary">{{ item.description }}</td>
            <td class="py-4 px-6 text-center text-gray-600 dark:text-text-secondary">
              {{ item.quantity }}
            </td>
            <td class="py-4 px-6 text-center text-gray-600 dark:text-text-secondary font-mono">
              {{ formatCurrency(item.unit_price) }}
            </td>
            <td
              class="py-4 px-6 text-left text-gray-800 dark:text-text-primary font-mono font-semibold"
            >
              {{ formatCurrency(item.total_price) }}
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 dark:bg-surface-ground">
          <tr>
            <td
              colspan="3"
              class="py-3 px-6 text-left font-semibold text-gray-600 dark:text-text-secondary"
            >
              المجموع الفرعي:
            </td>
            <td
              class="py-3 px-6 text-left font-semibold text-gray-800 dark:text-text-primary font-mono"
            >
              {{ formatCurrency(totals.subtotal) }}
            </td>
          </tr>
          <tr>
            <td
              colspan="3"
              class="py-3 px-6 text-left font-semibold text-gray-600 dark:text-text-secondary"
            >
              الضريبة ({{ totals.tax_percentage }}%):
            </td>
            <td
              class="py-3 px-6 text-left font-semibold text-gray-800 dark:text-text-primary font-mono"
            >
              {{ formatCurrency(totals.tax_amount) }}
            </td>
          </tr>
          <tr class="text-base">
            <td
              colspan="3"
              class="py-4 px-6 text-left font-bold text-gray-800 dark:text-text-primary"
            >
              المجموع الإجمالي:
            </td>
            <td
              class="py-4 px-6 text-left font-bold text-gray-900 dark:text-text-primary font-mono"
            >
              {{ formatCurrency(totals.total_amount) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters.js'
const props = defineProps({
  items: { type: Array, required: true },
  totals: { type: Object, required: true }, // نستقبل كائن الفاتورة كله كـ totals
})
</script>
