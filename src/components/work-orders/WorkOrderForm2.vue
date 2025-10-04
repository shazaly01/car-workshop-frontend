<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- شكوى العميل (حقل إلزامي) -->
      <AppTextarea
        id="client_complaint"
        label="شكوى العميل"
        v-model="form.client_complaint"
        placeholder="صف المشكلة التي يواجهها العميل بالتفصيل..."
        required
        rows="4"
      />

      <!-- ملاحظات الفحص الأولي (حقل اختياري) -->
      <AppTextarea
        id="initial_inspection_notes"
        label="ملاحظات الفحص الأولي (اختياري)"
        v-model="form.initial_inspection_notes"
        placeholder="أي ملاحظات أولية من الفني عند استلام السيارة..."
        rows="3"
      />

      <!-- رسائل الخطأ -->
      <div v-if="errorMessage" class="bg-danger/20 text-danger p-3 rounded-lg text-sm">
        <p v-if="typeof errorMessage === 'string'">{{ errorMessage }}</p>
        <ul v-else class="list-disc list-inside">
          <li v-for="(errors, field) in errorMessage" :key="field">{{ errors[0] }}</li>
        </ul>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex justify-end space-x-3 space-x-reverse pt-4">
        <AppButton type="button" variant="outline" @click="closeDialog" :disabled="isSubmitting">
          إلغاء
        </AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الإنشاء...' : 'إنشاء أمر العمل' }}
        </AppButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkOrderStore } from '@/stores/workOrderStore'
import AppButton from '@/components/base/AppButton.vue'
import AppTextarea from '@/components/base/AppTextarea.vue' // افتراض وجود هذا المكون

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
  vehicleId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close', 'work-order-created'])

const workOrderStore = useWorkOrderStore()
const isSubmitting = ref(false)
const errorMessage = ref(null)

// تهيئة النموذج مع البيانات المستلمة من الـ props
const form = ref({
  client_id: props.clientId,
  vehicle_id: props.vehicleId,
  client_complaint: '',
  initial_inspection_notes: '',
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    const newWorkOrder = await workOrderStore.createWorkOrder(form.value)
    emit('work-order-created', newWorkOrder) // إرسال أمر العمل الجديد للأب
    closeDialog()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMessage.value = error.response.data.errors
    } else {
      errorMessage.value = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const closeDialog = () => {
  emit('close')
}
</script>
