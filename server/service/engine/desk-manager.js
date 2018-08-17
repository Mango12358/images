var events = require('events');
var Desk = require('./desk.js');

var instance = null;

function DeskManager() {
    this.userDeskMap = {};
    this.desks = [];

}

DeskManager.prototype.createDesk = function (type, users, baseScore, baseGold, room) {
    var desk = new Desk(type, users, baseScore, baseGold, room);
    for (var i = 0; i < users.length; i++) {
        if (this.userDeskMap[users[i].userId] !== undefined) {
            this.userDeskMap[users[i].userId].disableUser(users[i].userId);
        }
        this.userDeskMap[users[i].userId] = desk;
        users[i].emitHandsUp("handsUp")
    }
}

function getInstance() {
    if (instance == null) {
        instance = new DeskManager();
    }
    return instance;
}


module.exports = {getInstance};