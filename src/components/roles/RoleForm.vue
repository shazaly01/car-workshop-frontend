<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <!-- حقل اسم الدور -->
      <div>
        <AppInput
          id="role-name"
          v-model="form.name"
          label="اسم الدور"
          placeholder="مثال: مدير محتوى"
          required
        />
        <p v-if="errors.name" class="text-sm text-danger mt-1">{{ errors.name[0] }}</p>
      </div>

      <!-- قسم الصلاحيات -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-2"
          >الصلاحيات</label
        >
        <div v-if="isPermissionsLoading" class="text-center text-text-muted">
          جاري تحميل الصلاحيات...
        </div>
        <div v-else class="space-y-4">
          <!-- تجميع الصلاحيات حسب الفئة -->
          <div
            v-for="(permissionGroup, groupName) in groupedPermissions"
            :key="groupName"
            class="p-4 border border-surface-border rounded-lg"
          >
            <h4 class="font-bold text-text-primary capitalize mb-3">{{ groupName }}</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              <div
                v-for="permission in permissionGroup"
                :key="permission.id"
                class="flex items-center"
              >
                <input
                  :id="`perm-${permission.id}`"
                  type="checkbox"
                  :value="permission.id"
                  v-model="form.permissions"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label :for="`perm-${permission.id}`" class="ml-2 text-sm text-text-secondary">
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- أزرار الإجراءات -->
    <div class="mt-8 flex justify-end gap-4">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الدور' }}
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import permissionService from '@/services/permissionService'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => null,
  },
  isSubmitting: Boolean,
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: '',
  permissions: [],
})

const groupedPermissions = ref({})
const isPermissionsLoading = ref(false)

// مراقبة البيانات الأولية لملء النموذج في حالة التعديل
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value.name = newData.name
      form.value.permissions = [...newData.permissions] // نسخ المصفوفة لضمان التفاعلية
    } else {
      form.value.name = ''
      form.value.permissions = []
    }
  },
  { immediate: true, deep: true },
)

// جلب وتجميع الصلاحيات عند تحميل المكون
onMounted(async () => {
  isPermissionsLoading.value = true
  try {
    const response = await permissionService.getPermissions()
    groupedPermissions.value = response.data
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
  } finally {
    isPermissionsLoading.value = false
  }
})

const handleSubmit = () => {
  emit('submit', form.value)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
