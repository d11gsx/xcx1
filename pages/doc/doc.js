// pages/docs/docs.js
// 获取应用实例
const app = getApp()
import * as API from "../../utils/api";
let rewardedVideoAd = null;
Page({
  data: {
    // 状态栏高度
    statusBarHeight: '',
    // 屏幕高度
    windowHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 文章ID
    id: '',
    // 设置缓存
    wxSet: '',
    // 详情内容
    doc: [],
    // 默认样式
    scrollTable: true,
    tagStyle: {
      p: 'line-height: 32px;',
      ul: 'list-style: none;padding: 0 !important;',
      li: 'line-height: 74rpx;',
      h2: 'border-top: 1px solid rgb(0 0 141 / 12%);margin: 48px 0 16px;padding-top: 24px;letter-spacing: -.02em;line-height: 32px;',
      h3: 'border-top: 1px solid rgb(0 0 141 / 12%);margin: 48px 0 16px;padding-top: 24px;letter-spacing: -.02em;line-height: 32px;',
    },
    // 下载地址内容
    isShow: false,
    // vip
    vip: false,
    // 文档子列表
    active: -1,

    // 选项卡-滚动位置
    swID: '',
    // 选项卡默认
    active: 0,
    heightArray: [],
    maxIndex: -1,
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
      // 请求详情
      this.docInfo();
    }
  },

  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight,
      windowHeight: app.globalData.windowHeight,
    })
    // 请求详情
    this.docInfo();
  },
  onShow() {
    // 获取缓存信息
    this.getSystemInfo();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: this.data.doc.attributes.title,
      imageUrl: this.data.doc.attributes.cover,
      path: 'pages/doc/doc?id=' + this.data.id
    }
  },

  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.doc.attributes.title,
      imageUrl: this.data.doc.attributes.cover,
      path: 'pages/doc/doc?id=' + this.data.id
    }
  },

  // 监听滑动
  onPageScroll: function (e) {
    let maxIndex = -1;
    for (var i = 0; i < this.data.heightArray.length; i++) {
      if (e.scrollTop > (this.data.heightArray[i])) {
        maxIndex = i;
      }
    }

    this.setData({
      scrollTopHightX: e.scrollTop,
      maxIndex: maxIndex,
    })

    if (maxIndex != -1) {
      this.sollTap();
    }

  },

  // 获取缓存信息
  getSystemInfo() {
    // 设置缓存
    var vip = wx.getStorageSync('VIP');
    this.setData({
      vip: vip,
    })
  },

  // 请求详情
  docInfo() {
    API.getDocsInfo([this.data.id]).then((res) => {
      // 获取当前时间戳
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
      const day = now.getDate();
      const postDaySum = year + month + day;

      this.setData({
        doc: res.data.data,
        postDaySum: postDaySum
      })
      // console.log(postDaySum, '获取当前时间戳');
      // console.log('请求详情', res.data.data);
      // console.log(this.data.doc.attributes.list.length);

      // 获取每个元素距离顶部的位置
      if (this.data.doc.attributes.list.length > 1) {
        var heightArray = [];
        let query = wx.createSelectorQuery() //创建节点查询器
        query.selectAll('.doc-content').boundingClientRect((rect) => {
          console.log(rect)
          rect.forEach(function (value) {
            heightArray.push(value.top)
          })
          this.setData({
            heightArray
          })
        }).exec()
      }

      // 获取激励视频缓存
      const postAdKey = wx.getStorageSync('doc_adkey');
      if (this.data.wxSet.adCache === true) {
        console.log('开启广告缓存');
        if (postAdKey) {
          const foundItem = postAdKey.find(item => item.id === this.data.id);
          if (foundItem) {
            // 这里简化了判断条件，直接判断是否不相等，相等就隐藏，不相等就播放广告
            if (foundItem.time !== this.data.postDaySum) {
              this.starpAd();
            } else {
              this.setData({
                isShow: false,
              });
            }
          } else {
            this.starpAd();
          }
        } else {
          this.starpAd();
        }
      } else {
        console.log('no启广告缓存');
        this.starpAd();
      }
    })
  },
  // 滚动内容区域，自动切换相应的Tab标签
  sollTap() {
    if (this.data.maxIndex != this.data.starIndex) {
      this.setData({
        active: this.data.maxIndex,
        swID: 'sw' + this.data.maxIndex,
        starIndex: this.data.maxIndex,
      })
    }

  },
  // 初始化激励视频广告组件
  starpAd() {
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd != null) {
      this.CreateAd();
    } else {
      this.setData({
        isShow: false
      })
    }
  },

  //初始化激励视频广告组件
  CreateAd: function () {
    var that = this;
    if (that.data.doc.attributes.adRead == true) {
      this.setData({
        isShow: true
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
            isShow: false,
          })
        })
        that.videoAd.onClose((res) => {
          if (res && res.isEnded) {
            wx.showToast({
              icon: 'none',
              title: "感谢您支持"
            })
            that.setData({
              isShow: false,
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
        isShow: false,
      })
    }
  },

  // 激励视频
  getVideoAd: function () {
    let that = this;
    if(app.globalData.launchScene == 1154){
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon:"none"
      })
      return;
    }
    // 用户触发广告后，判断设备信息，非手机端不显示广告，若是手机端显示激励视频广告
    wx.getSystemInfo({
      success: (res) => {
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

  // 执行滚动
  tabTap(e) {
    // console.log(e.currentTarget.dataset.indx)
    this.setData({
      swID: e.currentTarget.dataset.swipe, //选项卡-滚动位置
      active: e.currentTarget.dataset.indx, //选项卡默认
    })
    wx.pageScrollTo({ //滚动到指定位置
      selector: '.' + e.currentTarget.dataset.swipe,
      duration: 0,
      offsetTop: -90
    })
  },
  // 返回&&击遮罩层时 定时页面栈函数
  onClickoverlay() {
    this.setData({
      isShow: false,
    })
    setTimeout(() => {
      this.tarBlack();
    }, 200)

  },

  // 返回按钮 建立页面栈 如果是1则是分享打开需要返回主页，大于1则返回上一级
  tarBlack: function () {
    console.log('广告给关闭')
    var selPage = getCurrentPages();
    console.log(selPage.length)
    if (selPage.length == 1) {
      wx.navigateTo({
        url: '../index/index',
      })
    } else {
      wx.navigateBack({
        delta: 1
      });
    }
  },

  // 文章子列表点击
  docsList(e) {
    if (this.data.active != e.currentTarget.dataset.index) {
      this.setData({
        active: e.currentTarget.dataset.index
      })
    } else {
      this.setData({
        active: -1
      })
    }
  },

  // 附件点击
  infoTap(e) {
    wx.navigateTo({
      url: '../info/info?id=' + e.currentTarget.dataset.id,
    })
  },

  // 访问web点击
  webTap() {
    wx.navigateTo({
      url: '../web/web?url=' + this.data.doc.attributes.web,
    })
  },

  // 设置广告缓存
  setRead() {
    var postAdKey = wx.getStorageSync('doc_adkey');
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
    wx.setStorageSync('doc_adkey', postAdKey);
    // console.log(postAdKey)
  },
})