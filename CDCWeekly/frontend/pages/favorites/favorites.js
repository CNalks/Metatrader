/**
 * 收藏页面逻辑
 */

const app = getApp();
// 引入日期格式化工具 (如果项目中有统一的工具库，应从中引入)
const { formatTime } = require('../../utils/util'); // 假设存在 util.js 并导出 formatTime

Page({
  /**
   * 页面的初始数据
   */
  data: {
    favoriteArticles: [], // 收藏的文章列表
    isEmpty: true         // 列表是否为空
  },

  /**
   * 生命周期函数--监听页面显示
   * 每次进入页面都重新加载收藏列表，以保证数据最新
   */
  onShow: function () {
    this.loadFavorites();
  },

  /**
   * 加载收藏列表
   */
  loadFavorites: function () {
    const favorites = app.getFavorites();
    // 格式化收藏时间
    const formattedFavorites = favorites.map(item => {
      return {
        ...item,
        // 使用 formatTime 函数格式化时间戳
        favoriteTimeFormatted: item.favoriteTime ? formatTime(new Date(item.favoriteTime)) : '未知时间'
      };
    });
    this.setData({
      favoriteArticles: formattedFavorites,
      isEmpty: formattedFavorites.length === 0
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
   * 移除收藏
   * @param {Object} e 事件对象
   */
  removeFavorite: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏这篇文章吗？',
      success: (res) => {
        if (res.confirm) {
          const success = app.removeFavorite(id);
          if (success) {
            wx.showToast({
              title: '已取消收藏',
              icon: 'none'
            });
            // 重新加载列表
            this.loadFavorites(); 
          } else {
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 跳转到首页
   */
  goToHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});