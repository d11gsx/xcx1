// /* pages/redenvelopes/redenvelopes.js */
// 获取应用实例
const app = getApp()
import * as API from "../../utils/api";
let rewardedVideoAd = null;
Page({
  data: {
    // 状态栏高度
    statusBarHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 文章ID
    id: '',
    wall: [],
    image: [],
    // 设置缓存
    wxSet: '',
    // 下载地址内容
    isShow: false,
    // vip
    vip: false,
    // 滚动区域
    swipreIndex: 0,
    indicatorDots: false,

    // 视频壁纸
    show_fullscreen: false,
    show_play: false,
    controls: false,
    heightVideo: [],
    videoLogin: true,
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
        statusBarHeight: app.globalData.statusBarHeight
      })
      // 请求详情
      this.wallInfo();
    }

  },

  //（解决异步）
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight
    })
    // 请求详情
    this.wallInfo();
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
      title: this.data.wall.attributes.title,
      imageUrl: this.data.wall.attributes.cover,
      path: 'pages/redenvelopes/redenvelopes?id=' + this.data.id
    }
  },

  //分享盆友圈
  onShareTimeline(res) {
    return {
      title: this.data.wall.attributes.title,
      imageUrl: this.data.wall.attributes.cover,
      path: 'pages/redenvelopes/redenvelopes?id=' + this.data.id
    }
  },

  // 监听滑动
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },

  // 获取滚动区域index
  bindChange(e) {
    this.setData({
      swipreIndex: e.detail.current
    })
  },

  // 获取缓存信息
  getSystemInfo() {
    // 设置缓存
    var value = wx.getStorageSync('getSystemInfo');
    var vip = wx.getStorageSync('VIP');
    this.setData({
      statusBarHeight: value.statusBarHeight,
      vip: vip,
    })
  },

  // 请求详情
  wallInfo() {
    API.getRedEnvelopesInfo([this.data.id]).then((res) => {
      // 获取当前时间戳
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
      const day = now.getDate();
      const postDaySum = year + month + day;

      this.setData({
        wall: res.data.data,
        postDaySum: postDaySum
      })
      // console.log(postDaySum, '获取当前时间戳');
      // console.log('请求详情', res.data.data)

      // 获取激励视频缓存
      const postAdKey = wx.getStorageSync('wall_adkey');

      if (this.data.wxSet.adCache == true) {
        console.log('开启广告缓存')
        // 查找缓存数据
        if (postAdKey) {
          const foundItem = postAdKey.find(item => item.id === this.data.id)
          // console.log(foundItem,'查找缓存数据')
          if (foundItem) {
            // 缓存时间大于或不等于
            if (foundItem.time != postDaySum) {
              this.starpAd();
            } else {
              this.setData({
                isShow: false,
              })
            }
          } else {
            // 没有缓存 初始化广告
            this.starpAd();
            // console.log('缓存没有这个ID')
          }
        } else {
          // console.log('没有缓存 初始化广告')
          // 没有缓存 初始化广告
          this.starpAd();
        }
      } else {
        console.log('no启广告缓存')
        this.starpAd();
      }
    })
  },

  // 初始化激励视频广告组件
  starpAd() {
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd !=
      null) {
      this.CreateAd();
    } else {
      this.setData({
        isShow: false,
      })
    }
  },

  // 判断用户是否授权"保存到相册"
  sevePhto() {
    if (this.data.isShow == true) {
      this.adDown();
    } else {
      this.downWall();
    }
  },

  //初始化激励视频广告组件
  CreateAd: function () {
    var that = this;
    if (that.data.wall.attributes.adRead == true) {
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
          // 下载壁纸
          that.downWall();
        })
        that.videoAd.onClose((res) => {
          if (res && res.isEnded) {
            wx.showToast({
              icon: 'none',
              title: "感谢您支持"
            })
            this.setData({
              isShow: false,
            })
            // 下载壁纸
            that.downWall();
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

  // 获取视频信息
  videoInfo(e) {
    // 计算视频比例
    var proportion = e.detail.height / (e.detail.width);
    var heights = (proportion * app.globalData.windowHeight) * 0.8 + 'rpx';
    this.setData({
      heightVideo: this.data.heightVideo.concat(heights),
      videoLogin: false
    })
    console.log(this.data.heightVideo)
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
  // 点击解锁
  adDown() {
    wx.showModal({
      title: '提示',
      content: '激励视频广告获取红包封面',
      success: (res) => {
        if (res.confirm) {
          this.getVideoAd();
        }
      }
    })
  },
  // 下载媒体文件
  downWall() {
    wx.navigateTo({
      url: '../web/web?url=' + encodeURIComponent(JSON.stringify(this.data.wall.attributes.url)) + '&type=json',
    })
  },

  // 保存图片相册
  saveImage(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '图片保存成功',
          icon: 'success',
        });
      },
      fail: (err) => {
        console.error('图片保存失败:', err);
        wx.showToast({
          title: '图片保存失败',
          icon: 'none',
        });
      },
    });
  },
  // 视频图片相册
  saveVideo(tempFilePath) {
    wx.saveVideoToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '图片保存成功',
          icon: 'success',
        });
      },
      fail: (err) => {
        console.error('图片保存失败:', err);
        wx.showToast({
          title: '图片保存失败',
          icon: 'none',
        });
      },
    });
  },

  // 设置广告缓存
  setRead() {
    var postAdKey = wx.getStorageSync('wall_adkey');
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
    wx.setStorageSync('wall_adkey', postAdKey);
    // console.log(postAdKey)
  },
});