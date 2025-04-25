/**
 * 邮件服务
 * 负责连接邮箱、获取邮件、解析邮件内容
 */

const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const config = require('../../config/config');
const Weekly = require('../../models/weekly');
const logger = require('../../utils/logger');

class EmailService {
  constructor() {
    this.imap = null;
    this.connected = false;
    this.config = config.email;
  }

  /**
   * 连接邮箱
   * @returns {Promise} 连接结果
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // 创建IMAP连接
        this.imap = new Imap(this.config.imap);

        // 连接成功事件
        this.imap.once('ready', () => {
          this.connected = true;
          logger.info('邮箱连接成功');
          resolve(true);
        });

        // 连接错误事件
        this.imap.once('error', (err) => {
          logger.error('邮箱连接错误:', err);
          this.connected = false;
          reject(err);
        });

        // 连接结束事件
        this.imap.once('end', () => {
          this.connected = false;
          logger.info('邮箱连接已关闭');
        });

        // 开始连接
        this.imap.connect();
      } catch (error) {
        logger.error('邮箱连接异常:', error);
        reject(error);
      }
    });
  }

  /**
   * 关闭连接
   */
  disconnect() {
    if (this.imap && this.connected) {
      this.imap.end();
      this.connected = false;
    }
  }

  /**
   * 获取邮件列表
   * @param {Number} days 获取最近几天的邮件，默认7天
   * @returns {Promise} 邮件列表
   */
  async fetchEmails(days = 7) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      try {
        // 打开收件箱
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            logger.error('打开收件箱失败:', err);
            return reject(err);
          }

          // 计算日期范围
          const date = new Date();
          date.setDate(date.getDate() - days);
          const dateString = date.toISOString().split('T')[0];

          // 搜索条件：指定日期之后的邮件 + 发件人 + 主题关键词
          const searchCriteria = [
            ['SINCE', dateString],
            ['FROM', this.config.filter.from],
            ['SUBJECT', this.config.filter.subject]
          ];

          // 执行搜索
          this.imap.search(searchCriteria, (err, results) => {
            if (err) {
              logger.error('搜索邮件失败:', err);
              return reject(err);
            }

            if (!results || results.length === 0) {
              logger.info('未找到符合条件的邮件');
              return resolve([]);
            }

            logger.info(`找到 ${results.length} 封符合条件的邮件`);
            
            // 获取邮件详情
            const emails = [];
            const fetch = this.imap.fetch(results, { bodies: '', struct: true });

            fetch.on('message', (msg, seqno) => {
              const email = { seqno };

              msg.on('body', (stream, info) => {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });

                stream.once('end', () => {
                  // 解析邮件内容
                  simpleParser(buffer, (err, parsed) => {
                    if (err) {
                      logger.error('解析邮件失败:', err);
                      return;
                    }

                    email.id = parsed.messageId;
                    email.subject = parsed.subject;
                    email.from = parsed.from.text;
                    email.date = parsed.date;
                    email.html = parsed.html || parsed.textAsHtml;
                    email.text = parsed.text;
                    
                    emails.push(email);
                  });
                });
              });
            });

            fetch.once('error', (err) => {
              logger.error('获取邮件详情失败:', err);
              reject(err);
            });

            fetch.once('end', () => {
              logger.info('所有邮件获取完成');
              resolve(emails);
            });
          });
        });
      } catch (error) {
        logger.error('获取邮件异常:', error);
        reject(error);
      }
    });
  }

  /**
   * 保存邮件到数据库
   * @param {Array} emails 邮件列表
   * @returns {Promise} 保存结果
   */
  async saveEmails(emails) {
    try {
      const savedEmails = [];

      for (const email of emails) {
        // 提取期号
        const issueNumberMatch = email.subject.match(/Vol\s*(\d+)\s*,?\s*No\s*(\d+)/i);
        let issueNumber = '';
        
        if (issueNumberMatch && issueNumberMatch.length >= 3) {
          issueNumber = `Vol.${issueNumberMatch[1]}-No.${issueNumberMatch[2]}`;
        } else {
          // 如果无法提取期号，使用日期作为标识
          const date = new Date(email.date);
          issueNumber = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }

        // 检查是否已存在
        const existingWeekly = await Weekly.findOne({ emailId: email.id });
        if (existingWeekly) {
          logger.info(`周报 ${issueNumber} 已存在，跳过`);
          continue;
        }

        // 创建新周报记录
        const weekly = new Weekly({
          issueNumber,
          publishDate: email.date,
          emailSubject: email.subject,
          emailId: email.id,
          rawContent: email.html || email.text,
          status: 'pending'
        });

        // 保存到数据库
        await weekly.save();
        logger.info(`周报 ${issueNumber} 保存成功`);
        savedEmails.push(weekly);
      }

      return savedEmails;
    } catch (error) {
      logger.error('保存邮件失败:', error);
      throw error;
    }
  }

  /**
   * 扫描邮箱并处理新邮件
   * @returns {Promise} 处理结果
   */
  async scanAndProcess() {
    try {
      logger.info('开始扫描邮箱...');
      
      // 获取最近邮件
      const emails = await this.fetchEmails();
      
      // 关闭连接
      this.disconnect();
      
      if (emails.length === 0) {
        logger.info('未发现新邮件');
        return [];
      }
      
      // 保存邮件
      const savedEmails = await this.saveEmails(emails);
      logger.info(`成功保存 ${savedEmails.length} 封新邮件`);
      
      return savedEmails;
    } catch (error) {
      logger.error('扫描处理邮件失败:', error);
      // 确保连接关闭
      this.disconnect();
      throw error;
    }
  }
}

module.exports = new EmailService();