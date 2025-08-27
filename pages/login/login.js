// pages/login/login.js
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
    // 是否注册
    isRegister: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
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

  // 注册登录册按钮
  registerTap() {
    this.setData({
      isRegister: !this.data.isRegister
    })
  },

  // 用户登录
  submitLocal(e) {
    // console.log(e.detail.value)
    API.userLocal(e.detail.value).then((res) => {
      // console.log(res)
      if (res.statusCode == 200) {
        wx.showToast({
          title: '登录跳转中',
          icon: 'success',
          duration: 2000
        })

        // 跳转个人中心
        wx.setStorageSync("lmUser", res.data.user);
        wx.setStorageSync("token", res.data.jwt);
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1200);

      } else {
        // 密码错误
        wx.showToast({
          title: res.data.error.message,
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  // 用户注册
  submitRegister(e) {
    // console.log(e.detail.value)
    API.userRegister(e.detail.value).then((res) => {
      // console.log(res)
      if (res.statusCode == 200) {
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          isRegister: false
        })
      } else {
        wx.showToast({
          title: res.data.error.message,
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
})