<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- الصف الأول: الاسم و SKU -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="name"
          label="اسم البند"
          v-model="form.name"
          placeholder="مثال: فلتر زيت"
          required
        />
        <AppInput
          id="sku"
          label="SKU (رمز التخزين)"
          v-model="form.sku"
          placeholder="مثال: OIL-FIL-001"
        />
      </div>

      <!-- الصف الثاني: الوصف -->
      <AppInput
        id="description"
        label="الوصف"
        type="textarea"
        v-model="form.description"
        placeholder="أي تفاصيل إضافية عن البند"
      />

      <!-- الصف الثالث: النوع والسعر -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            for="type"
            class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
            >النوع</label
          >
          <select
            id="type"
            v-model="form.type"
            required
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary"
          >
            <option value="part">قطعة غيار</option>
            <option value="service">خدمة</option>
          </select>
        </div>
        <AppInput
          id="unit_price"
          label="سعر الوحدة"
          type="number"
          step="0.01"
          v-model="form.unit_price"
          placeholder="0.00"
          required
        />
      </div>

      <!-- رسائل الخطأ -->
      <div v-if="errorMessage" class="bg-danger/20 text-danger p-3 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <!-- أزرار الإجراءات -->
      <div class="flex justify-end space-x-3 space-x-reverse pt-4">
        <AppButton type="button" variant="outline" @click="closeDialog" :disabled="isSubmitting">
          إلغاء
        </AppButton>
        <AppButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}
        </AppButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalogStore'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  itemToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const catalogStore = useCatalogStore()
const isSubmitting = ref(false)
const errorMessage = ref('')

const initialFormState = {
  id: null,
  name: '',
  sku: '',
  description: '',
  type: 'part',
  unit_price: '',
}

const form = ref({ ...initialFormState })

const isEditMode = computed(() => !!props.itemToEdit)

// مراقبة التغييرات في `itemToEdit` لتعبئة النموذج
watch(
  () => props.itemToEdit,
  (newItem) => {
    if (newItem) {
      form.value = { ...newItem }
    } else {
      form.value = { ...initialFormState }
    }
    errorMessage.value = '' // إعادة تعيين رسالة الخطأ عند فتح النموذج
  },
  { immediate: true },
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    if (isEditMode.value) {
      await catalogStore.updateItem(form.value.id, form.value)
    } else {
      await catalogStore.createItem(form.value)
    }
    closeDialog()
  } catch (error) {
    // عرض رسائل الخطأ القادمة من الخادم (Validation)
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
    console.error('Submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeDialog = () => {
  emit('close')
}
</script>
