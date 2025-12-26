# InsForge 身份验证集成

## 已完成的工作

### 1. 创建认证上下文 (`contexts/authContext.tsx`)
- 提供 `AuthProvider` 组件包装应用
- 提供 `useAuth` hook 访问认证状态
- 实现的功能：
  - `signIn(email, password)` - 邮箱密码登录
  - `signUp(email, password, name?)` - 用户注册
  - `signOut()` - 登出
  - `signInWithOAuth(provider)` - OAuth 登录（GitHub/Google）
  - `user` - 当前用户信息
  - `loading` - 加载状态

### 2. 创建认证页面
- `app/(auth)/login.tsx` - 登录页面
  - 邮箱密码登录
  - GitHub/Google OAuth 登录
  - 跳转到注册页面
- `app/(auth)/register.tsx` - 注册页面
  - 用户注册
  - GitHub/Google OAuth 登录
  - 跳转到登录页面

### 3. 更新根布局
- 在 `app/_layout.tsx` 中添加 `AuthProvider`
- 添加 `(auth)` 路由组

### 4. 更新数据库操作
- 在 `db/supabase/database.ts` 中添加用户 ID 自动获取
- 确保所有数据操作都与当前用户关联

### 5. 更新页面
- `app/(tabs)/index.tsx` - 添加认证检查，未登录跳转到登录页
- `app/(tabs)/profile.tsx` - 显示用户邮箱，实现登出功能

## 使用方法

### 在组件中使用认证

```tsx
import { useAuth } from '~/contexts/authContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <Text>Loading...</Text>;
  if (!user) return <Text>Please login</Text>;

  return (
    <View>
      <Text>Welcome, {user.email}!</Text>
      <Button onPress={signOut} title="Logout" />
    </View>
  );
}
```

### 路由保护

在需要认证的页面中添加：

```tsx
useEffect(() => {
  if (!loading && !user) {
    router.replace('/(auth)/login');
  }
}, [user, loading]);
```

## 注意事项

1. **InsForge SDK 认证 API**
   - 当前实现基于 `@insforge/sdk` 的认证方法
   - 如果 SDK 的 API 不同，需要调整 `authContext.tsx` 中的实现

2. **OAuth 重定向**
   - OAuth 登录会打开浏览器
   - 需要配置回调 URL 在 InsForge 控制台

3. **环境变量**
   - 确保 `.env` 文件中设置了：
     - `EXPO_PUBLIC_INSFORGE_BASE_URL`
     - `EXPO_PUBLIC_INSFORGE_ANON_KEY`

4. **数据库 RLS 策略**
   - 确保数据库的 Row-Level Security (RLS) 策略正确配置
   - 用户只能访问自己的数据

## 下一步

1. 测试登录/注册功能
2. 配置 OAuth 提供商（GitHub/Google）
3. 测试数据隔离（确保用户只能看到自己的数据）
4. 添加密码重置功能（可选）




