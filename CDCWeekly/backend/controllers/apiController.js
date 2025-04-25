/**
 * API控制器
 * 处理前端请求，返回数据
 */

const Weekly = require('../models/weekly');
const Article = require('../models/article');
const logger = require('../utils/logger');

class ApiController {
  /**
   * 获取周报列表
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async getWeeklyList(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      // 查询周报列表，按发布日期降序排序
      const weeklies = await Weekly.find({ status: 'completed' })
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('issueNumber publishDate createdAt');

      // 获取文章数量
      const weeklyIds = weeklies.map(weekly => weekly._id);
      const articleCounts = await Article.aggregate([
        { $match: { weekly: { $in: weeklyIds } } },
        { $group: { _id: '$weekly', count: { $sum: 1 } } }
      ]);

      // 构建响应数据
      const result = weeklies.map(weekly => {
        const articleCount = articleCounts.find(item => item._id.equals(weekly._id));
        return {
          id: weekly._id,
          issueNumber: weekly.issueNumber,
          publishDate: weekly.publishDate,
          createdAt: weekly.createdAt,
          articleCount: articleCount ? articleCount.count : 0
        };
      });

      // 获取总数
      const total = await Weekly.countDocuments({ status: 'completed' });

      res.json({
        success: true,
        data: {
          list: result,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`获取周报列表失败: ${error.message}`, error);
      res.status(500).json({
        success: false,
        message: '获取周报列表失败',
        error: error.message
      });
    }
  }

  /**
   * 获取周报详情
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async getWeeklyDetail(req, res) {
    try {
      const { id } = req.params;

      // 查询周报信息
      const weekly = await Weekly.findById(id).select('issueNumber publishDate');
      if (!weekly) {
        return res.status(404).json({
          success: false,
          message: '未找到指定周报'
        });
      }

      // 查询关联的文章列表
      const articles = await Article.find({ weekly: id })
        .select('title authors summary highlights originalUrl')
        .sort({ createdAt: 1 });

      res.json({
        success: true,
        data: {
          weekly: {
            id: weekly._id,
            issueNumber: weekly.issueNumber,
            publishDate: weekly.publishDate
          },
          articles: articles.map(article => ({
            id: article._id,
            title: article.title,
            authors: article.authors,
            summary: article.summary,
            highlights: article.highlights,
            originalUrl: article.originalUrl
          }))
        }
      });
    } catch (error) {
      logger.error(`获取周报详情失败: ${error.message}`, error);
      res.status(500).json({
        success: false,
        message: '获取周报详情失败',
        error: error.message
      });
    }
  }

  /**
   * 获取文章详情
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async getArticleDetail(req, res) {
    try {
      const { id } = req.params;

      // 查询文章信息
      const article = await Article.findById(id)
        .populate('weekly', 'issueNumber publishDate');

      if (!article) {
        return res.status(404).json({
          success: false,
          message: '未找到指定文章'
        });
      }

      res.json({
        success: true,
        data: {
          id: article._id,
          title: article.title,
          authors: article.authors,
          summary: article.summary,
          highlights: article.highlights,
          originalAbstract: article.originalAbstract,
          originalUrl: article.originalUrl,
          weekly: {
            id: article.weekly._id,
            issueNumber: article.weekly.issueNumber,
            publishDate: article.weekly.publishDate
          }
        }
      });
    } catch (error) {
      logger.error(`获取文章详情失败: ${error.message}`, error);
      res.status(500).json({
        success: false,
        message: '获取文章详情失败',
        error: error.message
      });
    }
  }

  /**
   * 搜索文章
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  async searchArticles(req, res) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词不能为空'
        });
      }

      // 构建搜索条件
      const searchCondition = {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { summary: { $regex: keyword, $options: 'i' } },
          { highlights: { $regex: keyword, $options: 'i' } },
          { originalAbstract: { $regex: keyword, $options: 'i' } }
        ]
      };

      // 执行搜索
      const articles = await Article.find(searchCondition)
        .populate('weekly', 'issueNumber publishDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // 获取总数
      const total = await Article.countDocuments(searchCondition);

      res.json({
        success: true,
        data: {
          list: articles.map(article => ({
            id: article._id,
            title: article.title,
            authors: article.authors,
            summary: article.summary,
            highlights: article.highlights,
            originalUrl: article.originalUrl,
            weekly: {
              id: article.weekly._id,
              issueNumber: article.weekly.issueNumber,
              publishDate: article.weekly.publishDate
            }
          })),
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`搜索文章失败: ${error.message}`, error);
      res.status(500).json({
        success: false,
        message: '搜索文章失败',
        error: error.message
      });
    }
  }
}

module.exports = new ApiController();