// 云函数入口文件
const cloud = require('wx-server-sdk');
const { Configuration, OpenAIApi } = require('openai');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// --- 配置信息 (需要替换为实际配置或从环境变量/数据库读取) ---
const aiConfig = {
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY', // 从环境变量读取
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo', // 使用的模型
  summaryPrompt: process.env.SUMMARY_PROMPT || '请用简洁、准确的中文总结以下医学或公共卫生文章的主要内容:',
  highlightPrompt: process.env.HIGHLIGHT_PROMPT || '请用简洁、准确的中文列出以下医学或公共卫生文章的核心亮点，每点一行:',
  maxTokensSummary: parseInt(process.env.MAX_TOKENS_SUMMARY || '500', 10),
  maxTokensHighlight: parseInt(process.env.MAX_TOKENS_HIGHLIGHT || '500', 10),
  temperatureSummary: parseFloat(process.env.TEMP_SUMMARY || '0.5'),
  temperatureHighlight: parseFloat(process.env.TEMP_HIGHLIGHT || '0.3')
};
// --------------------------------------------------------------

let openai; // OpenAI 实例
try {
  if (aiConfig.apiKey && aiConfig.apiKey !== 'YOUR_OPENAI_API_KEY') {
    const configuration = new Configuration({
      apiKey: aiConfig.apiKey,
    });
    openai = new OpenAIApi(configuration);
    console.log('OpenAI SDK 初始化成功');
  } else {
    console.warn('OpenAI API Key 未配置或无效，AI分析功能将不可用');
  }
} catch (error) {
  console.error('OpenAI SDK 初始化失败:', error);
  openai = null; // 确保 openai 为 null
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { articleId } = event;

  if (!openai) {
    console.error('OpenAI SDK 未初始化，无法执行分析');
    return { success: false, message: 'AI 服务未配置或初始化失败' };
  }

  if (!articleId) {
    console.error('缺少 articleId 参数');
    return { success: false, message: '缺少 articleId 参数' };
  }

  console.log(`开始分析文章，ID: ${articleId}`);

  try {
    // 1. 获取文章记录
    const articleRes = await db.collection('articles').doc(articleId).get();
    if (!articleRes.data) {
      throw new Error(`未找到ID为 ${articleId} 的文章记录`);
    }
    const article = articleRes.data;

    // 检查状态，只分析已抓取完成且未分析的文章
    if (article.status !== 'completed') {
      console.log(`文章 "${article.title}" (ID: ${articleId}) 状态为 ${article.status}，跳过分析`);
      return { success: true, message: `文章状态为 ${article.status}，无需分析` };
    }
    // 检查是否已有摘要，避免重复分析
    if (article.summary) {
        console.log(`文章 "${article.title}" (ID: ${articleId}) 已有摘要，跳过分析`);
        return { success: true, message: '文章已有分析结果，无需重复分析' };
    }

    // 2. 检查是否有可分析的内容
    const contentToAnalyze = article.content || article.originalAbstract;
    if (!contentToAnalyze) {
      throw new Error(`文章 "${article.title}" (ID: ${articleId}) 没有可供分析的内容 (content 和 originalAbstract 都为空)`);
    }

    // 3. 调用 OpenAI API 生成摘要
    console.log(`为文章 "${article.title}" 生成摘要...`);
    const summary = await generateSummary(contentToAnalyze);

    // 4. 调用 OpenAI API 提取亮点
    console.log(`为文章 "${article.title}" 提取亮点...`);
    const highlights = await extractHighlights(contentToAnalyze);

    // 5. 更新文章记录
    await db.collection('articles').doc(articleId).update({
      data: {
        summary: summary,
        highlights: highlights,
        // 可以考虑增加一个 'analyzedAt' 字段记录分析时间
        // status: 'analyzed', // 可以选择更新状态为 analyzed
        errorMessage: null, // 清除之前的错误信息
        updatedAt: db.serverDate()
      }
    });

    console.log(`文章 "${article.title}" 分析完成`);
    return { success: true, message: '文章分析成功' };

  } catch (error) {
    console.error(`分析文章 (ID: ${articleId}) 失败:`, error);
    // 更新文章状态为错误 (可选，取决于是否要标记分析失败)
    try {
      await db.collection('articles').doc(articleId).update({
        data: {
          // status: 'analyze_error', // 可以设置特定错误状态
          errorMessage: `AI分析失败: ${error.message}`,
          updatedAt: db.serverDate()
        }
      });
      console.log(`文章 (ID: ${articleId}) AI分析状态更新为 error`);
    } catch (updateError) {
      console.error(`更新文章 (ID: ${articleId}) AI分析状态为 error 时失败:`, updateError);
    }
    return { success: false, message: '分析文章失败', error: error.message };
  }
};

// --- OpenAI API 调用封装 ---

async function generateSummary(content) {
  try {
    const prompt = `${aiConfig.summaryPrompt}\n\n${content.substring(0, 3000)}`; // 限制内容长度避免超长
    const response = await openai.createChatCompletion({
      model: aiConfig.model,
      messages: [
        { role: 'system', content: '你是一个专业的医学和公共卫生领域助手，擅长总结疾病预防控制相关的学术文章。请用简洁、准确的中文总结文章的主要内容。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: aiConfig.maxTokensSummary,
      temperature: aiConfig.temperatureSummary,
    });
    const summary = response.data.choices[0].message.content.trim();
    console.log('摘要生成成功');
    return summary;
  } catch (error) {
    console.error(`调用 OpenAI 生成摘要失败: ${error.response ? JSON.stringify(error.response.data) : error.message}`, error);
    throw new Error(`生成摘要失败: ${error.message}`);
  }
}

async function extractHighlights(content) {
  try {
    const prompt = `${aiConfig.highlightPrompt}\n\n${content.substring(0, 3000)}`; // 限制内容长度
    const response = await openai.createChatCompletion({
      model: aiConfig.model,
      messages: [
        { role: 'system', content: '你是一个专业的医学和公共卫生领域助手，擅长从疾病预防控制相关的学术文章中提取关键发现和亮点。请用简洁、准确的中文列出文章的核心亮点，每点一行，使用数字编号。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: aiConfig.maxTokensHighlight,
      temperature: aiConfig.temperatureHighlight,
    });
    const highlightsText = response.data.choices[0].message.content.trim();
    const highlights = highlightsText
      .split(/\n+/)
      .map(line => line.replace(/^[\d.\-\•\*\s]+/, '').trim()) // 移除行首的数字、点、破折号、星号等
      .filter(line => line.length > 5); // 过滤掉过短或无效的行
    console.log(`成功提取 ${highlights.length} 个亮点`);
    return highlights;
  } catch (error) {
    console.error(`调用 OpenAI 提取亮点失败: ${error.response ? JSON.stringify(error.response.data) : error.message}`, error);
    throw new Error(`提取亮点失败: ${error.message}`);
  }
}