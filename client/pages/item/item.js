// pages/index/item.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    image: {
      url: "../index/1.jpg"
    },
    similar: [{
      url: "../index/1.jpg"
    }, {
      url: "../index/1.jpg"
    }]
  },
  onShareAppMessage: function (res) {
    return {
      title: '大家都在用的图片搜索神器！百万高清图片等你来搜！',
      path: '/pages/index/index',
      imageUrl: "/pages/index/1.jpg"
    }
  },
  download: function (res) {
    wx.downloadFile({
      url: this.data.image.url,
      success: function(res) {
        if (res.statusCode === 200) {
          if (res.authSetting['scope.writePhotosAlbum']) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath
            })
          } else {
            util.showModel('用户未授权', e.detail.errMsg);
          }
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '下载失败',
          duration: 500
        })
      },
      complete: function(res) {},
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id })
    var self = this;
    var queryData = {};
    queryData.id = self.data.id;

    wx.request({
      url: config.service.imageGetUrl,
      method: "POST",
      data: queryData,
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var tmp = self.data.imgUrls;
        var newData = [];
        //TODO SET DATA
        // for (var i = 0; i < res.data.length; i++) {
        //   var uri = res.data[i].cos_uri;
        //   uri = res.data[i].source_id + ".jpg"
        //   newData.push({ id: res.data[i].id, url: config.properties.imageHost + uri + config.properties.imageType })
        // }
        // tmp = tmp.concat(newData);
        // console.log(tmp)
        // self.setData({ imgUrls: tmp, page: self.data.page + 1 });


        wx.showToast({
          icon: 'success',
          title: '加载成功',
          duration: 500
        })
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
  previewImage: function () {
    wx.previewImage({
      current: this.data.image.url,
      urls: [this.data.image.url]
    })
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