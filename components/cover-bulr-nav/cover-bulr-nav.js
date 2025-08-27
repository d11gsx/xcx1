// components/cover-bulr-nav/cover-bulr-nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 状态栏高度
    statusBarHeight: {
      type: String,
      value: ''
    },
    // 滚动高度
    scrollTopHightX: {
      type: String,
      value: ''
    },
    // 不显示返回
    icon: {
      type: Boolean,
      value: true
    },
    // 显示搜索图标
    coverSearch: {
      type: Boolean,
      value: false
    },
    // 显示logo
    logo: {
      type: String,
      value: ''
    },
    // 标题
    title: {
      type: String,
      value: ''
    },
    // vip
    vip: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 判断是否登录
    isLogin() {
      wx.navigateTo({
        url: '../my/my',
      })
    },

    // 左上角返回按钮
    tarBlack: function () {
      // 建立页面栈 如果是1则是分享打开需要返回主页，大于1则返回上一级
      var selPage = getCurrentPages();
      console.log(selPage.length)
      if (selPage.length == 1) {
        wx.navigateTo({
          url: "../index/index"
        })
      } else {
        wx.navigateBack({
          delta: 1
        });
      }
    },

    // 搜索点击 传输搜索制 并跳转lits页面
    coverSearchTap() {
      wx.showModal({
        title: '搜索一下！',
        placeholderText: '告诉我你想寻找什么...',
        confirmText:'搜索',
        editable:true,
        success(res) {
          if (res.confirm) {
            console.log(res.content)
            wx.navigateTo({
              url: '../../pages/lists/lists?search=' + res.content,
            })
          }
        }
      })
    }
  }
})