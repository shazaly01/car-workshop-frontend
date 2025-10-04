<template>
  <AppCard>
    <template #header>
      <h3 class="text-lg font-bold text-text-primary">نتائج التشخيص</h3>
    </template>

    <!-- عرض البيانات إذا كانت موجودة -->
    <div v-if="diagnosis" class="space-y-4 text-sm">
      <!-- ... (محتوى عرض التشخيص يبقى كما هو) ... -->
      <!-- أكواد OBD -->
      <div v-if="diagnosis.obd_codes && diagnosis.obd_codes.length > 0">
        <h4 class="font-semibold text-text-secondary mb-2">أكواد الأعطال (OBD)</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="code in diagnosis.obd_codes"
            :key="code"
            class="font-mono bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-md text-xs"
          >
            {{ code }}
          </span>
        </div>
      </div>

      <!-- نتائج الفحص اليدوي -->
      <div>
        <h4 class="font-semibold text-text-secondary mb-2">نتائج الفحص اليدوي</h4>
        <p class="bg-surface-ground p-3 rounded-lg whitespace-pre-wrap">
          {{ diagnosis.manual_inspection_results }}
        </p>
      </div>

      <!-- الإصلاحات المقترحة -->
      <div>
        <h4 class="font-semibold text-text-secondary mb-2">الإصلاحات المقترحة</h4>
        <p class="bg-surface-ground p-3 rounded-lg whitespace-pre-wrap">
          {{ diagnosis.proposed_repairs }}
        </p>
      </div>

      <!-- معلومات الفني -->
      <div class="pt-2 border-t border-surface-border text-xs text-text-muted">
        تم التشخيص بواسطة
        <span class="font-semibold">{{ diagnosis.technician?.name || 'غير محدد' }}</span>
        في
        <span class="font-semibold">{{
          new Date(diagnosis.diagnosed_at).toLocaleString('ar-EG')
        }}</span>
      </div>
    </div>

    <!-- [بداية التعديل] رسالة بديلة أو زر إضافة -->
    <div v-else class="text-center py-8">
      <!-- عرض الزر إذا كان مسموحًا بالإضافة -->
      <div v-if="canAddDiagnosis">
        <AppButton variant="success" @click="$emit('add-diagnosis')">
          <PlusIcon class="w-5 h-5 ml-1" />
          إضافة تشخيص
        </AppButton>
      </div>
      <!-- عرض رسالة إذا لم يكن مسموحًا بالإضافة -->
      <p v-else class="text-text-muted">لم يتم إضافة تشخيص بعد.</p>
    </div>
    <!-- [نهاية التعديل] -->

    <!-- قسم الإجراءات في الـ footer -->
    <template #footer v-if="diagnosis">
      <div
        class="flex justify-end p-3 bg-surface-ground border-t border-surface-border rounded-b-lg"
      >
        <AppButton variant="outline" size="sm" @click="$emit('edit-diagnosis')">
          تعديل التشخيص
        </AppButton>
      </div>
    </template>
  </AppCard>
</template>

<script setup>
import AppCard from '@/components/base/AppCard.vue'
import AppButton from '@/components/base/AppButton.vue'
// [جديد] استيراد أيقونة الزائد
import { PlusIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  diagnosis: {
    type: Object,
    default: null,
  },
  // [جديد] استقبال شرط إمكانية الإضافة
  canAddDiagnosis: {
    type: Boolean,
    default: false,
  },
})

// [تعديل] إضافة الحدث الجديد
defineEmits(['edit-diagnosis', 'add-diagnosis'])
</script>
