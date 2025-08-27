// pages/follow/follow.js
const app = getApp()
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
    // 基本配置
    wxSet: '',
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
      if (app.globalData.wxSet.attendviImg == null) {
        wx.showToast({
          title: '后台未配置内容',
          icon: 'error',
          duration: 2000
        })
      }
    }
  },
  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight
    })
    if (app.globalData.wxSet.attendviImg == null || app.globalData.wxSet.attendviImg == '') {
      wx.showToast({
        title: '后台未配置内容',
        icon: 'error',
        duration: 2000
      })
    }
  },
  // 监听滑动
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },
  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: '/pages/follow/follow'
    }
  },
})