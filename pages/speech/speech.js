// pages/speech/speech.js
const app = getApp()
import * as API from "../../utils/api";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 状态栏高度
    statusBarHeight: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 设置缓存
    wxSet: '',
    vip: false, // vip
    // 文案
    speech: [],
    idx: 0,
    id: 1,
    isDownload: false,
    free: 4, //免费次数
    apiSwitch: false,
    API: '',
    adRead: false,
    shareApi: false,

    // 当前日期
    formattedDate: '',
    dayOfWeek: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.idx != undefined) {
      this.setData({
        idx: Number(options.idx)
      })
    }

    if (options.cn != undefined) {
      var speech = {
        cn: options.cn,
        en: options.en
      }
      this.setData({
        speech: speech,
        shareApi: true,
      })
    }

    // 获取当前日期
    this.getDayTime();
    if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    } else {
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight,
      })
      // speech数据
      this.getSpeech();
    }
  },
  onShow() {
    // 获取缓存信息
    this.getSystemInfo();
  },


  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight,
    })
    // speech数据
    this.getSpeech();
  },

  //分享盆友圈
  onShareTimeline(res) {
    if (this.data.apiSwitch == false) {
      return {
        title: this.data.wxSet.shareTitle,
        imageUrl: this.data.wxSet.shareImg,
        path: '/pages/speech/speech?idx=' + this.data.idx
      }
    }

  },

  // 页面内分享
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }

    if (this.data.apiSwitch == false) {
      return {
        title: this.data.wxSet.shareTitle,
        imageUrl: this.data.wxSet.shareImg,
        path: '/pages/speech/speech?idx=' + this.data.idx
      }
    } else {
      return {
        title: this.data.wxSet.shareTitle,
        imageUrl: this.data.wxSet.shareImg,
        path: '/pages/speech/speech?cn=' + this.data.speech.cn + '&en=' + this.data.speech.en
      }
    }
  },

  // 当前日期
  getDayTime() {
    var date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 格式化日期部分
    const formattedDate = `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;

    // 获取星期几的数组
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const dayOfWeek = weekdays[date.getDay()];
    this.setData({
      formattedDate,
      dayOfWeek
    })
  },

  // 获取缓存信息
  getSystemInfo() {
    // 设置缓存
    var vip = wx.getStorageSync('VIP');
    this.setData({
      vip: vip,
    })
  },
  // speech数据
  getSpeech() {
    API.getSpeech().then((res) => {
      // 获取当前时间戳
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
      const day = now.getDate();
      const postDaySum = year + month + day;

      // console.log('speech数据', res.data.data)
      this.setData({
        postDaySum: postDaySum,
        id: res.data.data.id,
        apiSwitch: res.data.data.attributes.apiSwitch,
        API: res.data.data.attributes.API,
        adRead: res.data.data.attributes.adRead
      })
      if (res.data.data.attributes.apiSwitch == true) {
        // 一言API
        this.getApiSpe();
      } else {
        // 对id进行排序
        let speech = res.data.data.attributes.content.sort(function (a, b) {
          return b.id - a.id;
        });
        this.setData({
          speech: speech,
        })
      }

      // 获取激励视频缓存
      const postAdKey = wx.getStorageSync('speech_adkey');
      const isAdCacheOn = this.data.wxSet.adCache === true;
      if (isAdCacheOn) {
        if (postAdKey) {
          const foundItem = postAdKey.find(item => item.id === this.data.id);
          if (foundItem) {
            // 缓存时间不等于时执行starAd方法，这里简化了判断条件的写法
            if (foundItem.time !== postDaySum) {
              this.starpAd();
            } else {
              this.setData({
                isDownload: true,
                free: 20
              });
            }
          } else {
            this.starpAd();
          }
        } else {
          this.starpAd();
        }
      } else {
        this.starpAd();
      }
    })
  },
  // 一言API
  getApiSpe() {
    if (this.data.shareApi == false) {
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: this.data.API,
        success: (res) => {
          wx.hideLoading()
          if (res.statusCode == 200) {
            this.setData({
              speech: res.data
            })
          } else {
            wx.showToast({
              title: 'API错误',
            })
          }
        }
      })
    }
  },

  // 初始化激励视频广告组件
  starpAd() {
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd != null) {
      this.CreateAd();
    } else {
      this.setData({
        isDownload: true,
        free: 99,
      })
    }
  },

  //初始化激励视频广告组件
  CreateAd: function () {
    var that = this;
    if (that.data.adRead == true) {
      this.setData({
        isDownload: false,
      })
      if (wx.createRewardedVideoAd) {
        that.videoAd = wx.createRewardedVideoAd({
          adUnitId: that.data.wxSet.jiliAd
        })
        that.videoAd.onLoad(() => {})
        that.videoAd.onError((err) => {
          wx.showToast({
            icon: 'none',
            title: "错误码：" + err.errCode
          })
          that.setData({
            isDownload: true,
            free: 99
          })
        })
        that.videoAd.onClose((res) => {
          if (res && res.isEnded) {
            wx.showToast({
              icon: 'none',
              title: "感谢您支持"
            })
            that.setData({
              isDownload: true,
              free: 99
            })
            // 设置广告缓存
            if (this.data.wxSet.adCache == true) {
              this.setRead();
            }
          } else {
            wx.showToast({
              icon: 'none',
              title: "中途关闭广告"
            })

          }
        })
      }
    } else {
      this.setData({
        isDownload: true,
        free: 99
      })
    }
  },

  // 激励视频
  getVideoAd: function () {
    let that = this;
    // 用户触发广告后，判断设备信息，非手机端不显示广告，若是手机端显示激励视频广告
    wx.getSystemInfo({
      success: (res) => {
        // console.log(res.platform)
        if (res.model.includes == 'ipad') {
          wx.showToast({
            icon: 'error',
            title: "请使用移动端设备访问"
          })
        } else {
          if (that.videoAd) {
            that.videoAd.show().catch(() => {
              // 失败重试
              that.videoAd.load()
                .then(() => that.videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败', err)
                })
            })
          }
        }
      }
    })
  },

  // 下一条
  daInx() {
    if (app.globalData.launchScene == 1154) {
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon: "none"
      })
      return;
    }

    this.setData({
      shareApi: false,
    })
    if (this.data.free <= 0) { //判断是否免费
      this.getVideoAd();
    }
    if (this.data.apiSwitch == true) { //判断是否为API请求
      this.getApiSpe();
    }
    if (this.data.free > 0) {
      this.setData({
        free: this.data.free - 1,
        idx: this.data.idx + 1,
      })
      if (this.data.speech[this.data.idx] == undefined && this.data.apiSwitch == false) {
        wx.showToast({
          title: '没有文案了',
          icon: 'error'
        })
      }
    }
  },

  // 设置广告缓存
  setRead() {
    var postAdKey = wx.getStorageSync('speech_adkey');
    if (postAdKey == '') {
      var postAdKey = [];
    }

    // 检测事否存在ID
    var isItem = postAdKey.find(item => item.id === this.data.id);
    // 如果有更新ID,若没有新增ID
    if (isItem) {
      const updateData = (id, newData) => {
        postAdKey = postAdKey.map(item => {
          if (item.id === id) {
            return {
              ...item,
              ...newData
            };
          }
          return item;
        });
      };
      updateData(this.data.id, {
        time: this.data.postDaySum,
      });
    } else {
      var jlis = postAdKey.unshift({
        id: this.data.id,
        time: this.data.postDaySum,
      })
    }
    wx.setStorageSync('speech_adkey', postAdKey);
    // console.log(postAdKey)
  },

  // 复制一言
  copySpeech() {
    if (this.data.apiSwitch == true) {
      wx.setClipboardData({
        data: this.data.speech.hitokoto + '\n' + this.data.speech.from,
      })
    } else {
      wx.setClipboardData({
        data: this.data.speech[this.data.idx].content + '\n' + '----' + this.data.speech[this.data.idx].ver + '' + this.data.speech[this.data.idx].url,
      })
    }
  }
})