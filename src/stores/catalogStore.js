import { defineStore } from 'pinia'
import { ref } from 'vue'
import catalogService from '@/services/catalogService'

export const useCatalogStore = defineStore('catalog', () => {
  // --- State ---
  const items = ref([])
  const isLoading = ref(false)

  // --- Actions ---

  // 1. جلب جميع البنود
  async function fetchItems(params = {}) {
    // <-- 1. إضافة params هنا
    isLoading.value = true
    try {
      // 2. تمرير الـ params إلى الخدمة
      const response = await catalogService.getItems(params)
      items.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch catalog items:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 2. إنشاء بند جديد
  async function createItem(itemData) {
    try {
      const response = await catalogService.createItem(itemData)

      // [تم الإصلاح هنا] التحقق من بنية الاستجابة
      // إذا كانت البيانات داخل "data" (مثل JsonResource)، استخدمها. وإلا، استخدم الاستجابة مباشرة.
      const newItem = response.data.data || response.data

      // إضافة البند الجديد إلى بداية القائمة في الواجهة فورًا
      items.value.unshift(newItem)
    } catch (error) {
      console.error('Failed to create item:', error)
      throw error
    }
  }

  // 3. تحديث بند موجود
  async function updateItem(id, itemData) {
    try {
      const response = await catalogService.updateItem(id, itemData)

      // [تم الإصلاح هنا] تطبيق نفس المنطق على التحديث
      const updatedItem = response.data.data || response.data

      // تحديث البند في القائمة
      const index = items.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        items.value[index] = updatedItem
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      throw error
    }
  }

  // 4. حذف بند
  async function deleteItem(id) {
    try {
      await catalogService.deleteItem(id)
      // إزالة البند من القائمة
      items.value = items.value.filter((item) => item.id !== id)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // --- Return ---
  return {
    items,
    isLoading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
