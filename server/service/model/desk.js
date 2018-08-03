var events = require('events');
var cards = require('./card.js');

function leftBeishu(leftCards) {
    if (leftCards.length != 3) return 1;

    if (leftCards[0].getType() == leftCards[1].getType() && leftCards[0].getType() == leftCards[2].getType()) {
        return 3;//同花
    }
    var tmp = leftCards.sort(cards.cardComparable);
    if (tmp[0].getValue() == tmp[1].getValue() && tmp[2].getValue() == tmp[1].getValue()) {
        return 3;//3张
    } else if (tmp[0].getValue() == tmp[1].getValue() || tmp[2].getValue() == tmp[1].getValue()) {
        return 2;//2张
    } else if (tmp[1].getValue() - tmp[0].getValue() == 1 && tmp[2].getValue() - tmp[1].getValue() == 1) {
        return 3;//顺子
    }
    var jokerCount = 0;
    for (var i = 0; i < 3; i++) {
        if (tmp[i].isJoker()) {
            jokerCount += 1;
        }
    }
    if (jokerCount == 1) {
        return 2;
    } else if (jokerCount == 2) {
        return 3;
    }
    return 1;
}

function shuffle(input) {
    for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
}

function Desk(type, users, baseScore, baseGold, room) {
    this.deskInfo = {};
    this.playInfo = {};
    this.usersInfo = {};

    this.deskInfo.type = type;
    this.deskInfo.room = room;
    this.deskInfo.baseGold = baseGold;
    this.deskInfo.baseScore = baseScore;
    this.deskInfo.baseBeishu = 1;

    this.usersInfo.users = users;
    this.userinfo.userStatus = [];

    this.playInfo.orders = [];
    this.playInfo.cards = {};
    this.playInfo.steps = {};
    this.playInfo.steps.fapai = {};
    this.playInfo.steps.mingpai = {};
    this.playInfo.steps.qiangdizhu = {};
    this.playInfo.steps.jiabei = {};
    this.playInfo.steps.chupai = {};
    this.playInfo.steps.jiesuan = {};
    this.playInfo.steps.current = {type: "init", step: this.playInfo.steps.fapai};

    this.event = new events.EventEmitter();
}

Desk.prototype.broadcast = function () {
    for (var i = 0; i < this.usersInfo.users.length; i++) {
        var data = {};
        //TODO user info
        data.users = this.usersInfo.users;
        if (this.playInfo.steps.current.type == "fapai") {
            data.playInfo = JSON.parse(JSON.stringify(this.playInfo.steps.current))
            data.playInfo.step.userCards = data.playInfo.step.cards[i];
            data.playInfo.step.cards = {};
            data.playInfo.step.leftCards = {};
        } else {
            data.playInfo = this.playInfo.steps.current;
        }
        this.usersInfo.users[i].pushData(data);
    }
}

Desk.prototype.listen = function (event, handler) {
    this.event.on(event, handler)
}

Desk.prototype.start = function () {
    this.init();
    this.event.emit('start');
    var deskCards = shuffle(cards.getPokes());
    this.playInfo.steps.fapai.leftCards = deskCards.slice(0, 3);
    this.playInfo.steps.fapai.cards = [deskCards.slice(3, 20), deskCards.slice(20, 37), deskCards.slice(37, 54)];
    this.playInfo.steps.current = {type: "fapai", step: this.playInfo.steps.fapai};
    this.event.emit('fapai');
    this.event.emit('broadcast');
    setTimeout(function () {
        if (this.playInfo.steps.current.type == "fapai") {
            this.playInfo.steps.current = {type: "mingpai", step: this.playInfo.steps.mingpai};
            this.event.emit('mingpai');
            this.event.emit('broadcast');
        } else if (this.playInfo.steps.current.type == "mingpai") {
            this.orderQiangdizhu({type: "start"})
        }
    }, 8000)
}


Desk.prototype.reset = function () {
    this.playInfo.orders = [];
    this.playInfo.cards = {};
    this.playInfo.steps = {};
    this.playInfo.steps.fapai = {};
    this.playInfo.steps.mingpai = {};
    this.playInfo.steps.qiangdizhu = {};
    this.playInfo.steps.jiabei = {};
    this.playInfo.steps.chupai = {};
    this.playInfo.steps.jiesuan = {};
    this.playInfo.steps.current = {type: "init", step: this.playInfo.steps.fapai};
    this.event.emit('reset');
    this.start();
}

Desk.prototype.orderMingpai = function (order) {
    if (this.playInfo.steps.current.type != "fapai") {
        throw new Error("不是发牌阶段");
    }
    var userIndex = 0;
    for (var i = 0; i < this.usersInfo.users.length; i++) {
        if (this.usersInfo.users[i] == order.user) {
            userIndex = i;
            break;
        }
    }
    if (this.playInfo.steps.mingpai.data == undefined) {
        this.playInfo.steps.mingpai.data = [];
    }
    for (var i = 0; i < this.playInfo.steps.mingpai.data.length; i++) {
        if (this.playInfo.steps.mingpai.data[i].index == userIndex) {
            return;
        }
    }
    //TODO user info
    this.playInfo.steps.mingpai.data.push({
        index: userIndex,
        user: order.user,
        cards: this.playInfo.steps.fapai.cards[userIndex]
    });

    this.playInfo.steps.current = {type: "mingpai", step: this.playInfo.steps.mingpai};
    this.event.emit('mingpai');
    this.event.emit('broadcast');
}

Desk.prototype.orderQiangdizhu = function (order) {
    var nextOrder = function () {
        this.playInfo.steps.qiangdizhu.orderPlayer = (this.playInfo.steps.qiangdizhu.orderPlayer.index + 1) % this.usersInfo.users.length;
        this.event.emit('broadcast');
    }

    if (this.playInfo.steps.current.type == "mingpai" && order.type == "start") {
        var startIndex = Math.floor(Math.random() * (this.usersInfo.users.length));
        //TODO UserInfo
        this.playInfo.steps.qiangdizhu.orderPlayer = {index: startIndex, user: this.usersInfo.users[startIndex]}
        this.playInfo.steps.qiangdizhu.orders = [];
        this.playInfo.steps.qiangdizhu.beishu = 1;
        this.playInfo.steps.qiangdizhu.finishedPlayers = [];
        this.playInfo.steps.current = {type: "qiangdizhu", step: this.playInfo.steps.qiangdizhu};
        this.event.emit('qiangdizhu');
        this.event.emit('broadcast');
    } else {
        var tmp = [];
        for (var i = 0; i < this.playInfo.steps.qiangdizhu.orders.length && i < this.usersInfo.users.length + 1; i++) {
            if (this.orders[i].type != "不叫") {
                tmp.push(this.orders[i].user);
            }
        }
        var userIndex = 0;
        for (var i = 0; i < this.usersInfo.users.length; i++) {
            if (this.usersInfo.users[i] == order.user) {
                userIndex = i;
                break;
            }
        }
        if (userIndex != this.playInfo.steps.qiangdizhu.orderPlayer.index) {
            throw  new Error("Not In Order");
        }
        if (this.playInfo.steps.qiangdizhu.currentDizhu == undefined) {
            if (order.type == '叫地主') {
                this.playInfo.steps.qiangdizhu.orders.push(order);
                this.playInfo.steps.qiangdizhu.currentDizhu = this.playInfo.steps.qiangdizhu.orderPlayer;
                nextOrder();
            } else if (order.type == '不叫') {
                this.playInfo.steps.qiangdizhu.orders.push(order);
                nextOrder();
            } else {
                throw new Error("Error Order.");
            }
        } else {
            if (userIndex == this.playInfo.steps.qiangdizhu.currentDizhu.index) {
                throw new Error("不能抢自己地主");
            }
            if (this.playInfo.steps.qiangdizhu.finishedPlayers.indexOf(userIndex) >= 0) {
                throw new Error("玩家不能再抢地主");
            }
            if (order.type == '抢地主') {
                this.playInfo.steps.qiangdizhu.orders.push(order);
                this.playInfo.steps.qiangdizhu.beishu = 2 * this.playInfo.steps.qiangdizhu.beishu;
                this.playInfo.steps.qiangdizhu.currentDizhu = this.playInfo.steps.qiangdizhu.orderPlayer;
                this.playInfo.steps.qiangdizhu.finishedPlayers.push(userIndex)
                nextOrder();
            } else if (order.type == '不抢') {
                this.playInfo.steps.qiangdizhu.orders.push(order);
                this.playInfo.steps.qiangdizhu.finishedPlayers.push(userIndex)
                nextOrder();
            } else {
                throw new Error("Error Order.");
            }
        }
        if (this.playInfo.steps.qiangdizhu.orders.length == this.usersInfo.users.length && this.playInfo.steps.qiangdizhu.currentDizhu == undefined) {
            this.reset()
        } else if (this.playInfo.steps.qiangdizhu.currentDizhu != undefined && this.playInfo.steps.qiangdizhu.finishedPlayers.length == this.usersInfo.users.length) {
            this.playInfo.steps.qiangdizhu.leftBeishu = leftBeishu(this.playInfo.steps.fapai.leftCards);
            this.playInfo.steps.qiangdizhu.leftCards = this.playInfo.steps.fapai.leftCards;
            this.playInfo.fapai.cards[this.playInfo.steps.qiangdizhu.currentDizhu.index].push(this.playInfo.steps.fapai.leftCards)
            this.playInfo.steps.current = {type: "qiangdizhu", step: this.playInfo.steps.qiangdizhu};
            this.event.emit('qiangdizhu');
            this.event.emit('broadcast');
        }
    }
}


Desk.prototype.nextOrder = function () {
    this.orderUser = (this.orderUser + 1) % this.users.length;
    this.event.emit('broadcast');
}

Desk.prototype.order = function (stage, order) {
    if (this.status != "started" && this.status != "playing") {
        return false;
    }
    if (this.users[this.orderUser] != order.user) {
        return false;
    }
    switch (stage) {
        case 'call':
            if (this.step != "Init") {
                return false;
            }
            var tmp = [];
            for (var i = 0; i < this.orders.length && i < this.users.length + 1; i++) {
                if (this.orders[i].type != "不叫") {
                    tmp.push(this.orders[i].user);
                }
            }

            if (tmp.length == 0) {
                if (order.type == '叫地主') {
                    this.orders.push(order);
                    this.nextOrder();
                } else if (order.type == '不叫') {
                    this.orders.push(order);
                    this.nextOrder();
                } else {
                    return false;
                }
            } else {
                if (order.user == tmp[-1].user) {
                    return false;
                }
                if (order.type == '抢地主') {
                    this.orders.push(order);
                    this.beishu = this.beishu * 2;
                    this.nextOrder();
                } else if (order.type == '不抢') {
                    this.orders.push(order);
                    this.nextOrder();
                } else {
                    return false;
                }
            }
            if (this.orders.length == 2 && tmp.length == 0 && order.type == "不叫") {
                this.reset()
            } else if (this.orders.length == 4) {
                this.step = "called";
                this.userR
            }

            break;
        case 'double':
            break;
        case 'card':
            break;
    }
    this.status = "playing";
}
