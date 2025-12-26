# 样式问题修复指南

## 问题
NativeWind v4 在 Web 平台上可能无法正确加载样式。

## 解决方案

### 方案 1: 检查 CSS 导入
确保 `global.css` 在 `app/_layout.tsx` 中正确导入：
```tsx
import '../global.css';
```

### 方案 2: 使用内联样式（临时方案）
如果 NativeWind 不工作，可以使用 React Native 的 StyleSheet：

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
  },
});
```

### 方案 3: 检查浏览器控制台
1. 打开浏览器开发者工具 (F12)
2. 检查 Console 标签页是否有错误
3. 检查 Network 标签页，确认 CSS 文件是否加载
4. 检查 Elements 标签页，查看元素是否有 className 属性

### 方案 4: 清除缓存并重启
```bash
cd my-app
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear
```

### 方案 5: 验证 NativeWind 配置
确保以下文件配置正确：
- `tailwind.config.js` - Tailwind 配置
- `babel.config.js` - Babel 配置（包含 nativewind/babel）
- `postcss.config.js` - PostCSS 配置
- `global.css` - 包含 @tailwind 指令

## 当前配置状态
- ✅ `global.css` 已创建并包含 @tailwind 指令
- ✅ `babel.config.js` 已配置 nativewind/babel
- ✅ `tailwind.config.js` 已配置
- ✅ `postcss.config.js` 已创建
- ✅ `app/_layout.tsx` 已导入 global.css

## 调试步骤
1. 打开浏览器控制台 (F12)
2. 检查是否有 CSS 相关的错误
3. 查看元素是否有 className 属性
4. 检查 Network 标签，确认 CSS 文件加载
5. 尝试硬刷新 (Ctrl+Shift+R 或 Cmd+Shift+R)




