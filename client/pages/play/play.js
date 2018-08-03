// pages/play/play.js
const Dialog = require('../../zanui/dist/dialog/dialog');
var calculate = require('../../utils/calculate.js')
var levels = require('../../utils/levels.js')
var util = require('../../utils/util.js')
const KeyLevel = "Level"
const KeyHelp = "Help"
const KeyLastAddHelp = "LastAddHelp"
var Page = require('../../utils/xmadx_sdk.min.js').xmad(Page).xmPage;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    guid: 3,
    current: {
      level: 1,
      move: 5,
      target: 30,
      value: "5678",
      commands: []
    },
    xmad: {
      adData: {},
      ad: {
        banner: "xmf38879e095cbdf5cbddc0707ebb047",
        insert: "xm5f42be0e852d5805e43d3dd7947d66",
        fixed: "xma93f0e0f293d0e56c6d6d33f1e3763"
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initLevel()
    wx.showShareMenu({
      // 是否使用带 shareTicket 的转发
      withShareTicket: true
    })
  },
  nextLevel: function () {
    console.log(this.data)
    var next = this.data.current.level + 1;
    wx.setStorageSync(KeyLevel, next);
    this.setData({ current: levels.get(next) });
    this.setCommandShowValue()
    this.showGuid();
  },
  setLevel: function (index) {
    var next = index;
    wx.setStorageSync(KeyLevel, next);
    this.setData({ current: levels.get(next) });
    this.setCommandShowValue()
  },
  resetLevel: function () {
    this.setData({ current: levels.get(this.data.current.level) })
    this.setCommandShowValue()
  },
  initLevel: function () {
    var lastLevel = wx.getStorageSync(KeyLevel)
    if (lastLevel == undefined || lastLevel <= 0) {
      lastLevel = 1;
      wx.setStorageSync(KeyLevel, lastLevel);
    }
    this.setData({ current: levels.get(lastLevel) })
    this.setCommandShowValue()
    this.showGuid();
  },
  longAction: function (e) {
    var index = parseInt(e.target.id);
    var commands = this.data.current.commands;
    var command = commands[index];
    if (command.op == "存储") {
      command = calculate.store(this.data.current.value, command)
      commands[index] = command;
      this.setData({ "current.commands": commands, "current.move": this.data.current.move - 1 })
      this.setCommandShowValue()
    }
  },
  action: function (e) {
    var index = parseInt(e.target.id);
    console.log(index)
    var commands = this.data.current.commands;
    var command = commands[index];
    console.log(command)
    if (command.op == "[+]") {
      commands = calculate.up(command.num, commands)
      this.setData({ "current.commands": commands, "current.move": this.data.current.move - 1 })
      this.setCommandShowValue()
    } else if (command.op == "[-]") {
      commands = calculate.up('' + command.num, commands)
      this.setData({ "current.commands": commands, "current.move": this.data.current.move - 1 })
      this.setCommandShowValue()
    } else if (command.op == "存储") {
      if (command.num == undefined) return;
      var tmpValue = String(calculate.cal(this.data.current.value, command.num))
      var tmpIndex = tmpValue.indexOf(".");
      if (tmpIndex > 0) {
        tmpValue = tmpValue.substring(0, index + 2);
      }
      this.setData({ "current.value": tmpValue, "current.move": this.data.current.move - 1 })
    } else {
      var tmpValue = String(calculate.cal(this.data.current.value, (command.op + (command.num == undefined ? '' : command.num))))
      var tmpIndex = tmpValue.indexOf(".");
      if (tmpIndex > 0) {
        tmpValue = tmpValue.substring(0, index + 2);
      }
      this.setData({ "current.value": tmpValue, "current.move": this.data.current.move - 1 })
    }
    if (this.data.current.fCommand != undefined && this.data.current.fCommand.op != undefined && this.data.current.fCommand.num != undefined) {
      while (this.data.current.value.length > parseInt(this.data.current.fCommand.num)) {
        util.sleep(200)
        var tmpValue = String(calculate.cal(this.data.current.value, (this.data.current.fCommand.op)))
        this.setData({ "current.value": tmpValue })
      }
    }
    this.checkSuccess();
  },
  setCommandShowValue: function () {
    var commands = this.data.current.commands;
    if (this.data.current.showIndex == undefined) {
      var showIndex = [];
      for (var i = 0; i < commands.length; i++) {
        var tmpIndex = Math.abs(util.hash(JSON.stringify(commands[i]))) % 6;
        console.log("test", tmpIndex)
        for (var j = tmpIndex; j < 6; j = (1 + j) % 6) {
          if ((j + 1) % 6 == tmpIndex) break;
          if (showIndex[j] == undefined) {
            showIndex[j] = i;
            break;
          }
        }
      }
    }
    for (var i = 0; i < commands.length; i++) {
      if (commands[i].op == "存储") {
        commands[i].show = commands[i].num == undefined ? commands[i].op : commands[i].num;
      } else {
        commands[i].show = commands[i] != undefined ? commands[i].op + (commands[i].num == undefined ? '' : commands[i].num) : ''
      }

      if (commands[i].op == "存储") {
        commands[i].color = "purple"
      } else if (commands[i].op == "<<" || commands[i].op == "" || commands[i].op == undefined) {
        commands[i].color = "blue"
      } else if (commands[i].op == "镜像" || commands[i].op == "+/-") {
        commands[i].color = "pink"
      } else if (commands[i].op == "翻转" || commands[i].op == "10转" || commands[i].op == "求和") {
        commands[i].color = "orangeRed"
      } else if (commands[i].op == "左移" || commands[i].op == "右移" || commands[i].op == "X^2" || commands[i].op == "X^3") {
        commands[i].color = "green"
      } else {
        commands[i].color = "orange"
      }
      if (commands[i].show.length >= 5) {
        commands[i].small = "icon-small";
      }

    }
    if (this.data.current.fCommand != undefined) {
      this.setData({ 'current.fs': 'f' + this.data.current.fCommand.op.charAt(1), 'current.fe': 'f' + this.data.current.fCommand.op.charAt(2) })
    }

    this.setData({ 'current.commands': commands, "current.showIndex": showIndex })
    console.log(this.data)
  },
  showGuid: function () {
    var x = levels.getGuid(this.data.current.level);
    if (x != undefined) {
      Dialog({
        title: '游戏规则',
        message: x,
        selector: '#dialog',
        buttons: [{
          text: 'So Easy',
          color: 'gray',
          type: 'next'
        }, {
          text: '试一下',
          color: 'red',
          type: 'go'
        }]
      }).then((res) => {
      })
    }
  },
  checkSuccess: function () {
    if (this.data.current.value == this.data.current.target) {
      this.showSuccess();
    } else if (this.data.current.move <= 0) {
      this.showFailed();
    }
  },
  parseCommand: function (command) {
    return 'pink';
  },
  showSuccess: function () {
    Dialog({
      title: '挑战成功',
      message: '太简单了，So Easy.',
      selector: '#dialog',
      buttons: [{
        text: '下一关',
        color: 'gray',
        type: 'next'
      }, {
        text: '分享',
        color: 'red',
        type: 'share',
        openType: 'share'
      }]
    }).then((res) => {
      if (res.type == "next") {
        this.nextLevel()
      }
    })
  },
  touchstart: function (e) {
    let that = this;
    that.setData({
      touchStart: e.timeStamp
    })
  },
  touchend: function (e) {
    let that = this;
    that.setData({
      touchEnd: e.timeStamp
    })
  },
  touch: function (e) {
    if (this.data.touchEnd - this.data.touchStart > 350) {
      this.longAction(e)
    } else {
      this.action(e);
    }
  },
  showFailed: function () {
    Dialog({
      title: '挑战失败',
      message: '哎呀妈呀，手抖了！',
      selector: '#dialog',
      buttons: [{
        text: '重新开始',
        color: 'gray',
        type: 'restart'
      }, {
        text: '求助',
        color: 'red',
        type: 'share',
        openType: 'share'
      }]
    }).then((res) => {
      if (res.type == "restart") {
        this.resetLevel()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  help: function () {
    var helpTimes = wx.getStorageSync(KeyHelp)
    if (isNaN(parseInt(helpTimes))) {
      helpTimes = "3";
      wx.setStorageSync(KeyHelp, helpTimes);
    }
    if (parseInt(helpTimes) > 0) {
      wx.setStorageSync(KeyHelp, (parseInt(helpTimes) - 1)) + "";
      var helpInfo = "";
      var count = 0;
      if (this.data.current.results.length > 5) {
        count = 2;
      } else {
        count = 1;
      }
      // var count = this.data.current.results.length;
      for (var i = 0; i < count; i++) {
        helpInfo += "第" + (i + 1) + "步:" + this.data.current.commands[this.data.current.results[i]].show + '\n';
      }

      Dialog({
        title: '提示信息',
        message: helpInfo,
        selector: '#dialog',
        buttons: [{
          text: 'So Easy',
          color: 'gray',
          type: 'restart'
        }, {
          text: '分享',
          color: 'red',
          type: 'share',
          openType: 'share'
        }]
      }).then((res) => {
        if (res.type == "restart") {
          this.resetLevel()
        }
      })
    } else {
      Dialog({
        title: '提示信息',
        message: '提示机会用完了，分享获取提示！',
        selector: '#dialog',
        buttons: [{
          text: '关闭',
          color: 'gray',
          type: 'qiuzhu'
        }, {
          text: '分享',
          color: 'red',
          type: 'share',
          openType: 'share'
        }]
      })
    }
  },
  addHelpTime: function () {
    var helpTimes = wx.getStorageSync(KeyHelp)
    if (isNaN(parseInt(helpTimes))) {
      helpTimes = "3";
      wx.setStorageSync(KeyHelp, helpTimes);
    }
    var last = wx.getStorageSync(KeyLastAddHelp)
    if (isNaN(parseInt(last))) {
      last = "0";
      wx.setStorageSync(KeyLastAddHelp, last);
    }
    var date = new Date().getTime()
    if (date - parseInt(last) < 1000 * 60 * 10) {
      return;
    }

    if (parseInt(helpTimes) < 5) {
      wx.setStorageSync(KeyHelp, String(parseInt(helpTimes) + 1));
      wx.setStorageSync(KeyLastAddHelp, String(date));
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    var that = this;
    if (res.from === 'button') {
      if (res.target.id === 'help') {
        return {
          title: '[有人@你]这关过不去了！求各位帮帮忙吧！',
          path: '/pages/index/index',
          success: function (res) {
            var shareTicket = (res.shareTickets && res.shareTickets[0]) || ''
            if (res.shareTickets != undefined && res.shareTickets[0] != undefined) {
              that.addHelpTime();
              util.showSuccess("分享成功")
            } else {
              util.showModel("分享失败", "请分享到微信群")
            }
          }
        }
      }
      return {
        title: '[有人@你]我已经闯' + this.data.current.level + '关了！不服来战！',
        path: '/pages/index/index',
        success: function (res) {
          var shareTicket = (res.shareTickets && res.shareTickets[0]) || ''
          if (res.shareTickets != undefined && res.shareTickets[0] != undefined) {
            that.addHelpTime();
            util.showSuccess("分享成功")
          } else {
            util.showModel("分享失败", "请分享到微信群")
          }
        }
      }
    } else {
      return {
        title: '[有人@你]这关过不去了！求各位帮帮忙吧！',
        path: '/pages/index/index'
      }
    }
  }
})