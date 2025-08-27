// index.js
// 获取应用实例
const app = getApp()
import * as API from "../../utils/api";
import {
  formatDate
} from "../../utils/helper";
let interstitialAd = null;
Page({
  data: {
    // 轮播图
    autoplay: true,
    interval: 3000,
    duration: 800,
    // 引入骨架
    skeleton: true,
    searchValue: '',

    // 状态栏高度
    statusBarHeight: '',
    // 首页背景图片
    indexBg: [],
    // 是否显示logo
    icon: true,
    // logo
    logo: '',
    // 基本配置
    wxSet: '',
    // 金刚区
    vajra: [],
    // 瓷片区
    porcelain: [],

    // 选项卡-滚动位置
    swID: '',

    // 页码
    page: 1,
    // 文章页码
    pageCount: 1,
    //选项卡-选中时的分类ID
    aid: '',

    // 以下是template所需要的数据字段
    tabLists: [], // 选项卡-文章数组
    vip: false, // vip
    indexType: '', // 首页列表类型
    adSwitch: true, //广告开关
    videoAd: '', // 视频广告id
    //滚动高度
    scrollTopHightX: '',
    // 选项卡默认
    active: 0,
    // 选项卡-数组
    categoriestTab: [],
    // 热门文章
    hot: [],
    newHotArray:[],

    // loading加载图
    listsLoading: true,

    // 获取2天后日期
    threeDaysLater: 0,
    noticeDaySum: 0,

    // 一言
    apiSwitch: false,
  },

  onLoad() {
    // 获取当前时间戳
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
    const day = now.getDate();
    const noticeDaySum = year + month + day;

    // 获取2天后日期
    var nowTow = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
    var threeDaysLater = formatDate(nowTow, 'yyyy.MM.dd')
    this.setData({
      threeDaysLater,
      noticeDaySum
    })

    if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    } else {
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight,
        indexType: app.globalData.wxSet.indexType,
        adSwitch: app.globalData.wxSet.adSwitch,
        videoAd: app.globalData.wxSet.videoAd,
        vajra: app.globalData.wxSet.vajra,
        porcelain: app.globalData.wxSet.porcelain,
        logo: app.globalData.wxSet.logo,
        indexBg: app.globalData.indexBg,
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
      indexType: app.globalData.wxSet.indexType,
      adSwitch: app.globalData.wxSet.adSwitch,
      videoAd: app.globalData.wxSet.videoAd,
      vajra: app.globalData.wxSet.vajra,
      porcelain: app.globalData.wxSet.porcelain,
      logo: app.globalData.wxSet.logo,
      indexBg: app.globalData.indexBg,
    })
    // 请求分类接口
    this.getCategory();
  },
  // 下拉刷新
  onPullDownRefresh() {
    app.getSetDate();
    wx.showToast({
      title: '正刷新...',
      icon: 'loading',
      duration: 1200,
    })
    setTimeout(() => {
      wx.stopPullDownRefresh();
      this.changeToken();
      wx.showToast({
        title: '刷新成功',
        duration: 1200,
      })
    }, 1200);
  },

  onShow() {
    // 获取缓存信息
    this.getSystemInfo();
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

  // 上拉加载
  onReachBottom() {
    if (this.data.wxSet.indexType != 'Speech') {
      this.setData({
        page: this.data.page + 1
      })

      this.getTabLists(); // 选项卡文章列表
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
      path: 'pages/index/index'
    }
  },

  // 热门文章
  getHost() {
    // 触发广告
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.chapingAd != null && app.globalData.launchScene != 1154) {
      this.getTialAd();
    }
    // 弹窗公告
    const noticeTime = wx.getStorageSync('notice_time');
    if (this.data.wxSet.popNotice != null && noticeTime != this.data.noticeDaySum) {
      //popNoticeUrl有内容需跳转时
      if (this.data.wxSet.popNoticeUrl != null) {
        wx.showModal({
          title: '弹窗通知',
          confirmText: '访问',
          content: this.data.wxSet.popNotice,
          success: (res) => {
            wx.setStorageSync('notice_time', this.data.noticeDaySum);
            if (res.confirm) {
              if (this.data.wxSet.popNoticeUrl != null) {
                this.popNoticeUrl();
              }
            }
          }
        })
      } else {
        //popNoticeUrl无内容默认弹窗
        wx.showModal({
          title: '弹窗通知',
          showCancel: false,
          content: this.data.wxSet.popNotice,
          success: (res) => {
            wx.setStorageSync('notice_time', this.data.noticeDaySum);
          }
        })
      }
    }

    if (this.data.wxSet.hot == '') { //如果hot是空的关闭加载，不执行后面代码
      setTimeout(() => {
        this.setData({
          skeleton: false,
        })
      }, 1000)
      return;
    }

    // 循环请求接
    const apiMap = {
      "Doc": API.getDocsHost,
      "Post": API.getHost,
      "Topic": API.getSubjectsHost,
      "BrushQuestion": API.getBrushHost,
      "HonBao": API.getRedEnvelopesHost,
      "Image": API.getWallHost
    };
    // 假设 apiMap 和 this.data 已经定义好
    async function fetchDataSequentially() {
      var newArray = this.data.wxSet.hot.filter(item => item.isShow == true);
      this.setData({
        newHotArray:newArray
      })
      for (var i = 0; i < newArray.length; i++) {
        var item = newArray[i];
        if (item.isShow != false) {
          // 根据item.type获取对应的API调用方法
          const apiCall = apiMap[item.type];
          if (apiCall) {
            try {
              const res = await apiCall(item.hosID);
              var tyleList = res.data.data;
              // 更新this.data.wxSet.hot数组中的对应元素
              this.setData({
                hot: [...this.data.hot, tyleList]
              });
            } catch (error) {
              console.error('请求失败:', error);
            }
          }
        }
      }
    }
    // 调用 fetchDataSequentially 函数
    fetchDataSequentially.call(this);

    setTimeout(() => {
      this.setData({
        skeleton: false,
      })
    }, 1000)
  },

  // 请求分类接口
  getCategory() {
    // 初始化 type 变量
    let type = '&filters[type][$eq]=' + this.data.wxSet.indexType;
    if (this.data.wxSet.showCategory != null) {
      if (!this.data.wxSet.showCategory.includes("filters[type]")) {
        type += this.data.wxSet.showCategory;
      }
    }

    API.getCategory([this.data.page], [type]).then((res) => {
      var muen = res.data.data.unshift({
        id: 0,
        attributes: {
          name: "最新",
          icon: "../../images/new.png",
          type: this.data.wxSet.indexType
        }
      })
      this.setData({
        categoriestTab: res.data.data,
      })
      // console.log('请求分类', this.data.categoriestTab[0].id)
      // 最新文章列表
      this.newList();
      // 请求热门文章
      this.getHost();
    })
  },

  // 最新文章列表
  newList() {
    const apiMap = {
      'Post': API.getLists,
      'Doc': API.getDocsLists,
      'Topic': API.getSubjects,
      'Image': API.getWallLists,
      'BrushQuestion': API.getBrush,
      'HonBao': API.getRedEnvelopesList
    };
    const indexType = this.data.wxSet.indexType;
    if (indexType === "Speech") {
      // 处理 speech 数据  
      this.getSpeech();
      this.ifPageCount();
      wx.hideLoading();
      return;
    }

    apiMap[indexType]([1]).then((res) => {
      // 初始化时间格式
      let data = res.data.data;
      for (let key in data) {
        data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt, 'yyyy.MM.dd')
      }
      // 遍历数组，根据索引奇偶性将元素分别添加到不同的数组中
      const evenIndexItems = [];
      const oddIndexItems = [];
      for (let i = 0; i < data.length; i++) {
        if (i % 2 === 0) {
          evenIndexItems.push(data[i]);
        } else {
          oddIndexItems.push(data[i]);
        }
      }
      // 合并偶数索引和奇数索引的数组
      this.data.tabLists[0] = evenIndexItems.concat(oddIndexItems);
      this.setData({
        tabLists: this.data.tabLists,
        pageCount: res.data.meta.pagination.pageCount,
      })
      // console.log('请求全部文章', this.data.tabLists)
      wx.hideLoading()
      // 判断是否数组为空
      this.ifPageCount();
    })
  },

  // speech数据
  getSpeech() {
    API.getSpeech().then((res) => {
      this.setData({
        API: res.data.data.attributes.API,
        apiSwitch: res.data.data.attributes.apiSwitch,
        listsLoading: false
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
          tabLists: speech.slice(0, 4),
        })
      }
    })
  },
  // 一言API
  getApiSpe() {
    wx.request({
      url: this.data.API,
      success: (res) => {
        if (res.statusCode == 200) {
          this.setData({
            tabLists: res.data
          })
        } else {
          wx.showToast({
            title: 'API错误',
          })
        }
      }
    })
  },
  speenchMore() {
    wx.navigateTo({
      url: '../speech/speech',
    })
  },

  // 获取缓存信息
  getSystemInfo() {
    var vip = wx.getStorageSync('VIP');
    // 设置缓存
    this.setData({
      vip: vip,
    })
  },

  // 插屏广告
  getTialAd() {
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: this.data.wxSet.chapingAd
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {
        console.log(err)
      })
      interstitialAd.onClose(() => {})
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  },

  // 获取输入框值 且跳转
  search(e) {
    // console.log(e.detail.value)
    if (e.detail.value == '') {
      wx.showToast({
        icon: "error",
        title: '请输入搜索内容...',
      })
      return;
    }
    wx.navigateTo({
      url: '../lists/lists?search=' + e.detail.value,
    })
  },

  // 失去焦点是获取输入框内容
  searchValue(e) {
    // console.log(e.detail.value)
    this.setData({
      searchValue: e.detail.value
    })
  },
  // 搜索按钮跳转
  searchBlur() {
    // console.log(this.data.searchValue,1111)
    if (this.data.searchValue == '') {
      wx.showToast({
        icon: "error",
        title: '请输入搜索内容...',
      })
    } else {
      wx.navigateTo({
        url: '../lists/lists?search=' + this.data.searchValue,
      })
    }
  },

  // 列表跳转  
  indexListsTap(e) {
    var {
      id,
      type,
      open,
      web
    } = e.currentTarget.dataset;
    if (type == undefined) {
      var type = this.data.wxSet.indexType
    }
    const urlMap = {
      'Post': `../info/info?id=${id}`,
      'Doc': `../doc/doc?id=${id}`,
      'Image': `../wallcover/wallcover?id=${id}`,
      'Topic': `../topic/topic?id=${id}`,
      'BrushQuestion': `../brush/brush?id=${id}`,
      'HonBao': `../redenvelopes/redenvelopes?id=${id}`,
    };

    const targetUrl = urlMap[type];
    if (type == "Doc" && open == true) {
      wx.navigateTo({
        url: '../web/web?url=' + web,
      });
    } else {
      wx.navigateTo({
        url: targetUrl,
      });
    }
  },

  // 点击跳转
  ifyTap() {
    wx.navigateTo({
      url: '../classify/classify',
    })
  },

  // 金刚区点击  
  vajraTap(e) {
    const vajraData = e.currentTarget.dataset;
    switch (vajraData.type) {
      case 'wx_web': // 跳转web  
        wx.navigateTo({
          url: `../web/web?url=${vajraData.url}`,
        })
        break;

      case 'wx_program': // 跳转小程序  
        wx.navigateToMiniProgram({
          appId: vajraData.appid,
          path: vajraData.url,
        });
        break;

      case 'wx_default': // 跳转二级页面  
        wx.navigateTo({
          url: vajraData.url,
        })
        break;

      default:
        console.error('Unknown vajra type:', vajraData.type);
        // 可以在这里添加额外的错误处理逻辑，比如显示一个通用的错误提示  
        break;
    }
  },

  // 执行滚动
  tabTap(e) {
    // console.log(e.currentTarget.dataset.indx)
    this.setData({
      swID: e.currentTarget.dataset.swipe, //选项卡-滚动位置
      active: e.currentTarget.dataset.indx, //选项卡默认
      aid: e.currentTarget.dataset.aid, //选项卡-选中时的分类ID
      type: e.currentTarget.dataset.type, //选项卡类型
      page: 1,
    })
    wx.showLoading({
      title: '加载中...',
    })
    wx.pageScrollTo({
      selector: '.fengrui-tab',
      duration: 1000,
      success: () => {
        this.activeList(e);
      }
    });
  },
  // 选项卡点击
  activeList(e) {
    if (e.currentTarget.dataset.aid == 0) {
      this.newList();
    } else {
      const apiMap = {
        'Post': API.getCategoryList,
        'Doc': API.getDocsCategoryList,
        'Image': API.getWallCategoryList,
        'Topic': API.getSubjectsLists,
        'BrushQuestion': API.getBrushLists,
        'HonBao': API.getRedEnvelopesCategoryList,
      };
      apiMap[this.data.wxSet.indexType]([e.currentTarget.dataset.aid], [1]).then((res) => {
        // 初始化时间格式
        let data = res.data.data;
        for (let key in data) {
          data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt, 'yyyy.MM.dd')
        }
        const evenIndexItems = [];
        const oddIndexItems = [];
        // 遍历数组，根据索引奇偶性将元素分别添加到不同的数组中
        for (let i = 0; i < data.length; i++) {
          if (i % 2 === 0) {
            evenIndexItems.push(data[i]);
          } else {
            oddIndexItems.push(data[i]);
          }
        }
        // 合并偶数索引和奇数索引的数组
        if (data.length > 0) {
          this.data.tabLists[0] = evenIndexItems.concat(oddIndexItems);
          this.setData({
            tabLists: this.data.tabLists,
            pageCount: res.data.meta.pagination.pageCount,
          })
        }
        wx.hideLoading()
      })
    }
  },

  // 选项卡文章列表
  getTabLists() {
    const apiMap = {
      'Post': {
        lists: API.getLists,
        category: API.getCategoryList
      },
      'Doc': {
        lists: API.getDocsLists,
        category: API.getDocsCategoryList
      },
      'Topic': {
        lists: API.getSubjects,
        category: API.getSubjectsLists
      },
      'Image': {
        lists: API.getWallLists,
        category: API.getWallCategoryList
      },
      'BrushQuestion': {
        lists: API.getBrush,
      },
      'HonBao': {
        lists: 'API.getRedEnvelopesList',
        category: API.getRedEnvelopesCategoryList
      }
    };

    if (this.data.aid == 0) {
      var apihost = apiMap[this.data.wxSet.indexType].lists;
      apihost([this.data.page]).then((res) => {
        // 初始化时间格式
        let data = res.data.data;
        for (let key in data) {
          data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt, 'yyyy.MM.dd')
        }

        const evenIndexItems = [];
        const oddIndexItems = [];
        // 遍历数组，根据索引奇偶性将元素分别添加到不同的数组中
        for (let i = 0; i < data.length; i++) {
          if (i % 2 === 0) {
            evenIndexItems.push(data[i]);
          } else {
            oddIndexItems.push(data[i]);
          }
        }
        // 合并偶数索引和奇数索引的数组
        if (data.length > 0) {
          this.data.tabLists.push(evenIndexItems.concat(oddIndexItems))
          this.setData({
            tabLists: this.data.tabLists,
            pageCount: res.data.meta.pagination.pageCount,
          })
        }
      })
    } else {
      var apihost = apiMap[this.data.wxSet.indexType].category;
      apihost([this.data.aid], [this.data.page]).then((res) => {
        // 初始化时间格式
        let data = res.data.data;
        for (let key in data) {
          data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt, 'yyyy.MM.dd')
        }
        const evenIndexItems = [];
        const oddIndexItems = [];
        // 遍历数组，根据索引奇偶性将元素分别添加到不同的数组中
        for (let i = 0; i < data.length; i++) {
          if (i % 2 === 0) {
            evenIndexItems.push(data[i]);
          } else {
            oddIndexItems.push(data[i]);
          }
        }
        // 合并偶数索引和奇数索引的数组
        if (data.length > 0) {
          this.data.tabLists.push(evenIndexItems.concat(oddIndexItems))
          this.setData({
            tabLists: this.data.tabLists,
            pageCount: res.data.meta.pagination.pageCount,
          })
        }
      })
    }
    // 判断是否数组为空
    this.ifPageCount();
  },

  // 判断是否数组为空
  ifPageCount() {
    if (this.data.pageCount == 0) {
      this.setData({
        isShow: true
      })
    } else if (this.data.pageCount < this.data.page) {
      this.setData({
        listsLoading: false
      })
    }
  },

  // 选项卡菜单点击
  muenTap() {
    wx.navigateTo({
      url: '../category/category'
    })
  },

  // 弹窗通知点击
  popNoticeUrl() {
    if (this.data.wxSet.popNoticeUrl.substr(0, 5) == 'https') {
      wx.navigateTo({
        url: '../web/web?url=' + this.data.wxSet.popNoticeUrl,
      })
    } else {
      wx.navigateTo({
        url: this.data.wxSet.popNoticeUrl,
      })
    }
  },

  /**
   * 格式化时间
   * @param {*} date 
   */
  formatDate(dateStr, format = "") {
    const date = new Date(dateStr);
    if (!format) format = 'yyyy-MM-dd hh:mm:ss';
    let map = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in map) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (map[k]) : (("00" + map[k]).substr(("" + map[k]).length)));
      }
    }
    return format;
  },
})