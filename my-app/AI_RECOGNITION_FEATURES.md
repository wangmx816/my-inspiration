# AI 识别功能实现总结

## ✅ 已实现的功能

### 1. 文本识别账单
- **入口**：首页浮动按钮 → 文本输入
- **功能**：用户输入账单文本，AI 识别并提取危废转移信息
- **模型**：Deepseek R1 / Deepseek Chat（自动回退）
- **识别字段**：
  - 类型（转入/转出）
  - 危废量（吨）
  - 危废类别（HW01-HW49）
  - 危废来源
  - 描述信息
  - 日期

### 2. 语音识别记账
- **入口**：首页浮动按钮 → 语音输入
- **功能**：用户录音，AI 转文本后识别
- **流程**：
  1. 用户点击开始录音
  2. 录音完成后自动识别
  3. 如果语音转文本失败，提示用户使用文本输入
- **模型**：Gemini 1.5 Pro / Gemini Pro（语音转文本）
- **注意**：如果 InsForge AI 不支持音频输入，会自动提示用户使用文本输入

### 3. 拍照识别
- **入口**：首页浮动按钮 → 拍照
- **功能**：用户拍照或选择相册图片，AI 识别图片中的账单信息
- **模型**：Gemini 1.5 Pro（支持多模态）
- **识别字段**：同文本识别

## 🔄 工作流程

### 通用流程
1. **用户选择输入方式**（文本/语音/拍照）
2. **AI 识别** → 返回 JSON 对象
3. **预填表单** → 自动填充识别结果
4. **用户确认** → 可以修改任何字段
5. **提交** → 保存到数据库

### 数据流转
```
用户输入 → AI 识别 → JSON 对象 → 预填表单 → 用户确认 → 保存
```

## 📁 相关文件

### 核心文件
- `services/aiRecognition.ts` - AI 识别服务
  - `recognizeTransactionFromText()` - 文本识别
  - `recognizeTransactionFromVoice()` - 语音识别
  - `recognizeBillFromImage()` - 图片识别
  - `normalizeRecognizedData()` - 数据标准化

### UI 文件
- `app/(modals)/recognize-input.tsx` - 识别输入界面
- `app/(modals)/add-transaction.tsx` - 交易创建表单（支持预填）
- `app/(tabs)/index.tsx` - 首页（浮动按钮）
- `components/FloatingActionButton.tsx` - 浮动操作按钮

### 配置
- `lib/insforge.ts` - InsForge SDK 客户端配置
- `functions/ai-recognition.js` - 边缘函数（可选）

## 🎯 使用方式

### 方式 1：从首页浮动按钮
1. 点击首页右下角的 `+` 按钮
2. 选择输入方式：
   - 📷 拍照识别
   - 🎤 语音识别
   - 📝 文本识别
   - ➕ 手动创建

### 方式 2：直接导航
```typescript
// 文本识别
router.push('/(modals)/recognize-input?type=text');

// 语音识别
router.push('/(modals)/recognize-input?type=voice');

// 拍照识别
router.push('/(modals)/recognize-input?type=camera');
```

## 🔧 配置说明

### 环境变量
```env
# InsForge 配置
EXPO_PUBLIC_INSFORGE_BASE_URL=https://uu9vud59.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key

# 可选：使用边缘函数
EXPO_PUBLIC_USE_AI_EDGE_FUNCTION=false
```

### 模型配置
- **文本识别**：优先使用 `Deepseek R1`，自动回退到其他格式
- **图片识别**：使用 `gemini-1.5-pro`
- **语音识别**：使用 `gemini-1.5-pro` 或 `gemini-pro` 进行语音转文本

## 📊 识别结果格式

```typescript
interface RecognizedTransaction {
  type?: 'income' | 'expense';      // 转入/转出
  amount?: number;                   // 危废量（吨）
  category?: string;                 // 危废类别（HW01-HW49）
  source?: string;                   // 危废来源
  description?: string;              // 描述信息
  date?: string;                     // 日期（YYYY-MM-DD）
}
```

## ⚠️ 注意事项

### 1. 模型可用性
- 确保在 InsForge 管理面板中已启用所需模型
- 如果模型未启用，会显示错误提示

### 2. 语音识别限制
- 如果 InsForge AI 不支持音频输入，语音识别会自动提示用户使用文本输入
- 用户可以直接在文本输入框中输入语音内容

### 3. 数据验证
- AI 识别结果会进行标准化处理
- 用户可以在表单中修改任何字段
- 提交前会进行必填字段验证

### 4. 错误处理
- 所有识别失败都会显示友好的错误提示
- 支持自动回退到备用模型
- 提供详细的调试日志

## 🐛 故障排除

### 识别失败
1. 检查 InsForge 配置是否正确
2. 确认模型是否已启用
3. 查看浏览器控制台的详细日志
4. 检查网络连接

### 语音识别不工作
1. 检查麦克风权限
2. 如果语音转文本失败，使用文本输入方式
3. 查看控制台错误信息

### 图片识别失败
1. 检查相机/相册权限
2. 确认图片格式支持
3. 查看控制台错误信息

## 📝 后续优化建议

1. **语音识别增强**：
   - 集成第三方语音转文本服务（如 OpenAI Whisper）
   - 支持实时语音识别

2. **识别准确度提升**：
   - 优化系统提示词
   - 添加更多示例数据
   - 支持用户反馈和纠错

3. **用户体验优化**：
   - 添加识别进度提示
   - 支持识别结果预览
   - 支持批量识别

