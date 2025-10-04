<template>
  <div class="flex flex-col items-center justify-center h-full text-center">
    <h1 class="text-9xl font-extrabold text-primary">404</h1>
    <p class="text-2xl font-semibold text-gray-700 dark:text-text-secondary mt-4">
      الصفحة غير موجودة
    </p>
    <p class="text-gray-500 dark:text-text-muted mt-2">
      عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.
    </p>
    <AppButton @click="$router.push({ name: 'Dashboard' })" class="mt-8">
      العودة إلى لوحة التحكم
    </AppButton>
  </div>
</template>

<script setup>
import AppButton from '@/components/base/BaseButton.vue'
</script>
