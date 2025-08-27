// pages/about/about.js
// 获取应用实例
const app = getApp()
import * as API from "../../utils/api";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 状态栏高度
    statusBarHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 设置缓存
    wxSet: [],
    // 默认样式
    scrollTable: true,
    tagStyle: {
      p: 'line-height: 30px;font-size:30rpx',
      ul: 'list-style: none;padding: 0 !important;',
      li: 'line-height: 70rpx;',
      h2: 'border-top: 1px solid rgb(0 0 141 / 12%);margin: 48px 0 16px;padding-top: 24px;letter-spacing: -.02em;line-height: 32px;',
      h3: 'border-top: 1px solid rgb(0 0 141 / 12%);margin: 48px 0 16px;padding-top: 24px;letter-spacing: -.02em;line-height: 32px;',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
       if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    }else{
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight
      })
    }
  },

  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight
    })
  },

  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: '/pages/about/about'
    }
  },

  // 监听滑动
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },

  // 请求基本数据
  getSetDate() {
    API.getFrSet().then((res) => {
      // 设置缓存
      this.setData({
        wxSet: res.data.data.attributes,
      })
    })
  },
})