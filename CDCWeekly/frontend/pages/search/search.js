/**
 * 搜索页面逻辑
 */

// 引入请求工具
// const { get } = require('../../utils/request'); // 使用云函数替代

Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword: '',        // 搜索关键词
    articles: [],       // 搜索结果
    loading: false,     // 加载状态
    searched: false,    // 是否已搜索
    error: false,       // 错误状态
    errorMsg: '',       // 错误信息
    hasMore: false,     // 是否有更多结果
    page: 1,            // 当前页码
    limit: 20,          // 每页数量
    loadingMore: false, // 加载更多状态
    searchHistory: []   // 搜索历史
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 初始化搜索历史
    this.loadSearchHistory();
  },

  /**
   * 输入关键词
   * @param {Object} e 事件对象
   */
  inputKeyword: function (e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  /**
   * 清空关键词
   */
  clearKeyword: function () {
    this.setData({
      keyword: ''
    });
  },

  /**
   * 执行搜索
   */
  search: function () {
    const { keyword } = this.data;
    if (!keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    // 重置搜索状态
    this.setData({
      articles: [],
      loading: true,
      searched: true,
      error: false,
      errorMsg: '',
      page: 1,
      hasMore: false
    });

    // 保存搜索历史
    this.saveSearchHistory(keyword);

    // 执行搜索请求
    this.fetchSearchResults();
  },

  /**
   * 获取搜索结果
   */
  fetchSearchResults: function () {
    const { keyword, page, limit } = this.data;

    wx.cloud.callFunction({
      name: 'searchArticles',
      data: { keyword, page, limit }
    })
      .then(res => {
        if (res.result && res.result.success) {
          const { list, pagination } = res.result.data;
          const total = pagination.total;

          this.setData({
            articles: page === 1 ? list : [...this.data.articles, ...list],
            loading: false,
            loadingMore: false,
            hasMore: (this.data.articles.length + list.length) < total
          });
        } else {
          throw new Error(res.result.message || '搜索失败');
        }
      })
      .catch(err => {
        this.setData({
          loading: false,
          loadingMore: false,
          error: true,
          errorMsg: err.message || err.errMsg || '搜索失败，请重试'
        });
        console.error('搜索失败:', err);
      });
  },

  /**
   * 加载更多结果
   */
  loadMore: function () {
    if (!this.data.hasMore || this.data.loadingMore) return;
    
    this.setData({
      loadingMore: true,
      page: this.data.page + 1
    });
    
    this.fetchSearchResults();
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  /**
   * 加载搜索历史
   */
  loadSearchHistory: function () {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({
      searchHistory: history
    });
  },

  /**
   * 保存搜索历史
   * @param {String} keyword 关键词
   */
  saveSearchHistory: function (keyword) {
    let history = this.data.searchHistory || [];
    keyword = keyword.trim();
    if (!keyword) return;

    // 如果已存在，先移除
    const index = history.indexOf(keyword);
    if (index > -1) {
      history.splice(index, 1);
    }

    // 添加到历史记录开头
    history.unshift(keyword);

    // 限制历史记录数量
    const limitedHistory = history.slice(0, 10);

    // 保存到本地存储
    wx.setStorageSync('searchHistory', limitedHistory);

    this.setData({
      searchHistory: limitedHistory
    });
  },

  /**
   * 使用历史记录搜索
   * @param {Object} e 事件对象
   */
  useHistory: function (e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({
      keyword
    }, () => {
      this.search(); // 设置关键词后自动执行搜索
    });
  },

  /**
   * 清空搜索历史
   */
  clearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({
            searchHistory: []
          });
          wx.showToast({
            title: '已清空',
            icon: 'none'
          });
        }
      }
    });
  }
});