const baseUrl = 'https://star.frbkw.com';
// const baseUrl = 'https://lintech.icu';

var frRequest = function(config) {
	let retryCount = 0; // 用于记录重试次数

	return new Promise((resolve, reject) => {
		// 显示加载弹窗
		// wx.showLoading({
		// 	title: '加载中...',
		// 	mask: true
		// });

		const request = () => {
			wx.request({
				url: baseUrl + config.url, //路径
				timeout: 5000, //设置请求时间
				data: config.data, // 存放的数据
				method: config.method, //数据请求方式
				header: config.header, //请求头设置
				success: res => {
					// 关闭加载弹窗
					// wx.hideLoading();
					resolve(res);
					// console.log('res数据成功了', res);
				},
				fail: err => {
					// 关闭加载弹窗（即使请求失败也需要关闭，避免一直显示加载状态）
					wx.hideLoading();
					console.log('err数据请求失败了', err);
					wx.showToast({
						title: '数据请求失败了',
					});

					if (retryCount < 3) {
						retryCount++;
						console.log(`正在进行第${retryCount}次重试...`);
						request(); // 重新发起请求
					} else {
						reject(err); // 达到重试次数上限，拒绝Promise并传递错误信息
					}
				},
			});
		};

		request();
	});
};

export default frRequest;