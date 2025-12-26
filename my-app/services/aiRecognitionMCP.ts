/**
 * AI Recognition Service using InsForge Edge Functions (via MCP)
 * 通过 InsForge 边缘函数调用 AI 识别功能
 */

import { insforge } from '~/lib/insforge';
import { WASTE_CATEGORIES, WASTE_SOURCES } from '~/utils/categories';

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
    console.error('Failed to convert image to base64:', error);
    throw new Error('图片转换失败');
  }
}

/**
 * 通过边缘函数调用 AI 识别
 */
async function callAIFunction(type: 'text' | 'image', data: any): Promise<RecognizedTransaction> {
  try {
    const baseUrl = process.env.EXPO_PUBLIC_INSFORGE_BASE_URL || 'https://uu9vud59.ap-southeast.insforge.app';
    const functionUrl = `${baseUrl}/functions/v1/ai-recognition`;
    
    console.log('[AI Recognition MCP] 调用边缘函数:', functionUrl);
    console.log('[AI Recognition MCP] 请求类型:', type);
    console.log('[AI Recognition MCP] 请求数据:', { ...data, imageBase64: data.imageBase64 ? '[base64 data]' : undefined });
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_INSFORGE_ANON_KEY}`,
      },
      body: JSON.stringify({
        type,
        data,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'AI 未返回识别结果');
    }
    
    console.log('[AI Recognition MCP] 识别结果:', result.data);
    return normalizeRecognizedData(result.data);
  } catch (error: any) {
    console.error('[AI Recognition MCP] 错误:', error);
    throw new Error(error.message || 'AI 识别失败');
  }
}

/**
 * 使用边缘函数识别图片中的账单信息
 */
export async function recognizeBillFromImage(imageUri: string): Promise<RecognizedTransaction> {
  try {
    const base64 = await imageUriToBase64(imageUri);
    return await callAIFunction('image', { imageBase64: base64 });
  } catch (error: any) {
    console.error('Image recognition error:', error);
    const errorMessage = error?.message || error?.toString() || '未知错误';
    throw new Error(`图片识别失败: ${errorMessage}`);
  }
}

/**
 * 使用边缘函数识别文本中的记账信息
 */
export async function recognizeTransactionFromText(text: string): Promise<RecognizedTransaction> {
  try {
    return await callAIFunction('text', { text, model: 'deepseek-r1' });
  } catch (error: any) {
    console.error('Text recognition error:', error);
    const errorMessage = error?.message || error?.toString() || '未知错误';
    throw new Error(`文本识别失败: ${errorMessage}`);
  }
}

/**
 * 使用边缘函数识别语音中的记账信息（暂不支持，需要先转文本）
 */
export async function recognizeTransactionFromVoice(audioUri: string): Promise<RecognizedTransaction> {
  // 语音识别需要先转换为文本，这里暂时不支持
  throw new Error('语音识别需要先转换为文本，请使用文本输入方式');
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
    const dateStr = String(data.date);
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      result.date = date.toISOString().split('T')[0];
    }
  } else {
    result.date = new Date().toISOString().split('T')[0];
  }

  return result;
}




