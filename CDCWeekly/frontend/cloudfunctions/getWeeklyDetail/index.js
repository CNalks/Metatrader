// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 表示当前云环境
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { id } = event; // 从事件对象中获取周报ID

  if (!id) {
    return {
      success: false,
      message: '缺少周报ID参数'
    };
  }

  try {
    // 1. 查询周报信息 (假设集合名为 'weeklies')
    const weeklyRes = await db.collection('weeklies').doc(id).field({
      _id: true,
      issueNumber: true,
      publishDate: true
    }).get();

    if (!weeklyRes.data) {
      return {
        success: false,
        message: '未找到指定周报'
      };
    }
    const weekly = weeklyRes.data;

    // 2. 查询关联的文章列表 (假设集合名为 'articles', 关联字段为 'weeklyId')
    const articlesRes = await db.collection('articles')
      .where({
        weeklyId: id // 使用 weeklyId 关联
      })
      .field({ // 指定返回字段
        _id: true,
        title: true,
        authors: true,
        summary: true,
        highlights: true,
        originalUrl: true
      })
      .orderBy('createdAt', 'asc') // 按创建时间升序
      .get();

    const articles = articlesRes.data;

    return {
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
    };
  } catch (error) {
    console.error('获取周报详情失败:', error);
    return {
      success: false,
      message: '获取周报详情失败',
      error: error.message
    };
  }
};