/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', ...defaultTheme.fontFamily.sans],
      },
      // [التحسين الرئيسي] لوحة ألوان "الورشة الزرقاء"
      colors: {
        // اللون الأساسي أصبح أزرق ساطع
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#2563eb', // blue-600
        },
        // اللون الثانوي يمكن أن يكون سماويًا فاتحًا للتناسق
        secondary: '#38bdf8', // sky-400

        // ألوان الحالات
        danger: '#f43f5e', // rose-500
        success: '#4ade80', // green-400
        warning: '#facc15', // yellow-400

        // ألوان الخلفيات والأسطح المستوحاة من شاشة الدخول
        'surface-ground': '#0c1425', // الخلفية الرئيسية الداكنة
        'surface-section': '#1e293b', // لون البطاقات والأقسام (أفتح قليلاً)
        'surface-border': '#334155', // لون الحدود
        'surface-overlay': 'rgba(12, 20, 37, 0.5)', // لون البطاقات الزجاجية

        // ألوان النصوص
        'text-primary': '#f8fafc', // أبيض ناصع
        'text-secondary': '#cbd5e1', // رمادي فاتح
        'text-muted': '#94a3b8', // رمادي باهت
      },
    },
  },
  plugins: [],
}
