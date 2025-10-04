<template>
  <AppTable :headers="tableHeaders" :items="roles" :is-loading="isLoading" :row-clickable="false">
    <template #cell-name="{ item }">
      <span class="font-bold text-text-primary">{{ item.name }}</span>
    </template>
    <template #cell-permissions_count="{ item }">
      <span class="text-text-secondary">{{ item.permissions.length }} صلاحيات</span>
    </template>
    <template #cell-actions="{ item }">
      <div class="flex items-center gap-2">
        <AppButton
          v-if="authStore.hasPermission('edit roles')"
          @click="$emit('edit-permissions', item)"
          variant="outline"
          size="sm"
          >تعديل الصلاحيات</AppButton
        >
        <AppButton
          v-if="authStore.hasPermission('edit roles') && !isProtectedRole(item.name)"
          @click="$emit('edit-name', item)"
          variant="secondary"
          size="sm"
          >تعديل الاسم</AppButton
        >
        <AppButton
          v-if="authStore.hasPermission('delete roles') && !isProtectedRole(item.name)"
          @click="$emit('delete', item)"
          variant="danger"
          size="sm"
          >حذف</AppButton
        >
      </div>
    </template>
  </AppTable>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppTable from '@/components/base/AppTable.vue'
import AppButton from '@/components/base/AppButton.vue'

defineProps({
  roles: Array,
  isLoading: Boolean,
})

defineEmits(['edit-name', 'edit-permissions', 'delete'])

const authStore = useAuthStore()

const tableHeaders = ref([
  { key: 'name', label: 'اسم الدور' },
  { key: 'permissions_count', label: 'عدد الصلاحيات' },
  { key: 'actions', label: 'إجراءات', class: 'text-left' },
])

const isProtectedRole = (roleName) => ['admin', 'receptionist', 'technician'].includes(roleName)
</script>
