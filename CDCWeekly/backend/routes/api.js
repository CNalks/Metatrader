/**
 * API路由
 * 定义API接口路径和对应的控制器方法
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// 周报相关接口
router.get('/weeklies', apiController.getWeeklyList); // 获取周报列表
router.get('/weeklies/:id', apiController.getWeeklyDetail); // 获取周报详情

// 文章相关接口
router.get('/articles/:id', apiController.getArticleDetail); // 获取文章详情
router.get('/search', apiController.searchArticles); // 搜索文章

module.exports = router;