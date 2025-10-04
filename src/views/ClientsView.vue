<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <ClientList />
  </div>
</template>

<script setup>
import ClientList from '@/components/clients/ClientList.vue'

// لا حاجة لأي منطق هنا.
// هذا الفصل بين "العرض" (View) و "المكون" (Component) هو ممارسة جيدة
// لأنه يسمح بإعادة استخدام ClientList في أماكن أخرى إذا لزم الأمر،
// بينما يبقى هذا الملف مسؤولاً فقط عن تخطيط الصفحة.
</script>
