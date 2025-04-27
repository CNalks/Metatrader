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
  const { page = 1, limit = 10 } = event;
  const skip = (page - 1) * limit;

  try {
    // 1. 查询周报列表 (假设集合名为 'weeklies')
    const weeklyRes = await db.collection('weeklies')
      .where({
        status: 'completed' // 假设状态字段为 'status'
      })
      .orderBy('publishDate', 'desc') // 按发布日期降序
      .skip(skip)
      .limit(limit)
      .field({ // 指定返回字段
        _id: true,
        issueNumber: true,
        publishDate: true,
        createdAt: true
      })
      .get();

    const weeklies = weeklyRes.data;

    // 2. 获取文章数量 (假设集合名为 'articles', 关联字段为 'weeklyId')
    const weeklyIds = weeklies.map(weekly => weekly._id);
    const articleCountRes = await db.collection('articles')
      .aggregate()
      .match({
        weeklyId: _.in(weeklyIds) // 使用 weeklyId 关联
      })
      .group({
        _id: '$weeklyId',
        count: db.command.aggregate.sum(1)
      })
      .end();

    const articleCounts = articleCountRes.list.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // 3. 构建响应数据
    const result = weeklies.map(weekly => ({
      id: weekly._id,
      issueNumber: weekly.issueNumber,
      publishDate: weekly.publishDate,
      createdAt: weekly.createdAt,
      articleCount: articleCounts[weekly._id] || 0
    }));

    // 4. 获取总数
    const totalRes = await db.collection('weeklies')
      .where({
        status: 'completed'
      })
      .count();
    const total = totalRes.total;

    return {
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
    };
  } catch (error) {
    console.error('获取周报列表失败:', error);
    return {
      success: false,
      message: '获取周报列表失败',
      error: error.message
    };
  }
};