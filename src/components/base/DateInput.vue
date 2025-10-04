<!-- src/components/base/DateInput.vue -->
<template>
  <div>
    <!-- العنوان (Label) الخاص بالحقل -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-text-secondary mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <!-- أيقونة اختيارية داخل الحقل -->
      <div
        v-if="icon"
        class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5"
      >
        <component :is="icon" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <!-- حقل الإدخال الفعلي -->
      <input
        :id="id"
        type="date"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="bg-surface-ground border border-surface-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
        :class="{ 'ps-10': icon }"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script setup>
import { CalendarIcon } from '@heroicons/vue/24/outline'

// تعريف الـ props لتخصيص المكون
defineProps({
  modelValue: {
    // لدعم v-model
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: () => `date-input-${Math.random().toString(36).substring(7)}`,
  },
  placeholder: {
    type: String,
    default: 'Select date',
  },
  icon: {
    type: Object,
    default: () => CalendarIcon, // أيقونة افتراضية
  },
})

// تعريف الحدث الذي يصدره المكون لدعم v-model
defineEmits(['update:modelValue'])
</script>

<style scoped>
/* لجعل أيقونة اختيار التاريخ في المتصفح متوافقة مع الثيم الداكن */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
}
.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
