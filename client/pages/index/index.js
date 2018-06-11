//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const typeMap = {
  "2": "旅游",
  "3": "风景",
  "4": "地标",
  "5": "动物",
  "6": "科技"
}

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    menuList: [{ image: 'mq.jpg', label: "每日精选", url: "/pages/list/list?" }, { image: 'mq.jpg', label: "热门图片", url: "/pages/list/list?" }, { image: 'mq.jpg', label: "搜索", url: "/pages/search/search" }, { image: 'mq.jpg', label: "搞笑幽默", url: "/pages/search/search", target: "mini", appId: "appId" }, { image: 'mq.jpg', label: "赞赏", url: "/pages/search/search", target: "mini", appId: "appId" }],
    tabList: [{ id: '1', title: "精选" }, { id: '2', title: "旅游" }, { id: '3', title: "风景" }, { id: '4', title: "地标" }, { id: '5', title: "动物" }, { id: '6', title: "科技" }],
    swiperUrls: config.properties.swiperImages,
    showImageData: {
      images: [],
      id: "1"
    },
    currentTabId: "1",
    imageData: {},
    loading: false
  },
  onShareAppMessage: function (res) {
    // if (res.from === 'button') {
    //   console.log(res.target)
    // }
    return {
      title: '大家都在用的图片搜索神器！百万高清图片等你来搜！',
      path: '/pages/index/index',
      imageUrl: "./1.jpg"
    }
  },
  loadMore: function () {
    var self = this;

    this.setData({ loading: true });

    var queryData = {};
    if (this.data.currentTabId == "1") {
      queryData.choice = true;
    } else {
      queryData.type = typeMap[this.data.currentTabId];
    }
    var page = 0;
    if (this.data.imageData[this.data.currentTabId] != undefined) {
      page = this.data.imageData[this.data.currentTabId].page + 1;
    }
    queryData.page = page;

    wx.request({
      url: config.service.imageQueryUrl,
      method: "POST",
      data: queryData,
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log(self.data)
        var tmp = self.data.imageData[self.data.currentTabId];
        if (tmp == undefined) {
          tmp = { page: 0, images: [] };
        }

        var newData = [];
        for (var i = 0; i < res.data.length; i++) {
          var uri = res.data[i].cos_uri;
          newData.push({ id: res.data[i].id, url: config.properties.imageHost + uri })
        }
        tmp.page = page;
        tmp.images = tmp.images.concat(newData);
        console.log(tmp)

        var t = {};
        var key = "imageData." + self.data.currentTabId
        t[key] = tmp;

        var showDataTmp = self.data.showImageData;
        showDataTmp.images = tmp.images;
        showDataTmp.id = self.data.currentTabId;
        console.log(showDataTmp)
        t["showImageData"] = showDataTmp;
        self.setData(t);
        self.setData({ loading: false });
      },
      fail: function (err) {
        wx.showToast({
          title: '加载失败，请重试',
          duration: 500
        })
        self.setData({ loading: false });
      }
    })

  },
  handleTabChange: function (e) {
    console.log(e)
    var selectedId = e.detail;
    if (this.data.currentTabId == selectedId) {
      return
    } else {
      this.setData({ currentTabId: selectedId })
      if (this.data.imageData[selectedId] != undefined && this.data.imageData[selectedId].images.length > 0) {
        var showDataTmp = this.data.showImageData;
        showDataTmp.images = this.data.imageData[selectedId].images;
        showDataTmp.id = this.data.currentTabId;
        this.setData({ showImageData: showDataTmp });
      } else {
        this.loadMore();
      }
    }
  },
  tapSearch: function () {
    wx.navigateTo({ url: '/pages/search/search' });
  },
  menuTap: function (e) {
    console.log(e)
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
  },

  // 切换是否带有登录态
  switchRequestMode: function (e) {
    this.setData({
      takeSession: e.detail.value
    })
    this.doRequest()
  },

  doRequest: function () {
    util.showBusy('请求中...')
    var that = this
    var options = {
      url: config.service.requestUrl,
      login: true,
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
    if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
      qcloud.request(options)
    } else {    // 使用 wx.request 则不带登录态
      wx.request(options)
    }
  },


  // 预览图片
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
    })
  },
  onLoad: function () {
    this.loadMore();
  },
  tapImage: function (e) {
    wx.navigateTo({
      url: '/pages/item/item?id=' + e.target.id,
    })
  }
})
