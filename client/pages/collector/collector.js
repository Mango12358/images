// pages/collector/collector.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [{
      url: "../index/1.jpg"
    }, {
      url: "../index/1.jpg"
    }, {
      url: "../index/1.jpg"
    }, {
      url: "../index/1.jpg"
    }]
  },
  getCollections: function () {
    var that = this;
    this.checkSession();
    var requestData = {}
    var option = {
      url: config.service.collectionGetUrl,
      login: true,
      method: 'POST',
      data: requestData,
      success(result) {
        util.showSuccess('请求成功完成')
        console.log('request success', result)
        that.setData({
          requestResult: JSON.stringify(result.data)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(option)
  },
  checkSession: function () {
    // 查看是否授权
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          var userInfo;
          wx.getUserInfo({
            success:function(info){
              console.log(info);
              userInfo = info;
            }
          })
          // 检查登录是否过期
          wx.checkSession({
            success: function () {
              // 登录态未过期
              // that.setData({
              //   userInfo: userInfo,
              //   logged: true
              // })
              
            },

            fail: function () {
              qcloud.clearSession();
              // 登录态已过期，需重新登录
              var options = {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                userInfo: userInfo
              }
              wx.showToast({
                title: '请重新登录',
              });
              var switchTab = function(){
                wx.switchTab({
                  url: '/pages/mine/mine',
                })
              }
              setTimeout(switchTab, 1000)
            },
          });
        } else {
          wx.showToast({
            title: '请重新登录',
          });
          var switchTab = function () {
            wx.switchTab({
              url: '/pages/mine/mine',
            })
          }
          setTimeout(switchTab, 1000)
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCollections();
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
        var header = {};
        header[constants.WX_HEADER_CODE] = loginResult.code;
        header[constants.WX_HEADER_ENCRYPTED_DATA] = options.encryptedData;
        header[constants.WX_HEADER_IV] = options.iv;

        console.log(loginParams)
        wx.request({
          url: config.service.loginUrl,
          data: loginParams,
          header: header,
          success: function () {
            util.showSuccess('登录成功');
            that.setData({
              userInfo: options.userInfo,
              logged: true
            })
          },
          fail: function (error) {
            util.showModel('登录失败', error)
            console.log('登录失败', error)
          }
        })
      },
      fail: function (loginError) {
        util.showModel('登录失败', loginError)
        console.log('登录失败', loginError)
      },
    });
  }
})