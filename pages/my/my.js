// pages/my/my.js
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
    // 用户信息
    lmUserInfo: [],
    isUser: false,
    vip: false,
    // 基本配置
    wxSet: '',
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
    }
  },
  // 页面内分享
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: 'pages/my/my'
    }
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    //（解决异步）
    app.on('wxSet', this.changeToken.bind(this));
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight
    })
  },
  
  //（解决异步）
  changeToken() {
    // console.log('wxSet', app.globalData.wxSet);
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight
    })
  },
  onShow() {
    // 判断是否登录
    this.isUser();
  },

  // 判断是否登录
  isUser() {
    const lmUser = wx.getStorageSync('lmUser')
    if (lmUser == "") {
      this.setData({
        isUser: false
      })
    } else {
      this.setData({
        isUser: true
      })
      // 刷新获取用户基本信息
      this.getUserInfoMe();
    }
  },
  // 获取用户基本信息
  getUserInfoMe() {
    // 配置header
    const jwt = wx.getStorageSync('token')
    const token = {
      'content-type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    }

    API.userInfoMe(token).then((res) => {
      if (res.statusCode == 200) {
        wx.setStorageSync("lmUser", res.data);
        this.vipTime(res.data);
        this.setData({
          lmUserInfo: res.data
        })
      } else {
        wx.showToast({
          title: '登录过期',
          icon: 'error',
          duration: 2000
        })
        wx.removeStorageSync('lmUser')
        wx.removeStorageSync('token')
        this.setData({
          vip: false
        })
      }
    })
  },

  // 用户登录
  isLogin() {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  // 清除缓存
  clearTap() {
    wx.removeStorageSync('lmUser')
    wx.removeStorageSync('token')
    wx.showToast({
      title: 'OKOK',
      duration: 2000
    })
    wx.setStorageSync('VIP', false)
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },

  // vip判断
  vipTime(e) {
    // vip时间转换
    var date = new Date(e.vipTime);
    var vipTime = date.getTime();
    // console.log(vipTime,'VIP时间')

    // 获取当前时间
    const timestamp = Date.parse(new Date());
    // console.log(timestamp,'当前时间')

    // 对比VIP是否到期
    if (vipTime > timestamp) {
      this.setData({
        vip: true
      })
      wx.setStorageSync('VIP', true)
    } else {
      wx.setStorageSync('VIP', false)
    }
  },

  // 提示
  openVip() {
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '点击“客服”联系升级用户组级别',
      success(res) {}
    })
  },

  // 关于我们
  aboutTap() {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  // 刷新状态
  getLockUser() {
    const lmUser = wx.getStorageSync('lmUser')
    if (lmUser != "") {
      this.getUserInfoMe();
      wx.showToast({
        title: '刷新中...',
        icon: "loading"
      })
    } else {
      wx.showToast({
        title: '请登录',
        icon: "error"
      })
    }
  },

  // 金刚区点击
  attendviImgTap() {
    wx.navigateTo({
      url: '../follow/follow',
    })
  },
})