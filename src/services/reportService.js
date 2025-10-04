// src/services/reportService.js

import apiClient from './apiClient'

/**
 * [مُعدَّل] جلب بيانات تقرير الإيرادات من الواجهة الخلفية.
 * @param {object} params - كائن يحتوي على فلاتر مثل start_date و end_date.
 * @returns {Promise<AxiosResponse>} استجابة axios الكاملة.
 */
export const fetchRevenueReport = (params) => {
  // نرجع الـ Promise مباشرة كما هو ليتم التعامل معه في المكون
  return apiClient.get('/reports/revenue', { params })
}
