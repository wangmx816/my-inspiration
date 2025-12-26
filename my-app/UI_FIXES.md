# UI 样式修复总结

## 问题
NativeWind v4 不支持自定义颜色 `bg-background` 和 `text-foreground`，以及透明度语法如 `text-foreground/60`。

## 修复方案
将所有自定义颜色替换为标准的 Tailwind 颜色：

### 颜色映射
- `bg-background` → `bg-white`
- `text-foreground` → `text-gray-900`
- `text-foreground/60` → `text-gray-500`
- `text-foreground/40` → `text-gray-400`
- `bg-foreground/10` → `bg-gray-100`
- `border-foreground/10` → `border-gray-200`
- `border-foreground/5` → `border-gray-100`

### 已修复的文件
- ✅ `app/(tabs)/index.tsx`
- ✅ `app/(tabs)/statistics.tsx`
- ✅ `app/(tabs)/wallet.tsx`
- ✅ `app/(tabs)/profile.tsx`
- ✅ `app/(modals)/add-transaction.tsx`
- ✅ `app/(modals)/add-account.tsx`
- ✅ `components/BalanceCard.tsx`
- ✅ `components/TransactionItem.tsx`
- ✅ `components/AccountItem.tsx`
- ✅ `components/CategoryPicker.tsx`

### 注意事项
- 图标组件（lucide-react-native）不支持 `className` 属性，需要使用 `View` 包裹
- 透明度语法在 NativeWind 中可能不支持，使用具体的颜色值替代




