# AI 识别功能 - MCP/边缘函数配置

## 概述

本项目支持两种方式调用 InsForge AI 功能：

1. **直接 SDK 调用**（默认）：通过 `@insforge/sdk` 直接调用 AI API
2. **边缘函数调用**（可选）：通过 InsForge 边缘函数封装 AI 调用

## 配置方式

### 方式 1：直接 SDK 调用（当前默认）

无需额外配置，代码会直接使用 `insforge.ai.chat.completions.create()` 调用 AI。

### 方式 2：通过边缘函数调用

1. **部署边缘函数**：
   - 使用 InsForge MCP 工具或管理面板创建边缘函数
   - 函数文件：`my-app/functions/ai-recognition.js`
   - 函数 slug：`ai-recognition`

2. **启用边缘函数模式**：
   在 `.env` 文件中添加：
   ```env
   EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=true
   ```

3. **函数会自动回退**：
   - 如果边缘函数调用失败，会自动回退到 SDK 直接调用
   - 确保两种方式都能正常工作

## 边缘函数部署

### 使用 MCP 工具部署

```bash
# 通过 MCP 工具创建函数（需要 MCP 服务器连接）
# 函数配置：
# - Name: AI Recognition
# - Slug: ai-recognition
# - Description: AI recognition service for waste transfer manifest
# - Status: active
# - Code File: my-app/functions/ai-recognition.js
```

### 使用 InsForge 管理面板部署

1. 登录 InsForge 管理面板
2. 进入 Functions 部分
3. 创建新函数：
   - 名称：AI Recognition
   - Slug：ai-recognition
   - 状态：Active
   - 代码：复制 `my-app/functions/ai-recognition.js` 的内容

## 边缘函数功能

边缘函数支持以下识别类型：

1. **文本识别** (`type: 'text'`)
   - 输入：`{ text: string, model?: string }`
   - 输出：`RecognizedTransaction`

2. **图片识别** (`type: 'image'`)
   - 输入：`{ imageBase64: string, model?: string }`
   - 输出：`RecognizedTransaction`

## 优势

### 边缘函数方式
- ✅ 集中管理 AI 调用逻辑
- ✅ 可以在服务器端处理敏感信息
- ✅ 便于统一更新和调试
- ✅ 支持更复杂的错误处理和重试逻辑

### SDK 直接调用方式
- ✅ 更简单的实现
- ✅ 减少网络请求次数
- ✅ 更快的响应时间（少一次 HTTP 跳转）

## 故障排除

### 边缘函数调用失败

如果边缘函数调用失败，代码会自动回退到 SDK 直接调用。检查：

1. 边缘函数是否正确部署
2. 函数 URL 是否正确：`${baseUrl}/functions/v1/ai-recognition`
3. API Key 是否正确配置
4. 查看浏览器控制台的错误日志

### SDK 调用失败

检查：
1. InsForge 配置是否正确（`baseUrl` 和 `anonKey`）
2. AI 模型是否已启用
3. 网络连接是否正常
4. 查看浏览器控制台的详细错误日志

## 切换方式

要切换调用方式，只需修改 `.env` 文件：

```env
# 使用边缘函数
EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=true

# 使用 SDK 直接调用（默认）
EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=false
# 或删除该环境变量
```

重启应用后生效。




