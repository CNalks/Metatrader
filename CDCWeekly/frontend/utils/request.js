/**
 * 网络请求工具
 * 封装微信小程序网络请求API，统一处理请求和响应
 */

// 获取应用实例
const app = getApp();

/**
 * 发送网络请求
 * @param {Object} options 请求选项
 * @param {String} options.url 请求路径
 * @param {String} options.method 请求方法
 * @param {Object} options.data 请求数据
 * @param {Boolean} options.showLoading 是否显示加载提示
 * @returns {Promise} 请求结果Promise
 */
const request = (options) => {
  // 默认显示加载提示
  if (options.showLoading !== false) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  }

  // 构建完整URL
  const url = options.url.startsWith('http') ? options.url : `${app.globalData.apiBaseUrl}${options.url}`;

  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        // 请求成功，但业务状态可能失败
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 检查业务状态
          if (res.data && res.data.success === false) {
            // 业务失败
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
              duration: 2000
            });
            reject(res.data);
          } else {
            // 业务成功
            resolve(res.data);
          }
        } else {
          // HTTP请求失败
          wx.showToast({
            title: `请求失败(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        // 网络请求失败
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
};

/**
 * GET请求
 * @param {String} url 请求路径
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果Promise
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * POST请求
 * @param {String} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果Promise
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

module.exports = {
  request,
  get,
  post
};