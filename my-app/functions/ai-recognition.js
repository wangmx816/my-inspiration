// InsForge Edge Function: AI Recognition
// 用于识别危废转移信息的 AI 服务

module.exports = async function(request) {
  try {
    // 解析请求
    const { type, data } = await request.json();
    
    // 获取 InsForge 配置
    const INSFORGE_BASE_URL = Deno.env.get('INSFORGE_BASE_URL') || 'https://uu9vud59.ap-southeast.insforge.app';
    const INSFORGE_ANON_KEY = Deno.env.get('INSFORGE_ANON_KEY');
    
    if (!INSFORGE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: 'InsForge anon key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 根据类型处理不同的识别任务
    if (type === 'text') {
      return await handleTextRecognition(data, INSFORGE_BASE_URL, INSFORGE_ANON_KEY);
    } else if (type === 'image') {
      return await handleImageRecognition(data, INSFORGE_BASE_URL, INSFORGE_ANON_KEY);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported recognition type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('AI Recognition Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 处理文本识别
async function handleTextRecognition(data, baseUrl, anonKey) {
  const { text, model = 'openai/gpt-4o' } = data;
  
  if (!text) {
    return new Response(
      JSON.stringify({ error: 'Text is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从用户提供的文本中准确提取危废转移信息
2. 严格按照 JSON 格式返回结果
3. 确保所有字段都符合危废管理的标准规范
4. 如果信息不完整，使用合理的默认值（如日期使用今天）`;

  const userPrompt = `请从以下文本中识别危废转移信息，返回 JSON 格式：
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

只返回 JSON 对象，不要其他文字。`;

  // 尝试不同的模型名称（参考成功案例：使用 openai/gpt-4o）
  const possibleModels = [
    model || 'openai/gpt-4o',
    'openai/gpt-4o',      // OpenAI GPT-4o（优先使用）
    'gpt-4o',             // GPT-4o（备用格式）
    'Gpt 4o',             // InsForge 面板显示的名称（带空格）
    'GPT-4o',             // 全大写
    'openai/gpt-4',       // OpenAI GPT-4（备用）
    'gpt-4',              // GPT-4（备用）
  ];
  
  let lastError = null;
  for (const modelName of possibleModels) {
    try {
      const response = await fetch(`${baseUrl}/ai/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      const content = result?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI did not return recognition result');
      }
      
      const parsed = JSON.parse(content);
      return new Response(
        JSON.stringify({ success: true, data: parsed }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      continue;
    }
  }
  
  return new Response(
    JSON.stringify({ 
      error: 'All models failed', 
      message: lastError?.message || 'Unknown error' 
    }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

// 处理图片识别
async function handleImageRecognition(data, baseUrl, anonKey) {
  const { imageBase64, model = 'gemini-1.5-pro' } = data;
  
  if (!imageBase64) {
    return new Response(
      JSON.stringify({ error: 'Image base64 is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const systemPrompt = `你是一个专业的危废转移联单信息识别助手。你的任务是：
1. 从图片中准确识别危废转移联单的信息
2. 提取所有相关字段（类型、数量、类别、来源、日期等）
3. 严格按照 JSON 格式返回结果
4. 确保所有字段都符合危废管理的标准规范`;

  const userPrompt = `请识别这张危废转移联单图片，提取以下信息并返回 JSON 格式：
{
  "type": "income" 或 "expense"（转入或转出）,
  "amount": 数字（危废量，单位：吨）,
  "category": "危废类别（HW01-HW49中的一个）",
  "source": "危废来源",
  "description": "描述信息",
  "date": "日期（格式：YYYY-MM-DD）"
}

只返回 JSON 对象，不要其他文字。`;

  try {
    const response = await fetch(`${baseUrl}/ai/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI did not return recognition result');
    }
    
    const parsed = JSON.parse(content);
    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Image recognition failed', 
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}




