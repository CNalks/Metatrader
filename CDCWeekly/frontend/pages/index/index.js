/**
 * 首页/周报列表页逻辑
 */

// 引入请求工具
// const { get } = require('../../utils/request'); // 使用云函数替代

Page({
  /**
   * 页面的初始数据
   */
  data: {
    weeklies: [],      // 周报列表数据
    loading: true,      // 加载状态
    refreshing: false,  // 下拉刷新状态
    loadingMore: false, // 加载更多状态
    hasMore: true,      // 是否有更多数据
    page: 1,            // 当前页码
    limit: 10,          // 每页数量
    error: false,       // 错误状态
    errorMsg: ''        // 错误信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadWeeklies();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadWeeklies(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  /**
   * 加载周报列表
   * @param {Boolean} refresh 是否刷新
   */
  loadWeeklies: function (refresh = false) {
    const { page, limit } = this.data;
    
    this.setData({
      loading: !refresh,
      error: false,
      errorMsg: ''
    });

    // 请求周报列表 (使用云函数)
    wx.cloud.callFunction({
      name: 'getWeeklyList',
      data: { page, limit }
    })
      .then(res => {
        if (res.result && res.result.success) {
          const { list, pagination } = res.result.data;
          const total = pagination.total;
          // 格式化日期
          const formattedData = list.map(item => ({
            ...item,
            publishDate: this.formatDate(item.publishDate)
          }));

          this.setData({
            weeklies: refresh ? formattedData : [...this.data.weeklies, ...formattedData],
            loading: false,
            refreshing: false,
            hasMore: this.data.page * this.data.limit < total
          });
        } else {
          throw new Error(res.result.message || '加载失败');
        }

        // 停止下拉刷新动画
        if (refresh) {
          wx.stopPullDownRefresh();
        }
      })
      .catch(err => {
        console.error('加载周报列表失败:', err);
        this.setData({
          loading: false,
          refreshing: false,
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
   * 加载更多
   */
  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    
    this.loadWeeklies();
  },

  /**
   * 查看周报详情
   * @param {Object} e 事件对象
   */
  viewWeekly: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/weekly/weekly?id=${id}`
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