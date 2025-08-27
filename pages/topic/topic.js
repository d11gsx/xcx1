// pages/topic/topic.js
const app = getApp()
import * as API from "../../utils/api";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 状态栏高度
    statusBarHeight: '',
    windowHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 设置缓存
    wxSet: '',
    // 详情
    info: [],
    // 默认样式
    tagStyle: {
      p: 'line-height: 24px;'
    },
    // 选项卡
    active: 0,

    // vip
    vip: false,
    // 元素高度
    materiaHeight: 0,

    // material材料
    materialDots: true,
    // 全屏材料
    materiaCover: false,
    materiaInx: 0,

    // 激励阅读
    isTopic: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id: options.id
    })
    if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    } else {
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight,
        windowHeight: app.globalData.windowHeight,
      })
      // 请求详情接口
      this.topicInfo();
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
      windowHeight: app.globalData.windowHeight,
    })
    // 请求详情接口
    this.topicInfo();
  },

  // 获取缓存信息
  getSystemInfo() {
    // 设置缓存
    var vip = wx.getStorageSync('VIP');
    this.setData({
      vip: vip,
    })
  },

  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.info.attributes.title,
      imageUrl: this.data.info.attributes.cover,
      path: 'pages/topic/topic?id=' + this.data.id,
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
      title: this.data.info.attributes.title,
      imageUrl: this.data.info.attributes.cover,
      path: 'pages/topic/topic?id=' + this.data.id,
    }
  },

  // 请求详情接口
  topicInfo() {
    API.getSubjectsInfo([this.data.id]).then((res) => {
      // 获取当前时间戳
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
      const day = now.getDate();
      const postDaySum = year + month + day;

      console.log('请求详情', res.data.data)
      this.setData({
        info: res.data.data,
        postDaySum: postDaySum
      })

      // 获取元素高度
      const query = wx.createSelectorQuery()
      query.selectAll('.materia-i-coenten').boundingClientRect();
      query.exec((res) => {
        this.setData({
          materiaHeight: res[0],
        })
      })

      // 获取激励视频缓存
      const postAdKey = wx.getStorageSync('topic_adkey');
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
                isTopic: true
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

  // 初始化激励视频广告组件
  starpAd() {
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd != null) {
      this.CreateAd();
    } else {
      this.setData({
        isTopic: true
      })
    }
  },

  //初始化激励视频广告组件
  CreateAd: function () {
    var that = this;
    if (that.data.info.attributes.adRead == true) {
      this.setData({
        // isShow: true
        isTopic: false,
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
            // isShow: false,
            isTopic: true,
          })
        })
        that.videoAd.onClose((res) => {
          if (res && res.isEnded) {
            wx.showToast({
              icon: 'none',
              title: "感谢您支持"
            })
            that.setData({
              // isShow: false,
              isTopic: true,
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
        // isShow: false,
        isTopic: true
      })
    }
  },

  // 激励视频
  getVideoAd: function () {
    let that = this;
    if (app.globalData.launchScene == 1154) {
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon: "none"
      })
      return;
    }
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

  // 选项卡点击
  tabTap(e) {
    this.setData({
      swID: e.currentTarget.dataset.swipe, //选项卡-滚动位置
      active: e.currentTarget.dataset.indx, //选项卡默认
      aid: e.currentTarget.dataset.aid, //选项卡-选中时的分类ID
      type: e.currentTarget.dataset.type, //选项卡类型
      showPrivacy: false,
    })
    wx.pageScrollTo({
      selector: '.fengrui-tab'
    });
  },

  // 材料内容展开点击
  materiaTap(e) {
    this.setData({
      materiaInx: e.currentTarget.dataset.idx,
      materiaCover: true,
      icon: true,
      logo: this.data.wxSet.logo,
    })
  },

  // 点击关闭材料全屏
  customOff() {
    this.setData({
      materiaCover: false,
      icon: false,
      logo: '',
    })
  },

  // 设置广告缓存
  setRead() {
    var postAdKey = wx.getStorageSync('topic_adkey');
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
    wx.setStorageSync('topic_adkey', postAdKey);
    // console.log(postAdKey)
  },
})