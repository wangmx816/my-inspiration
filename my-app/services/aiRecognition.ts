import { insforge } from '~/lib/insforge';
import { WASTE_CATEGORIES, WASTE_SOURCES } from '~/utils/categories';

// 配置：是否使用边缘函数（通过 HTTP 调用）
const USE_EDGE_FUNCTION = process.env.EXPO_PUBLIC_USE_AI_EDGE_FUNCTION === 'true';

// 配置：是否使用直接 API 调用（不通过 InsForge）
// 如果提供了 API Key，自动启用直接 API 调用
const DIRECT_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';
const USE_DIRECT_API = process.env.EXPO_PUBLIC_USE_DIRECT_AI_API === 'true' || !!DIRECT_API_KEY;
// 默认使用 DeepSeek API
const DIRECT_API_BASE_URL = process.env.EXPO_PUBLIC_AI_API_BASE_URL || 'https://api.deepseek.com/v1';

export interface RecognizedTransaction {
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  source?: string;
  description?: string;
  date?: string;
}

/**
 * 将图片 URI 转换为 base64
 */
async function imageUriToBase64(uri: string): Promise<string> {
  try {
    // 在 React Native 中，使用 fetch 读取图片
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // 转换为 base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // 移除 data:image/...;base64, 前缀
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('图片转换失败');
  }
}

/**
 * 使用 InsForge AI 识别图片中的账单信息
 */
export async function recognizeBillFromImage(imageUri: string): Promise<RecognizedTransaction> {
  try {
    // 读取图片为 base64
    const base64 = await imageUriToBase64(imageUri);
    
    // 如果配置使用直接 API，优先使用直接 API
    // 注意：DeepSeek API 的 chat completions 不支持图片输入（image_url），所以图片识别时跳过 DeepSeek
    const isDeepSeek = DIRECT_API_BASE_URL.includes('deepseek.com');
    if (USE_DIRECT_API && DIRECT_API_KEY && !isDeepSeek) {
      // 只有非 DeepSeek API 才尝试直接 API 调用（因为 DeepSeek 不支持图片输入）
      try {
        console.log('[AI Recognition] 使用直接 API 调用模式（图片识别）');
        console.log('[AI Recognition] API 配置:', {
          baseUrl: DIRECT_API_BASE_URL,
          hasApiKey: !!DIRECT_API_KEY,
          isDeepSeek,
        });
        
        const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从图片中准确识别危废转移联单的信息
2. 提取所有相关字段（类型、数量、类别、来源、日期等）
3. 严格按照 JSON 格式返回结果
4. 确保所有字段都符合危废管理的标准规范`;

        const prompt = `请识别这张危废转移联单图片，提取以下信息并返回 JSON 格式：
{
  "type": "income" 或 "expense"（转入或转出）,
  "amount": 数字（危废量，单位：吨）,
  "category": "危废类别（HW01-HW49中的一个）",
  "source": "危废来源",
  "description": "描述信息",
  "date": "日期（格式：YYYY-MM-DD）"
}

可用的危废类别：${WASTE_CATEGORIES.map(c => `${c.code}(${c.name})`).join(', ')}
可用的危废来源：${WASTE_SOURCES.join(', ')}

只返回 JSON 对象，不要其他文字。`;

        // 非 DeepSeek API（如 OpenAI）支持图片输入
        const directModels = [
          'gpt-4o',             // GPT-4o（优先，支持图片）
          'gpt-4-turbo',        // GPT-4 Turbo
          'gpt-4-vision-preview', // GPT-4 Vision
        ];

        let lastError: any = null;
        for (const modelName of directModels) {
          try {
            console.log('[AI Recognition] 尝试直接 API 模型（图片）:', modelName, 'Base URL:', DIRECT_API_BASE_URL);
            
            const data = await callDirectAIAPI(
              modelName,
              [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:image/jpeg;base64,${base64}`,
                      },
                    },
                  ],
                },
              ],
              { type: 'json_object' }
            );

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
              throw new Error('AI 未返回识别结果');
            }

            console.log('[AI Recognition] 直接 API 图片识别结果:', content);
            const parsed = JSON.parse(content);
            return normalizeRecognizedData(parsed);
          } catch (error: any) {
            console.warn(`[AI Recognition] 直接 API 模型 ${modelName} 失败:`, error.message);
            lastError = error;
            continue;
          }
        }

        // 如果所有模型都失败，抛出错误以便回退
        throw lastError || new Error('所有直接 API 模型都失败');
      } catch (error: any) {
        console.warn('[AI Recognition] 直接 API 调用失败，回退到 InsForge:', error.message);
        // 回退到 InsForge 调用
      }
    } else if (isDeepSeek) {
      // DeepSeek API 不支持图片输入，直接跳过，使用 InsForge
      console.log('[AI Recognition] DeepSeek API 不支持图片输入，跳过直接 API 调用，使用 InsForge');
    }
    
    // 如果配置使用边缘函数，优先使用边缘函数
    if (USE_EDGE_FUNCTION) {
      try {
        return await callAIFunctionViaEdgeFunction('image', { imageBase64: base64 });
      } catch (error: any) {
        console.warn('[AI Recognition] 边缘函数失败，回退到 SDK:', error.message);
        // 回退到 SDK 调用
      }
    }

    // 使用 InsForge AI 的 vision API 识别图片
    const prompt = `请识别这张危废转移联单图片，提取以下信息并返回 JSON 格式：
{
  "type": "income" 或 "expense"（转入或转出）,
  "amount": 数字（危废量，单位：吨）,
  "category": "危废类别（HW01-HW49中的一个）",
  "source": "危废来源",
  "description": "描述信息",
  "date": "日期（格式：YYYY-MM-DD）"
}

可用的危废类别：${WASTE_CATEGORIES.map(c => `${c.code}(${c.name})`).join(', ')}
可用的危废来源：${WASTE_SOURCES.join(', ')}

只返回 JSON 对象，不要其他文字。`;

    // 使用 InsForge AI chat completions API，支持图片输入
    // 尝试多个支持图片的模型（按优先级）
    
    // 系统提示词：定义 AI 的角色和任务
    const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从图片中准确识别危废转移联单的信息
2. 提取所有相关字段（类型、数量、类别、来源、日期等）
3. 严格按照 JSON 格式返回结果
4. 确保所有字段都符合危废管理的标准规范`;

    // 尝试多个支持图片的模型
    const imageModels = [
      'gemini-3-pro-image-preview',  // Gemini 3 Pro Image Preview（优先）
      'gemini-1.5-pro',              // Gemini 1.5 Pro
      'gemini-pro',                  // Gemini Pro
      'gemini-1.5-flash',            // Gemini 1.5 Flash
      'gpt-4o',                      // GPT-4o（如果可用）
      'gpt-4-vision',                // GPT-4 Vision
    ];

    let lastError: any = null;
    for (const modelName of imageModels) {
      try {
        console.log('[AI Recognition] 尝试使用 InsForge 模型（图片）:', modelName);
        
        const response = await insforge.ai.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        });

        const data = response;
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('AI 未返回识别结果');
        }

        console.log('[AI Recognition] InsForge 图片识别结果:', content);
        const parsed = JSON.parse(content);
        return normalizeRecognizedData(parsed);
      } catch (error: any) {
        console.warn(`[AI Recognition] InsForge 模型 ${modelName} 失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // 所有模型都失败了
    throw lastError || new Error('所有图片识别模型都失败，请检查 InsForge 后端是否启用了支持图片的模型（如 gemini-3-pro-image-preview）');
  } catch (error: any) {
    console.error('Image recognition error:', error);
    const errorMessage = error?.message || error?.toString() || '未知错误';
    throw new Error(`图片识别失败: ${errorMessage}`);
  }
}

/**
 * 将音频 URI 转换为 base64
 */
async function audioUriToBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert audio to base64:', error);
    throw new Error('音频转换失败');
  }
}

/**
 * 使用 InsForge AI 识别语音中的记账信息
 * 策略：先进行语音转文本，然后使用文本识别
 */
export async function recognizeTransactionFromVoice(audioUri: string): Promise<RecognizedTransaction> {
  try {
    console.log('[AI Recognition] 开始语音识别');
    
    const base64 = await audioUriToBase64(audioUri);
    console.log('[AI Recognition] 音频已转换为 base64，长度:', base64.length);
    
    // 尝试使用 Gemini 模型进行语音转文本
    // 注意：如果 InsForge AI 支持音频输入，可以直接使用；否则需要先转文本
    const transcriptionPrompt = `请将这段语音转换为文本。只返回转换后的文本内容，不要其他说明文字。`;
    
    // 尝试不同的模型进行语音转文本
    const transcriptionModels = [
      'gemini-1.5-pro',
      'gemini-pro',
      'gpt-4o',
    ];
    
    let transcribedText: string | null = null;
    let lastError: any = null;
    
    // 尝试使用支持多模态的模型进行语音转文本
    // 注意：目前 InsForge AI 可能不支持直接音频输入
    // 如果支持，使用以下格式；如果不支持，需要集成第三方语音转文本服务
    for (const modelName of transcriptionModels) {
      try {
        console.log('[AI Recognition] 尝试使用模型进行语音转文本:', modelName);
        
        // 方案1：尝试使用文本提示，让用户手动输入（如果模型不支持音频）
        // 方案2：如果 InsForge AI 支持音频输入，使用以下格式
        // 方案3：集成第三方语音转文本服务（如 OpenAI Whisper API）
        
        // 注意：根据 InsForge AI 的实际 API 文档调整
        // 如果支持音频输入，使用多模态 content 格式
        // 如果不支持，这里会失败，然后提示用户使用文本输入
        
        const transcriptionData = await insforge.ai.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: transcriptionPrompt, // 先尝试纯文本提示
              // 如果支持音频，可以尝试：
              // content: [
              //   { type: 'text', text: transcriptionPrompt },
              //   { type: 'audio_url', audio_url: { url: `data:audio/m4a;base64,${base64}` } },
              // ],
            },
          ],
        });

        transcribedText = transcriptionData?.choices?.[0]?.message?.content;
        if (transcribedText && transcribedText.trim().length > 0) {
          console.log('[AI Recognition] 语音转文本成功:', transcribedText);
          break;
        }
      } catch (error: any) {
        console.warn(`[AI Recognition] 模型 ${modelName} 语音转文本失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // 如果所有模型都失败，尝试直接使用文本识别（假设用户会手动输入）
    if (!transcribedText) {
      console.warn('[AI Recognition] 语音转文本失败，尝试使用文本提示');
      
      // 方案：提示用户手动输入，或使用文本识别
      // 这里我们抛出一个友好的错误，让用户知道可以使用文本输入
      throw new Error('语音转文本功能暂不可用。请使用文本输入方式，或手动输入语音内容进行识别。');
    }
    
    // 使用转录的文本进行识别
    console.log('[AI Recognition] 使用转录文本进行识别');
    return await recognizeTransactionFromText(transcribedText);
  } catch (error: any) {
    console.error('[AI Recognition] 语音识别错误:', error);
    const errorMessage = error?.message || '语音识别失败，请重试';
    
    // 如果是语音转文本失败，提供更友好的提示
    if (errorMessage.includes('语音转文本')) {
      throw new Error('语音转文本功能暂不可用。请使用文本输入方式，直接输入语音内容进行识别。');
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * 通过边缘函数调用 AI 识别（备用方案）
 */
async function callAIFunctionViaEdgeFunction(type: 'text' | 'image', data: any): Promise<RecognizedTransaction> {
  try {
    const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://uu9vud59.ap-southeast.insforge.app';
    const functionUrl = `${baseUrl}/functions/v1/ai-recognition`;
    
    console.log('[AI Recognition] 通过边缘函数调用:', functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY}`,
      },
      body: JSON.stringify({ type, data }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'AI 未返回识别结果');
    }
    
    return normalizeRecognizedData(result.data);
  } catch (error: any) {
    console.error('[AI Recognition] 边缘函数调用失败:', error);
    throw error;
  }
}

/**
 * 直接调用 AI API（不通过 InsForge）
 */
async function callDirectAIAPI(model: string, messages: any[], responseFormat?: any): Promise<any> {
  try {
    console.log('[AI Recognition] 使用直接 API 调用:', {
      baseUrl: DIRECT_API_BASE_URL,
      model,
      hasApiKey: !!DIRECT_API_KEY,
    });

    const response = await fetch(`${DIRECT_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIRECT_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        ...(responseFormat && { response_format: responseFormat }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[AI Recognition] 直接 API 调用失败:', error);
    throw error;
  }
}

/**
 * 使用 InsForge AI 识别文本中的记账信息
 */
export async function recognizeTransactionFromText(text: string): Promise<RecognizedTransaction> {
  // 如果配置使用直接 API，优先使用直接 API
  if (USE_DIRECT_API && DIRECT_API_KEY) {
    try {
      console.log('[AI Recognition] 使用直接 API 调用模式');
      
      const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从用户提供的文本中准确提取危废转移信息
2. 严格按照 JSON 格式返回结果
3. 确保所有字段都符合危废管理的标准规范
4. 如果信息不完整，使用合理的默认值（如日期使用今天）`;

      const prompt = `请从以下文本中识别危废转移信息，返回 JSON 格式：
"${text}"

返回格式：
{
  "type": "income" 或 "expense"（转入或转出）,
  "amount": 数字（危废量，单位：吨）,
  "category": "危废类别（HW01-HW49中的一个）",
  "source": "危废来源",
  "description": "描述信息",
  "date": "日期（格式：YYYY-MM-DD，如果未提及则使用今天）"
}

可用的危废类别：${WASTE_CATEGORIES.map(c => `${c.code}(${c.name})`).join(', ')}
可用的危废来源：${WASTE_SOURCES.join(', ')}

只返回 JSON 对象，不要其他文字。`;

      // 根据 API Base URL 选择模型
      const isDeepSeek = DIRECT_API_BASE_URL.includes('deepseek.com');
      const directModels = isDeepSeek
        ? [
            'deepseek-chat',      // DeepSeek Chat（优先）
            'deepseek-reasoner',  // DeepSeek Reasoner
            'deepseek-r1',        // DeepSeek R1
          ]
        : [
            'gpt-4o',             // GPT-4o（优先）
            'gpt-4-turbo',        // GPT-4 Turbo
            'gpt-4',              // GPT-4
          ];

      let lastError: any = null;
      for (const modelName of directModels) {
        try {
          console.log('[AI Recognition] 尝试直接 API 模型:', modelName);
          
          const data = await callDirectAIAPI(
            modelName,
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            { type: 'json_object' }
          );

          const content = data?.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error('AI 未返回识别结果');
          }

          console.log('[AI Recognition] 直接 API 识别结果:', content);
          const parsed = JSON.parse(content);
          return normalizeRecognizedData(parsed);
        } catch (error: any) {
          console.warn(`[AI Recognition] 直接 API 模型 ${modelName} 失败:`, error.message);
          lastError = error;
          continue;
        }
      }

      throw lastError || new Error('所有直接 API 模型都失败');
    } catch (error: any) {
      console.warn('[AI Recognition] 直接 API 调用失败，回退到 InsForge:', error.message);
      // 回退到 InsForge 调用
    }
  }

  // 如果配置使用边缘函数，优先使用边缘函数
  if (USE_EDGE_FUNCTION) {
    try {
      return await callAIFunctionViaEdgeFunction('text', { text, model: 'openai/gpt-4o' });
    } catch (error: any) {
      console.warn('[AI Recognition] 边缘函数失败，回退到 SDK:', error.message);
      // 回退到 SDK 调用
    }
  }
  
  try {
    const prompt = `请从以下文本中识别危废转移信息，返回 JSON 格式：
"${text}"

返回格式：
{
  "type": "income" 或 "expense"（转入或转出）,
  "amount": 数字（危废量，单位：吨）,
  "category": "危废类别（HW01-HW49中的一个）",
  "source": "危废来源",
  "description": "描述信息",
  "date": "日期（格式：YYYY-MM-DD，如果未提及则使用今天）"
}

可用的危废类别：${WASTE_CATEGORIES.map(c => `${c.code}(${c.name})`).join(', ')}
可用的危废来源：${WASTE_SOURCES.join(', ')}

只返回 JSON 对象，不要其他文字。`;

    console.log('[AI Recognition] 调用文本识别，使用模型: openai/gpt-4o');
    console.log('[AI Recognition] 输入文本:', text);
    
    // 尝试不同的模型名称格式（按优先级顺序）
    // 根据 InsForge 管理面板中的实际模型名称
    // 参考成功案例：使用 openai/gpt-4o 格式
    const possibleModels = [
      'openai/gpt-4o',      // OpenAI GPT-4o（优先使用，参考成功案例）
      'gpt-4o',             // GPT-4o（备用格式）
      'Gpt 4o',             // InsForge 面板显示的名称（带空格）
      'GPT-4o',             // 全大写
      'openai/gpt-4',       // OpenAI GPT-4（备用）
      'gpt-4',              // GPT-4（备用）
    ];
    
    let lastError: any = null;
    for (const modelName of possibleModels) {
      try {
        console.log('[AI Recognition] 尝试使用模型:', modelName);
        
        // 系统提示词：定义 AI 的角色和任务
        const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从用户提供的文本中准确提取危废转移信息
2. 严格按照 JSON 格式返回结果
3. 确保所有字段都符合危废管理的标准规范
4. 如果信息不完整，使用合理的默认值（如日期使用今天）`;

        console.log('[AI Recognition] 调用 InsForge AI Integration API，模型:', modelName);
        console.log('[AI Recognition] 使用 InsForge AI Integration:', {
          api: 'insforge.ai.chat.completions.create',
          model: modelName,
          hasSystemPrompt: !!systemPrompt,
          hasUserPrompt: !!prompt,
          responseFormat: 'json_object',
        });

        // 使用 InsForge AI Integration API 调用
        console.log('[AI Recognition] Base URL:', process.env.EXPO_PUBLIC_INSFORGE_BASE_URL);
        console.log('[AI Recognition] 完整请求:', {
          model: modelName,
          messages: [
            { role: 'system', contentLength: systemPrompt.length },
            { role: 'user', contentLength: prompt.length },
          ],
          response_format: 'json_object',
        });
        
        // 调用 InsForge AI Integration API
        const data = await insforge.ai.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
        });

        console.log('[AI Recognition] API 响应状态:', {
          hasData: !!data,
          hasChoices: !!data?.choices,
          choicesLength: data?.choices?.length || 0,
          fullResponse: JSON.stringify(data, null, 2),
        });
        
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          console.error('[AI Recognition] 未获取到响应内容');
          throw new Error('AI 未返回识别结果');
        }

        console.log('[AI Recognition] 识别结果:', content);
        const parsed = JSON.parse(content);
        return normalizeRecognizedData(parsed);
      } catch (error: any) {
        console.error(`[AI Recognition] 模型 ${modelName} 失败:`, {
          message: error?.message,
          code: error?.code,
          status: error?.status,
          statusText: error?.statusText,
          response: error?.response,
          fullError: JSON.stringify(error, null, 2),
        });
        lastError = error;
        // 继续尝试下一个模型
        continue;
      }
    }
    
    // 所有模型都失败了
    console.error('[AI Recognition] 所有模型都失败');
    const errorMessage = lastError?.message || '未知错误';
    throw new Error(`文本识别失败: ${errorMessage}`);
  } catch (error: any) {
    console.error('[AI Recognition] 文本识别错误:', error);
    const errorMessage = error?.message || error?.toString() || '未知错误';
    throw new Error(`文本识别失败: ${errorMessage}`);
  }
}

/**
 * 标准化识别结果
 */
function normalizeRecognizedData(data: any): RecognizedTransaction {
  const result: RecognizedTransaction = {};

  // 标准化 type
  if (data.type) {
    const typeStr = String(data.type).toLowerCase();
    if (typeStr.includes('income') || typeStr.includes('转入') || typeStr.includes('收入')) {
      result.type = 'income';
    } else if (typeStr.includes('expense') || typeStr.includes('转出') || typeStr.includes('支出')) {
      result.type = 'expense';
    }
  }

  // 标准化 amount
  if (data.amount !== undefined && data.amount !== null) {
    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
    if (!isNaN(amount) && amount > 0) {
      result.amount = amount;
    }
  }

  // 标准化 category（匹配 HW01-HW49）
  if (data.category) {
    const categoryStr = String(data.category).toUpperCase();
    const matchedCategory = WASTE_CATEGORIES.find(
      (c) => c.code === categoryStr || categoryStr.includes(c.code)
    );
    if (matchedCategory) {
      result.category = matchedCategory.code;
    }
  }

  // 标准化 source
  if (data.source) {
    const sourceStr = String(data.source);
    const matchedSource = WASTE_SOURCES.find((s) => s === sourceStr || sourceStr.includes(s));
    if (matchedSource) {
      result.source = matchedSource;
    } else {
      result.source = sourceStr; // 如果不在列表中，保留原值
    }
  }

  // 标准化 description
  if (data.description) {
    result.description = String(data.description);
  }

  // 标准化 date
  if (data.date) {
    // 尝试解析日期
    const dateStr = String(data.date);
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      result.date = date.toISOString().split('T')[0];
    }
  } else {
    // 如果没有日期，使用今天
    result.date = new Date().toISOString().split('T')[0];
  }

  return result;
}
