// pages/index/item.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCollected: false,
    collected: "fa-heart-o",
    image: {
      id: 1,
      uri: "",
      url: "../index/1.jpg"
    },
    similar: [{
      id: 1,
      url: "../index/1.jpg"
    }, {
      id: 1,
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
    console.log(this.data.image.url)
    wx.downloadFile({
      url: this.data.image.url,
      success: function (downloadRes) {
        wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.writePhotosAlbum']) {
              wx.saveImageToPhotosAlbum({
                filePath: downloadRes.tempFilePath
              })
            } else {
              util.showModel('用户未授权', e.detail.errMsg);
            }
          }
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '下载失败',
          duration: 500
        })
      },
      complete: function (res) { },
    })
  },
  tapImage: function (e) {
    wx.navigateTo({
      url: '/pages/item/item?id=' + e.target.id,
    })
  },
  collctorTap: function (e) {
    this.checkSession();
    var that = this;

    var requestData = { sourceId: this.data.image.id, imgUri: this.data.image.uri };
    var option = {
      url: config.service.collectionAddUrl,
      login: true,
      method: 'POST',
      data: requestData,
      success(result) {
        util.showSuccess('收藏成功')
        that.setData({
          isCollected: true,
          collected: "fa-heart"
        })
      },
      fail(error) {
        util.showModel('收藏失败,请检查网络', error);
      }
    }

    var cancelOption = {
      url: config.service.collectionRemoveUrl,
      login: true,
      method: 'POST',
      data: requestData,
      success(result) {
        util.showSuccess('取消成功')
        that.setData({
          isCollected: false,
          collected: "fa-heart-o"
        })
      },
      fail(error) {
        util.showModel('取消失败,请检查网络', error);
      }
    }
    if (this.data.isCollected) {
      qcloud.request(cancelOption)
    } else {
      qcloud.request(option)
    }

  },
  checkSession: function () {
    // 查看是否授权
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 检查登录是否过期
          wx.checkSession({
            success: function () {
            },
            fail: function () {
              qcloud.clearSession();
              wx.showToast({
                title: '请重新登录',
              });
              setTimeout(function () {
                wx.switchTab({
                  url: '/pages/mine/mine',
                })
              }, 1000)
            },
          });
        } else {
          wx.showToast({
            title: '请重新登录',
          });
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/mine/mine',
            })
          }, 1000)
        }
      }
    });
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
        var similar = [];
        //TODO SET DATA
        for (var i = 0; i < res.data.similar.length; i++) {
          var uri = res.data.similar[i].uri;
          similar.push({ id: res.data.similar[i].id, url: config.properties.imageHost + uri + config.properties.imageType })
        }
        var image = { id: res.data.id, url: config.properties.imageHost + res.data.uri + config.properties.imageType, uri: res.data.uri };

        self.setData({ image: image, similar: similar });
      },
      fail: function (err) {
        wx.showToast({
          title: '加载失败',
          duration: 500
        })
      }
    })
  },
  toHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  previewImage: function () {
    wx.previewImage({
      current: this.data.image.url,
      urls: [this.data.image.url]
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '大家都在用的图片搜索神器！百万高清图片等你来搜！',
      path: '/pages/item/item?id=' + this.data.image.id
    }
  }
})