// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 表示当前云环境
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event; // 从事件对象中获取文章ID

  if (!id) {
    return {
      success: false,
      message: '缺少文章ID参数'
    };
  }

  try {
    // 1. 查询文章信息 (假设集合名为 'articles')
    const articleRes = await db.collection('articles').doc(id).get();

    if (!articleRes.data) {
      return {
        success: false,
        message: '未找到指定文章'
      };
    }
    const article = articleRes.data;

    // 2. 查询关联的周报信息 (假设集合名为 'weeklies', 关联字段为 'weeklyId')
    let weeklyInfo = null;
    if (article.weeklyId) {
      const weeklyRes = await db.collection('weeklies').doc(article.weeklyId).field({
        _id: true,
        issueNumber: true,
        publishDate: true
      }).get();
      if (weeklyRes.data) {
        weeklyInfo = {
          id: weeklyRes.data._id,
          issueNumber: weeklyRes.data.issueNumber,
          publishDate: weeklyRes.data.publishDate
        };
      }
    }

    return {
      success: true,
      data: {
        id: article._id,
        title: article.title,
        authors: article.authors,
        summary: article.summary,
        highlights: article.highlights,
        originalAbstract: article.originalAbstract,
        originalUrl: article.originalUrl,
        weekly: weeklyInfo // 可能为 null
      }
    };
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return {
      success: false,
      message: '获取文章详情失败',
      error: error.message
    };
  }
};