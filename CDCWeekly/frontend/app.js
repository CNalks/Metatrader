/**
 * 小程序全局逻辑
 */

App({
  // 全局数据
  globalData: {
    // API基础URL
    apiBaseUrl: 'https://api.example.com/api/v1', // 实际部署时需要替换为真实API地址
    // 用户收藏数据
    favorites: []
  },

  /**
   * 小程序启动时执行
   */
  onLaunch: function() {
    // 从本地存储加载收藏数据
    this.loadFavorites();
  },

  /**
   * 从本地存储加载收藏数据
   */
  loadFavorites: function() {
    const favorites = wx.getStorageSync('favorites') || [];
    this.globalData.favorites = favorites;
  },

  /**
   * 保存收藏数据到本地存储
   */
  saveFavorites: function() {
    wx.setStorageSync('favorites', this.globalData.favorites);
  },

  /**
   * 添加收藏
   * @param {Object} article 文章对象
   */
  addFavorite: function(article) {
    // 检查是否已收藏
    const index = this.globalData.favorites.findIndex(item => item.id === article.id);
    if (index === -1) {
      // 添加收藏时间
      article.favoriteTime = new Date().getTime();
      this.globalData.favorites.unshift(article);
      this.saveFavorites();
      return true;
    }
    return false;
  },

  /**
   * 取消收藏
   * @param {String} articleId 文章ID
   */
  removeFavorite: function(articleId) {
    const index = this.globalData.favorites.findIndex(item => item.id === articleId);
    if (index !== -1) {
      this.globalData.favorites.splice(index, 1);
      this.saveFavorites();
      return true;
    }
    return false;
  },

  /**
   * 检查文章是否已收藏
   * @param {String} articleId 文章ID
   */
  isFavorite: function(articleId) {
    return this.globalData.favorites.some(item => item.id === articleId);
  },

  /**
   * 获取收藏列表
   */
  getFavorites: function() {
    return this.globalData.favorites;
  }
});