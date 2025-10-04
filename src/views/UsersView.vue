<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- 1. الشريط العلوي للصفحة -->
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-text-primary">إدارة المستخدمين</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-text-secondary">
          عرض وتعديل وحذف المستخدمين وصلاحياتهم.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <AppButton v-if="authStore.hasPermission('create users')" @click="goToCreateUser">
          <PlusIcon class="w-5 h-5 -ml-1 mr-2" />
          إضافة مستخدم جديد
        </AppButton>
      </div>
    </div>

    <!-- 2. بطاقة المحتوى والجدول -->
    <AppCard>
      <AppTable
        :headers="tableHeaders"
        :items="userStore.users"
        :is-loading="userStore.isLoading"
        :pagination="userStore.pagination"
        @page-changed="handlePageChange"
      >
        <!-- تخصيص خلية الدور (Role) -->
        <template #cell-role="{ item }">
          <span v-if="item.roles && item.roles.length > 0" class="font-medium text-primary">
            {{ item.roles[0].name }}
          </span>
          <span v-else class="text-text-muted">لا يوجد دور</span>
        </template>

        <!-- تخصيص خلية الإجراءات (Actions) -->
        <template #cell-actions="{ item }">
          <div class="flex space-x-2 space-x-reverse">
            <AppButton
              v-if="authStore.hasPermission('edit users')"
              size="sm"
              variant="outline"
              @click="goToEditUser(item.id)"
            >
              <PencilIcon class="w-4 h-4" />
            </AppButton>
            <AppButton
              v-if="authStore.hasPermission('delete users') && item.id !== authStore.user.id"
              size="sm"
              variant="danger"
              @click="confirmDeleteUser(item)"
            >
              <TrashIcon class="w-4 h-4" />
            </AppButton>
          </div>
        </template>
      </AppTable>
    </AppCard>

    <!-- 3. مربع حوار تأكيد الحذف -->
    <AppConfirmDialog
      :is-open="isDeleteDialogOpen"
      title="تأكيد حذف المستخدم"
      :message="`هل أنت متأكد من أنك تريد حذف المستخدم '${userToDelete?.name}'؟ لا يمكن التراجع عن هذا الإجراء.`"
      @confirm="executeDelete"
      @cancel="isDeleteDialogOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore' // لاستخدامه في التحقق من الصلاحيات
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppCard from '@/components/base/AppCard.vue'
import AppTable from '@/components/base/AppTable.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppConfirmDialog from '@/components/base/AppConfirmDialog.vue' // افترض وجود هذا المكون

// استيراد الأيقونات
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const toast = useToast()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'name', label: 'الاسم' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'role', label: 'الدور' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
]

// جلب البيانات عند تحميل المكون
onMounted(() => {
  userStore.fetchUsers()
})

// --- دوال التنقل ---
const goToCreateUser = () => {
  router.push({ name: 'user-create' })
}

const goToEditUser = (id) => {
  router.push({ name: 'user-edit', params: { id } })
}

const handlePageChange = (page) => {
  userStore.fetchUsers({ page })
}

// --- منطق الحذف ---
const isDeleteDialogOpen = ref(false)
const userToDelete = ref(null)

const confirmDeleteUser = (user) => {
  userToDelete.value = user
  isDeleteDialogOpen.value = true
}

const executeDelete = async () => {
  if (!userToDelete.value) return

  try {
    await userStore.deleteUser(userToDelete.value.id)
    toast.success(`تم حذف المستخدم '${userToDelete.value.name}' بنجاح.`)
  } catch (error) {
    const message = error.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم.'
    toast.error(message)
  } finally {
    isDeleteDialogOpen.value = false
    userToDelete.value = null
  }
}
</script>
