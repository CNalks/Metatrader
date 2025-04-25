/**
 * 后台服务主入口
 * 负责初始化Express应用、连接数据库、注册路由和启动定时任务
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const config = require('./config/config');
const apiRoutes = require('./routes/api');
const emailService = require('./services/email/emailService');
const emailParser = require('./services/parser/emailParser');
const articleScraper = require('./services/scraper/articleScraper');
const aiService = require('./services/ai/aiService');
const logger = require('./utils/logger');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册API路由
app.use(config.api.prefix, apiRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`API错误: ${err.message}`, err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// 连接数据库
mongoose.connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info('数据库连接成功');
    // 启动服务器
    startServer();
  })
  .catch(err => {
    logger.error('数据库连接失败:', err);
    process.exit(1);
  });

/**
 * 启动服务器
 */
function startServer() {
  const port = config.api.port;
  app.listen(port, () => {
    logger.info(`服务器已启动，监听端口 ${port}`);
    // 启动定时任务
    startScheduledTasks();
  });
}

/**
 * 启动定时任务
 */
function startScheduledTasks() {
  // 每小时扫描邮箱
  cron.schedule('0 * * * *', async () => {
    logger.info('执行定时任务: 扫描邮箱');
    try {
      // 扫描邮箱并处理新邮件
      const newWeeklies = await emailService.scanAndProcess();
      
      // 如果有新周报，解析文章
      for (const weekly of newWeeklies) {
        try {
          await emailParser.parseEmail(weekly._id);
        } catch (error) {
          logger.error(`解析周报 ${weekly.issueNumber} 失败:`, error);
        }
      }
    } catch (error) {
      logger.error('扫描邮箱任务失败:', error);
    }
  });

  // 每30分钟抓取文章
  cron.schedule('*/30 * * * *', async () => {
    logger.info('执行定时任务: 抓取文章');
    try {
      await articleScraper.scrapePendingArticles(5);
    } catch (error) {
      logger.error('抓取文章任务失败:', error);
    }
  });

  // 每小时分析文章
  cron.schedule('30 * * * *', async () => {
    logger.info('执行定时任务: 分析文章');
    try {
      await aiService.analyzeCompletedArticles(3);
    } catch (error) {
      logger.error('分析文章任务失败:', error);
    }
  });

  logger.info('定时任务已启动');
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
});

module.exports = app;