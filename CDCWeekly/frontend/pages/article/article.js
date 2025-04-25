/**
 * 文章详情页逻辑
 */

// 引入请求工具
const { get } = require('../../utils/request');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    article: null,      // 文章数据
    loading: true,      // 加载状态
    error: false,       // 错误状态
    errorMsg: '',       // 错误信息
    isFavorite: false   // 收藏状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取文章ID
    const { id } = options;
    if (!id) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '缺少文章ID参数'
      });
      return;
    }
    
    // 加载文章数据
    this.articleId = id;
    this.loadArticle();
  },

  /**
   * 加载文章数据
   */
  loadArticle: function () {
    this.setData({
      loading: true,
      error: false,
      errorMsg: ''
    });

    // 请求文章详情
    get(`/articles/${this.articleId}`)
      .then(res => {
        if (res.success && res.data) {
          // 更新文章数据
          this.setData({
            article: res.data,
            loading: false
          });
          
          // 检查收藏状态
          this.checkFavoriteStatus();
        } else {
          this.setData({
            loading: false,
            error: true,
            errorMsg: res.message || '获取文章失败'
          });
        }
      })
      .catch(err => {
        this.setData({
          loading: false,
          error: true,
          errorMsg: '网络请求失败，请稍后重试'
        });
        console.error('加载文章失败', err);
      });
  },

  /**
   * 检查收藏状态
   */
  checkFavoriteStatus: function () {
    const app = getApp();
    const isFavorite = app.isFavorite(this.articleId);
    this.setData({ isFavorite });
  },

  /**
   * 切换收藏状态
   */
  toggleFavorite: function () {
    const app = getApp(); // 获取全局应用实例
    const { article, isFavorite } = this.data;
    if (!article) return;

    if (isFavorite) {
      // 取消收藏
      const success = app.removeFavorite(article.id);
      if (success) {
        this.setData({ isFavorite: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    } else {
      // 添加收藏
      const success = app.addFavorite(article);
      if (success) {
        this.setData({ isFavorite: true });
        wx.showToast({ title: '已收藏', icon: 'success' });
      } else {
        // 可能因为重复添加或其他原因失败
        wx.showToast({ title: '收藏失败或已收藏', icon: 'none' });
        // 确保状态同步
        if (app.isFavorite(article.id)) {
          this.setData({ isFavorite: true });
        }
      }
    }
  },

  /**
   * 复制原文链接
   */
  copyLink: function () {
    const { article } = this.data;
    wx.setClipboardData({
      data: article.originalUrl,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { article } = this.data;
    // 确保 article 数据存在
    if (!article) {
      return {
        title: '疾控周报速递',
        path: '/pages/index/index', // 如果文章数据未加载，分享首页
        imageUrl: '/images/share-default.jpg' // 默认分享图片
      };
    }
    return {
      title: article.title, // 使用文章标题作为分享标题
      path: `/pages/article/article?id=${article.id}`, // 分享路径指向当前文章
      imageUrl: article.imageUrl || '/images/share-default.jpg' // 优先使用文章图片，否则用默认图
    };
  }
});