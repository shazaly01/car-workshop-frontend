<template>
  <div class="flex justify-end p-3 bg-surface-ground border-t border-surface-border rounded-b-lg">
    <AppButton variant="outline" size="sm" @click="printQuote"> طباعة </AppButton>
  </div>
</template>

<script setup>
import AppButton from '@/components/base/AppButton.vue'

const printQuote = () => {
  alert('سيتم تنفيذ وظيفة الطباعة هنا.')
  // window.print();
}
</script>
