<template>
  <div>
    <!-- رأس الصفحة: العنوان وزر الإضافة -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-text-primary">قائمة العملاء</h1>
      <AppButton @click="openFormDialog()"> إضافة عميل جديد </AppButton>
    </div>

    <!-- جدول عرض العملاء -->
    <AppTable
      :headers="tableHeaders"
      :items="clientStore.clients"
      :is-loading="clientStore.isLoading"
      :row-clickable="false"
    >
      <!-- تخصيص خلية نوع العميل -->
      <template #cell-type="{ item }">
        <span
          class="px-2 py-1 text-xs font-semibold rounded-full"
          :class="
            item.type === 'company'
              ? 'bg-purple-200 text-purple-800'
              : 'bg-green-200 text-green-800'
          "
        >
          {{ item.type === 'company' ? 'شركة' : 'فرد' }}
        </span>
      </template>

      <!-- [تم التعديل هنا] تخصيص خلية الإجراءات مع زر التفاصيل -->
      <template #cell-actions="{ item }">
        <div class="flex items-center justify-center space-x-2 space-x-reverse">
          <AppButton variant="outline" size="sm" @click="viewClientDetails(item)">
            تفاصيل
          </AppButton>
          <AppButton variant="secondary" size="sm" @click="openFormDialog(item)"> تعديل </AppButton>
          <AppButton variant="danger" size="sm" @click="openDeleteDialog(item)"> حذف </AppButton>
        </div>
      </template>
    </AppTable>

    <!-- نافذة نموذج الإنشاء/التعديل -->
    <AppDialog v-model="isFormDialogVisible" :title="formTitle">
      <ClientForm :client-to-edit="selectedClient" @close="isFormDialogVisible = false" />
    </AppDialog>

    <!-- نافذة تأكيد الحذف -->
    <AppConfirmDialog
      v-model="isDeleteDialogVisible"
      title="تأكيد حذف العميل"
      message="هل أنت متأكد من رغبتك في حذف هذا العميل؟ سيتم حذف جميع البيانات المرتبطة به."
      @confirmed="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/clientStore'
import AppTable from '@/components/base/AppTable.vue'
import AppButton from '@/components/base/AppButton.vue'
import AppDialog from '@/components/base/AppDialog.vue'
import AppConfirmDialog from '@/components/base/AppConfirmDialog.vue'
import ClientForm from './ClientForm.vue'

const router = useRouter()
const clientStore = useClientStore()

// تعريف أعمدة الجدول
const tableHeaders = [
  { key: 'name', label: 'الاسم', class: 'text-right' },
  { key: 'phone', label: 'الهاتف', class: 'text-right' },
  { key: 'email', label: 'البريد الإلكتروني', class: 'text-right' },
  { key: 'type', label: 'النوع', class: 'text-right' },
  { key: 'actions', label: 'إجراءات', class: 'text-center', cellClass: 'w-56 text-center' }, // زيادة عرض العمود
]

// إدارة حالة النوافذ المنبثقة
const isFormDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const selectedClient = ref(null)

const formTitle = computed(() => (selectedClient.value ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'))

// جلب البيانات عند تحميل المكون
onMounted(() => {
  if (clientStore.clients.length === 0) {
    clientStore.fetchClients()
  }
})

// دالة للانتقال لصفحة تفاصيل العميل
const viewClientDetails = (client) => {
  router.push({ name: 'client-details', params: { id: client.id } })
}

// فتح نافذة النموذج (مع أو بدون بيانات للتعديل)
const openFormDialog = (client = null) => {
  selectedClient.value = client
  isFormDialogVisible.value = true
}

// فتح نافذة تأكيد الحذف
const openDeleteDialog = (client) => {
  selectedClient.value = client
  isDeleteDialogVisible.value = true
}

// تنفيذ الحذف بعد التأكيد
const handleDelete = async () => {
  if (selectedClient.value) {
    await clientStore.deleteClient(selectedClient.value.id)
  }
  isDeleteDialogVisible.value = false
  selectedClient.value = null
}
</script>
