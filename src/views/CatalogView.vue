<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <CatalogList />
  </div>
</template>

<script setup>
import CatalogList from '@/components/catalog/CatalogList.vue'

// لا حاجة لأي منطق إضافي هنا، لأن CatalogList.vue يدير كل شيء.
// هذا الفصل بين "الصفحة" (View) و "المكون" (Component) هو ممارسة جيدة
// لأنه يسمح بإعادة استخدام CatalogList في أماكن أخرى إذا لزم الأمر.
</script>
