<script setup>
import { ref, watch, computed } from 'vue'
import { useVehicleStore } from '@/stores/vehicleStore'
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps({
  vehicleToEdit: {
    type: Object,
    default: null,
  },
  clientId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close', 'vehicle-saved'])

const vehicleStore = useVehicleStore()
const isSubmitting = ref(false)
const errorMessage = ref(null)

const initialFormState = {
  id: null,
  client_id: props.clientId, // <-- دائمًا نأخذ ID العميل من الـ prop
  vin: '',
  plate_number: '',
  make: '',
  model: '',
  year: '',
  color: '',
  mileage: '',
}

const form = ref({ ...initialFormState })

const isEditMode = computed(() => !!props.vehicleToEdit)

// --- [تم التعديل هنا] ---
// مراقبة التغييرات لتعبئة النموذج
watch(
  () => props.vehicleToEdit,
  (newVehicle) => {
    errorMessage.value = null
    if (newVehicle) {
      // في وضع التعديل: ادمج بيانات السيارة مع التأكد من وجود client_id
      form.value = {
        ...initialFormState, // ابدأ بالحالة الأولية لضمان وجود كل الحقول
        ...newVehicle, // ادمج بيانات السيارة المعدلة فوقها
        client_id: props.clientId, // <-- تأكد دائمًا من أن client_id هو الصحيح
      }
    } else {
      // في وضع الإنشاء: أعد التعيين إلى الحالة الأولية
      form.value = { ...initialFormState }
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    let savedVehicle
    if (isEditMode.value) {
      savedVehicle = await vehicleStore.updateVehicle(form.value.id, form.value)
    } else {
      savedVehicle = await vehicleStore.createVehicle(form.value)
    }
    emit('vehicle-saved', savedVehicle)
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

<!-- القالب <template> يبقى كما هو -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- ... جميع حقول الإدخال ... -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="vin"
          label="رقم الهيكل (VIN)"
          v-model="form.vin"
          placeholder="17 حرفًا"
          required
        />
        <AppInput
          id="plate_number"
          label="رقم اللوحة"
          v-model="form.plate_number"
          placeholder="أ ب ج 1234"
          required
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="make"
          label="الشركة المصنعة"
          v-model="form.make"
          placeholder="مثال: Toyota"
          required
        />
        <AppInput
          id="model"
          label="الطراز"
          v-model="form.model"
          placeholder="مثال: Camry"
          required
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppInput
          id="year"
          label="سنة الصنع"
          type="number"
          v-model="form.year"
          placeholder="مثال: 2023"
          required
        />
        <AppInput
          id="color"
          label="اللون (اختياري)"
          v-model="form.color"
          placeholder="مثال: أبيض"
        />
      </div>
      <AppInput
        id="mileage"
        label="الممشى (اختياري)"
        type="number"
        v-model="form.mileage"
        placeholder="مثال: 150000"
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
        <AppButton type="button" variant="outline" @click="closeDialog" :disabled="isSubmitting"
          >إلغاء</AppButton
        >
        <AppButton type="submit" :disabled="isSubmitting">{{
          isSubmitting ? 'جاري الحفظ...' : 'حفظ'
        }}</AppButton>
      </div>
    </div>
  </form>
</template>
