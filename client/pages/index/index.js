//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var calculate = require('../../utils/calculate.js')
const Dialog = require('../../zanui/dist/dialog/dialog');
const KeyLevel = "Level"
var Page = require('../../utils/xmadx_sdk.min.js').xmad(Page).xmPage;

qcloud.setLoginUrl(config.service.loginUrl);

Page({
  data: {
    userInfo: {},
    logged: false,
    loading: false,
    miniApp:{
      appId:"wx6ba1ad7ef1f10fda",
      path:"/pages/index/index",
      extra:""
    },
    xmad: {
      adData: {},
      ad: {
        banner: "xma7dcf2a83e7da84badc0356ea8069a", 
        insert: "xm5f42be0e852d5805e43d3dd7947d66", 
        fixed: "xmf3e3e75586cd3e9a50c55cf6fa284c" 
      }
    }
  },
  loadAppId:function(){
    var that = this;
    wx.request({
      url: 'https://oss.nhjoke.xyz/to/appid.json',
      success:function(res){
        that.setData({"miniApp":res.data})
      }
    })
  },
  reward1: function () {
    Dialog({
      title: '领取奖励',
      message: '您还未邀请到10为好友，快去邀请好友吧！',
      selector: '#dialog',
      buttons: [{
        text: '关闭',
        color: 'gray',
        type: 'next'
      }, {
        text: '邀请好友',
        color: 'red',
        type: 'go',
        openType: 'share'
      }]
    })
  },
  reward50: function () {
    Dialog({
      title: '领取奖励',
      message: '您还未达到领取条件，加油哟！',
      selector: '#dialog',
      buttons: [{
        text: '关闭',
        color: 'gray',
        type: 'next'
      }, {
        text: '分享',
        color: 'red',
        type: 'go',
        openType: 'share'
      }]
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '[有人@你]我已经闯' + this.data.level + '关了！不服来战！',
      path: '/pages/index/index'
    }
  },
  tapPlaySingle: function () {
    wx.navigateTo({
      url: '/pages/play/play',
    })
  },
  bindGetUserInfo: function (res) {
    if (this.data.logged) return
    this.setData({ userInfo: res.detail.userInfo, logged: true })
    // const session = qcloud.Session.get()
    // if (session) {
    //   // 第二次登录
    //   // 或者本地已经有登录态
    //   // 可使用本函数更新登录态
    //   qcloud.loginWithCode({
    //     success: res => {
    //       this.setData({ userInfo: res, logged: true })
    //       console.log(res)
    //     },
    //     fail: err => {
    //       console.error(err)
    //     }
    //   })
    // } else {
    //   // 首次登录
    //   qcloud.login({
    //     success: res => {
    //       this.setData({ userInfo: res, logged: true })
    //     },
    //     fail: err => {
    //       console.error(err)
    //     }
    //   })
    // }
  },
  onLoad: function () {
    wx.getUserInfo({
      success: res => {
        this.setData({ userInfo: res.userInfo, logged: true })
      },
      fail: res => {
        console.log(res)
      }
    })
    var lastLevel = wx.getStorageSync(KeyLevel)
    if (lastLevel == undefined || lastLevel <= 0) {
      lastLevel = 1;
      wx.setStorageSync(KeyLevel, lastLevel);
    }
    this.setData({ level: lastLevel })
    this.loadAppId();
  }

})


function A(){
  this.a = "a"
}
A.prototype.getA = function(){
  return this.a;
}
console.log(new A().getA())