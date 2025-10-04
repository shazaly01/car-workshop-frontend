<template>
  <!-- [تعديل] العنوان الآن ديناميكي -->
  <AppDialog v-model="isDialogVisible" :title="dialogTitle" @close="closeDialog">
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
            <!-- [تعديل] نص الزر الآن ديناميكي -->
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <span v-else>{{ submitButtonText }}</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useWorkOrderStore } from '@/stores/workOrderStore'
import AppDialog from '@/components/base/AppDialog.vue' // نفترض أن النموذج داخل AppDialog
import AppButton from '@/components/base/AppButton.vue'
import AppTextarea from '@/components/base/AppTextarea.vue'

const props = defineProps({
  // v-model للتحكم في ظهور النافذة
  modelValue: { type: Boolean, default: false },
  // في وضع الإنشاء
  clientId: { type: Number, default: null },
  vehicleId: { type: Number, default: null },
  // [جديد] في وضع التعديل
  workOrderToEdit: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const workOrderStore = useWorkOrderStore()
const isSubmitting = ref(false)
const errorMessage = ref(null)

// [تعديل] استخدام reactive للنموذج لتسهيل المراقبة
const form = reactive({
  client_id: null,
  vehicle_id: null,
  client_complaint: '',
  initial_inspection_notes: '',
})

// --- [جديد] منطق تحديد الوضع ---
const isEditMode = computed(() => !!props.workOrderToEdit)
const dialogTitle = computed(() => (isEditMode.value ? 'تعديل أمر العمل' : 'إنشاء أمر عمل جديد'))
const submitButtonText = computed(() => (isEditMode.value ? 'حفظ التعديلات' : 'إنشاء أمر العمل'))

// --- [جديد] مراقبة لملء النموذج في وضع التعديل ---
watch(
  () => props.workOrderToEdit,
  (newVal) => {
    if (isEditMode.value && newVal) {
      form.client_complaint = newVal.client_complaint
      form.initial_inspection_notes = newVal.initial_inspection_notes || ''
      // لا نحتاج لتمرير client_id أو vehicle_id في وضع التعديل
      form.client_id = null
      form.vehicle_id = null
    } else {
      // وضع الإنشاء
      form.client_id = props.clientId
      form.vehicle_id = props.vehicleId
      form.client_complaint = ''
      form.initial_inspection_notes = ''
    }
  },
  { immediate: true }, // immediate: true لتشغيل المراقب فورًا عند تحميل المكون
)

// --- [تعديل] دالة الإرسال الذكية ---
const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    if (isEditMode.value) {
      // وضع التعديل
      await workOrderStore.updateWorkOrder(props.workOrderToEdit.id, {
        client_complaint: form.client_complaint,
        initial_inspection_notes: form.initial_inspection_notes,
      })
    } else {
      // وضع الإنشاء
      await workOrderStore.createWorkOrder({
        client_id: form.client_id,
        vehicle_id: form.vehicle_id,
        client_complaint: form.client_complaint,
        initial_inspection_notes: form.initial_inspection_notes,
      })
    }
    emit('saved')
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

// التحكم في النافذة المنبثقة
const isDialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// const closeDialog = () => {
//   isDialogVisible.value = false // <-- [جديد] تحديث الحالة الداخلية
//   emit('update:modelValue', false) // إعلام الأب بالتغيير
// }
</script>
