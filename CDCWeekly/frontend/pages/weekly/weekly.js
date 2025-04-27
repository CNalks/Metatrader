/**
 * 周报详情页逻辑
 */

// 引入请求工具
// const { get } = require('../../utils/request'); // 使用云函数替代

Page({
  /**
   * 页面的初始数据
   */
  data: {
    weekly: null,       // 周报数据
    articles: [],       // 文章列表
    loading: true,      // 加载状态
    error: false,       // 错误状态
    errorMsg: ''        // 错误信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取周报ID
    const { id } = options;
    if (!id) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '缺少周报ID参数'
      });
      return;
    }
    
    // 加载周报数据
    this.weeklyId = id;
    this.loadWeeklyDetail();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadWeeklyDetail(true);
  },

  /**
   * 加载周报详情
   * @param {Boolean} refresh 是否刷新
   */
  loadWeeklyDetail: function (refresh = false) {
    this.setData({
      loading: !refresh,
      error: false,
      errorMsg: ''
    });

    // 请求周报详情 (使用云函数)
    wx.cloud.callFunction({
      name: 'getWeeklyDetail',
      data: { id: this.weeklyId }
    })
      .then(res => {
        if (res.result && res.result.success) {
          const { weekly, articles } = res.result.data;
        
        // 格式化日期
        const formattedWeekly = {
          ...weekly,
          publishDate: this.formatDate(weekly.publishDate)
        };
        
        this.setData({
          weekly: formattedWeekly,
          articles: articles,
          loading: false
        });

          // 设置页面标题
          wx.setNavigationBarTitle({
            title: `第 ${formattedWeekly.issueNumber} 期`
          });

          // 停止下拉刷新动画
          if (refresh) {
            wx.stopPullDownRefresh();
          }
        } else {
          throw new Error(res.result.message || '加载失败');
        }
      })
      .catch(err => {
        console.error('加载周报详情失败:', err);
        this.setData({
          loading: false,
          error: true,
          errorMsg: err.message || err.errMsg || '加载失败，请重试'
        });
        
        // 停止下拉刷新动画
        if (refresh) {
          wx.stopPullDownRefresh();
        }
      });
  },

  /**
   * 查看文章详情
   * @param {Object} e 事件对象
   */
  viewArticle: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/article/article?id=${id}`
    });
  },

  /**
   * 返回首页
   */
  goBack: function () {
    wx.navigateBack({
      delta: 1,
      fail: function() {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },

  /**
   * 格式化日期
   * @param {String} dateString 日期字符串
   * @returns {String} 格式化后的日期
   */
  formatDate: function (dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
});