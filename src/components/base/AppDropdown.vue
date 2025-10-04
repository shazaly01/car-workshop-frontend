<!-- src/components/base/AppDropdown.vue -->
<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- 1. المُشغِّل (Trigger) -->
    <div @click="toggleDropdown">
      <slot name="trigger"></slot>
    </div>

    <!-- 2. المحتوى (Content) -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-surface-overlay ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      >
        <!-- ✨ تم تغيير z-10 إلى z-50 لضمان ظهور القائمة في الأعلى دائمًا -->
        <slot name="content" :close-dropdown="closeDropdown"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// دالة لإغلاق القائمة عند النقر خارجها
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// إضافة وإزالة مستمع الأحداث
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

defineExpose({ closeDropdown })
</script>
