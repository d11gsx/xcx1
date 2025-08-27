// pages/web/web.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options)
    if(options.type != undefined){
      var datas = JSON.parse(decodeURIComponent(options.url))
      this.setData({
        url:datas
      })
    }else{
      this.setData({
        url:options.url
      })
    }
  },
})