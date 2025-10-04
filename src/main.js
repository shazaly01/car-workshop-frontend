// --- Vue Core & Plugins ---
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'

// --- Root Component ---
import App from './App.vue'

// --- UI Libraries & Services ---
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'vue-toastification'

// --- Styles ---
import 'primeicons/primeicons.css' // أنماط أيقونات PrimeVue
import 'vue-toastification/dist/index.css' // أنماط مكتبة الإشعارات
import './assets/main.css' // ملف الأنماط الرئيسي (يحتوي على Tailwind)

// --- Create Vue App Instance ---
const app = createApp(App)

// --- Use Core Plugins ---
app.use(createPinia())
app.use(router)

// --- Use UI Libraries ---

// 1. إعداد PrimeVue
app.use(PrimeVue, { unstyled: true }) // خيار unstyled مهم جدًا ليعمل مع Tailwind CSS

// 2. إعداد خدمات PrimeVue
app.use(ToastService)
app.use(ConfirmationService)

// 3. إعداد vue-toastification (الإشعارات)
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: true, // مهم جدًا لدعم اللغة العربية
}
app.use(Toast, toastOptions)

// --- Mount The App ---
app.mount('#app')
