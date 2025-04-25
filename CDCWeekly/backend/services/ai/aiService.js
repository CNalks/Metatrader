/**
 * AI分析服务
 * 负责调用大语言模型API，生成文章摘要和提取亮点
 */

const { Configuration, OpenAIApi } = require('openai');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const Article = require('../../models/article');

class AIService {
  constructor() {
    // 初始化OpenAI配置
    this.configuration = new Configuration({
      apiKey: config.ai.apiKey,
    });
    this.openai = new OpenAIApi(this.configuration);
    this.model = config.ai.model;
  }

  /**
   * 生成文章摘要
   * @param {String} content 文章内容
   * @returns {Promise<String>} 生成的摘要
   */
  async generateSummary(content) {
    try {
      // 准备提示词
      const prompt = `${config.ai.summaryPrompt}\n\n${content}`;
      
      // 调用API
      const response = await this.openai.createChatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: '你是一个专业的医学和公共卫生领域助手，擅长总结疾病预防控制相关的学术文章。请用简洁、准确的中文总结文章的主要内容。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5,
      });
      
      // 提取生成的摘要
      const summary = response.data.choices[0].message.content.trim();
      logger.info('摘要生成成功');
      
      return summary;
    } catch (error) {
      logger.error(`生成摘要失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 提取文章亮点
   * @param {String} content 文章内容
   * @returns {Promise<Array>} 提取的亮点列表
   */
  async extractHighlights(content) {
    try {
      // 准备提示词
      const prompt = `${config.ai.highlightPrompt}\n\n${content}`;
      
      // 调用API
      const response = await this.openai.createChatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: '你是一个专业的医学和公共卫生领域助手，擅长从疾病预防控制相关的学术文章中提取关键发现和亮点。请用简洁、准确的中文列出文章的核心亮点。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });
      
      // 提取生成的亮点
      const highlightsText = response.data.choices[0].message.content.trim();
      
      // 将文本分割为亮点列表
      const highlights = highlightsText
        .split(/\n+/)
        .map(line => line.replace(/^[\d\-•\*\s]+/, '').trim()) // 移除行首的数字、破折号、星号等
        .filter(line => line.length > 0);
      
      logger.info(`成功提取 ${highlights.length} 个亮点`);
      
      return highlights;
    } catch (error) {
      logger.error(`提取亮点失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 分析文章
   * @param {String} articleId 文章ID
   * @returns {Promise} 分析结果
   */
  async analyzeArticle(articleId) {
    try {
      // 获取文章记录
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error(`未找到ID为 ${articleId} 的文章记录`);
      }

      // 检查文章内容是否存在
      if (!article.content && !article.originalAbstract) {
        throw new Error(`文章 "${article.title}" 没有可分析的内容`);
      }

      logger.info(`开始分析文章 "${article.title}"`);

      // 使用文章内容或摘要进行分析
      const contentToAnalyze = article.content || article.originalAbstract;

      // 生成摘要
      const summary = await this.generateSummary(contentToAnalyze);
      article.summary = summary;

      // 提取亮点
      const highlights = await this.extractHighlights(contentToAnalyze);
      article.highlights = highlights;

      // 保存分析结果
      await article.save();

      logger.info(`文章 "${article.title}" 分析完成`);
      return article;
    } catch (error) {
      logger.error(`分析文章失败: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * 批量分析文章
   * @param {Array} articleIds 文章ID数组
   * @returns {Promise} 分析结果
   */
  async analyzeArticles(articleIds) {
    const results = {
      success: [],
      failed: []
    };

    for (const articleId of articleIds) {
      try {
        const article = await this.analyzeArticle(articleId);
        results.success.push(article);
        
        // 添加延迟，避免API请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed.push({
          articleId,
          error: error.message
        });
      }
    }

    logger.info(`批量分析完成: 成功 ${results.success.length} 篇，失败 ${results.failed.length} 篇`);
    return results;
  }

  /**
   * 分析已抓取但未分析的文章
   * @param {Number} limit 最大处理数量
   * @returns {Promise} 分析结果
   */
  async analyzeCompletedArticles(limit = 5) {
    try {
      // 查找状态为completed但没有摘要的文章
      const articlesToAnalyze = await Article.find({
        status: 'completed',
        summary: { $exists: false }
      }).limit(limit);
      
      if (articlesToAnalyze.length === 0) {
        logger.info('没有待分析的文章');
        return { success: [], failed: [] };
      }
      
      logger.info(`找到 ${articlesToAnalyze.length} 篇待分析文章`);
      
      // 提取文章ID
      const articleIds = articlesToAnalyze.map(article => article._id);
      
      // 批量分析
      return await this.analyzeArticles(articleIds);
    } catch (error) {
      logger.error(`分析待处理文章失败: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = new AIService();