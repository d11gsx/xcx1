import * as API from "./utils/api";
// 声明常量（解决异步）
const eventMap = new Map();
App({
  async onLaunch() {
    // 获取启动参数
    const launchOptions = wx.getLaunchOptionsSync();
    this.globalData.launchScene = launchOptions.scene;
    // console.log('Launch options:', launchOptions.scene);

    if (launchOptions.scene != 1154) {
      this.update() // 检测更新
    }

  },
  async onShow() {
    // 用户登录时间缓存
    this.loginUser();
    // 请求基本数据
    this.getSetDate();
  },
  globalData: {
    count: 1, //定义Nuber（解决异步）
    wxSet: [], //基本配置
    statusBarHeight: 0, //状态栏高度
    windowHeight: 0, //可使用窗口高度
    platform: "",
    indexBg: [], //首页录播图
    launchScene: 1001, //启动小程序的场景值
  },
  // 事件订阅（解决异步）
  on(action, event) {
    if (eventMap && !eventMap.has(action)) {
      eventMap.set(action, event);
    }
  },

  //事件卸载（解决异步）
  off(action) {
    if (eventMap && eventMap.has(action)) {
      eventMap.delete(action);
    }
  },

  //事件触发（解决异步）
  emit(action, arg) {
    if (eventMap && eventMap.has(action)) {
      eventMap.get(action) && eventMap.get(action)(arg);
    }
  },
  // 请求基本数据
  getSetDate() {
    API.getFrSet().then((res) => {
      // 获取设备信息
      wx.getSystemInfo({
        success: (res) => {
          this.globalData.statusBarHeight = res.statusBarHeight;
          this.globalData.platform = res.platform;
          this.globalData.windowHeight = res.windowHeight;
        }
      })

      // 存为内存
      this.globalData.wxSet = res.data.data.attributes;
      this.globalData.indexBg = res.data.data.attributes.indexBg.split(/[\n,]/g);
      // 定义Nuber（解决异步）
      if (res.data) {
        this.emit('wxSet', this.globalData.count++);
      }
    })
  },

  // 获取用户基本信息
  loginUser() {
    const jwt = wx.getStorageSync('token')
    const lmUser = wx.getStorageSync('lmUser')
    // 判断是否token过期
    if (lmUser != '') {
      // 配置header
      const token = {
        'content-type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      }
      // 更新用户信息缓存，若token过期提示重新登录
      API.userInfoMe(token).then((res) => {
        if (res.statusCode == 200) {
          wx.setStorageSync("lmUser", res.data);
        } else {
          wx.showToast({
            title: '登录过期',
            icon: 'error',
            duration: 2000
          })
          wx.removeStorageSync('lmUser')
          wx.removeStorageSync('token')
        }
      })
    } else {
      this.vipUser();
    }

  },

  // 获取缓存数据 每次打开小程序对比时间是过期
  vipUser() {
    var lmUserInfo = wx.getStorageSync('lmUser');
    if (lmUserInfo == '') {
      wx.setStorageSync('VIP', false)
    } else {
      this.vipTime(lmUserInfo);
    }
  },

  // vip判断
  vipTime(e) {
    // vip时间转换
    var date = new Date(e.vipTime);
    var vipTime = date.getTime();
    // console.log(vipTime,'VIP时间')

    // 获取当前时间
    const timestamp = Date.parse(new Date());
    // console.log(timestamp,'当前时间')

    // 对比VIP是否到期
    if (vipTime > timestamp) {
      wx.setStorageSync('VIP', true)
    } else {
      wx.setStorageSync('VIP', false)
    }
  },

  // 版本更新
  update() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        // 新版本下载成功
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，请您重启应用，以确保正常使用。',
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
        // 新版本下载失败
        updateManager.onUpdateFailed(function () {
          wx.showModal({
            title: '更新提示',
            content: '检测到了新版本，但是下载失败了~'
          })
        })
      }
    })
  }
})