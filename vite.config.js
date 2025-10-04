// استيراد الأدوات اللازمة من مكتبة Vite و Node.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// الرابط الرسمي لتوثيق Vite
// https://vite.dev/config/
export default defineConfig({
  base: '/',
  // الإضافات (Plugins ) المستخدمة في المشروع
  plugins: [
    vue(), // الإضافة الأساسية لتشغيل Vue
    vueDevTools(), // إضافة أدوات المطورين لـ Vue (مفيدة في التطوير)
  ],

  // إعدادات تحديد مسارات الملفات (Resolving paths)
  resolve: {
    // تعريف اسم مختصر (Alias) للمسارات
    alias: {
      // هذا السطر يسمح لك بكتابة @ بدلاً من المسار الطويل لمجلد src
      // مثال: import MyComponent from '@/components/MyComponent.vue'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
