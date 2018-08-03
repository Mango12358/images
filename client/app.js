//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')
var App = require('./utils/xmadx_sdk.min.js').xmad(App, 'App').xmApp;

App({
  onLaunch: function (options) {
    qcloud.setLoginUrl(config.service.loginUrl)
    this.globalQuery = options.query;
  },
  globalQuery: {}
})