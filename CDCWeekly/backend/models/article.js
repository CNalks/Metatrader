/**
 * 文章数据模型
 * 用于存储周报中的文章信息
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 文章模式
const ArticleSchema = new Schema({
  // 关联的周报ID
  weekly: {
    type: Schema.Types.ObjectId,
    ref: 'Weekly',
    required: true,
    index: true
  },
  // 文章标题
  title: {
    type: String,
    required: true,
    index: true
  },
  // 文章作者
  authors: [{
    type: String
  }],
  // 原文链接
  originalUrl: {
    type: String,
    required: true
  },
  // 原文摘要
  originalAbstract: {
    type: String
  },
  // AI生成的摘要
  summary: {
    type: String
  },
  // AI提取的亮点
  highlights: [{
    type: String
  }],
  // 文章内容
  content: {
    type: String
  },
  // 处理状态
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  // 处理错误信息
  errorMessage: {
    type: String
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 创建索引
ArticleSchema.index({ weekly: 1 }); // 按周报ID索引
ArticleSchema.index({ title: 'text' }); // 标题全文索引，用于搜索

// 导出模型
module.exports = mongoose.model('Article', ArticleSchema);