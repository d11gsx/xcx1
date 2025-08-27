// pages/category/category.js
const app = getApp()
import * as API from "../../utils/api";
// 引入动态文案
import speech from "../../template/common-speech.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 引入骨架
    skeleton: true,
    // 状态栏高度
    statusBarHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 分类数据
    categories: [],
    // 设置缓存
    wxSet: '',
    // 页数
    page: 1,
    // loading加载图
    listsLoading: true,
    // 文案
    speech: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
       if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    } else {
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight,
      })
      // 请求分类接口
      this.getCategory();
    }
  },

  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight,
    })
    // 请求分类接口
    this.getCategory();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.setData({
      page: this.data.page + 1
    })
    this.getCategory();
  },

  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: '/pages/category/category'
    }
  },
  // 监听滑动
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },

  // 页面内分享
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: 'pages/category/category'
    }
  },

  // 请求分类接口
  getCategory() {
    API.getCategory([this.data.page], [this.data.wxSet.showCategory]).then((res) => {
      // console.log('请求分类', res.data.data)
      let sphInx = Math.ceil(Math.random() * speech[0].speech.length);// 设置一个随机数 取文案
      this.setData({
        categories: this.data.categories.concat(res.data.data),
        skeleton: false,
        speech:speech[0].speech[sphInx - 1]
      })
      if (this.data.page > res.data.meta.pagination.pageCount) {
        this.setData({
          listsLoading: false
        })
      }
    })
  },

  // 分类列表点击
  categoryTap(e) {
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../lists/lists?id=' + id + '&type=' + type,
    })
  },
})