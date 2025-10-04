<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <div v-if="isLoading" class="text-center py-8">جاري التحميل...</div>
    <div v-else>
      <div class="max-h-[60vh] overflow-y-auto border border-surface-border rounded-md">
        <table class="min-w-full divide-y divide-surface-border">
          <thead class="bg-surface-section sticky top-0 z-10">
            <tr>
              <th class="p-3 font-bold text-text-primary text-right">المجموعة</th>
              <th
                v-for="action in permissionActions"
                :key="action.key"
                class="p-3 font-bold text-text-primary text-center"
              >
                {{ action.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border">
            <tr v-for="(group, groupName) in structuredPermissions" :key="groupName">
              <td class="p-3 font-semibold text-text-primary capitalize">
                {{ translateGroupName(groupName) }}
              </td>
              <td v-for="action in permissionActions" :key="action.key" class="p-3 text-center">
                <input
                  v-if="group[action.key]"
                  type="checkbox"
                  :value="group[action.key].id"
                  v-model="selectedPermissions"
                  class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <span v-else class="text-text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton @click="handleSubmit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الصلاحيات' }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleStore } from '@/stores/roleStore'
import AppDialog from '@/components/base/AppDialog.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  role: Object,
  isLoading: Boolean,
  isSubmitting: Boolean,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const roleStore = useRoleStore()
const selectedPermissions = ref([])

const dialogTitle = computed(() => `تعديل صلاحيات دور: ${props.role?.name || ''}`)

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      selectedPermissions.value = newRole.permissions.map((pId) => pId)
    }
  },
  { immediate: true },
)

const permissionActions = ref([
  { key: 'list', label: 'عرض القائمة' },
  { key: 'view', label: 'عرض عنصر' },
  { key: 'create', label: 'إنشاء' },
  { key: 'edit', label: 'تعديل' },
  { key: 'delete', label: 'حذف' },
])

const groupNameMap = {
  users: 'المستخدمون',
  roles: 'الأدوار والصلاحيات',
  dashboard: 'لوحة التحكم',
  catalog: 'الكتالوج',
  'work-orders': 'أوامر العمل',
  diagnosis: 'التشخيص',
  clients: 'العملاء',
  vehicles: 'المركبات',
  quotations: 'عروض الأسعار',
  invoices: 'الفواتير',
  payments: 'المدفوعات',
  reports: 'التقارير',
}

const translateGroupName = (englishName) => groupNameMap[englishName] || englishName

const structuredPermissions = computed(() => {
  const permissions = roleStore.permissions
  if (!permissions || Object.keys(permissions).length === 0) return {}
  const structured = {}
  for (const groupName in permissions) {
    structured[groupName] = permissions[groupName].reduce((acc, permission) => {
      const action = permission.name.split(' ')[0]
      acc[action] = permission
      return acc
    }, {})
  }
  return structured
})

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', selectedPermissions.value)
}
</script>
