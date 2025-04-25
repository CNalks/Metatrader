/**
 * 配置文件
 * 包含邮箱配置、数据库配置、AI API配置等
 */

module.exports = {
  // 邮箱配置
  email: {
    // QQ邮箱IMAP服务器配置
    imap: {
      user: process.env.EMAIL_USER || '', // 邮箱账号，从环境变量获取
      password: process.env.EMAIL_PASSWORD || '', // 邮箱授权码，从环境变量获取
      host: 'imap.qq.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    },
    // 邮件过滤条件
    filter: {
      from: 'weekly@chinacdc.cn', // 发件人地址（示例）
      subject: 'China CDC Weekly' // 邮件主题关键词
    },
    // 扫描频率（毫秒）
    scanInterval: 3600000 // 默认每小时扫描一次
  },
  
  // 数据库配置
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cdc_weekly',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // AI API配置
  ai: {
    provider: 'openai', // AI服务提供商
    apiKey: process.env.OPENAI_API_KEY || '', // API密钥，从环境变量获取
    model: 'gpt-3.5-turbo', // 使用的模型
    // 摘要生成提示词
    summaryPrompt: '请用中文简洁地总结以下文章的主要内容，不超过200字：',
    // 亮点提取提示词
    highlightPrompt: '请用中文提取以下文章中最关键的3-5个发现、结论或创新点，以简短的要点形式列出：'
  },
  
  // API服务配置
  api: {
    port: process.env.PORT || 3000,
    prefix: '/api/v1'
  },
  
  // 监控告警配置
  monitor: {
    enabled: true,
    notifyEmail: process.env.NOTIFY_EMAIL || '', // 告警通知邮箱
    errorThreshold: 3 // 错误阈值，超过该值触发告警
  }
};