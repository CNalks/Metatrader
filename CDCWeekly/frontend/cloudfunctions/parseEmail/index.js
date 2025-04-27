// 云函数入口文件
const cloud = require('wx-server-sdk');
const cheerio = require('cheerio');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { weeklyId } = event;

  if (!weeklyId) {
    console.error('缺少 weeklyId 参数');
    return { success: false, message: '缺少 weeklyId 参数' };
  }

  console.log(`开始解析周报，ID: ${weeklyId}`);

  try {
    // 1. 获取周报记录
    const weeklyRes = await db.collection('weeklies').doc(weeklyId).get();
    if (!weeklyRes.data) {
      throw new Error(`未找到ID为 ${weeklyId} 的周报记录`);
    }
    const weekly = weeklyRes.data;

    // 检查是否已经是 completed 或 error 状态
    if (weekly.status === 'completed' || weekly.status === 'error') {
        console.log(`周报 ${weekly.issueNumber} (ID: ${weeklyId}) 状态为 ${weekly.status}，跳过解析`);
        return { success: true, message: `周报状态为 ${weekly.status}，无需解析`, articlesSaved: 0 };
    }

    // 2. 更新状态为处理中
    await db.collection('weeklies').doc(weeklyId).update({
      data: {
        status: 'processing',
        updatedAt: db.serverDate()
      }
    });
    console.log(`周报 ${weekly.issueNumber} 状态更新为 processing`);

    // 3. 解析HTML内容
    if (!weekly.rawContent) {
        throw new Error(`周报 ${weekly.issueNumber} (ID: ${weeklyId}) 的 rawContent 为空`);
    }
    const $ = cheerio.load(weekly.rawContent);
    const extractedArticles = [];

    // 查找文章链接 (选择器需要根据实际邮件HTML结构调整)
    $('a').each((index, element) => {
      const link = $(element).attr('href');
      const text = $(element).text().trim();

      // 过滤有效的文章链接 (与原 emailParser.js 逻辑保持一致)
      if (link &&
          (link.includes('weekly.chinacdc.cn') ||
           link.includes('chinacdc.cn/weekly') ||
           link.includes('doi.org'))) {

        // 排除导航链接、页脚链接等
        if (text.length > 10 && !text.includes('China CDC Weekly') && !text.includes('Copyright')) {
          // 避免重复添加相同 URL
          if (!extractedArticles.some(a => a.url === link)) {
             extractedArticles.push({
                title: text,
                url: link
             });
          }
        }
      }
    });

    console.log(`从周报 ${weekly.issueNumber} 中提取到 ${extractedArticles.length} 篇文章链接`);

    // 4. 保存文章记录
    let articlesSavedCount = 0;
    for (const article of extractedArticles) {
      // 检查是否已存在 (使用 weeklyId 和 originalUrl 联合检查)
      const existingArticle = await db.collection('articles').where({
        weeklyId: weeklyId,
        originalUrl: article.url
      }).count();

      if (existingArticle.total > 0) {
        console.log(`文章 "${article.title}" (URL: ${article.url}) 已存在，跳过`);
        continue;
      }

      // 创建新文章记录
      await db.collection('articles').add({
        data: {
          weeklyId: weeklyId,
          title: article.title,
          originalUrl: article.url,
          authors: [], // 初始化为空数组
          summary: null,
          highlights: [],
          originalAbstract: null,
          content: null,
          status: 'pending', // 初始状态为待抓取
          errorMessage: null,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
      articlesSavedCount++;
      console.log(`新文章 "${article.title}" 保存成功`);
    }

    // 5. 更新周报状态为完成
    await db.collection('weeklies').doc(weeklyId).update({
      data: {
        status: 'completed',
        errorMessage: null, // 清除之前的错误信息
        updatedAt: db.serverDate()
      }
    });
    console.log(`周报 ${weekly.issueNumber} 解析完成，状态更新为 completed`);

    return { success: true, message: `解析成功，新增 ${articlesSavedCount} 篇文章`, articlesSaved: articlesSavedCount };

  } catch (error) {
    console.error(`解析周报邮件 (ID: ${weeklyId}) 失败:`, error);
    // 更新周报状态为错误
    try {
      await db.collection('weeklies').doc(weeklyId).update({
        data: {
          status: 'error',
          errorMessage: error.message || '解析过程中发生未知错误',
          updatedAt: db.serverDate()
        }
      });
      console.log(`周报 (ID: ${weeklyId}) 状态更新为 error`);
    } catch (updateError) {
      console.error(`更新周报 (ID: ${weeklyId}) 状态为 error 时失败:`, updateError);
    }
    return { success: false, message: '解析周报失败', error: error.message };
  }
};