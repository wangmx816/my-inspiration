# 直接 AI API 调用配置

## 概述

如果 InsForge AI Integration 无法使用，可以配置直接调用 AI 模型的 API（如 OpenAI API）。

## 配置方式

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 启用直接 API 调用
EXPO_PUBLIC_USE_DIRECT_AI_API=true

# AI API 密钥（必需）
EXPO_PUBLIC_AI_API_KEY=your-api-key-here

# AI API 基础 URL（可选，默认为 OpenAI）
EXPO_PUBLIC_AI_API_BASE_URL=https://api.openai.com/v1
```

### 2. 支持的 API 提供商

#### DeepSeek API（推荐）
```env
EXPO_PUBLIC_USE_DIRECT_AI_API=true
EXPO_PUBLIC_AI_API_KEY=sk-5ea17752218d4e7d8c82cff415862482
EXPO_PUBLIC_AI_API_BASE_URL=https://api.deepseek.com/v1
```

### OpenAI API
```env
EXPO_PUBLIC_USE_DIRECT_AI_API=true
EXPO_PUBLIC_AI_API_KEY=sk-...
EXPO_PUBLIC_AI_API_BASE_URL=https://api.openai.com/v1
```

#### 其他兼容 OpenAI 格式的 API
```env
EXPO_PUBLIC_USE_DIRECT_AI_API=true
EXPO_PUBLIC_AI_API_KEY=your-api-key
EXPO_PUBLIC_AI_API_BASE_URL=https://your-api-endpoint.com/v1
```

## 使用方式

### 优先级顺序

1. **直接 API 调用**（如果 `EXPO_PUBLIC_USE_DIRECT_AI_API=true` 且提供了 API Key）
2. **边缘函数**（如果 `EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=true`）
3. **InsForge SDK**（默认）

### 文本识别

**DeepSeek API**（如果使用 DeepSeek）：
- `deepseek-chat`（优先）
- `deepseek-reasoner`
- `deepseek-r1`

**OpenAI API**（如果使用 OpenAI）：
- `gpt-4o`（优先）
- `gpt-4-turbo`
- `gpt-4`

### 图片识别

**DeepSeek API**（如果使用 DeepSeek）：
- `deepseek-chat`（优先，支持多模态图片输入）
- `deepseek-reasoner`（支持图片）
- `deepseek-v2`（如果可用）

**OpenAI API**（如果使用 OpenAI）：
- `gpt-4o`（优先，支持图片）
- `gpt-4-turbo`
- `gpt-4-vision-preview`

## 配置示例

### 使用 OpenAI API

```env
# 启用直接 API
EXPO_PUBLIC_USE_DIRECT_AI_API=true

# OpenAI API Key
EXPO_PUBLIC_AI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# OpenAI API Base URL（默认值，可省略）
EXPO_PUBLIC_AI_API_BASE_URL=https://api.openai.com/v1
```

### 使用其他兼容 API

```env
# 启用直接 API
EXPO_PUBLIC_USE_DIRECT_AI_API=true

# API Key
EXPO_PUBLIC_AI_API_KEY=your-api-key

# 自定义 API 端点
EXPO_PUBLIC_AI_API_BASE_URL=https://api.example.com/v1
```

## 注意事项

1. **API Key 安全**：
   - 不要将 API Key 提交到版本控制系统
   - 使用环境变量存储 API Key
   - 生产环境建议使用服务器端代理

2. **API 费用**：
   - 直接调用 API 会产生费用
   - 建议设置使用限制和监控

3. **模型支持**：
   - 确保 API 端点支持所需的模型
   - 图片识别需要支持多模态的模型（如 gpt-4o）

4. **回退机制**：
   - 如果直接 API 调用失败，会自动回退到 InsForge
   - 确保至少有一种方式可用

## 故障排除

### API Key 无效
- 检查 API Key 是否正确
- 确认 API Key 是否有足够的权限

### 模型不可用
- 检查 API 端点是否支持该模型
- 尝试使用其他模型名称

### 网络错误
- 检查网络连接
- 确认 API 端点 URL 正确
- 检查防火墙设置

## 切换回 InsForge

如果不想使用直接 API，只需：

```env
# 禁用直接 API
EXPO_PUBLIC_USE_DIRECT_AI_API=false

# 或删除该环境变量
```

代码会自动使用 InsForge AI Integration。

