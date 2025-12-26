# Netlify 部署指南

## 部署配置

项目已配置好 Netlify 部署，配置文件为 `netlify.toml`。

## Netlify 设置步骤

### 1. 连接 GitHub 仓库

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub，授权访问
4. 选择仓库 `wangmx816/my-inspiration`

### 2. 配置构建设置

Netlify 会自动读取 `netlify.toml` 配置文件，但请确认以下设置：

- **Base directory**: 留空（根目录）
- **Build command**: `cd my-app && npm install && npx expo export --platform web && cp public/_redirects dist/_redirects`
- **Publish directory**: `my-app/dist`

或者使用配置文件中的设置（已在 `netlify.toml` 中配置）：

```
Build command: cd my-app && npm install && npx expo export --platform web && cp public/_redirects dist/_redirects
Publish directory: my-app/dist
```

### 3. 环境变量（可选）

如果需要设置环境变量，在 Netlify 的 "Site settings" → "Environment variables" 中添加：

- `EXPO_PUBLIC_INSFORGE_BASE_URL`
- `EXPO_PUBLIC_INSFORGE_ANON_KEY`
- `EXPO_PUBLIC_USE_DIRECT_AI_API`
- `EXPO_PUBLIC_AI_API_KEY`
- `EXPO_PUBLIC_AI_API_BASE_URL`

### 4. 部署

点击 "Deploy site"，Netlify 会自动：
1. 安装依赖
2. 构建 Expo Web 应用
3. 复制 `_redirects` 文件到 `dist` 目录
4. 部署到 CDN

## 路由说明

`_redirects` 文件确保所有路由都指向 `index.html`，支持 Expo Router 的客户端路由。

## 故障排除

### 404 错误

如果遇到 404 错误：
1. 确认 `_redirects` 文件已复制到 `dist` 目录
2. 检查 Netlify 的构建日志
3. 确认发布目录设置为 `my-app/dist`

### 构建失败

1. 检查 Node.js 版本（建议 18+）
2. 查看构建日志中的错误信息
3. 确认所有依赖都已正确安装

## 自定义域名

在 Netlify 的 "Domain settings" 中可以：
- 添加自定义域名
- 配置 HTTPS（自动）
- 设置重定向规则

