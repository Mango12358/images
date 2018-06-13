// pages/mine/mine.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad:function(){
    var that = this;
    wx.checkSession({
      success: function () {
        // 登录态未过期
        wx.getUserInfo({
          success: function (userInfo) {
            // 登录态未过期
            console.log(userInfo)
            that.setData({
              userInfo: JSON.parse(userInfo.rawData),
              logged: true
            })
          }
        })
      },
      fail: function () {
        qcloud.clearSession();
      },
    });
  },
  onShareAppMessage: function (res) {
    // if (res.from === 'button') {
    //   console.log(res.target)
    // }
    return {
      title: '大家都在用的图片搜索神器！百万高清图片等你来搜！',
      path: '/pages/index/index',
      imageUrl: "/pages/index/1.jpg"
    }
  },
  bindGetUserInfo: function (e) {
    if (this.data.logged) return;

    util.showBusy('正在登录');

    var that = this;
    var userInfo = e.detail.userInfo;

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {

          // 检查登录是否过期
          wx.checkSession({
            success: function () {
              // 登录态未过期
              util.showSuccess('登录成功');
              that.setData({
                userInfo: userInfo,
                logged: true
              })
            },

            fail: function () {
              qcloud.clearSession();
              // 登录态已过期，需重新登录
              var options = {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                userInfo: userInfo
              }
              that.doLogin(options);
            },
          });
        } else {
          util.showModel('用户未授权', e.detail.errMsg);
        }
      }
    });
  },

  doLogin: function (options) {
    var that = this;

    wx.login({
      success: function (loginResult) {
        var loginParams = {
          code: loginResult.code,
          encryptedData: options.encryptedData,
          iv: options.iv,
        }
        qcloud.requestLogin({
          loginParams, success() {
            util.showSuccess('登录成功');

            that.setData({
              userInfo: options.userInfo,
              logged: true
            })
          },
          fail(error) {
            util.showModel('登录失败', error)
            console.log('登录失败', error)
          }
        });
      },
      fail: function (loginError) {
        util.showModel('登录失败', loginError)
        console.log('登录失败', loginError)
      },
    });
  }
})