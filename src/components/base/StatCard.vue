<template>
  <!-- [مُحسَّن] استخدام مكون ديناميكي: RouterLink إذا كان to موجودًا، وإلا div -->
  <component
    :is="wrapperComponent"
    :to="to"
    class="relative p-6 rounded-2xl overflow-hidden transition-all duration-300 ease-in-out group"
    :class="[colorClasses.bg, { 'cursor-pointer': !!to }]"
  >
    <div class="relative z-10">
      <div class="flex items-center justify-between">
        <p class="font-bold text-text-primary">{{ title }}</p>
        <component
          :is="icon"
          class="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
          :class="colorClasses.icon"
        />
      </div>
      <p class="text-4xl font-extrabold text-text-primary mt-4">{{ value }}</p>
    </div>
    <!-- عنصر زخرفي في الخلفية -->
    <div
      class="absolute -bottom-8 -end-8 text-white/5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125"
    >
      <component :is="icon" class="w-32 h-32" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  // [مُعدَّل] to أصبحت اختيارية
  to: {
    type: [Object, String], // يمكن أن تكون كائنًا أو نصًا
    required: false, // لم تعد مطلوبة
    default: null,
  },
  title: String,
  value: [String, Number],
  icon: [Object, Function],
  color: {
    type: String,
    default: 'primary',
  },
})

// [جديد] تحديد المكون الذي سيغلف البطاقة
const wrapperComponent = computed(() => {
  // إذا كانت الخاصية 'to' موجودة، استخدم RouterLink
  // وإلا، استخدم 'div' عادي
  return props.to ? RouterLink : 'div'
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'success':
      return { bg: 'bg-success/10 hover:bg-success/20', icon: 'text-success' }
    case 'warning':
      return { bg: 'bg-warning/10 hover:bg-warning/20', icon: 'text-warning' }
    default:
      return { bg: 'bg-primary/10 hover:bg-primary/20', icon: 'text-primary' }
  }
})
</script>
