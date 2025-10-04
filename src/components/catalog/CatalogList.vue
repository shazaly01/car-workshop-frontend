<template>
  <div>
    <!-- زر إضافة بند جديد وعنوان الصفحة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">إدارة الاصناف والخدمات</h1>
      <AppButton @click="openFormDialog()"> إضافة بند جديد </AppButton>
    </div>

    <!-- الجدول لعرض البنود -->
    <AppTable
      :headers="tableHeaders"
      :items="catalogStore.items"
      :is-loading="catalogStore.isLoading"
      :row-clickable="false"
    >
      <!-- تخصيص خلية السعر -->
      <template #cell-unit_price="{ item }">
        <span class="font-mono">{{ formatCurrency(item.unit_price) }}</span>
      </template>

      <!-- تخصيص خلية النوع -->
      <template #cell-type="{ item }">
        <span
          class="px-2 py-1 text-xs font-semibold rounded-full"
          :class="
            item.type === 'service' ? 'bg-sky-200 text-sky-800' : 'bg-amber-200 text-amber-800'
          "
        >
          {{ item.type === 'service' ? 'خدمة' : 'قطعة غيار' }}
        </span>
      </template>

      <!-- [تم التعديل هنا] تخصيص خلية الإجراءات بأزرار مباشرة -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-center space-x-2 space-x-reverse">
          <AppButton variant="secondary" size="sm" @click="openFormDialog(item)"> تعديل </AppButton>
          <AppButton variant="danger" size="sm" @click="openDeleteDialog(item)"> حذف </AppButton>
        </div>
      </template>
    </AppTable>

    <!-- نافذة نموذج الإنشاء/التعديل -->
    <AppDialog v-model="isFormDialogVisible" :title="formTitle">
      <CatalogForm :item-to-edit="selectedItem" @close="isFormDialogVisible = false" />
    </AppDialog>

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogVisible"
      title="تأكيد الحذف"
      message="هل أنت متأكد من رغبتك في حذف هذا البند؟ لا يمكن التراجع عن هذا الإجراء."
      @confirmed="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCatalogStore } from '@/stores/catalogStore'
import AppTable from '@/components/base/AppTable.vue'
import AppButton from '@/components/base/AppButton.vue'
// AppDropdown لم نعد بحاجة إليه هنا
import AppDialog from '@/components/base/AppDialog.vue'
import AppConfirmDialog from '@/components/base/AppConfirmDialog.vue'
import CatalogForm from './CatalogForm.vue'

const catalogStore = useCatalogStore()

const tableHeaders = [
  { key: 'name', label: 'الاسم', class: 'text-right' },
  { key: 'sku', label: 'SKU', class: 'text-right' },
  { key: 'type', label: 'النوع', class: 'text-right' },
  { key: 'unit_price', label: 'السعر', class: 'text-right' },
  { key: 'actions', label: 'إجراءات', class: 'text-center', cellClass: 'text-center' },
]

const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedItem = ref(null)

const formTitle = computed(() => (selectedItem.value ? 'تعديل بند' : 'إضافة بند جديد'))

onMounted(() => {
  // جلب البيانات فقط إذا كانت القائمة فارغة
  if (catalogStore.items.length === 0) {
    catalogStore.fetchItems()
  }
})

const openFormDialog = (item = null) => {
  selectedItem.value = item
  isFormDialogVisible.value = true
}

const openDeleteDialog = (item) => {
  selectedItem.value = item
  isDeleteDialogVisible.value = true
}

const handleDelete = async () => {
  if (selectedItem.value) {
    await catalogStore.deleteItem(selectedItem.value.id)
  }
  isDeleteDialogVisible.value = false
  selectedItem.value = null
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value)
}
</script>
