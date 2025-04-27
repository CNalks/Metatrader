/**
 * 小程序全局逻辑
 */

App({
  /**
   * 小程序初始化时执行
   */
  onLaunch: function () {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'YOUR_ENV_ID', 
        traceUser: true, // 是否要捕捉每个用户的访问记录。设置为true，用户可在管理端看到用户访问记录
      });
    }

    // 从本地存储加载收藏数据
    this.loadFavorites();
  },
  // 全局数据
  globalData: {
    // API基础URL
    apiBaseUrl: 'https://api.example.com/api/v1', // 实际部署时需要替换为真实API地址
    // 用户收藏数据
    favorites: []
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