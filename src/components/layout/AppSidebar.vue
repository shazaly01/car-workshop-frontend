<template>
  <aside
    class="flex h-full flex-col bg-surface-section border-l border-surface-border lg:border-l-0 lg:border-r"
  >
    <!-- 1. الشعار (بدون تغيير) -->
    <div class="flex items-center justify-between h-16 px-5 flex-shrink-0">
      <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-2">
        <WrenchScrewdriverIcon class="h-8 w-8 text-primary" />
        <h1 class="text-xl font-bold text-text-primary">AutoCare</h1>
      </RouterLink>
    </div>

    <!-- 2. روابط التنقل بالترتيب المنطقي الجديد -->
    <div class="flex flex-1 flex-col justify-between mt-4 overflow-y-auto">
      <nav class="px-3 space-y-1">
        <!-- المجموعة الأولى: العمليات والمحاسبة -->
        <template v-for="link in mainLinks" :key="link.name">
          <RouterLink
            v-if="authStore.hasPermission(link.permission)"
            :to="{ name: link.routeName }"
            class="nav-link"
          >
            <component :is="link.icon" class="h-6 w-6" stroke-width="1.5" />
            <span class="mx-2 text-base font-medium">{{ link.name }}</span>
          </RouterLink>
        </template>

        <!-- فاصل -->
        <div class="py-2"><hr class="border-t border-surface-border/50" /></div>

        <!-- المجموعة الثانية: الإدارة والنظام -->
        <template v-for="link in adminLinks" :key="link.name">
          <RouterLink
            v-if="authStore.hasPermission(link.permission)"
            :to="{ name: link.routeName }"
            class="nav-link"
          >
            <component :is="link.icon" class="h-6 w-6" stroke-width="1.5" />
            <span class="mx-2 text-base font-medium">{{ link.name }}</span>
          </RouterLink>
        </template>
      </nav>

      <!-- 3. تسجيل الخروج (بدون تغيير) -->
      <div class="pt-4 mt-auto px-2 border-t border-surface-border">
        <a @click.prevent="handleLogout" href="#" class="nav-link text-danger hover:bg-danger/10">
          <ArrowLeftOnRectangleIcon class="h-6 w-6" stroke-width="1.5" />
          <span class="mx-2 text-base font-medium">تسجيل الخروج</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

// استيراد الأيقونات
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BookOpenIcon, // إعادة استخدام أيقونة الكتاب
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const router = useRouter()

// [التحسين] تقسيم الروابط إلى مجموعتين منطقيتين فقط
const mainLinks = computed(() => [
  { name: 'لوحة التحكم', routeName: 'dashboard', icon: HomeIcon, permission: 'view dashboard' },
  {
    name: 'مركز العمل',
    routeName: 'work-center',
    icon: WrenchScrewdriverIcon,
    permission: 'list work-orders',
  },
  { name: 'العملاء', routeName: 'clients', icon: UserGroupIcon, permission: 'list clients' },
  {
    name: 'الفواتير',
    routeName: 'invoices',
    icon: CurrencyDollarIcon,
    permission: 'view invoices',
  },
  {
    name: 'عروض الأسعار',
    routeName: 'quotations',
    icon: DocumentChartBarIcon,
    permission: 'list quotations',
  },
])

const adminLinks = computed(() => [
  // [التحسين الرئيسي] دمج الأصناف والخدمات في زر واحد باسم جديد
  {
    name: 'الأصناف والخدمات',
    routeName: 'catalog',
    icon: BookOpenIcon,
    permission: 'manage catalog',
  },
  { name: 'التقارير', routeName: 'revenue-report', icon: ChartBarIcon, permission: 'view reports' },
  { name: 'المستخدمون', routeName: 'users', icon: UsersIcon, permission: 'list users' },
  {
    name: 'الأدوار والصلاحيات',
    routeName: 'roles',
    icon: ShieldCheckIcon,
    permission: 'list roles',
  },
])

// دالة تسجيل الخروج (بدون تغيير)
const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}

// صلاحية عامة وهمية للوحة التحكم (بدون تغيير)
if (!authStore.hasPermission('view dashboard')) {
  authStore.user.permissions.push('view dashboard')
}
</script>

<style scoped>
/* الأنماط هنا لم تتغير */
.nav-link {
  @apply flex items-center px-3 py-2.5 transition-colors duration-300 transform;
  @apply text-text-secondary rounded-lg;
}
.nav-link:hover {
  @apply bg-surface-border text-text-primary;
}
.router-link-exact-active {
  background-image: linear-gradient(
    to right,
    theme('colors.primary.DEFAULT / 15%'),
    theme('colors.primary.DEFAULT / 5%')
  );
  @apply text-white font-bold;
  border-right: 4px solid theme('colors.secondary');
  box-shadow: 0 4px 15px -5px theme('colors.primary.DEFAULT / 40%');
}
.text-danger {
  color: theme('colors.danger');
}
.nav-link.text-danger:hover {
  @apply bg-danger/10 text-red-400;
}
</style>
