// pages/classify/classify.js
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
		// 设置缓存
		wxSet: '',
		// 案例滑动图片
		stateImg: [],
		// 详情内容
		info: [],
		// 默认样式
		tagStyle: {
			p: 'line-height: 30px;'
		},
		// 下载地址内容
		isDownload: false,
		// vip
		vip: false,

		// 随机数码
		code64: '',
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
			this.postInfo();
		}
	},
	//（解决异步）
	changeToken() {
		this.setData({
			wxSet: app.globalData.wxSet,
			statusBarHeight: app.globalData.statusBarHeight
		})
		// 请求详情
		this.postInfo();
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
			title: this.data.info.attributes.title,
			imageUrl: this.data.info.attributes.cover,
			path: 'pages/info/info?id=' + this.data.id
		}
	},

	//分享盆友圈
	onShareTimeline(res) {
		return {
			title: this.data.info.attributes.title,
			imageUrl: this.data.info.attributes.cover,
			path: 'pages/info/info?id=' + this.data.id
		}
	},

	// 监听滑动
	onPageScroll: function(e) {
		this.setData({
			scrollTopHightX: e.scrollTop
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

	// 请求详情
	postInfo() {
		API.getInfo([this.data.id]).then((res) => {
			// 获取当前时间戳
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1; // 月份从 0 开始，需加 1
			const day = now.getDate();
			const postDaySum = year + month + day;

			this.setData({
				info: res.data.data,
				postDaySum: postDaySum
			})
			console.log('请求详情', res.data.data)

			if (res.data.data.attributes.images != null) {
				this.setData({
					stateImg: res.data.data.attributes.images.split(/[\n,]/g)
				})
			}

			// 获取激励视频缓存
			const postAdKey = wx.getStorageSync('pos_adkey');
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
								isDownload: true
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
			// 随机数码
			if (this.data.wxSet.copyUrl == true) {
				this.random64();
			}
		})
	},

	// 初始化激励视频广告组件
	starpAd() {
		if (this.data.wxSet.adSwitch == true && this.data.vip == false && this.data.wxSet.jiliAd != null) {
			this.CreateAd();
		} else {
			this.setData({
				isDownload: true
			})
		}
	},


	// 案例滑动图片
	stateImgTap(e) {
		wx.previewImage({
			current: this.data.stateImg[e.currentTarget.dataset.id],
			urls: this.data.stateImg
		})
	},

	// 随机数码
	random64() {
		let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let randomString = '';
		for (let i = 0; i < 64; i++) {
			let randomIndex = Math.floor(Math.random() * characters.length);
			randomString += characters.charAt(randomIndex);
		}
		this.setData({
			code64: randomString
		})
	},

	//初始化激励视频广告组件
	CreateAd: function() {
		var that = this;
		if (that.data.info.attributes.adRead == true) {
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
				isDownload: true
			})
		}
	},

	// 激励视频
	getVideoAd: function() {
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

	// 阅读文档点击
	docsTap(e) {
		// console.log(e.currentTarget.dataset.id)
		wx.navigateTo({
			url: '../doc/doc?id=' + e.currentTarget.dataset.id,
		})
	},

	// 访问web点击
	webTap() {
		wx.navigateTo({
			url: '../web/web?url=' + this.data.info.attributes.web,
		})
	},


	// 返回按钮 建立页面栈 如果是1则是分享打开需要返回主页，大于1则返回上一级
	tarBlack: function() {
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

	// 复制url
	copyTap(e) {
		wx.setClipboardData({
			data: e.currentTarget.dataset.url,
		})
	},

	// 设置广告缓存
	setRead() {
		var postAdKey = wx.getStorageSync('pos_adkey');
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
		wx.setStorageSync('pos_adkey', postAdKey);
		// console.log(postAdKey)
	},

})