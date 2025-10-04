<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- 1. الشريط العلوي ورابط العودة -->
    <div class="mb-6">
      <RouterLink :to="{ name: 'users' }" class="text-primary hover:underline">
        &larr; العودة إلى قائمة المستخدمين
      </RouterLink>
      <h1 class="text-3xl font-bold text-text-primary mt-2">
        {{ isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد' }}
      </h1>
    </div>

    <!-- 2. عرض مؤشر التحميل -->
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-text-secondary">جاري تحميل البيانات...</p>
      <!-- يمكنك إضافة أيقونة تحميل هنا -->
    </div>

    <!-- 3. النموذج -->
    <div
      v-else
      class="max-w-4xl mx-auto bg-surface-section p-6 sm:p-8 rounded-xl shadow-lg border border-surface-border"
    >
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- الاسم -->
          <div class="md:col-span-2">
            <label for="name" class="block text-sm font-medium text-text-secondary mb-1"
              >الاسم الكامل</label
            >
            <AppInput id="name" v-model="formData.name" required placeholder="مثال: محمد الأحمد" />
          </div>

          <!-- البريد الإلكتروني -->
          <div class="md:col-span-2">
            <label for="email" class="block text-sm font-medium text-text-secondary mb-1"
              >البريد الإلكتروني</label
            >
            <AppInput
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="example@domain.com"
            />
          </div>

          <!-- تلميح كلمة المرور -->
          <div
            v-if="isEditMode"
            class="md:col-span-2 bg-blue-500/10 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300"
          >
            اترك حقول كلمة المرور فارغة إذا كنت لا تريد تغييرها.
          </div>

          <!-- كلمة المرور -->
          <div>
            <label for="password" class="block text-sm font-medium text-text-secondary mb-1"
              >كلمة المرور</label
            >
            <AppInput
              id="password"
              v-model="formData.password"
              type="password"
              :required="!isEditMode"
            />
          </div>

          <!-- تأكيد كلمة المرور -->
          <div>
            <label
              for="password_confirmation"
              class="block text-sm font-medium text-text-secondary mb-1"
              >تأكيد كلمة المرور</label
            >
            <AppInput
              id="password_confirmation"
              v-model="formData.password_confirmation"
              type="password"
              :required="formData.password !== ''"
            />
          </div>

          <!-- الدور -->
          <div class="md:col-span-2">
            <label for="role" class="block text-sm font-medium text-text-secondary mb-1"
              >الدور</label
            >
            <select v-model="formData.role_id" id="role" required class="app-select">
              <option disabled value="">اختر دوراً للمستخدم...</option>
              <option v-for="role in userStore.roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- عرض رسائل الخطأ -->
        <div v-if="formError" class="mt-6 bg-danger/10 p-4 rounded-md text-sm text-danger-dark">
          <p class="font-bold mb-2">حدث خطأ في التحقق من البيانات:</p>
          <ul class="list-disc list-inside space-y-1">
            <template v-for="(errors, field) in formError" :key="field">
              <li v-for="error in errors" :key="error">{{ error }}</li>
            </template>
          </ul>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
          <AppButton type="button" variant="secondary" @click="router.push({ name: 'users' })">
            إلغاء
          </AppButton>
          <AppButton type="submit" :is-loading="userStore.isLoading">
            {{ isEditMode ? 'حفظ التغييرات' : 'إنشاء المستخدم' }}
          </AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppInput from '@/components/base/AppInput.vue'
import AppButton from '@/components/base/AppButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

// تحديد وضع التعديل بناءً على وجود ID في المسار
const userId = computed(() => route.params.id)
const isEditMode = computed(() => !!userId.value)

// حالة النموذج
const formData = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role_id: '',
})
const formError = ref(null)
const isLoading = ref(false)

// جلب البيانات عند تحميل المكون
onMounted(async () => {
  isLoading.value = true
  // دائمًا تأكد من وجود قائمة الأدوار
  await userStore.fetchRoles()

  // إذا كنا في وضع التعديل، اجلب بيانات المستخدم
  if (isEditMode.value) {
    const user = await userStore.fetchUser(userId.value)
    if (user) {
      formData.value.name = user.name
      formData.value.email = user.email
      formData.value.role_id = user.roles[0]?.id || '' // الحصول على id الدور الأول
    } else {
      toast.error('لم يتم العثور على المستخدم المطلوب.')
      router.push({ name: 'users' })
    }
  }
  isLoading.value = false
})

// دالة إرسال النموذج
const handleSubmit = async () => {
  formError.value = null
  // التحقق من تطابق كلمتي المرور في الواجهة الأمامية قبل الإرسال
  if (formData.value.password !== formData.value.password_confirmation) {
    formError.value = { password: ['كلمتا المرور غير متطابقتين.'] }
    return
  }

  try {
    let successMessage = ''
    if (isEditMode.value) {
      await userStore.updateUser(userId.value, formData.value)
      successMessage = 'تم تحديث بيانات المستخدم بنجاح!'
    } else {
      await userStore.createUser(formData.value)
      successMessage = 'تم إنشاء المستخدم بنجاح!'
    }
    toast.success(successMessage)
    router.push({ name: 'users' })
  } catch (error) {
    if (error.response && error.response.status === 422) {
      formError.value = error.response.data.errors
    } else {
      const message = error.response?.data?.message || 'حدث خطأ غير متوقع.'
      toast.error(message)
    }
  }
}
</script>

<style scoped>
/* تنسيق مخصص لحقل الاختيار (select) ليتناسب مع التصميم */
.app-select {
  @apply bg-surface-ground border border-surface-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5;
}
</style>
