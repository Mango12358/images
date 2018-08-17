var events = require('events');

function User() {
    this.userId = "";
    this.userInfo = {};
    this.userGameInfo = {};
    this.userTunnelInfo = {};
    this.userIsAI = false;
    this.userEvent = new events.EventEmitter();
}

User.prototype.on = function (event, handler) {
    this.userEvent.on(event, handler);
}

User.prototype.emitMessage = function (message) {
    this.userEvent.emit("message", this, message);
}

User.prototype.emitHandsUp = function (message) {
    this.userEvent.emit("handsUp", this, message);
}

User.prototype.emitCloseTunnel = function () {
    this.userEvent.emit("close", this);
}

User.prototype.emitLeaveDesk = function () {
    this.userEvent.emit("leaveDesk", this);
}

User.prototype.removeAllListener = function () {
    this.userEvent.removeAllListeners();
}

User.prototype.pushData = function (data) {
    console.log("PushData",this.userId,data)
}

User.prototype.addGold = function (data) {
    console.log("addGold",this.userId,data)
}
User.prototype.addScore = function (data) {
    console.log("addScore",this.userId,data)
}
User.prototype.subGold = function (data) {
    console.log("subGold",this.userId,data)
}
User.prototype.subScore = function (data) {
    console.log("subScore",this.userId,data)
}

User.prototype.isAI = function () {
    return this.userIsAI;
}

module.exports = User;