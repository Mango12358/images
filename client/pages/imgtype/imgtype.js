// pags/imgtype/imgtype.js
var config = require('../../config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperUrls: config.properties.swiperImages,
    images: [{
      url: "../index/1.jpg",
      name: "风景"
    }, {
      url: "../index/2.jpg",
      name: "旅游"
    }, {
      url: "../index/1.jpg",
      name: "建筑"
    }, {
      url: "../index/2.jpg",
      name: "动物"
    }, {
      url: "../index/2.jpg",
      name: "美食"
    }, {
      url: "../index/2.jpg",
      name: "交通"
    }, {
      url: "../index/2.jpg",
      name: "教育"
    }, {
      url: "../index/2.jpg",
      name: "背景"
    }, {
      url: "../index/2.jpg",
      name: "音乐"
    }, {
      url: "../index/2.jpg",
      name: "运动"
    }]
  },

  tapItem: function (e) { 
    wx.navigateTo({
      url: '/pages/list/list?type=' + e.target.id,
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