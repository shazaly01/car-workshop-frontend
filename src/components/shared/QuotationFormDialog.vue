<template>
  <!-- [تعديل] العنوان الآن ديناميكي -->
  <AppDialog v-model="isDialogVisible" :title="dialogTitle" @close="closeDialog" fullscreen>
    <form @submit.prevent="handleSubmit" class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- 1. الحقول الأساسية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AppInput
            id="issue_date"
            label="تاريخ الإصدار"
            type="date"
            v-model="form.issue_date"
            required
          />
          <AppInput
            id="expiry_date"
            label="تاريخ الانتهاء"
            type="date"
            v-model="form.expiry_date"
            required
          />
        </div>

        <!-- 2. إضافة البنود من الكتالوج -->
        <div class="p-4 border border-surface-border rounded-lg">
          <h4 class="font-bold mb-2">إضافة بنود</h4>
          <div class="relative">
            <AppInput
              id="search_catalog"
              v-model="searchQuery"
              @input="searchCatalogItems"
              placeholder="ابحث عن قطعة غيار أو خدمة..."
            />
            <div
              v-if="searchResults.length > 0 && showSearchResults"
              class="absolute w-full mt-1 bg-surface-overlay border border-surface-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
            >
              <ul>
                <li
                  v-for="item in searchResults"
                  :key="item.id"
                  @click="addItemToQuote(item)"
                  class="p-3 cursor-pointer hover:bg-surface-hover"
                >
                  <p class="font-semibold">{{ item.name }}</p>
                  <p class="text-sm text-text-muted">{{ formatCurrency(item.unit_price) }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 3. جدول البنود المضافة -->
        <div class="overflow-x-auto border border-surface-border rounded-lg">
          <table class="min-w-full text-sm">
            <thead class="bg-surface-ground">
              <tr>
                <th class="p-3 text-right font-semibold w-2/5">البند</th>
                <th class="p-3 text-center font-semibold">الكمية</th>
                <th class="p-3 text-center font-semibold">سعر الوحدة</th>
                <th class="p-3 text-left font-semibold">الإجمالي</th>
                <th class="p-3 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody v-if="form.items.length > 0" class="divide-y divide-surface-border">
              <tr v-for="(item, index) in form.items" :key="item.catalog_item_id || index">
                <td class="p-2">{{ item.description }}</td>
                <td class="p-2">
                  <AppInput
                    type="number"
                    :id="`qty-${index}`"
                    v-model.number="item.quantity"
                    @input="updateTotals"
                    class="w-20 text-center"
                    step="0.1"
                  />
                </td>
                <td class="p-2">
                  <AppInput
                    type="number"
                    :id="`price-${index}`"
                    v-model.number="item.unit_price"
                    @input="updateTotals"
                    class="w-24 text-center"
                    step="0.01"
                  />
                </td>
                <td class="p-2 text-left font-mono">
                  {{ formatCurrency(item.quantity * item.unit_price) }}
                </td>
                <td class="p-2 text-center">
                  <AppButton type="button" variant="danger" size="sm" @click="removeItem(index)">
                    حذف
                  </AppButton>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="5" class="p-8 text-center text-text-muted">
                  لم يتم إضافة أي بنود بعد.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. الإجماليات والملاحظات -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AppTextarea id="notes" label="ملاحظات (اختياري)" v-model="form.notes" rows="5" />
          <div class="space-y-2 text-sm p-4 bg-surface-ground rounded-lg">
            <div class="flex justify-between">
              <span class="text-text-secondary">المجموع الفرعي:</span>
              <span class="font-bold font-mono">{{ formatCurrency(totals.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-secondary">الضريبة (15%):</span>
              <span class="font-bold font-mono">{{ formatCurrency(totals.tax) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold border-t border-dashed pt-2 mt-2">
              <span>المجموع الإجمالي:</span>
              <span class="font-mono">{{ formatCurrency(totals.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. شريط الإجراءات السفلي -->
      <div class="flex-shrink-0 p-4 border-t border-surface-border bg-surface-section">
        <div v-if="errorMessage" class="bg-danger/20 text-danger p-3 rounded-lg text-sm mb-4">
          <p v-if="typeof errorMessage === 'string'">{{ errorMessage }}</p>
          <ul v-else class="list-disc list-inside">
            <li v-for="(errors, field) in errorMessage" :key="field">{{ errors[0] }}</li>
          </ul>
        </div>
        <div class="flex justify-end space-x-3 space-x-reverse">
          <AppButton type="button" variant="outline" @click="closeDialog" :disabled="isSubmitting">
            إلغاء
          </AppButton>
          <AppButton type="submit" :disabled="isSubmitting || form.items.length === 0">
            <span v-if="isSubmitting">جاري الحفظ...</span>
            <!-- [تعديل] نص الزر الآن ديناميكي -->
            <span v-else>{{ submitButtonText }}</span>
          </AppButton>
        </div>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useWorkOrderStore } from '@/stores/workOrderStore'
import { useQuotationStore } from '@/stores/quotationStore' // <-- [جديد] استيراد مخزن عروض الأسعار
import { useCatalogStore } from '@/stores/catalogStore'
import AppDialog from '@/components/base/AppDialog.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppInput from '@/components/base/AppInput.vue'
import AppTextarea from '@/components/base/AppTextarea.vue'
import { debounce } from 'lodash-es'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  workOrderId: { type: Number, required: false },
  // [جديد] إضافة prop لاستقبال بيانات عرض السعر الحالي
  quotation: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'quote-saved'])

const workOrderStore = useWorkOrderStore()
const quotationStore = useQuotationStore() // <-- [جديد]
const catalogStore = useCatalogStore()

const isDialogVisible = ref(props.modelValue)
const isSubmitting = ref(false)
const errorMessage = ref(null)

// --- البحث في الكتالوج ---
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)

const searchCatalogItems = debounce(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  await catalogStore.fetchItems({ search: searchQuery.value })
  searchResults.value = catalogStore.items
  showSearchResults.value = true
}, 300)

// --- بيانات النموذج ---
const form = reactive({
  issue_date: '',
  expiry_date: '',
  notes: '',
  items: [],
})

const totals = reactive({ subtotal: 0, tax: 0, total: 0 })

// --- [جديد] خصائص محسوبة لتحديد الوضع والنصوص ---
const isEditMode = computed(() => !!props.quotation)
const dialogTitle = computed(() => (isEditMode.value ? 'تعديل عرض السعر' : 'إنشاء عرض سعر جديد'))
const submitButtonText = computed(() => (isEditMode.value ? 'حفظ التعديلات' : 'حفظ عرض السعر'))

// --- دوال إدارة البنود ---
const addItemToQuote = (catalogItem) => {
  const existingItem = form.items.find((i) => i.catalog_item_id === catalogItem.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    form.items.push({
      catalog_item_id: catalogItem.id,
      description: catalogItem.name,
      quantity: 1,
      unit_price: parseFloat(catalogItem.unit_price), // التأكد من أنه رقم
    })
  }
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  updateTotals()
}

const removeItem = (index) => {
  form.items.splice(index, 1)
  updateTotals()
}

// --- حساب الإجماليات ---
const updateTotals = () => {
  const subtotal = form.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  )
  const tax = subtotal * 0.15
  totals.subtotal = subtotal
  totals.tax = tax
  totals.total = subtotal + tax
}

// --- [تعديل] دالة إرسال النموذج ---
const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    let updatedWorkOrder // <-- 1. تعريف متغير لالتقاط الاستجابة
    let payload

    if (isEditMode.value) {
      // --- وضع التعديل ---
      payload = {
        notes: form.notes,
        items: form.items.map((item) => ({
          catalog_item_id: item.catalog_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }
      // 2. التقاط الاستجابة من إجراء التحديث
      // ملاحظة: نفترض أن `updateQuotation` يعيد أمر العمل المحدث بالكامل
      updatedWorkOrder = await quotationStore.updateQuotation(props.quotation.id, payload)
    } else {
      // --- وضع الإنشاء ---
      payload = {
        issue_date: form.issue_date,
        expiry_date: form.expiry_date,
        notes: form.notes,
        items: form.items.map((item) => ({
          catalog_item_id: item.catalog_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      }
      // 3. التقاط الاستجابة من إجراء الإنشاء
      updatedWorkOrder = await workOrderStore.createQuotation(props.workOrderId, payload)
    }

    // 4. [الحل] إطلاق الحدث مع إرفاق كائن أمر العمل المحدث
    emit('quote-saved', updatedWorkOrder)

    closeDialog()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMessage.value = error.response.data.errors
    } else {
      errorMessage.value = error.response?.data?.message || 'حدث خطأ غير متوقع.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// --- دوال مساعدة ---
const closeDialog = () => {
  isDialogVisible.value = false // <-- [جديد] تحديث الحالة الداخلية
  emit('update:modelValue', false) // إعلام الأب بالتغيير
}

const formatCurrency = (value) => {
  const num = Number(value)
  if (isNaN(num)) return '0.00 ر.س'
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num)
}

// --- [تعديل] مراقبة فتح النافذة ---
watch(
  () => props.modelValue,
  (newValue) => {
    isDialogVisible.value = newValue
    if (newValue) {
      errorMessage.value = null
      if (isEditMode.value) {
        // وضع التعديل: املأ النموذج بالبيانات الحالية
        form.issue_date = props.quotation.issue_date
        form.expiry_date = props.quotation.expiry_date
        form.notes = props.quotation.notes || ''

        // إنشاء نسخة عميقة من البنود لتجنب التعديل المباشر على الـ prop
        form.items = (props.quotation.items || []).map((item) => ({
          // --- بداية التعديل ---
          // اقرأ المعرّف مباشرة من الحقل الصحيح الذي يرسله الـ API
          catalog_item_id: item.catalog_item_id,
          // --- نهاية التعديل ---

          // احتفظ بالمعلومات الأخرى كما هي
          id: item.id, // من الجيد الاحتفاظ بمعرف البند نفسه أيضاً
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      } else {
        // وضع الإنشاء: أعد تعيين النموذج
        form.issue_date = new Date().toISOString().split('T')[0]
        form.expiry_date = new Date(new Date().setDate(new Date().getDate() + 7))
          .toISOString()
          .split('T')[0]
        form.notes = ''
        form.items = []
      }
      updateTotals() // حساب الإجماليات بعد تعبئة النموذج
    }
  },
)
</script>
