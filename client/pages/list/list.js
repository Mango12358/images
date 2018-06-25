// pages/list/list.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    currentPage: 0,
    showLoadMore: true,
    listInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var useOptions = {};
    console.log(options)
    if (Object.getOwnPropertyNames(options).length > 0) {
      useOptions = options;
    } else {
      useOptions = getApp().globalQuery
    }
    var data = { startPage: 0 };
    if (useOptions.picset != undefined) {
      data.picset = useOptions.picset
    }
    if (useOptions.startPage != undefined) {
      data.startPage = useOptions.startPage
    }
    if (useOptions.type != undefined) {
      data.type = useOptions.type
    }
    if (useOptions.choice != undefined) {
      data.choice = useOptions.choice
    }
    if (useOptions.picsetId != undefined) {
      data.picsetId = useOptions.picsetId
    }

    if (useOptions.title != undefined) {
      data.title = useOptions.title
    }

    this.setData({
      currentPage: data.startPage,
      listInfo: data,
      showLoadMore: !data.picset
    })
    if (data.title != undefined) {
      wx.setNavigationBarTitle({
        title: data.title,
      })
    }
    this.loadMore();
  },
  imageTap: function (e) {
    wx.navigateTo({
      url: '/pages/item/item?id=' + e.target.id,
    })
  },
  loadMore: function () {
    var self = this;
    this.setData({ loading: true });

    var queryData = {};
    queryData.page = self.data.currentPage;

    if (self.data.listInfo.picset && self.data.listInfo.picsetId != undefined) {
      queryData.picsetId = self.data.listInfo.picsetId;
    } else {
      if (self.data.listInfo.type != null) {
        queryData.type = self.data.listInfo.type;
      }
      if (self.data.listInfo.choice != null) {
        queryData.choice = self.data.listInfo.choice;
      }
    }

    wx.request({
      url: config.service.imageQueryUrl,
      method: "POST",
      data: queryData,
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(self.data)

        var newData = [];
        for (var i = 0; i < res.data.length; i++) {
          var uri = res.data[i].cos_uri;
          newData.push({ id: res.data[i].id, url: config.properties.imageHost + uri + config.properties.imageType })
        }
        var images = self.data.imgUrls;
        images = images.concat(newData);

        self.setData({ imgUrls: images, currentPage: self.data.currentPage + 1 });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '大家都在用的图片搜索神器！百万高清图片等你来搜！',
      path: '/pages/index/index',
      imageUrl: "/pages/index/1.jpg"
    }
  }
})