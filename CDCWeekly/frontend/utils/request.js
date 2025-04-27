/**
 * 云函数调用工具
 * 封装微信小程序云函数调用API，统一处理请求和响应
 */

/**
 * 调用云函数
 * @param {Object} options 请求选项
 * @param {String} options.name 云函数名称
 * @param {Object} options.data 传递给云函数的参数
 * @param {Boolean} options.showLoading 是否显示加载提示
 * @returns {Promise} 云函数调用结果Promise
 */
const callFunction = (options) => {
  // 默认显示加载提示
  if (options.showLoading !== false) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  }

  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: options.name, // 云函数名称
      data: options.data || {}, // 传递给云函数的参数
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        // 检查云函数返回结果
        if (res.result && res.result.success === false) {
          // 云函数执行成功，但业务逻辑失败
          console.error(`云函数 ${options.name} 业务失败:`, res.result.message, res.result.error);
          wx.showToast({
            title: res.result.message || '操作失败',
            icon: 'none',
            duration: 2000
          });
          reject(res.result); // 返回业务错误信息
        } else if (res.result) {
          // 云函数执行成功，业务逻辑成功
          resolve(res.result); // 返回云函数结果
        } else {
          // 云函数调用成功，但没有返回 result 或 result 格式不符合预期
          console.error(`云函数 ${options.name} 返回格式错误:`, res);
          wx.showToast({
            title: '返回数据格式错误',
            icon: 'none',
            duration: 2000
          });
          reject(res); // 返回原始响应
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        // 云函数调用失败（网络错误、函数不存在等）
        console.error(`调用云函数 ${options.name} 失败:`, err);
        wx.showToast({
          title: '服务请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
};

// 为了兼容旧的调用方式，保留 get 和 post，但内部改为调用 callFunction
// 注意：旧的 url 参数现在需要映射到云函数名称

/**
 * 调用云函数 (模拟GET)
 * @param {String} functionName 云函数名称
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果Promise
 */
const get = (functionName, data = {}, options = {}) => {
  return callFunction({
    name: functionName,
    data,
    ...options
  });
};

/**
 * 调用云函数 (模拟POST)
 * @param {String} functionName 云函数名称
 * @param {Object} data 请求数据
 * @param {Object} options 其他选项
 * @returns {Promise} 请求结果Promise
 */
const post = (functionName, data = {}, options = {}) => {
  return callFunction({
    name: functionName,
    data,
    ...options
  });
};

module.exports = {
  callFunction, // 暴露新的调用方法
  get, // 保留旧方法，内部已改为调用云函数
  post // 保留旧方法，内部已改为调用云函数
};