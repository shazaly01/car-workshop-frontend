<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- الصف الأول: الاسم والهاتف -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="client-name"
          label="اسم العميل"
          v-model="form.name"
          placeholder="مثال: محمد الأحمد"
          required
        />
        <AppInput
          id="client-phone"
          label="رقم الهاتف"
          v-model="form.phone"
          placeholder="مثال: 05xxxxxxxx"
          required
        />
      </div>

      <!-- الصف الثاني: البريد الإلكتروني ونوع العميل -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="client-email"
          label="البريد الإلكتروني (اختياري)"
          type="email"
          v-model="form.email"
          placeholder="مثال: client@example.com"
        />
        <div>
          <label
            for="client-type"
            class="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1"
            >نوع العميل</label
          >
          <select
            id="client-type"
            v-model="form.client_type"
            required
            class="block w-full rounded-md shadow-sm transition-colors duration-200 bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-ground dark:border-surface-border dark:text-text-primary dark:focus:ring-primary dark:focus:border-primary"
          >
            <option value="individual">فرد</option>
            <option value="company">شركة</option>
          </select>
        </div>
      </div>

      <!-- الصف الثالث: العنوان -->
      <AppInput
        id="client-address"
        label="العنوان (اختياري)"
        type="textarea"
        v-model="form.address"
        placeholder="تفاصيل عنوان العميل"
      />

      <!-- رسائل الخطأ -->
      <div v-if="errorMessage" class="bg-danger/20 text-danger p-3 rounded-lg text-sm">
        <p v-for="(error, key) in errorMessages" :key="key">{{ error[0] }}</p>
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
import { useClientStore } from '@/stores/clientStore'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  clientToEdit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const clientStore = useClientStore()
const isSubmitting = ref(false)
const errorMessage = ref('') // رسالة خطأ عامة
const errorMessages = ref({}) // رسائل خطأ الحقول

const initialFormState = {
  id: null,
  name: '',
  phone: '',
  email: '',
  address: '',
  client_type: 'individual',
}

const form = ref({ ...initialFormState })

const isEditMode = computed(() => !!props.clientToEdit)

// مراقبة التغييرات في `clientToEdit` لتعبئة النموذج
watch(
  () => props.clientToEdit,
  (newClient) => {
    if (newClient) {
      // نستخدم client_type بدلاً من type لتطابق قاعدة البيانات
      form.value = { ...newClient, client_type: newClient.type || 'individual' }
    } else {
      form.value = { ...initialFormState }
    }
    errorMessage.value = ''
    errorMessages.value = {}
  },
  { immediate: true, deep: true },
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  errorMessages.value = {}
  try {
    if (isEditMode.value) {
      await clientStore.updateClient(form.value.id, form.value)
    } else {
      await clientStore.createClient(form.value)
    }
    closeDialog()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // خطأ في التحقق من الصحة (Validation)
      errorMessage.value = 'يرجى التحقق من البيانات المدخلة.'
      errorMessages.value = error.response.data.errors
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
