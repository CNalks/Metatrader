/**
 * 工具函数库
 */

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @returns {String} 格式化后的日期字符串 (YYYY-MM-DD HH:mm:ss)
 */
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [
    [year, month, day].map(formatNumber).join('-'),
    [hour, minute, second].map(formatNumber).join(':')
  ].join(' ');
};

/**
 * 格式化数字，不足两位补零
 * @param {Number} n 数字
 * @returns {String} 格式化后的字符串
 */
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

module.exports = {
  formatTime: formatTime
};