// pages/index/search.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    history: [],
    hot: ['云彩', '天空', '海', '旅游', '度假', '高山', '瀑布', '落日'],
    imgUrls: [],
    searched: false,
    query: "",
    page: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var h = wx.getStorageSync("history");
    console.log(h)
    if (h != undefined && h != "") {
      if (h.length > 8) {
        h.splice(0, h.length - 8);
      }
      this.setData({ history: h })
    }
  },

  searchTap: function (options) {
    var that = this;
    var query = wx.createSelectorQuery()
    query.select('#input').fields({
      properties: ['value']
    }, function (res) {
      console.log(res.value)
      if (res.value == "") return;
      var hh = that.data.history;
      console.log(hh)
      hh.push(res.value);
      if (hh.length > 8) {
        hh.splice(0, hh.length - 8);
      }
      wx.setStorageSync("history", hh)
      that.setData({ history: hh, page: 0, query: res.value, searched: true, imgUrls: [] })
      that.data.imgUrls=[];
      that.loadMore()
    }).exec()
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
    queryData.query = self.data.query;
    queryData.page = self.data.page;

    wx.request({
      url: config.service.imageQueryUrl,
      method: "POST",
      data: queryData,
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var tmp = self.data.imgUrls;
        var newData = [];
        for (var i = 0; i < res.data.length; i++) {
          var uri = res.data[i].cos_uri;
          // uri = res.data[i].source_id + ".jpg"
          newData.push({ id: res.data[i].id, url: config.properties.imageHost + uri + config.properties.imageType })
        }
        tmp = tmp.concat(newData);

        console.log(tmp)
        self.setData({ imgUrls: tmp, page: self.data.page + 1 });
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
  historyTap: function (e) {
    this.setData({ query: e.target.id, page: 0, searched: true })
    this.loadMore()
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