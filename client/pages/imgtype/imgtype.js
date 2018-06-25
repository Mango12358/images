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
    console.log(e)
    wx.navigateTo({
      url: '/pages/list/list?type=' + e.currentTarget.id
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})