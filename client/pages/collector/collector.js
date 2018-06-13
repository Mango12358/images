// pages/collector/collector.js

var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [],
    isLogin: false
  },
  getCollections: function () {
    var that = this;
    this.checkSession();
    var option = {
      url: config.service.collectionGetUrl,
      login: true,
      method: 'POST',
      data: {},
      success(result) {
        // util.showSuccess('请求成功完成')
        console.log('request success', result)
        var tmp = []
        for (var sid in result.data.sources) {
          var t = {};
          t["url"] = config.properties.imageHost + result.data.sources[sid].imgUri + config.properties.imageType;
          t["id"] = sid;
          tmp.push(t);
        };
        that.setData({
          images: tmp
        })
      },
      fail(error) {
        util.showModel('请求失败,请检查网络', error);
        console.log('request fail', error);
      }
    }
    qcloud.request(option)
  },
  tapImage:function(e){
    wx.navigateTo({
      url: '/pages/item/item?id=' + e.target.id,
    })
  },
  checkSession: function () {
    // 查看是否授权
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          var userInfo;
          wx.getUserInfo({
            success: function (info) {
              userInfo = info;
            }
          })
          // 检查登录是否过期
          wx.checkSession({
            success: function () {
              that.setData({ isLogin: true })
            },
            fail: function () {
              qcloud.clearSession();
              wx.showToast({
                title: '请重新登录',
              });
            },
          });
        } else {
          wx.showToast({
            title: '请重新登录',
          });
        }
      }
    });
  },
  tologin: function () {
    wx.switchTab({
      url: '/pages/mine/mine',
    })
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