<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-gray-900">
    <!-- 1. الخلفية المتحركة (Aurora Background) بألوان زرقاء -->
    <div class="aurora-container">
      <div class="aurora-shape shape1"></div>
      <div class="aurora-shape shape2"></div>
      <div class="aurora-shape shape3"></div>
    </div>

    <!-- 2. المحتوى الرئيسي مع بطاقة تسجيل الدخول -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4" dir="rtl">
      <div
        ref="card"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
        class="glass-card w-full max-w-md"
      >
        <!-- تأثير اللمعان التفاعلي -->
        <div class="card-glare"></div>

        <div class="relative z-10">
          <!-- شعار ونصوص التطبيق الجديدة -->
          <div class="text-center mb-8">
            <!-- أيقونة SVG جديدة (ترس ومفتاح) -->
            <div
              class="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-slate-700/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-14 h-14 text-sky-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20.5c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8Z" />
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path d="M14.5 12a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
                <path
                  d="M17.5 16.2c-1.1-1.1-2.2-2.3-3.3-3.3l-1.4 1.4c1.1 1.1 2.2 2.2 3.3 3.3.4.4 1 .4 1.4 0l1.4-1.4c-.4-.4-1-.4-1.4 0Z"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-white tracking-wider">Auto Master</h1>
            <p class="mt-2 text-slate-300 opacity-80 text-lg">نظام إدارة ورش السيارات</p>
          </div>

          <!-- نموذج تسجيل الدخول المحدث -->
          <form @submit.prevent="submitLogin" class="space-y-6">
            <!-- حقل اسم المستخدم -->
            <div class="relative">
              <input
                type="text"
                v-model="credentials.username"
                placeholder="اسم المستخدم"
                required
                class="form-input"
              />
              <svg
                class="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <!-- حقل كلمة المرور -->
            <div class="relative">
              <input
                type="password"
                v-model="credentials.password"
                placeholder="كلمة المرور"
                required
                class="form-input"
              />
              <svg
                class="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <!-- عرض رسائل الخطأ -->
            <div v-if="errors.general" class="text-sm text-red-300 text-center font-semibold pt-2">
              {{ errors.general }}
            </div>

            <!-- زر تسجيل الدخول -->
            <button type="submit" :disabled="isLoading" class="submit-button">
              <span v-if="isLoading">جاري التحقق...</span>
              <span v-else>تسجيل الدخول</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

// --- منطق تأثير اللمعان التفاعلي (بدون تغيير ) ---
const card = ref(null)
const onMouseMove = (event) => {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  card.value.style.setProperty('--mouse-x', `${x}px`)
  card.value.style.setProperty('--mouse-y', `${y}px`)
}
const onMouseLeave = () => {}

// --- منطق تسجيل الدخول المحدث ليتوافق مع النظام الجديد ---
const authStore = useAuthStore()
const credentials = ref({ username: '', password: '' })
const isLoading = ref(false)
const errors = ref({})

const submitLogin = async () => {
  isLoading.value = true
  errors.value = {}
  try {
    await authStore.handleLogin(credentials.value)
    // إعادة التوجيه تتم الآن داخل authStore
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value.general = 'اسم المستخدم أو كلمة المرور غير صحيحة.'
    } else {
      errors.value.general = 'حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* --- الأنماط الجديدة (Theme) باللون الأزرق --- */
.bg-gray-900 {
  background-color: #0c1425; /* أزرق داكن جدًا */
}

.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  filter: blur(100px) saturate(1.5);
  transform: scale(1.5);
}

.aurora-shape {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
}

.shape1 {
  width: 600px;
  height: 600px;
  background-color: rgba(59, 130, 246, 0.3);
  top: -150px;
  left: -200px;
  animation: move 25s infinite alternate;
}
.shape2 {
  width: 550px;
  height: 550px;
  background-color: rgba(96, 165, 250, 0.2);
  bottom: -100px;
  right: -150px;
  animation: move 30s infinite alternate-reverse;
}
.shape3 {
  width: 500px;
  height: 500px;
  background-color: rgba(37, 99, 235, 0.25);
  bottom: 50px;
  left: 20%;
  animation: move 22s infinite alternate;
}

@keyframes move {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(150px, 80px) rotate(180deg);
  }
}

.glass-card {
  position: relative;
  background: rgba(12, 20, 37, 0.5);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  overflow: hidden;
}

.card-glare {
  position: absolute;
  left: var(--mouse-x, -100%);
  top: var(--mouse-y, -100%);
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 60%);
  pointer-events: none;
  transition:
    left 0.1s ease,
    top 0.1s ease;
}

/* --- إصلاح حقول الإدخال لدعم RTL --- */
.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  /* تم تغيير padding-left إلى padding-right */
  padding: 12px 45px 12px 16px;
  color: white;
  transition: all 0.2s ease-in-out;
}
.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.form-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.input-icon {
  position: absolute;
  top: 50%;
  /* تم تغيير left إلى right */
  right: 16px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.4);
}

.submit-button {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}
.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
}
.submit-button:disabled {
  background: #374151;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
