// 云函数入口文件
const cloud = require('wx-server-sdk');
const Imap = require('node-imap');
const { simpleParser } = require('mailparser');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// --- 配置信息 (需要替换为实际配置或从环境变量/数据库读取) ---
const emailConfig = {
  imap: {
    user: process.env.EMAIL_USER || 'your-email@example.com', // 从环境变量读取或硬编码(不推荐)
    password: process.env.EMAIL_PASSWORD || 'your-password', // 从环境变量读取或硬编码(不推荐)
    host: process.env.EMAIL_HOST || 'imap.example.com',
    port: process.env.EMAIL_PORT || 993,
    tls: process.env.EMAIL_TLS === 'true' || true
  },
  filter: {
    from: process.env.EMAIL_FILTER_FROM || 'sender@example.com', // 筛选的发件人
    subject: process.env.EMAIL_FILTER_SUBJECT || 'CDC Weekly' // 筛选的主题关键词
  },
  fetchDays: parseInt(process.env.EMAIL_FETCH_DAYS || '7', 10) // 获取最近几天的邮件
};
// --------------------------------------------------------------

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('开始执行 scanEmails 云函数');
  let imap;
  let connection;
  const newWeeklies = [];

  try {
    // 1. 连接邮箱
    connection = await connectImap();
    imap = connection.imap;

    // 2. 打开收件箱
    await openInbox(imap);

    // 3. 搜索邮件
    const results = await searchEmails(imap);
    if (!results || results.length === 0) {
      console.log('未找到符合条件的邮件');
      return { success: true, message: '未找到新邮件', newWeeklies: [] };
    }
    console.log(`找到 ${results.length} 封符合条件的邮件`);

    // 4. 获取并解析邮件
    const emails = await fetchAndParseEmails(imap, results);

    // 5. 保存新邮件到数据库
    for (const email of emails) {
      const savedWeekly = await saveEmailToDb(email);
      if (savedWeekly) {
        newWeeklies.push(savedWeekly);
      }
    }

    console.log(`扫描完成，新增 ${newWeeklies.length} 条周报记录`);
    return { success: true, message: `扫描完成，新增 ${newWeeklies.length} 条周报`, newWeeklies };

  } catch (error) {
    console.error('scanEmails 云函数执行失败:', error);
    return { success: false, message: '扫描邮箱失败', error: error.message };
  } finally {
    // 6. 关闭连接
    if (imap && connection && connection.connected) {
      try {
        imap.end();
        console.log('邮箱连接已关闭');
      } catch (endError) {
        console.error('关闭邮箱连接时出错:', endError);
      }
    }
  }
};

// --- IMAP 操作封装 ---

function connectImap() {
  return new Promise((resolve, reject) => {
    try {
      const imap = new Imap(emailConfig.imap);
      let connected = false;

      imap.once('ready', () => {
        connected = true;
        console.log('邮箱连接成功');
        resolve({ imap, connected: true });
      });

      imap.once('error', (err) => {
        console.error('邮箱连接错误:', err);
        connected = false;
        reject(err);
      });

      imap.once('end', () => {
        connected = false;
        console.log('邮箱连接已关闭 (end event)');
      });

      imap.connect();
    } catch (error) {
      console.error('创建邮箱连接异常:', error);
      reject(error);
    }
  });
}

function openInbox(imap) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('打开收件箱失败:', err);
        return reject(err);
      }
      console.log('收件箱已打开');
      resolve(box);
    });
  });
}

function searchEmails(imap) {
  return new Promise((resolve, reject) => {
    const date = new Date();
    date.setDate(date.getDate() - emailConfig.fetchDays);
    const dateString = date.toISOString().split('T')[0];

    const searchCriteria = [
      ['SINCE', dateString],
      ['FROM', emailConfig.filter.from],
      ['SUBJECT', emailConfig.filter.subject]
    ];

    imap.search(searchCriteria, (err, results) => {
      if (err) {
        console.error('搜索邮件失败:', err);
        return reject(err);
      }
      resolve(results);
    });
  });
}

function fetchAndParseEmails(imap, results) {
  return new Promise((resolve, reject) => {
    const emails = [];
    if (!results || results.length === 0) {
        return resolve(emails);
    }
    const fetch = imap.fetch(results, { bodies: '', struct: true });

    fetch.on('message', (msg, seqno) => {
      let emailData = { seqno };
      let buffer = '';

      msg.on('body', (stream, info) => {
        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', () => {
          simpleParser(buffer)
            .then(parsed => {
              emailData.id = parsed.messageId;
              emailData.subject = parsed.subject;
              emailData.from = parsed.from.text;
              emailData.date = parsed.date;
              emailData.html = parsed.html || parsed.textAsHtml;
              emailData.text = parsed.text;
              emails.push(emailData);
            })
            .catch(err => {
              console.error(`解析邮件 (seqno: ${seqno}) 失败:`, err);
              // 即使解析失败也继续处理下一封邮件
            });
        });
      });
    });

    fetch.once('error', (err) => {
      console.error('获取邮件详情失败:', err);
      reject(err);
    });

    fetch.once('end', () => {
      console.log('所有邮件获取完成');
      // 等待所有 simpleParser 完成
      // 注意：这里简单处理，实际可能需要更健壮的异步控制
      setTimeout(() => resolve(emails), 500); 
    });
  });
}

async function saveEmailToDb(email) {
  try {
    // 提取期号 (与 emailParser.js 逻辑保持一致)
    const issueNumberMatch = email.subject.match(/Vol\.?\s*(\d+)\s*,?\s*No\.?\s*(\d+)/i);
    let issueNumber = '';
    if (issueNumberMatch && issueNumberMatch.length >= 3) {
      issueNumber = `Vol.${issueNumberMatch[1]}-No.${issueNumberMatch[2]}`;
    } else {
      const date = new Date(email.date);
      issueNumber = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    // 检查是否已存在 (使用 emailId 作为唯一标识)
    const existingWeekly = await db.collection('weeklies').where({
      emailId: email.id
    }).count();

    if (existingWeekly.total > 0) {
      console.log(`周报 ${issueNumber} (Email ID: ${email.id}) 已存在，跳过`);
      return null;
    }

    // 创建新周报记录
    const addRes = await db.collection('weeklies').add({
      data: {
        issueNumber,
        publishDate: email.date,
        emailSubject: email.subject,
        emailId: email.id,
        rawContent: email.html || email.text,
        status: 'pending', // 初始状态为待处理
        errorMessage: null,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    console.log(`新周报 ${issueNumber} (ID: ${addRes._id}) 保存成功`);
    return { _id: addRes._id, issueNumber }; // 返回ID和期号，方便后续处理

  } catch (error) {
    console.error(`保存邮件 (Subject: ${email.subject}) 到数据库失败:`, error);
    return null; // 保存失败不影响其他邮件处理
  }
}