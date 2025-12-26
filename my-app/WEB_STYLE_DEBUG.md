# Web 样式调试指南

## 问题诊断

如果样式在 Web 平台上不显示，请按以下步骤检查：

### 1. 检查浏览器控制台
打开浏览器开发者工具 (F12)，查看：
- **Console 标签**: 是否有 CSS 或样式相关的错误？
- **Network 标签**: `global.css` 文件是否成功加载？
- **Elements 标签**: 检查元素是否有 `className` 属性？样式是否应用？

### 2. 验证 NativeWind 配置

确保以下配置正确：

#### `babel.config.js`
```js
presets: [
  ["babel-preset-expo", { jsxImportSource: "nativewind" }],
  "nativewind/babel",
],
```

#### `tailwind.config.js`
```js
content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
],
presets: [require("nativewind/preset")],
```

#### `app/_layout.tsx`
```tsx
import '../global.css';
```

### 3. 清除缓存并重启

```bash
cd my-app
# 停止当前服务器 (Ctrl+C)
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear
```

### 4. 检查元素

在浏览器中：
1. 右键点击页面元素 → "检查"
2. 查看元素是否有 `className` 属性
3. 查看 Computed 样式，确认样式是否应用

### 5. 临时解决方案：使用 StyleSheet

如果 NativeWind 仍然不工作，可以临时使用 React Native 的 StyleSheet：

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  // ...
});

// 使用
<View style={styles.container}>
```

### 6. 检查 NativeWind 版本兼容性

当前版本：
- `nativewind@4.2.1`
- `tailwindcss@3.4.1`
- `expo@54.0.30`

确保版本兼容。

## 常见问题

### Q: 样式在移动端正常，但 Web 端不显示
A: NativeWind v4 在 Web 上需要确保 CSS 文件正确加载。检查 `global.css` 是否在 `_layout.tsx` 中导入。

### Q: className 属性存在，但样式不应用
A: 可能是 Tailwind 没有正确扫描文件。检查 `tailwind.config.js` 的 `content` 配置。

### Q: 控制台显示 CSS 加载错误
A: 检查 `postcss.config.js` 配置，确保 Tailwind 插件正确配置。




