// src/utils/formatters.js

/**
 * ينسق رقمًا كنص عملة (مثل: LYD 1,234.50).
 * @param {number | string} value - القيمة الرقمية للتنسيق.
 * @param {string} currency - رمز العملة (مثل 'LYD', 'USD').
 * @param {string} locale - الإعدادات المحلية للتنسيق (مثل 'en-US' للأرقام الإنجليزية).
 * @returns {string} - النص المنسق.
 */
export function formatCurrency(value, currency = 'LYD', locale = 'en-US') {
  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return '0.00'
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

/**
 * ينسق تاريخًا إلى نص удобочитаемый (مثل: 04 أكتوبر 2025).
 * @param {string | Date} dateString - التاريخ المراد تنسيقه.
 * @param {string} locale - الإعدادات المحلية للتنسيق.
 * @returns {string} - التاريخ المنسق.
 */
export function formatDate(dateString, locale = 'ar-SA') {
  if (!dateString) return 'غير محدد'

  const date = new Date(dateString)

  // التحقق مما إذا كان التاريخ صالحًا
  if (isNaN(date.getTime())) {
    return 'تاريخ غير صالح'
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
