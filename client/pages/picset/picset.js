// pages/picset/picset.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    page: 0
  },
  loadMore() {
    var self = this;

    this.setData({ loading: true });

    var queryData = {};
    queryData.page = self.data.page;

    wx.request({
      url: config.service.picsetQueryUrl,
      method: "POST",
      data: queryData,
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var tmp = self.data.imgUrls;
        var newData = [];
        //TODO SET DATA
        for (var i = 0; i < res.data.length; i++) {
          var uri = res.data[i].cos_uri;
          newData.push({ id: res.data[i].id, url: config.properties.imageHost + uri + config.properties.imageType })
        }
        tmp = tmp.concat(newData);
        console.log(tmp)
        self.setData({ imgUrls: tmp, page: self.data.page + 1 });
        if(newData.length == 0){
          wx.showToast({
            icon: 'success',
            title: '没有更多了',
            duration: 500
          })
        }
        self.setData({ loading: false });
      },
      fail: function (err) {
        wx.showToast({
          title: '加载失败',
          duration: 500
        })
        self.setData({ loading: false });
      }
    })
  },
  imageTap: function (e) {
    wx.navigateTo({
      url: '/pages/list/list?picset=' + e.target.id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})