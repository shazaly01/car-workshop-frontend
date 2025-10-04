<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- 1. رأس الصفحة -->
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-text-primary">إدارة الأدوار والصلاحيات</h1>
      <AppButton v-if="authStore.hasPermission('create roles')" @click="openNameDialog()">
        إضافة دور جديد
      </AppButton>
    </header>

    <!-- 2. قائمة الأدوار -->
    <RoleList
      :roles="roleStore.roles"
      :is-loading="roleStore.isLoading"
      @edit-name="openNameDialog"
      @edit-permissions="openPermissionsDialog"
      @delete="openDeleteDialog"
    />

    <!-- 3. النوافذ المنبثقة -->
    <RoleNameDialog
      v-model="isNameDialogVisible"
      :initial-data="selectedRole"
      :is-submitting="roleStore.isLoading"
      :errors="formErrors"
      @submit="handleNameSubmit"
    />

    <RolePermissionsDialog
      v-model="isPermissionsDialogVisible"
      :role="selectedRole"
      :is-submitting="roleStore.isLoading"
      @submit="handlePermissionsSubmit"
    />

    <AppConfirmDialog
      v-model="isConfirmDialogVisible"
      title="تأكيد الحذف"
      message="هل أنت متأكد أنك تريد حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء."
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import { useAuthStore } from '@/stores/authStore'
import AppButton from '@/components/base/AppButton.vue'
import AppConfirmDialog from '@/components/base/AppConfirmDialog.vue'
import RoleList from '@/components/roles/RoleList.vue'
import RoleNameDialog from '@/components/roles/RoleNameDialog.vue'
import RolePermissionsDialog from '@/components/roles/RolePermissionsDialog.vue'

const roleStore = useRoleStore()
const authStore = useAuthStore()

const isNameDialogVisible = ref(false)
const isPermissionsDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const selectedRole = ref(null)
const formErrors = ref({})

onMounted(() => {
  roleStore.fetchRoles()
  roleStore.fetchPermissions()
})

const openNameDialog = (role = null) => {
  selectedRole.value = role
  formErrors.value = {}
  isNameDialogVisible.value = true
}

const openPermissionsDialog = (role) => {
  selectedRole.value = role
  isPermissionsDialogVisible.value = true
}

const openDeleteDialog = (role) => {
  selectedRole.value = role
  isConfirmDialogVisible.value = true
}

const handleNameSubmit = async (formData) => {
  formErrors.value = {}
  try {
    if (formData.id) {
      await roleStore.editRoleName(formData.id, { name: formData.name })
    } else {
      await roleStore.addRole({ name: formData.name })
    }
    isNameDialogVisible.value = false
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors
    } else {
      console.error(error)
    }
  }
}

const handlePermissionsSubmit = async (permissions) => {
  if (!selectedRole.value) return
  await roleStore.updateRolePermissions(selectedRole.value.id, permissions)
  isPermissionsDialogVisible.value = false
}

const handleDeleteConfirm = async () => {
  if (!selectedRole.value) return
  await roleStore.removeRole(selectedRole.value.id)
  isConfirmDialogVisible.value = false
}
</script>
