<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <!-- 1. أيقونة أو صورة معبرة -->
      <!-- هذا SVG مدمج ولا يحتاج إلى ملفات خارجية -->
      <div class="illustration">
        <svg
          width="150"
          height="150"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="#4A5568"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8.34315 15.6569C8.34315 15.6569 9.99999 14 12 14C14 14 15.6569 15.6569 15.6569 15.6569"
            stroke="#4A5568"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 9L9.01 9"
            stroke="#4A5568"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M15 9L15.01 9"
            stroke="#4A5568"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18 18L6 6"
            stroke="#EF4444"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 2. عنوان الخطأ -->
      <h1 class="title">404 - الصفحة غير موجودة</h1>

      <!-- 3. رسالة توضيحية للمستخدم -->
      <p class="message">
        عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم حذفها أو أن الرابط الذي اتبعته
        غير صحيح.
      </p>

      <!-- 4. زر للعودة إلى الصفحة الرئيسية -->
      <button @click="goHome" class="home-button">العودة إلى لوحة التحكم</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// استدعاء الراوتر للانتقال بين الصفحات
const router = useRouter()

// دالة للعودة إلى الصفحة الرئيسية (لوحة التحكم)
const goHome = () => {
  router.push({ name: 'dashboard' })
}
</script>

<style scoped>
/* استخدام متغيرات CSS لتسهيل تعديل الألوان */
:root {
  --bg-color: #f7fafc;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --button-bg: #4299e1;
  --button-text: #ffffff;
  --button-hover-bg: #2b6cb0;
}

.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* تأخذ كامل ارتفاع الشاشة */
  background-color: var(--bg-color, #f7fafc);
  font-family: 'Cairo', sans-serif; /* يفضل استخدام خط عربي مناسب */
  text-align: center;
  padding: 20px;
  direction: rtl; /* لضمان التنسيق الصحيح للعربية */
}

.content-wrapper {
  max-width: 500px;
  width: 100%;
}

.illustration {
  margin-bottom: 2rem; /* 32px */
}

.title {
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  color: var(--text-primary, #2d3748);
  margin-bottom: 1rem; /* 16px */
}

.message {
  font-size: 1.125rem; /* 18px */
  color: var(--text-secondary, #718096);
  line-height: 1.6;
  margin-bottom: 2.5rem; /* 40px */
}

.home-button {
  background-color: var(--button-bg, #4299e1);
  color: var(--button-text, #ffffff);
  font-size: 1rem; /* 16px */
  font-weight: 600;
  padding: 0.75rem 2rem; /* 12px 32px */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.home-button:hover {
  background-color: var(--button-hover-bg, #2b6cb0);
}
</style>
