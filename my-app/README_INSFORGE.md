# InsForge 云端数据库配置

## 概述

本项目已配置为使用 InsForge 云端数据库（PostgreSQL），替代本地 SQLite 数据库。

## 配置步骤

### 1. 环境变量

创建 `.env` 文件（已创建示例文件 `.env.example`）：

```env
EXPO_PUBLIC_INSFORGE_BASE_URL=https://uu9vud59.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
```

### 2. 数据库表结构

数据库表已在 InsForge 云端创建：
- `accounts` - 危废贮存场所表
- `transactions` - 转入转出记录表

表结构包含：
- 自动生成的 UUID 主键
- `user_id` 字段用于多用户支持
- Row Level Security (RLS) 策略，确保用户只能访问自己的数据

### 3. 切换数据库

当前代码已配置为使用 InsForge 云端数据库。如果需要切换回本地 SQLite：

在 `store/useAccountStore.ts` 和 `store/useTransactionStore.ts` 中：

```typescript
// 使用 InsForge 云端数据库（当前）
import * as db from '~/db/supabase/database';

// 或使用本地 SQLite
// import * as db from '~/db/sqlite/database';
```

## 功能特性

### 多用户支持
- 每个用户的数据通过 `user_id` 字段隔离
- RLS 策略自动确保数据安全

### 自动 ID 生成
- 数据库自动生成 UUID 作为主键
- 无需手动生成 ID

### 数据同步
- 所有数据存储在云端
- 支持多设备同步
- 实时数据更新

## API 使用

所有数据库操作函数保持不变：
- `createAccount()` - 创建贮存场所
- `getAccounts()` - 获取贮存场所列表
- `updateAccount()` - 更新贮存场所
- `deleteAccount()` - 删除贮存场所
- `createTransaction()` - 创建转入转出记录
- `getTransactions()` - 获取转入转出记录
- `updateTransaction()` - 更新转入转出记录
- `deleteTransaction()` - 删除转入转出记录

## 注意事项

1. **首次使用**：确保已设置正确的环境变量
2. **用户认证**：当前使用匿名访问，如需用户认证，请集成 InsForge Auth
3. **数据迁移**：如需从本地 SQLite 迁移数据，需要编写迁移脚本

## 故障排除

如果遇到连接问题：
1. 检查环境变量是否正确设置
2. 确认 InsForge 后端 URL 可访问
3. 检查网络连接
4. 查看浏览器控制台的错误信息





