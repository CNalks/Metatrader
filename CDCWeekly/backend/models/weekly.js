/**
 * 周报数据模型
 * 用于存储周报信息和关联的文章
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 周报模式
const WeeklySchema = new Schema({
  // 周报期号
  issueNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // 发布日期
  publishDate: {
    type: Date,
    required: true,
    index: true
  },
  // 邮件主题
  emailSubject: {
    type: String,
    required: true
  },
  // 邮件ID
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  // 原始邮件内容
  rawContent: {
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
WeeklySchema.index({ publishDate: -1 }); // 按发布日期降序索引
WeeklySchema.index({ issueNumber: 1 }, { unique: true }); // 期号唯一索引

// 导出模型
module.exports = mongoose.model('Weekly', WeeklySchema);