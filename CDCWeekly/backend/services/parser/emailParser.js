/**
 * 邮件解析服务
 * 负责解析邮件内容，提取周报文章列表和链接
 */

const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const Weekly = require('../../models/weekly');
const Article = require('../../models/article');

class EmailParser {
  /**
   * 解析邮件内容
   * @param {String} weeklyId 周报ID
   * @returns {Promise} 解析结果
   */
  async parseEmail(weeklyId) {
    try {
      // 获取周报记录
      const weekly = await Weekly.findById(weeklyId);
      if (!weekly) {
        throw new Error(`未找到ID为 ${weeklyId} 的周报记录`);
      }

      // 更新状态为处理中
      weekly.status = 'processing';
      await weekly.save();

      logger.info(`开始解析周报 ${weekly.issueNumber}`);

      // 解析HTML内容
      const $ = cheerio.load(weekly.rawContent);
      const articles = [];

      // 查找文章链接
      // 注意：这里的选择器需要根据实际邮件HTML结构调整
      $('a').each((index, element) => {
        const link = $(element).attr('href');
        const text = $(element).text().trim();

        // 过滤有效的文章链接
        // 通常CDC Weekly的文章链接包含特定的URL模式
        if (link && 
            (link.includes('weekly.chinacdc.cn') || 
             link.includes('chinacdc.cn/weekly') || 
             link.includes('doi.org'))) {
          
          // 排除导航链接、页脚链接等
          if (text.length > 10 && !text.includes('China CDC Weekly') && !text.includes('Copyright')) {
            articles.push({
              title: text,
              url: link
            });
          }
        }
      });

      logger.info(`从周报 ${weekly.issueNumber} 中提取到 ${articles.length} 篇文章`);

      // 保存文章记录
      const savedArticles = [];
      for (const article of articles) {
        // 检查是否已存在
        const existingArticle = await Article.findOne({
          weekly: weekly._id,
          originalUrl: article.url
        });

        if (existingArticle) {
          logger.info(`文章 "${article.title}" 已存在，跳过`);
          savedArticles.push(existingArticle);
          continue;
        }

        // 创建新文章记录
        const newArticle = new Article({
          weekly: weekly._id,
          title: article.title,
          originalUrl: article.url,
          status: 'pending'
        });

        await newArticle.save();
        logger.info(`文章 "${article.title}" 保存成功`);
        savedArticles.push(newArticle);
      }

      // 更新周报状态
      weekly.status = 'completed';
      await weekly.save();

      return savedArticles;
    } catch (error) {
      logger.error(`解析周报邮件失败: ${error.message}`, error);
      
      // 更新周报状态为错误
      try {
        const weekly = await Weekly.findById(weeklyId);
        if (weekly) {
          weekly.status = 'error';
          weekly.errorMessage = error.message;
          await weekly.save();
        }
      } catch (updateError) {
        logger.error(`更新周报状态失败: ${updateError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * 提取期号信息
   * @param {String} subject 邮件主题
   * @returns {Object} 期号信息
   */
  extractIssueInfo(subject) {
    try {
      // 匹配格式如 "China CDC Weekly, Vol.5, No.30"
      const regex = /Vol\.?\s*(\d+)\s*,?\s*No\.?\s*(\d+)/i;
      const match = subject.match(regex);
      
      if (match && match.length >= 3) {
        return {
          volume: parseInt(match[1], 10),
          number: parseInt(match[2], 10),
          issueNumber: `Vol.${match[1]}-No.${match[2]}`
        };
      }
      
      // 如果无法匹配，返回null
      return null;
    } catch (error) {
      logger.error(`提取期号信息失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 提取发布日期
   * @param {String} content 邮件内容
   * @returns {Date|null} 发布日期
   */
  extractPublishDate(content) {
    try {
      // 加载HTML内容
      const $ = cheerio.load(content);
      
      // 查找日期文本
      // 注意：这里的选择器需要根据实际邮件HTML结构调整
      const dateText = $('span:contains("Published:")').text() || 
                       $('span:contains("Date:")').text() || 
                       $('p:contains("Published:")').text();
      
      if (dateText) {
        // 匹配日期格式，如 "Published: July 28, 2023"
        const dateMatch = dateText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s*,\s*(\d{4})/);
        
        if (dateMatch) {
          const monthNames = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
          };
          
          const month = monthNames[dateMatch[1]];
          const day = parseInt(dateMatch[2], 10);
          const year = parseInt(dateMatch[3], 10);
          
          return new Date(year, month, day);
        }
      }
      
      // 如果无法提取，返回null
      return null;
    } catch (error) {
      logger.error(`提取发布日期失败: ${error.message}`);
      return null;
    }
  }
}

module.exports = new EmailParser();