<template>
  <AppDialog :model-value="modelValue" @update:modelValue="close" :title="dialogTitle">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AppInput
        id="role-name"
        label="اسم الدور"
        v-model="form.name"
        type="text"
        required
        placeholder="مثال: مشرف محتوى"
      />
      <p v-if="errors.name" class="text-sm text-danger mt-1">{{ errors.name[0] }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <AppButton type="button" variant="secondary" @click="close">إلغاء</AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
        </AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppDialog from '@/components/base/AppDialog.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  initialData: Object,
  isSubmitting: Boolean,
  errors: Object,
})

const emit = defineEmits(['update:modelValue', 'submit'])

const form = ref({ id: null, name: '' })

const dialogTitle = computed(() => (props.initialData?.id ? 'تعديل اسم الدور' : 'إضافة دور جديد'))

watch(
  () => props.initialData,
  (newData) => {
    form.value = newData ? { ...newData } : { id: null, name: '' }
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
