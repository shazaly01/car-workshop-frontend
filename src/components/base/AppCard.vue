<template>
  <div
    class="w-full bg-surface-section/60 dark:bg-surface-section/60 backdrop-blur-xl rounded-2xl border border-surface-border/50 shadow-sm transition-all duration-300 flex flex-col"
  >
    <!-- 1. قسم الهيدر (Header Slot) -->
    <div v-if="$slots.header" class="p-4 border-b border-surface-border">
      <slot name="header"></slot>
    </div>

    <!-- 2. قسم المحتوى الرئيسي (Default Slot) -->
    <div class="p-6 flex-grow">
      <slot></slot>
    </div>

    <!-- 3. قسم الفوتر (Footer Slot) -->
    <div v-if="$slots.footer">
      <!-- لا نضيف padding هنا لأن البطاقات الفرعية تضيفه بنفسها -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>
