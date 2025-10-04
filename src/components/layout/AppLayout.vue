<template>
  <div class="relative flex h-screen bg-gray-100 dark:bg-surface-ground">
    <!-- 1. الشريط الجانبي للشاشات الكبيرة (ثابت) -->
    <div class="hidden lg:flex lg:flex-shrink-0">
      <AppSidebar class="w-64" />
    </div>

    <!-- 2. الشريط الجانبي للشاشات الصغيرة (منبثق) -->
    <transition name="fade">
      <!-- الطبقة المعتمة في الخلفية -->
      <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 z-30 bg-black/60 lg:hidden"
        aria-hidden="true"
      ></div>
    </transition>

    <transition name="slide-in-right">
      <!-- القائمة الفعلية التي تظهر من اليمين -->
      <div v-if="isSidebarOpen" class="fixed top-0 right-0 z-40 h-full lg:hidden">
        <AppSidebar class="w-64 h-full" />
      </div>
    </transition>

    <!-- 3. المحتوى الرئيسي للتطبيق -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- [تم التحديث] تم تغيير اسم المكون من AppTopbar إلى AppHeader -->
      <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <div class="p-4 md:p-6">
          <!-- هنا يتم عرض محتوى الصفحة الحالية (Dashboard, Clients, etc.) -->
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
// [تم التحديث] تم تغيير اسم المكون المستورد
import AppHeader from '@/components/layout/AppHeader.vue'

const isSidebarOpen = ref(false)
const route = useRoute()

// مراقبة حالة القائمة لمنع تمرير الصفحة الخلفية عند فتح القائمة على الموبايل
watch(isSidebarOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

// إغلاق القائمة الجانبية تلقائيًا عند تغيير المسار على الشاشات الصغيرة
// هذا يحسن تجربة المستخدم عند التنقل بين الصفحات على الموبايل
watch(
  () => route.path,
  () => {
    if (isSidebarOpen.value) {
      isSidebarOpen.value = false
    }
  },
)
</script>

<style scoped>
/* أنماط التحريك (من اليمين إلى اليسار لتناسب اللغة العربية) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-in-right-enter-from,
.slide-in-right-leave-to {
  transform: translateX(100%);
}
</style>
