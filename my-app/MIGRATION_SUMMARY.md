# 数据库迁移到 InsForge 云端 - 完成总结

## ✅ 已完成的工作

### 1. InsForge SDK 安装
- ✅ 安装了 `@insforge/sdk` 包
- ✅ 创建了 InsForge 客户端配置文件 (`lib/insforge.ts`)

### 2. 数据库表创建
- ✅ 在 InsForge 云端创建了 `accounts` 表
- ✅ 在 InsForge 云端创建了 `transactions` 表
- ✅ 创建了必要的索引
- ✅ 启用了 Row Level Security (RLS)
- ✅ 配置了匿名访问策略（用于开发测试）

### 3. 数据库操作代码
- ✅ 创建了 `db/supabase/database.ts`，使用 InsForge SDK
- ✅ 实现了所有 CRUD 操作：
  - Account: create, get, getById, update, delete
  - Transaction: create, get, getById, update, delete
- ✅ 支持自动 UUID 生成
- ✅ 保持了与原有接口的兼容性

### 4. Store 更新
- ✅ 更新了 `useAccountStore.ts` 使用 InsForge 数据库
- ✅ 更新了 `useTransactionStore.ts` 使用 InsForge 数据库
- ✅ 移除了对 `initDatabase()` 的调用（云端数据库无需初始化）

### 5. 表单更新
- ✅ 更新了 `add-account.tsx`，移除手动 ID 生成
- ✅ 更新了 `add-transaction.tsx`，移除手动 ID 生成
- ✅ 数据库自动生成 UUID

### 6. 页面更新
- ✅ 更新了首页，移除数据库初始化调用
- ✅ 更新了贮存场所页面，移除数据库初始化调用

## 📋 数据库表结构

### accounts 表
- `id` (UUID, 主键, 自动生成)
- `name` (TEXT, 必填)
- `balance` (REAL, 默认 0)
- `icon` (TEXT, 必填)
- `created_at` (TIMESTAMPTZ, 自动生成)
- `user_id` (UUID, 可选, 用于多用户支持)

### transactions 表
- `id` (UUID, 主键, 自动生成)
- `type` (TEXT, 'income' 或 'expense')
- `amount` (REAL, 必填)
- `category` (TEXT, 必填)
- `account_id` (UUID, 外键关联 accounts)
- `date` (DATE, 必填)
- `description` (TEXT, 可选)
- `source` (TEXT, 可选)
- `created_at` (TIMESTAMPTZ, 自动生成)
- `user_id` (UUID, 可选, 用于多用户支持)

## 🔧 配置信息

### InsForge 后端
- **Base URL**: `https://uu9vud59.ap-southeast.insforge.app`
- **Anon Key**: 已生成（存储在环境变量中）

### 环境变量
需要在 `.env` 文件中设置：
```env
EXPO_PUBLIC_INSFORGE_BASE_URL=https://uu9vud59.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
```

## 🚀 使用方法

### 切换数据库
代码已默认使用 InsForge 云端数据库。如需切换回本地 SQLite：

在 `store/useAccountStore.ts` 和 `store/useTransactionStore.ts` 中修改导入：
```typescript
// 当前：使用 InsForge 云端数据库
import * as db from '~/db/supabase/database';

// 切换回本地 SQLite：
// import * as db from '~/db/sqlite/database';
```

## 📝 注意事项

1. **匿名访问**：当前配置允许匿名用户访问所有数据，仅用于开发测试
2. **用户认证**：如需多用户支持，需要集成 InsForge Auth
3. **数据迁移**：如需从本地 SQLite 迁移现有数据，需要编写迁移脚本
4. **ID 类型**：数据库使用 UUID，但代码接口仍使用 string 类型（自动转换）

## 🔐 安全建议

1. **生产环境**：移除匿名访问策略，启用基于用户 ID 的 RLS 策略
2. **用户认证**：集成 InsForge Auth 实现用户登录
3. **API 密钥**：不要在代码中硬编码 API 密钥，使用环境变量

## ✨ 优势

1. **云端存储**：数据存储在云端，支持多设备同步
2. **自动备份**：InsForge 自动备份数据
3. **可扩展性**：支持大量数据和并发访问
4. **实时同步**：多用户实时数据同步
5. **安全性**：RLS 策略确保数据安全

## 🐛 故障排除

如果遇到问题：
1. 检查环境变量是否正确设置
2. 确认网络连接正常
3. 查看浏览器控制台的错误信息
4. 检查 InsForge 后端状态





