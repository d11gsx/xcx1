// docsType.js
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
    // 是否显示搜索
    coverSearch: false,
    searchActive: 0,
    // 状态栏高度
    statusBarHeight: '',
    // 是否显示logo
    icon: false,
    // 基本配置
    wxSet: '',
    // 选项卡-滚动位置
    swID: '',
    // 页码
    page: 1,
    // 文章页码
    pageCount: 1,
    //选项卡-选中时的分类ID
    aid: '',
    // loading加载图
    listsLoading: true,

    // 以下是template所需要的数据字段
    tabLists: [], // 选项卡-文章数组
    vip: false, // vip
    type: 'Post', // 列表类型
    adSwitch: true, //广告开关
    videoAd: '', // 视频广告id
    // 热门文章
    hot: [],
    hotSet: [],
    // 选项卡-数组
    categoriestTab: [],
    //滚动高度
    scrollTopHightX: '',
    // 选项卡默认
    active: 0,
    // 获取2天后日期
    threeDaysLater: 0,
  },


  onLoad(options) {
    // 获取2天后日期
    var now = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
    var threeDaysLater = formatDate(now, 'yyyy.MM.dd')

    this.setData({
      type: options.type,
      threeDaysLater
    })
    console.log(options)

    if (app.globalData.wxSet == '') {
      //（解决异步）
      app.on('wxSet', this.changeToken.bind(this));
    } else {
      this.setData({
        wxSet: app.globalData.wxSet,
        statusBarHeight: app.globalData.statusBarHeight,
        adSwitch: app.globalData.wxSet.adSwitch,
        videoAd: app.globalData.wxSet.videoAd,
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
      adSwitch: app.globalData.wxSet.adSwitch,
      videoAd: app.globalData.wxSet.videoAd,
    })
    // 请求分类接口
    this.getCategory();
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
    this.setData({
      page: this.data.page + 1
    })
    // 选项卡文章列表
    this.getTabLists();
  },
  // 页面内分享
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: 'pages/postType/postType?type=' + this.data.type
    }
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
          type: this.data.type
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
    const indexType = this.data.type;
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
      // console.log('请求全部文章', res.data.data)
      this.setData({
        tabLists: this.data.tabLists
      })
      wx.hideLoading()
      // 判断是否数组为空
      this.ifPageCount();
    })
  },

  // 获取缓存信息
  getSystemInfo() {
    var value = wx.getStorageSync('getSystemInfo');
    var vip = wx.getStorageSync('VIP');
    // 设置缓存
    this.setData({
      statusBarHeight: value.statusBarHeight,
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

  // 热门文章
  getHost() {
    // 触发广告
    if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.chapingAd != null  && app.globalData.launchScene != 1154) {
      this.getTialAd();
    }

    var filterType = this.data.wxSet.hot.filter(item => item.type === this.data.type)
    this.setData({
      hotSet: filterType
    })

    if (filterType == '') {
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
      for (var i = 0; i < filterType.length; i++) {
        var item = filterType[i];
        if (item.isShow !== false) {
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

  // 选项卡点击
  tabTap(e) {
    // console.log(e.currentTarget.dataset.indx)
    this.setData({
      swID: e.currentTarget.dataset.swipe, //选项卡-滚动位置
      active: e.currentTarget.dataset.indx, //选项卡默认
      aid: e.currentTarget.dataset.aid, //选项卡-选中时的分类ID
      type: e.currentTarget.dataset.type, //选项卡类型
      page: 1
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
      apiMap[this.data.type]([e.currentTarget.dataset.aid], [1]).then((res) => {
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
      })
      wx.hideLoading()
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
        lists: API.getRedEnvelopesList,
        category: API.getRedEnvelopesCategoryList
      }
    };

    if (this.data.aid == 0) {
      var apihost = apiMap[this.data.type].lists;
      apihost([this.data.page]).then((res) => {
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
      var apihost = apiMap[this.data.type].category;
      apihost([this.data.aid], [this.data.page]).then((res) => {
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
})