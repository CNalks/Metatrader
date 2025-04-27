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
  const { keyword, page = 1, limit = 10 } = event;
  const skip = (page - 1) * limit;

  if (!keyword) {
    return {
      success: false,
      message: '搜索关键词不能为空'
    };
  }

  try {
    // 1. 构建搜索条件 (使用正则表达式进行模糊匹配，忽略大小写)
    // 注意：云数据库的正则表达式能力有限，可能不如MongoDB强大
    // 微信云开发数据库支持 `db.RegExp` 构造函数
    const searchRegex = db.RegExp({
      regexp: keyword, // 使用用户输入的关键词
      options: 'i', // i 表示忽略大小写
    });

    const searchCondition = _.or([
      { title: searchRegex },
      { summary: searchRegex },
      { highlights: searchRegex }, // 如果 highlights 是数组，这种查询可能不准确
      { originalAbstract: searchRegex }
    ]);

    // 2. 执行搜索查询 (假设集合名为 'articles')
    const articlesRes = await db.collection('articles')
      .where(searchCondition)
      .orderBy('createdAt', 'desc') // 按创建时间降序
      .skip(skip)
      .limit(limit)
      .field({ // 指定返回字段，减少数据传输
        _id: true,
        title: true,
        summary: true, // 可能需要摘要用于列表展示
        weeklyId: true // 用于后续获取周报信息
      })
      .get();

    const articles = articlesRes.data;

    // 3. 获取总数
    const totalRes = await db.collection('articles')
      .where(searchCondition)
      .count();
    const total = totalRes.total;

    // 4. (可选) 获取关联的周报信息 (如果前端列表需要显示期号等)
    // 为了简化，这里暂时省略获取关联周报信息的步骤
    // 如果需要，可以像 getArticleDetail 那样根据 weeklyId 查询

    return {
      success: true,
      data: {
        list: articles.map(article => ({
          id: article._id,
          title: article.title,
          summary: article.summary // 返回摘要
          // weekly: weeklyInfo // 如果查询了周报信息，则添加
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('搜索文章失败:', error);
    // 对特定错误进行更友好的提示，例如超时或查询语法错误
    return {
      success: false,
      message: '搜索文章失败',
      error: error.message
    };
  }
};