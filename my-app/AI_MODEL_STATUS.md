# AI 模型对接状态

## ✅ 已完成的配置

### 1. SDK 和基础配置
- ✅ **InsForge SDK 已安装** (`@insforge/sdk@1.0.5`)
- ✅ **InsForge 客户端已配置** (`lib/insforge.ts`)
  - Base URL: `https://uu9vud59.ap-southeast.insforge.app`
  - Anon Key: 已配置（从环境变量读取）

### 2. AI 识别服务
- ✅ **AI 识别服务已创建** (`services/aiRecognition.ts`)
  - 支持文本识别 (`recognizeTransactionFromText`)
  - 支持图片识别 (`recognizeBillFromImage`)
  - 支持语音识别 (`recognizeTransactionFromVoice`)
  - 包含详细的错误处理和日志记录

### 3. 边缘函数
- ✅ **边缘函数代码已创建** (`functions/ai-recognition.js`)
  - 支持文本和图片识别
  - 包含模型回退机制

### 4. 模型配置
- ✅ **模型名称列表已更新**
  - 文本识别：尝试多种格式（`Deepseek R1`, `deepseek-r1`, `deepseek-R1`, `Deepseek Chat`, `deepseek-chat` 等）
  - 图片识别：使用 `gemini-1.5-pro`
  - 语音识别：使用 `gemini-pro` 进行转录

## ❌ 当前问题

### 1. 模型调用失败
- **错误信息**：`Model deepseek-chat is not enabled`
- **原因**：模型可能在 InsForge 管理面板中未启用，或模型名称不匹配

### 2. 需要确认的事项
- [ ] 在 InsForge 管理面板中确认模型是否已启用
- [ ] 确认模型的实际 API 名称（可能与显示名称不同）
- [ ] 检查是否需要配置额外的 API 密钥

## 🔧 配置检查清单

### 环境变量
确保 `.env` 文件中包含：
```env
EXPO_PUBLIC_INSFORGE_BASE_URL=https://uu9vud59.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=false  # 可选，默认使用 SDK 直接调用
```

### InsForge 管理面板检查
1. **登录 InsForge 管理面板**
2. **进入 AI 部分**
3. **检查模型状态**：
   - Deepseek R1 - 是否已启用？
   - Deepseek Chat - 是否已启用？
   - Gemini 1.5 Pro - 是否已启用？
   - Grok 4 - 是否已启用？
4. **查看模型详情**：
   - 点击模型卡片查看详细信息
   - 确认 API 中使用的实际模型名称
   - 检查是否有 API 密钥配置要求

## 🚀 下一步操作

### 1. 启用模型（如果未启用）
在 InsForge 管理面板中：
- 找到对应的模型卡片
- 点击启用/激活按钮
- 确认模型状态变为"已启用"

### 2. 验证模型名称
- 查看模型详情中的 API 名称
- 如果 API 名称与显示名称不同，更新代码中的模型名称列表

### 3. 测试调用
1. 刷新应用页面
2. 尝试文本识别功能
3. 查看浏览器控制台的详细日志：
   - 尝试了哪些模型名称
   - 每个模型的错误信息
   - API 响应详情

### 4. 如果仍然失败
请提供以下信息：
- InsForge 管理面板中模型的确切名称（API 名称）
- 浏览器控制台中的完整错误信息
- 模型是否已启用
- 是否需要配置额外的 API 密钥

## 📝 代码位置

- **AI 识别服务**：`my-app/services/aiRecognition.ts`
- **InsForge 客户端**：`my-app/lib/insforge.ts`
- **边缘函数**：`my-app/functions/ai-recognition.js`
- **配置文档**：`my-app/README_AI_MCP.md`

## 🔍 调试信息

代码中已包含详细的日志记录：
- 模型名称尝试日志
- API 请求参数日志
- API 响应状态日志
- 错误详情日志

查看浏览器控制台（F12）可以获取完整的调试信息。



