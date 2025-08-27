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
    // 当前题目
    atciv: 0,
    //答案解析
    analysis: false,

    // vip
    vip: false,
    // 元素高度
    materiaHeight: 0,

    // 答案提示
    answerBL: '',
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
      this.brushInfo();
    }
  },

  onShow() {
    // 获取缓存信息
    this.getSystemInfo();
  },

  /**
   * （解决异步）
   */
  changeToken() {
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight,
      windowHeight: app.globalData.windowHeight,
    })
    // 请求详情接口
    this.brushInfo();
  },

  // 获取缓存信息
  getSystemInfo() {
    // 设置缓存
    var vip = wx.getStorageSync('VIP');
    this.setData({
      vip: vip,
    })
  },

  /**
   * 分享盆友圈
   * @param {*} res 
   */
  onShareTimeline(res) {
    return {
      title: this.data.info.attributes.title,
      imageUrl: this.data.info.attributes.cover,
      path: 'pages/brush/brush?id=' + this.data.id,
    }
  },

  /**
   * 监听滑动
   * @param {*} e 
   */
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },

  /**
   * 页面内分享
   * @param {*} res 
   */
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: this.data.info.attributes.title,
      imageUrl: this.data.info.attributes.cover,
      path: 'pages/brush/brush?id=' + this.data.id,
    }
  },

  /**
   * 请求详情接口
   */
  brushInfo() {
    API.getBrushInfo([this.data.id]).then((res) => {
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
      query.selectAll('.notice').boundingClientRect();
      query.exec((res) => {
        this.setData({
          materiaHeight: res[0],
        })
      })

      // 获取激励视频缓存
      const brushAdKey = wx.getStorageSync('brush_adkey');
      const isAdCacheOn = this.data.wxSet.adCache === true;
      if (isAdCacheOn) {
        if (brushAdKey) {
          const foundItem = brushAdKey.find(item => item.id === this.data.id);
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

  /**
   *  初始化激励视频广告组件
   */
  starpAd() {
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd != null) {
      this.CreateAd();
    } else {
      this.setData({
        isTopic: true
      })
    }
  },

  /**
   * 初始化激励视频广告组件
   */
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

  /**
   * 激励视频
   */
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


  /**
   * 设置广告缓存
   */
  setRead() {
    var brushAdKey = wx.getStorageSync('brush_adkey');
    if (brushAdKey == '') {
      var brushAdKey = [];
    }

    // 检测事否存在ID
    var isItem = brushAdKey.find(item => item.id === this.data.id);
    // 如果有更新ID,若没有新增ID
    if (isItem) {
      const updateData = (id, newData) => {
        brushAdKey = brushAdKey.map(item => {
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
      var jlis = brushAdKey.unshift({
        id: this.data.id,
        time: this.data.postDaySum,
      })
    }
    wx.setStorageSync('brush_adkey', brushAdKey);
    // console.log(brushAdKey)
  },


  /**
   * checkbox点击事件
   * @param {e} * checkbox发生change事件 携带value
   */
  checkboxChange(e) {
    // console.log('checkbox发生change事件，携带value值为：', e.detail.value)

    // 对比答案
    var ABZ = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var resultString = '';
    for (let q = 0; q < e.detail.value.length; q++) { //获取复选框选中的索引值并找到对应的字母，拼接
      resultString += ABZ[e.detail.value[q]];
    }

    var charArray = resultString.split(''); //把得到resultString答案进行A-Z排序
    charArray.sort();
    var sortedString = charArray.join('');

    //  判断长度
    if (this.data.info.attributes.brush[this.data.atciv].answer.length == e.detail.value.length) {
      this.setData({
        analysis: true,
      })
      if (sortedString.toUpperCase() === this.data.info.attributes.brush[this.data.atciv].answer.toUpperCase()) {
        this.setData({
          answerBL: '答案正确'
        })
      } else {
        this.setData({
          answerBL: '答案错误'
        })
      }
    }

    // 获取点击的values值和当前题目的题目列表 
    const items = this.data.info.attributes.brush[this.data.atciv].options;
    const values = e.detail.value;

    // 循环数组 添加checked值和value值
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false;
      items[i].value = i;
      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].value == values[j]) {
          items[i].checked = true;
          break
        }
      }
    }

    // 将循环后的数组更新到原数组中
    let bruPs = this.data.info.attributes.brush[this.data.atciv];
    bruPs.indices = sortedString;
    let upIndices = 'info.attributes.brush[' + this.data.atciv + ']';
    let upArray = 'info.attributes.brush[' + this.data.atciv + '].options';
    this.setData({
      [upIndices]: bruPs,
      [upArray]: items,
    })
  },

  /**
   * 下一题
   */
  brushIn() {
    if(app.globalData.launchScene == 1154){
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon:"none"
      })
      return;
    }

    this.setData({
      analysis: false,
      answerBL: '',
    })

    if (this.data.atciv < this.data.info.attributes.brush.length - 1) {
      this.setData({
        atciv: this.data.atciv + 1
      })
    } else {
      wx.showToast({
        title: '已经是最后一题了',
      })
    }
  },

  /**
   * 上一题
   */
  brushOn() {
    this.setData({
      atciv: this.data.atciv - 1
    })

    // 对比答案
    if (this.data.info.attributes.brush[this.data.atciv].indices.toUpperCase() == this.data.info.attributes.brush[this.data.atciv].answer.toUpperCase()) {
      this.setData({
        answerBL: '答案正确',
        analysis: true,
      })
    } else {
      this.setData({
        answerBL: '答案错误',
        analysis: true,
      })
    }
  },
})