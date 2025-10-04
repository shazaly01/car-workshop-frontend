<template>
  <!-- [تعديل] العنوان الآن ديناميكي -->
  <AppDialog v-model="isDialogVisible" :title="dialogTitle" @close="closeDialog">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- حقل أكواد الأعطال (OBD) -->
        <div>
          <label for="obd_codes" class="block text-sm font-medium text-text-secondary mb-1">
            أكواد الأعطال (OBD) - اضغط Enter للإضافة
          </label>
          <div class="flex flex-wrap gap-2 p-2 border border-surface-border rounded-lg">
            <span
              v-for="(code, index) in form.obd_codes"
              :key="index"
              class="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-md text-xs font-mono"
            >
              {{ code }}
              <button
                type="button"
                @click="removeObdCode(index)"
                class="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </span>
            <input
              type="text"
              v-model="obdInput"
              @keydown.enter.prevent="addObdCode"
              placeholder="e.g., P0300"
              class="flex-grow bg-transparent focus:outline-none text-sm"
            />
          </div>
        </div>

        <!-- حقل نتائج الفحص اليدوي -->
        <AppTextarea
          id="manual_inspection_results"
          label="نتائج الفحص اليدوي"
          v-model="form.manual_inspection_results"
          placeholder="صف بالتفصيل نتائج الفحص اليدوي للسيارة..."
          required
          rows="5"
        />

        <!-- حقل الإصلاحات المقترحة -->
        <AppTextarea
          id="proposed_repairs"
          label="الإصلاحات المقترحة (اختياري)"
          v-model="form.proposed_repairs"
          placeholder="صف الإجراءات والإصلاحات المقترحة بناءً على التشخيص..."
          rows="4"
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
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <!-- [تعديل] نص الزر الآن ديناميكي -->
            <span v-else>{{ submitButtonText }}</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue' // <-- إضافة computed
import { useWorkOrderStore } from '@/stores/workOrderStore'
import AppDialog from '@/components/base/AppDialog.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppTextarea from '@/components/base/AppTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  workOrderId: {
    type: Number,
    required: true,
  },
  // [جديد] إضافة prop لاستقبال بيانات التشخيص الحالية
  diagnosis: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'diagnosis-saved'])

const workOrderStore = useWorkOrderStore()
const isDialogVisible = ref(props.modelValue)
const isSubmitting = ref(false)
const errorMessage = ref(null)

const obdInput = ref('')
const form = ref({
  obd_codes: [],
  manual_inspection_results: '',
  proposed_repairs: '',
})

// [جديد] خاصية محسوبة لتحديد ما إذا كنا في وضع التعديل
const isEditMode = computed(() => !!props.diagnosis)

// [جديد] خصائص محسوبة للنصوص الديناميكية
const dialogTitle = computed(() =>
  isEditMode.value ? 'تعديل نتائج التشخيص' : 'إضافة نتائج التشخيص',
)
const submitButtonText = computed(() => (isEditMode.value ? 'حفظ التعديلات' : 'حفظ التشخيص'))

// [تعديل] مراقبة فتح النافذة الآن تملأ النموذج بالبيانات إذا كانت موجودة
watch(
  () => props.modelValue,
  (newValue) => {
    isDialogVisible.value = newValue
    if (newValue) {
      errorMessage.value = null
      if (isEditMode.value) {
        // وضع التعديل: املأ النموذج بالبيانات الحالية
        form.value = {
          obd_codes: props.diagnosis.obd_codes ? [...props.diagnosis.obd_codes] : [],
          manual_inspection_results: props.diagnosis.manual_inspection_results || '',
          proposed_repairs: props.diagnosis.proposed_repairs || '',
        }
      } else {
        // وضع الإنشاء: أعد تعيين النموذج
        form.value = {
          obd_codes: [],
          manual_inspection_results: '',
          proposed_repairs: '',
        }
      }
    }
  },
)

const closeDialog = () => {
  isDialogVisible.value = false // <-- [جديد] تحديث الحالة الداخلية
  emit('update:modelValue', false) // إعلام الأب بالتغيير
}

const addObdCode = () => {
  const code = obdInput.value.trim().toUpperCase()
  if (code && !form.value.obd_codes.includes(code)) {
    form.value.obd_codes.push(code)
  }
  obdInput.value = ''
}

const removeObdCode = (index) => {
  form.value.obd_codes.splice(index, 1)
}

// [تعديل] دالة الحفظ الآن تتعامل مع الإنشاء والتحديث

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    let updatedWorkOrder // <-- 1. تعريف متغير لالتقاط الاستجابة

    if (isEditMode.value) {
      // 2. التقاط كائن أمر العمل المحدث من إجراء التحديث
      updatedWorkOrder = await workOrderStore.updateDiagnosis(props.diagnosis.id, form.value)
    } else {
      // 3. التقاط كائن أمر العمل المحدث من إجراء الإنشاء
      updatedWorkOrder = await workOrderStore.addDiagnosis(props.workOrderId, form.value)
    }

    // 4. [الحل] إطلاق الحدث مع إرفاق البيانات المحدثة
    emit('diagnosis-saved', updatedWorkOrder)

    closeDialog()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMessage.value = error.response.data.errors
    } else {
      errorMessage.value = error.response?.data?.message || 'حدث خطأ غير متوقع.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
