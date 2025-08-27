// pages/lists/lists.js
const app = getApp()
import * as API from "../../utils/api";
// 引入动态文案
import speech from "../../template/common-speech.js"
import {
  formatDate
} from "../../utils/helper";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 引入骨架
    skeleton: true,
    // 状态栏高度
    statusBarHeight: '',
    //滚动高度
    scrollTopHightX: '',
    // 是否显示logo
    icon: false,
    // logo
    logo: '',
    // 是否显示搜索
    coverSearch: true,
    // 参数
    id: '',
    // 搜素
    search: '',
    // 设置缓存
    wxSet: '',
    // 页数
    page: 1,
    // loading加载图
    listsLoading: true,
    // 文章页码
    pageCount: 1,
    // 弹窗
    showPrivacy: false,
    animationData: {},

    // 以下是template所需要的数据字段
    list: [], // 选项卡-文章数组
    vip: false, // vip
    adSwitch: true, //广告开关
    videoAd: '',
    // 文案
    speech: [],
    // 获取2天后日期
    threeDaysLater: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options)
    // 获取2天后日期
    var now = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
    var threeDaysLater = formatDate(now, 'yyyy.MM.dd')

    this.setData({
      id: options.id,
      search: decodeURIComponent(options.search),
      type: options.type,
      active: options.active,
      threeDaysLater
    })
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
      // 获取缓存信息
      this.getSystemInfo();
      // 判断请求接口
      this.getApiUrl();
      // 类型为搜索时隐藏搜索框
      if (options.search != '') {
        this.setData({
          coverSearch: false
        })
      }
    }
  },
  //（解决异步）
  changeToken() {
    // console.log('wxSet', app.globalData.wxSet);
    this.setData({
      wxSet: app.globalData.wxSet,
      statusBarHeight: app.globalData.statusBarHeight,
      adSwitch: app.globalData.wxSet.adSwitch,
      videoAd: app.globalData.wxSet.videoAd,
    })
    // 获取缓存信息
    this.getSystemInfo();
    // 判断请求接口
    this.getApiUrl();
    // 类型为搜索时隐藏搜索框
    if (options.search != '') {
      this.setData({
        coverSearch: false
      })
    }
  },

  // 监听滑动
  onPageScroll: function (e) {
    this.setData({
      scrollTopHightX: e.scrollTop
    })
  },

  // 页面上拉触底事件的处理函数
  onReachBottom() {
    this.setData({
      page: this.data.page + 1
    })
    if (this.data.id != '' && this.data.id != undefined) {
      // console.log('请求分类文章')
      this.categoryList();
    } else {
      // console.log('请求搜索')
      this.searchLits();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // console.log(res.target)
    }
    if (this.data.search != 'undefined') {
      var pathUrl = 'pages/lists/lists?search=' + this.data.search;
    } else {
      var pathUrl = 'pages/lists/lists?id=' + this.data.id;
    }
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: pathUrl
    }
  },

  //分享盆友圈
  onShareTimeline(res) {
    if (this.data.search != "") {
      var pathUrl = 'pages/lists/lists?search=' + this.data.search
    } else {
      var pathUrl = 'pages/lists/lists?id=' + this.data.id
    }
    return {
      title: this.data.wxSet.shareTitle,
      imageUrl: this.data.wxSet.shareImg,
      path: 'pages/lists/lists?search=' + this.data.search
    }
  },

  // 获取缓存信息
  getSystemInfo() {
    var vip = wx.getStorageSync('VIP');
    let sphInx = Math.ceil(Math.random() * speech[0].speech.length); // 设置一个随机数 取文案
    // console.log('随机数：', sphInx, '内容：', speech[0].speech)
    // 设置缓存
    this.setData({
      vip: vip,
      speech: speech[0].speech[sphInx - 1]
    })
  },

  // 判断请求接口
  getApiUrl() {
    if (this.data.id != '' && this.data.id != undefined) {
      // console.log('请求分类文章')
      this.categoryList();
    } else {
      // console.log('请求搜索')
      this.searchLits();
    }
  },

  // 请求分类文章列表 判断type类型 请求不同接口
  categoryList() {
    const apiMap = {
      'Post': API.getCategoryList,
      'Doc': API.getDocsCategoryList,
      'Image': API.getWallCategoryList,
      'Topic': API.getSubjectsLists,
      'BrushQuestion': API.getBrushLists,
      'HonBao': API.getRedEnvelopesCategoryList,
    };
    apiMap[this.data.type]([this.data.id], [this.data.page], []).then((res) => {
      // console.log('请求分类列表', res.data)
      // 初始化时间格式
      let data = res.data.data;
      for (let key in data) {
        data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt,
          'yyyy.MM.dd')
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
      this.data.list.push(evenIndexItems.concat(oddIndexItems))
      this.setData({
        list: this.data.list,
        pageCount: res.data.meta.pagination.pageCount,
        skeleton: false,
      })
      // 判断是否数组为空
      this.ifPageCount();
    })
  },

  // 请求搜索文章列表  判断type类型 请求不同接口 默认打开搜索资源
  searchLits() {
    const activeToApiMap = [
      API.getSearchList,
      API.getDocsSearchList,
      API.getSubjectsSearchList,
      API.getWsllsSearchList,
      API.getBrushSearchList,
      API.getRedEnvelopesSearchList
    ].map(api => ({
      API: api
    }));

    // 创建包含6个接口请求Promise对象的数组
    const requestPromises = activeToApiMap.map(({
      API
    }) => new Promise((resolve, reject) => {
      API([this.data.search], [this.data.page]).then((res) => {
        // 初始化时间格式
        let data = res.data.data;
        for (let key in data) {
          data[key].attributes.updatedAt = formatDate(data[key].attributes.updatedAt, 'yyyy.MM.dd');
        }
        resolve(data);
      }).catch((err) => {
        reject(err);
      });
    }));

    // 等待所有接口请求完成
    Promise.all(requestPromises)
      .then((results) => {
        // 将所有接口返回的数据合并并排序后设置到组件数据中
        let mergedData = [].concat(...results).sort((a, b) => new Date(b.attributes.updatedAt) - new Date(a.attributes.updatedAt));
        // 遍历数组，根据索引奇偶性将元素分别添加到不同的数组中
        const evenIndexItems = [];
        const oddIndexItems = [];
        for (let i = 0; i < mergedData.length; i++) {
          if (i % 2 === 0) {
            evenIndexItems.push(mergedData[i]);
          } else {
            oddIndexItems.push(mergedData[i]);
          }
        }
        // 合并偶数索引和奇数索引的数组
        this.data.list.push(evenIndexItems.concat(oddIndexItems))

        this.setData({
          list: this.data.list,
          skeleton: false
        });

        if (mergedData.length === 0) { //下一页无内容判断
          this.setData({
            listsLoading: false
          })
        }

        if (this.data.list.length === 0) { //搜索是内容为空判断
          this.setData({
            showPrivacy: true
          });
        }
      })
  },

  // 判断是否数组为空
  ifPageCount() {
    if (this.data.pageCount == 0) {
      this.setData({
        showPrivacy: true
      })
    } else if (this.data.pageCount < this.data.page) {
      this.setData({
        listsLoading: false
      })
    }
  },

  // 返回&&击遮罩层时 定时页面栈函数
  onClickoverlay() {
    this.setData({
      showPrivacy: false,
    })
    this.tarBlack();
  },

  // 返回按钮 建立页面栈 如果是1则是分享打开需要返回主页，大于1则返回上一级
  tarBlack: function () {
    var selPage = getCurrentPages();
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


})