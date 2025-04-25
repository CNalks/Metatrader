/**
 * 文章抓取服务
 * 负责访问原文链接，抓取文章详细内容
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const Article = require('../../models/article');

class ArticleScraper {
  /**
   * 抓取文章内容
   * @param {String} articleId 文章ID
   * @returns {Promise} 抓取结果
   */
  async scrapeArticle(articleId) {
    try {
      // 获取文章记录
      const article = await Article.findById(articleId);
      if (!article) {
        throw new Error(`未找到ID为 ${articleId} 的文章记录`);
      }

      // 更新状态为处理中
      article.status = 'processing';
      await article.save();

      logger.info(`开始抓取文章 "${article.title}"`);

      // 发送HTTP请求获取页面内容
      const response = await axios.get(article.originalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000 // 10秒超时
      });

      // 解析HTML内容
      const $ = cheerio.load(response.data);
      
      // 提取作者信息
      // 注意：选择器需要根据实际网页结构调整
      const authors = [];
      $('.author-name, .authors, .meta-authors').each((index, element) => {
        const authorText = $(element).text().trim();
        if (authorText && !authors.includes(authorText)) {
          authors.push(authorText);
        }
      });

      // 提取摘要
      let abstract = '';
      $('.abstract, #abstract, [id*="abstract"]').each((index, element) => {
        const text = $(element).text().trim();
        if (text && text.length > abstract.length) {
          abstract = text;
        }
      });

      // 提取正文内容
      let content = '';
      $('.article-content, .content, #content, .main-content').each((index, element) => {
        const text = $(element).text().trim();
        if (text && text.length > content.length) {
          content = text;
        }
      });

      // 如果没有找到内容，尝试其他常见选择器
      if (!content) {
        $('article, .article, .post, .entry, main').each((index, element) => {
          const text = $(element).text().trim();
          if (text && text.length > content.length) {
            content = text;
          }
        });
      }

      // 更新文章信息
      article.authors = authors;
      article.originalAbstract = abstract;
      article.content = content;
      article.status = 'completed';
      await article.save();

      logger.info(`文章 "${article.title}" 抓取成功`);
      return article;
    } catch (error) {
      logger.error(`抓取文章失败: ${error.message}`, error);
      
      // 更新文章状态为错误
      try {
        const article = await Article.findById(articleId);
        if (article) {
          article.status = 'error';
          article.errorMessage = error.message;
          await article.save();
        }
      } catch (updateError) {
        logger.error(`更新文章状态失败: ${updateError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * 批量抓取文章
   * @param {Array} articleIds 文章ID数组
   * @returns {Promise} 抓取结果
   */
  async scrapeArticles(articleIds) {
    const results = {
      success: [],
      failed: []
    };

    for (const articleId of articleIds) {
      try {
        const article = await this.scrapeArticle(articleId);
        results.success.push(article);
        
        // 添加延迟，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.failed.push({
          articleId,
          error: error.message
        });
      }
    }

    logger.info(`批量抓取完成: 成功 ${results.success.length} 篇，失败 ${results.failed.length} 篇`);
    return results;
  }

  /**
   * 抓取待处理的文章
   * @param {Number} limit 最大处理数量
   * @returns {Promise} 抓取结果
   */
  async scrapePendingArticles(limit = 10) {
    try {
      // 查找状态为pending的文章
      const pendingArticles = await Article.find({ status: 'pending' }).limit(limit);
      
      if (pendingArticles.length === 0) {
        logger.info('没有待处理的文章');
        return { success: [], failed: [] };
      }
      
      logger.info(`找到 ${pendingArticles.length} 篇待处理文章`);
      
      // 提取文章ID
      const articleIds = pendingArticles.map(article => article._id);
      
      // 批量抓取
      return await this.scrapeArticles(articleIds);
    } catch (error) {
      logger.error(`抓取待处理文章失败: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = new ArticleScraper();