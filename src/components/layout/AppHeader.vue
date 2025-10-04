<template>
  <header
    class="flex items-center justify-between h-16 px-4 bg-white dark:bg-surface-section border-b border-gray-200 dark:border-surface-border flex-shrink-0"
  >
    <!-- الجزء الأيمن: زر القائمة للشاشات الصغيرة -->
    <div class="flex items-center">
      <button @click="$emit('toggle-sidebar')" class="text-gray-500 dark:text-text-muted lg:hidden">
        <Bars3Icon class="w-6 h-6" />
      </button>
      <!-- يمكن إضافة عنوان الصفحة هنا لاحقًا إذا أردنا -->
    </div>

    <!-- الجزء الأيسر: الإجراءات -->
    <div class="flex items-center gap-4">
      <!-- 1. زر تبديل الثيم -->
      <button
        @click="themeStore.toggleTheme"
        class="text-gray-500 dark:text-text-muted hover:text-primary dark:hover:text-primary"
      >
        <SunIcon v-if="themeStore.currentTheme === 'dark'" class="w-6 h-6" />
        <MoonIcon v-else class="w-6 h-6" />
      </button>

      <!-- 2. قائمة المستخدم المنسدلة -->
      <div class="relative">
        <button @click="isUserMenuOpen = !isUserMenuOpen" class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700 dark:text-text-secondary hidden sm:inline">
            {{ authStore.user?.name || 'مستخدم' }}
          </span>
          <div
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-surface-border flex items-center justify-center text-gray-500 dark:text-text-muted"
          >
            <UserIcon class="w-5 h-5" />
          </div>
        </button>

        <!-- القائمة المنسدلة الفعلية -->
        <transition name="fade">
          <div
            v-if="isUserMenuOpen"
            class="absolute left-0 mt-2 w-48 bg-white dark:bg-surface-section rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
          >
            <a href="#" class="dropdown-item">
              <UserCircleIcon class="w-5 h-5" />
              <span>الملف الشخصي</span>
            </a>
            <a @click.prevent="handleLogout" href="#" class="dropdown-item text-danger">
              <ArrowLeftOnRectangleIcon class="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useRouter } from 'vue-router'

// استيراد الأيقونات
import {
  Bars3Icon,
  UserIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'

// تعريف الـ emits
defineEmits(['toggle-sidebar'])

// استدعاء المتاجر والراوتر
const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

// حالة القائمة المنسدلة للمستخدم
const isUserMenuOpen = ref(false)

// دالة تسجيل الخروج
const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.dropdown-item {
  @apply flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-text-secondary;
  @apply hover:bg-gray-100 dark:hover:bg-surface-border;
}
.text-danger {
  color: theme('colors.danger');
}
.text-danger:hover {
  @apply bg-danger/10;
}

/* أنماط التحريك للقائمة المنسدلة */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
