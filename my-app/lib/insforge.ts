import { createClient } from '@insforge/sdk';

// 从环境变量获取配置，如果没有则使用默认值
const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://uu9vud59.ap-southeast.insforge.app';
const anonKey = process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTE2NjF9.vZQ0oAebQK8nJHYQxUkrdBKugKi7DlYg-A-4Or8DQas';

if (!anonKey) {
  console.warn('InsForge anon key is not set. Please set EXPO_PUBLIC_INSFORGE_ANON_KEY in your .env file.');
}

console.log('InsForge Config:', { baseUrl, hasAnonKey: !!anonKey }); // 调试用

export const insforge = createClient({
  baseUrl,
  anonKey,
});

