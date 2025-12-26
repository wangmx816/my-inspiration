import { format as formatDate, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化危废量（单位：吨）
 */
export function formatAmount(amount: number): string {
  if (amount === 0) return '0';
  if (amount < 0.001) return '< 0.001';
  if (amount < 1) return amount.toFixed(3);
  if (amount < 1000) return amount.toFixed(2);
  return amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, 'yyyy-MM-dd');
}

/**
 * 格式化日期为完整格式
 */
export function formatDateLong(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, 'yyyy年MM月dd日', { locale: zhCN });
}

/**
 * 格式化日期为相对时间（如：3天前）
 */
export function formatDateRelative(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}





