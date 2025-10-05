import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// --- استيراد التخطيط والمكونات الأساسية ---
import AppLayout from '@/components/layout/AppLayout.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// --- استيراد الصفحات (Views) ---
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ClientsView from '@/views/ClientsView.vue'
import CatalogView from '@/views/CatalogView.vue'
// استيراد مكون تفاصيل العميل مباشرة لأنه جزء من تدفق العملاء
import ClientDetails from '@/components/clients/ClientDetails.vue'
import RevenueReportView from '@/views/RevenueReportView.vue'
import UsersView from '@/views/UsersView.vue'
import UserFormView from '@/views/UserFormView.vue'
import RolesView from '@/views/RolesView.vue'

// --- تعريف المسارات (Routes) ---
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresAuth: false,
    },
  },

  {
    path: '/print/work-order/:id',
    name: 'work-order-print',
    component: () => import('@/views/print/WorkOrderPrintView.vue'),
    // meta: { requiresAuth: true }, // حماية المسار
  },

  {
    path: '/print/invoice/:id',
    name: 'invoice-print',
    component: () => import('@/views/print/InvoicePrintView.vue'),
    props: true, // لتمرير :id كـ prop
    meta: { requiresAuth: true, layout: 'blank' }, // meta لتحديد أنه تخطيط فارغ
  },

  {
    path: '/print/revenue-report',
    name: 'revenue-report-print',
    component: () => import('@/views/print/RevenueReportPrintView.vue'), // نفترض وجود هذا المكون
    meta: { requiresAuth: true, layout: 'blank' }, // تخطيط فارغ للطباعة
  },
  {
    // المسار الرئيسي الذي يحتوي على جميع صفحات التطبيق المحمية
    path: '/',
    component: AppLayout,
    redirect: '/dashboard', // التوجيه الافتراضي عند الدخول
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView, // تم تصحيحها لتعرض لوحة التحكم الفعلية
        meta: { requiresAuth: true },
      },
      {
        path: 'clients',
        name: 'clients',
        component: ClientsView,
        meta: { requiresAuth: true, permission: 'list clients' },
      },
      {
        // المسار الديناميكي لتفاصيل العميل
        path: 'clients/:id',
        name: 'client-details', // الاسم الذي يستخدمه زر التفاصيل
        component: ClientDetails,
        meta: { requiresAuth: true, permission: 'list clients' }, // يمكن استخدام نفس صلاحية القائمة
        props: true, // لتمرير :id كـ prop للمكون
      },
      {
        path: 'catalog',
        name: 'catalog',
        component: CatalogView,
        meta: { requiresAuth: true, permission: 'manage catalog' },
      },
      {
        path: 'vehicles',
        name: 'vehicles',
        component: () => import('@/views/VehiclesView.vue'), // مثال على التحميل الكسول
        meta: { requiresAuth: true, permission: 'list vehicles' },
      },
      {
        path: 'work-center',
        name: 'work-center',
        component: () => import('@/views/WorkCenterView.vue'),
        meta: { requiresAuth: true, permission: 'list work-orders' },
      },

      {
        path: 'invoices',
        name: 'invoices',
        component: () => import('@/views/InvoicesView.vue'),
        meta: { requiresAuth: true, permission: 'view invoices' },
      },

      {
        path: 'invoices/:id', // <-- المسار الجديد
        name: 'invoice-details',
        component: () => import('@/views/InvoiceDetailsView.vue'),
        props: true, // <-- مهم جدًا
        meta: { requiresAuth: true, permission: 'view invoices' },
      },

      {
        path: 'reports/revenue', // المسار الجديد
        name: 'revenue-report', // اسم المسار الجديد
        component: RevenueReportView,
        meta: { requiresAuth: true, permission: 'view reports' }, // حماية المسار بالصلاحية
      },

      // *** START: ACTIVATE USER MANAGEMENT ROUTES ***
      {
        path: 'users',
        name: 'users',
        component: UsersView,
        meta: { requiresAuth: true, permission: 'list users' },
      },
      {
        path: 'users/create', // مسار إنشاء مستخدم جديد
        name: 'user-create',
        component: UserFormView,
        meta: { requiresAuth: true, permission: 'create users' },
      },
      {
        path: 'users/:id/edit', // مسار تعديل مستخدم موجود
        name: 'user-edit',
        component: UserFormView,
        props: true, // لتمرير :id كـ prop للمكون
        meta: { requiresAuth: true, permission: 'edit users' },
      },

      {
        path: 'roles',
        name: 'roles',
        component: RolesView,
        meta: { requiresAuth: true, permission: 'list roles' }, // حماية المسار بالصلاحية
      },
      // --- مسارات مستقبلية (معلّقة حاليًا) ---
      /*


      {
        path: 'quotations',
        name: 'quotations',
        component: () => import('@/views/QuotationsView.vue'),
        meta: { requiresAuth: true, permission: 'list quotations' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { requiresAuth: true, permission: 'manage users' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/ReportsView.vue'),
        meta: { requiresAuth: true, permission: 'view reports' },
      },
      */
    ],
  },
  // --- مسار صفحة 404 (يجب أن يكون الأخير دائمًا) ---
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
]

// --- إنشاء الراوتر ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // للتحكم في سلوك التمرير عند التنقل
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// --- حارس التوجيه الشامل (Global Navigation Guard) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. التحقق مما إذا كان المسار يتطلب تسجيل دخول
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  }
  // 2. التحقق مما إذا كان المسار يتطلب صلاحية معينة
  else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    console.warn(`Access denied: User does not have permission '${to.meta.permission}'`)
    next({ name: 'dashboard' }) // أو إلى صفحة 403
  }
  // 3. إذا كان المستخدم مسجلاً ويحاول الوصول إلى صفحة تسجيل الدخول
  else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  }
  // 4. إذا كانت كل الشروط سليمة، اسمح بالمرور
  else {
    next()
  }
})

export default router
