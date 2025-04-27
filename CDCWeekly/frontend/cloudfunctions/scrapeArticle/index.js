// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { articleId } = event;

  if (!articleId) {
    console.error('缺少 articleId 参数');
    return { success: false, message: '缺少 articleId 参数' };
  }

  console.log(`开始抓取文章，ID: ${articleId}`);

  try {
    // 1. 获取文章记录
    const articleRes = await db.collection('articles').doc(articleId).get();
    if (!articleRes.data) {
      throw new Error(`未找到ID为 ${articleId} 的文章记录`);
    }
    const article = articleRes.data;

    // 检查状态，避免重复抓取或抓取错误状态的文章
    if (article.status !== 'pending') {
        console.log(`文章 "${article.title}" (ID: ${articleId}) 状态为 ${article.status}，跳过抓取`);
        return { success: true, message: `文章状态为 ${article.status}，无需抓取` };
    }

    // 2. 更新状态为处理中
    await db.collection('articles').doc(articleId).update({
      data: {
        status: 'processing',
        updatedAt: db.serverDate()
      }
    });
    console.log(`文章 "${article.title}" 状态更新为 processing`);

    // 3. 发送HTTP请求获取页面内容
    if (!article.originalUrl) {
        throw new Error(`文章 "${article.title}" (ID: ${articleId}) 的 originalUrl 为空`);
    }
    const response = await axios.get(article.originalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000 // 15秒超时
    });

    // 4. 解析HTML内容
    const $ = cheerio.load(response.data);

    // 提取作者信息 (选择器需要根据实际网页结构调整)
    const authors = [];
    $('.author-name, .authors, .meta-authors, meta[name="author"]').each((index, element) => {
        let authorText = '';
        if (element.tagName === 'meta') {
            authorText = $(element).attr('content');
        } else {
            authorText = $(element).text().trim();
        }
        // 简单清洗和去重
        authorText = authorText.replace(/\s+/g, ' ').trim();
        if (authorText && !authors.includes(authorText)) {
            authors.push(authorText);
        }
    });

    // 提取摘要 (选择器需要根据实际网页结构调整)
    let abstract = '';
    $('.abstract, #abstract, [id*="abstract"], meta[name="description"], meta[property="og:description"]').each((index, element) => {
        let text = '';
        if (element.tagName === 'meta') {
            text = $(element).attr('content');
        } else {
            text = $(element).text().trim();
        }
        if (text && text.length > abstract.length) {
            abstract = text;
        }
    });

    // 提取正文内容 (选择器需要根据实际网页结构调整)
    let content = '';
    // 优先选择语义化标签或常见内容容器
    $('article, .article, .article-content, .post-content, .entry-content, .main-content, #content, .content').each((index, element) => {
        // 移除脚本、样式、导航等无关元素
        $(element).find('script, style, nav, header, footer, .sidebar, .related-posts, .comments').remove();
        const text = $(element).text().trim();
        // 选择最长的文本块作为主要内容
        if (text && text.length > content.length) {
            content = text;
        }
    });
    // 如果上面没找到，尝试body作为最后的选择
    if (!content) {
        $('body').find('script, style, nav, header, footer, .sidebar').remove();
        content = $('body').text().trim();
    }
    // 简单清洗，移除多余空白
    content = content.replace(/\s{2,}/g, '\n').trim();

    // 5. 更新文章信息
    await db.collection('articles').doc(articleId).update({
      data: {
        authors: authors,
        originalAbstract: abstract,
        content: content, // 存储提取的正文
        status: 'completed', // 更新状态为已抓取完成
        errorMessage: null, // 清除错误信息
        updatedAt: db.serverDate()
      }
    });

    console.log(`文章 "${article.title}" 抓取成功`);
    return { success: true, message: '文章抓取成功' };

  } catch (error) {
    console.error(`抓取文章 (ID: ${articleId}) 失败:`, error);
    // 更新文章状态为错误
    try {
      await db.collection('articles').doc(articleId).update({
        data: {
          status: 'error',
          errorMessage: error.message || '抓取过程中发生未知错误',
          updatedAt: db.serverDate()
        }
      });
      console.log(`文章 (ID: ${articleId}) 状态更新为 error`);
    } catch (updateError) {
      console.error(`更新文章 (ID: ${articleId}) 状态为 error 时失败:`, updateError);
    }
    return { success: false, message: '抓取文章失败', error: error.message };
  }
};