var events = require('events');
var CardManager = require('./card-manager.js');
var user = require('./user.js');
var TaskManager = require('../utils/TaskManager.js');

var deskTasks = new TaskManager();
var card = new CardManager.Card();


function Desk(type, users, baseScore, baseGold, baseBeishu, deskCost, room, playerNum) {
    this.deskInfo = {};
    this.playInfo = {};
    this.usersInfo = {};

    this.deskInfo.type = type;
    this.deskInfo.playerNum = playerNum === undefined ? 3 : playerNum;
    this.deskInfo.room = room;
    this.deskInfo.deskCost = deskCost;
    this.deskInfo.baseGold = baseGold;
    this.deskInfo.baseScore = baseScore;
    this.deskInfo.baseBeishu = baseBeishu;

    if (users.length < 2) throw new Error("Users Not Enough");

    this.usersInfo.users = users;
    this.usersInfo.playerInfo = {};

    this.playInfo.orders = [];
    this.playInfo.QDZorders = {finished: {}, orders: [], beishu: 1};
    this.playInfo.playerCards = {};
    this.playInfo.deskPokers = [];
    this.playInfo.leftCards = [];
    this.playInfo.dzPlayerIndex = -1;
    this.playInfo.currentPlayerIndex = 0;
    this.playInfo.playerJiaBei = {};
    this.playInfo.playerMingPai = {};
    this.playInfo.playerJieSuan = {};
    this.playInfo.stage = 0;// 0初始 1发牌 2明牌 3抢地主 4加倍 5出牌 6结算
    this.playInfo.started = false;
    this.playInfo.dzWin = false;
    this.playInfo.beishu = this.deskInfo.baseBeishu;

    this.playInfo.historyCards = [];

    const that = this;
    this.event = new events.EventEmitter();
    // this.event.on("mingpai", function (user, index, message) {
    //     that.onMingpai(user, index, message)
    // })
    // this.event.on("qiangdizhu", function (user, index, message) {
    //     that.onQiangDZ(user, index, message)
    // })
    // this.event.on("jiabei", function (user, index, message) {
    //     that.onJiaBei(user, index, message)
    // })
    // this.event.on("chupai", function (user, index, message) {
    //     that.onChuPai(user, index, message)
    // })
    this.event.on("jiesuan", function () {
        that.onJieSuan();
    })
    this.event.on("stageChange", function (from, to) {
        that.stageChange(from, to);
    })
    this.init();
}

Desk.prototype.on = function (event, handler) {
    this.event.on(event, handler);
}

Desk.prototype.leftBeishu = function (leftCards) {
    if (leftCards.length !== 3) return 1;

    if (card.getSuits(leftCards[0]) === card.getSuits(leftCards[1]) && card.getSuits(leftCards[0]) === card.getSuits(leftCards[2])) {
        return 3;//同花
    }
    let tmp = this.playInfo.deskPokers.weightSort(leftCards);
    if (card.getPoint(tmp[0]) === card.getPoint(tmp[1]) && card.getPoint(tmp[2]) === card.getPoint(tmp[1])) {
        return 3;//3张
    } else if (card.getPoint(tmp[0]) === card.getPoint(tmp[1]) || card.getPoint(tmp[2]) === card.getPoint(tmp[1])) {
        return 2;//2张
    } else if (card.getPoint(tmp[1]) - card.getPoint(tmp[0]) === 1 && card.getPoint(tmp[2]) - card.getPoint(tmp[1]) === 1) {
        return 3;//顺子
    }
    let jokerCount = 0;
    for (let i = 0; i < 3; i++) {
        if (card.getSuits(leftCards[0]) === "Swang" || card.getSuits(leftCards[0]) === "Bwang") {
            jokerCount += 1;
        }
    }
    if (jokerCount === 1) {
        return 2;
    } else if (jokerCount === 2) {
        return 3;
    }
    return 1;
}

Desk.prototype.onMingpai = function (user, index, message) {
    if (this.playInfo.stage !== 2) return;
    this.playInfo.playerMingPai[user.userId] = {index: index, isMingPai: message.mingpai};
    if (message.mingpai) {
        this.playInfo.beishu = this.playInfo.beishu * 4;
    }
    this.broadcast("mingpai")
    if (Object.keys(this.playInfo.playerMingPai).length === this.usersInfo.users.length) {
        this.nextStage();
    }
}
Desk.prototype.onQiangDZ = function (user, index, message) {
    //TODO
    var order = message.order;
    if (this.playInfo.stage !== 3) return;
    if (this.playInfo.currentPlayerIndex !== index) return;
    var nextUserIndex = (this.playInfo.currentPlayerIndex + 1) % this.usersInfo.users.length;

    if (this.playInfo.dzPlayerIndex < 0) {
        if (order.type === '叫地主') {
            this.playInfo.dzPlayerIndex = this.playInfo.currentPlayerIndex;
        } else if (order.type === '不叫') {
            this.playInfo.QDZorders.orders.push(order);
            this.playInfo.QDZorders.finished[index] = true;
        } else {
            throw new Error("Error Order.");
        }
    } else {
        if (index === this.playInfo.dzPlayerIndex) {
            throw new Error("不能抢自己地主");
        }
        if (this.playInfo.QDZorders.finished[index]) {
            throw new Error("玩家不能再抢地主");
        }
        if (order.type === '抢地主') {
            this.playInfo.QDZorders.orders.push(order);
            this.playInfo.QDZorders.beishu = 2 * this.playInfo.QDZorders.beishu;
            this.playInfo.dzPlayerIndex = index;
            this.playInfo.QDZorders.finished[index] = true;
        } else if (order.type === '不抢') {
            this.playInfo.QDZorders.orders.push(order);
            this.playInfo.QDZorders.finished[index] = true;
        } else {
            throw new Error("Error Order.");
        }
    }
    this.checkQDZ(nextUserIndex);
}

Desk.prototype.checkQDZ = function (nextIndex) {
    if (this.playInfo.QDZorders.finished[nextIndex]) {
        if (this.playInfo.dzPlayerIndex < 0) {
            this.reset();
        } else {
            //Finished
            this.playInfo.beishu = this.playInfo.beishu * this.playInfo.QDZorders.beishu;
            this.playInfo.beishu = this.playInfo.beishu * this.leftBeishu(this.playInfo.leftCards);
            this.broadcast("qiangdz")
            this.nextStage();
        }
    } else {
        this.broadcast("qiangdz")
        this.nextOrder();
    }
}

Desk.prototype.onJiaBei = function (user, index, message) {
    if (this.playInfo.stage !== 4) return;
    this.playInfo.playerJiaBei[user.userId] = {index: index, isJiaBei: message.jiabei};
    if (message.jiabei) {
        this.playInfo.beishu = this.playInfo.beishu * 2;
    }
    this.broadcast("jiabei")
    if (Object.keys(this.playInfo.playerJiaBei).length === this.usersInfo.users.length) {
        this.nextStage();
    }
}

Desk.prototype.onChuPai = function (user, index, message) {
    //TODO
    let lastOrder;
    for (let i = -1; i > 0 - this.playInfo.orders.length; i--) {
        if (this.playInfo.orders[i].type !== '不要') {
            lastOrder = this.playInfo.orders[i];
            break;
        }
    }
    if (lastOrder === undefined || message.type === '不要') {
        this.playInfo.orders.push({userId: user.userId, userIndex: index, data: message.data, type: message.type})
    } else if (lastOrder.userId === user.userId) {
        if (this.playInfo.orders[-1].type === '不要' && this.playInfo.orders[-2].type === '不要') {
            this.playInfo.orders.push({userId: user.userId, userIndex: index, data: message.data, type: message.type})
        } else {
            throw new Error("Missing Orders");
        }
    } else if (this.playInfo.deskPokers.beat(lastOrder.data, message.data)) {
        this.playInfo.orders.push({userId: user.userId, userIndex: index, data: message.data, type: message.type})
    } else {
        throw new Error("Error Chu Pai.");
    }
    for (let i = 0; i < message.data.length; i++) {
        let tmp = this.playInfo.playerCards[index].indexOf(message.data[i]);
        this.playInfo.playerCards.splice(tmp, 1);
    }
    this.nextOrder();
    this.broadcast("chupai")
}

Desk.prototype.onJieSuan = function () {
    //TODO
    this.deskInfo.baseGold = baseGold;
    this.deskInfo.baseScore = baseScore;
    this.deskInfo.baseBeishu = baseBeishu;
    if (this.playInfo.dzWin) {
        let userLostGold = 0;
        let userLostScore = 0;
        for (let i = 0; i < this.usersInfo.users.length; i++) {
            if (i !== this.playInfo.dzPlayerIndex) {
                //NongMing
                let lostGold = this.usersInfo.users[i].subGold(this.deskInfo.baseGold * this.playInfo.beishu)
                userLostGold += lostGold;
                let lostScore = this.usersInfo.users[i].subScore(this.deskInfo.baseScore * this.playInfo.beishu)
                userLostScore += lostScore;
                this.playInfo.playerJieSuan[i].gold = 0 - lostGold;
                this.playInfo.playerJieSuan[i].score = 0 - lostScore;
            }
        }
        this.usersInfo.users[this.playInfo.dzPlayerIndex].addGold(userLostGold)
        this.usersInfo.users[this.playInfo.dzPlayerIndex].addScore(userLostScore)
        this.playInfo.playerJieSuan[this.playInfo.dzPlayerIndex].gold = userLostGold;
        this.playInfo.playerJieSuan[this.playInfo.dzPlayerIndex].score = userLostScore;
    } else {
        let userLostGold = this.usersInfo.users[this.playInfo.dzPlayerIndex].subGold(this.deskInfo.baseGold * this.playInfo.beishu * 2)
        let userLostScore = this.usersInfo.users[this.playInfo.dzPlayerIndex].subScore(this.deskInfo.baseScore * this.playInfo.beishu * 2)
        this.playInfo.playerJieSuan[this.playInfo.dzPlayerIndex].gold = 0 - userLostGold;
        this.playInfo.playerJieSuan[this.playInfo.dzPlayerIndex].score = 0 - userLostScore;
        for (let i = 0; i < this.usersInfo.users.length; i++) {
            if (i !== this.playInfo.dzPlayerIndex) {
                //DZ
                let addGold = this.usersInfo.users[i].addGold(userLostGold / 2)
                let addScore = this.usersInfo.users[i].addScore(userLostScore / 2)
                this.playInfo.playerJieSuan[i].gold = addGold;
                this.playInfo.playerJieSuan[i].score = addScore;
            }
        }
    }
    this.broadcast("jiesuan")
}


Desk.prototype.init = function () {
    for (var i = 0; i < this.usersInfo.users.length; i++) {
        const that = this;
        this.usersInfo.users[i].on("handsUp", function (user) {
            that.userHandsUp(user)
        });
        this.usersInfo.users[i].on("message", function (user, message) {
            that.userMessage(user, message);
        });
        this.usersInfo.users[i].on("close", function (user) {
            that.userClose(user)
        });
        this.usersInfo.users[i].on("leaveDesk", function (user) {
            that.userLeave(user)
        });

        this.usersInfo.playerInfo[this.usersInfo.users[i].userId] = {
            index: i,
            autoPlay: this.usersInfo.users[i].isAI(),
            isReady: !!this.usersInfo.users[i].isAI(),
            isLeft: false
        };
    }
    const that = this;
    deskTasks.addOnceTask("handsUpCheck", function () {
        that.handsUpCheck(true)
    }, 10000)
}

Desk.prototype.handsUpCheck = function (dropUser) {
    for (let i = 0; i < this.usersInfo.users.length; i++) {
        if (!this.usersInfo.playerInfo[this.usersInfo.users[i].userId].isReady && dropUser) {
            this.dropUser(this.usersInfo.users[i]);
        }
    }
    if (this.usersInfo.users.length === this.deskInfo.playerNum && this.playInfo.stage === 0) {
        this.start();
    }
}


Desk.prototype.userMessage = function (user, message) {
    if (user === undefined || message === undefined || message.type === undefined
        || this.usersInfo.playerInfo[user.userId] === undefined) return;
    let playIndex = this.usersInfo.playerInfo[user.userId].index;
    switch (message.type) {
        case "mingpai":
            this.onMingpai(user, playIndex, message.data);
            break;
        case "qiangdizhu":
            this.onQiangDZ(user, playIndex, message.data);
            break;
        case "jiabei":
            this.onJiaBei(user, playIndex, message.data);
            break;
        case "chupai":
            this.onChuPai(user, playIndex, message.data);
            break;
    }
}

Desk.prototype.userClose = function (user) {
    if (this.usersInfo.playerInfo[this.usersInfo.users[i].userId] === undefined) {
        return
    }
    if (this.playInfo.started) {
        user.removeAllListener();
        this.usersInfo.playerInfo[this.usersInfo.users[i].userId].autoPlay = true;
        this.usersInfo.playerInfo[this.usersInfo.users[i].userId].isLeft = true;
    } else {
        this.dropUser(user);
    }
}

Desk.prototype.userLeave = function (user) {
    if (this.usersInfo.playerInfo[this.usersInfo.users[i].userId] === undefined) {
        return
    }
    if (this.playInfo.started) {
        user.removeAllListener();
        this.usersInfo.playerInfo[this.usersInfo.users[i].userId].autoPlay = true;
        this.usersInfo.playerInfo[this.usersInfo.users[i].userId].isLeft = true;
    } else {
        this.dropUser(user);
    }
}


Desk.prototype.dropUser = function (user) {
    if (this.usersInfo.playerInfo[user.userId] === undefined) {
        return
    }
    user.removeAllListener();
    this.usersInfo.users.splice(this.usersInfo.playerInfo[user.userId].index, 1);
    delete this.usersInfo.playerInfo[user.userId];
    this.event.emit("requireUser");
}

Desk.prototype.joinUser = function (user) {
    this.usersInfo.users.push(user);
    this.usersInfo.playerInfo[this.usersInfo.users[-1].userId] = {
        index: this.usersInfo.users.length - 1,
        autoPlay: user.isAI(),
        isReady: user.isAI() ? true : true
    };
    this.handsUpCheck();
}

Desk.prototype.userHandsUp = function (user) {
    if (this.usersInfo.playerInfo[user.userId] !== undefined) {
        this.usersInfo.playerInfo[user.userId].isReady = true;
    }
    this.handsUpCheck();
}
Desk.prototype.start = function () {
    this.event.emit('starting');
    if (this.playInfo.stage !== 0) {
        throw new Error("Stage Not Match")
    }
    this.playInfo.started = true;
    this.nextStage();//发牌阶段
    var poker = new CardManager.DDZPoker();
    if (this.playInfo.historyCards.length === 54 && this.deskInfo.type === "不洗牌") {
        poker.resetCards(this.playInfo.historyCards);
    } else {
        poker.getShuffleCards();
    }
    this.playInfo.deskPokers = poker;
    let dealCards = poker.dealCards();
    this.playInfo.leftCards = dealCards.leaveCards;
    this.playInfo.playerCards[0] = dealCards.player1;
    this.playInfo.playerCards[1] = dealCards.player2;
    this.playInfo.playerCards[2] = dealCards.player3;

    this.playInfo.historyCards = [];
    this.playInfo.playerJiaBei = {};
    this.playInfo.playerMingPai = {};
    this.playInfo.currentPlayerIndex = Math.floor(Math.random() * this.usersInfo.users.length);
    this.event.emit('started');
    this.broadcast("fapai");
    //发牌结束，进入明牌阶段
    this.nextStage();
}

Desk.prototype.stageChange = function (from, to) {
    if (from === to) {
        return;
    }
    var that = this;
    switch (to) {
        case 1: //发牌
            break;
        case 2: //明牌
            if (this.playInfo.stage <= 2) {
                deskTasks.addOnceTask("finishMingPai", function () {
                    if (that.playInfo.stage === 2) {
                        that.nextStage();
                    }
                }, 10000)
            }
            this.orderStart();//TODO Fortest
            break;
        case 3: //抢地主
            this.orderStart();
            break;
        case 4: //加倍
            if (this.playInfo.stage === 4) {
                deskTasks.addOnceTask("finishJiaBei", function () {
                    if (that.playInfo.stage === 4) {
                        that.nextStage();
                    }
                }, 10000)
            }
            this.nextOrder(this.playInfo.dzPlayerIndex);//TODO Fortest
            break;
        case 5: //出牌
            this.nextOrder(this.playInfo.dzPlayerIndex);
            break;
        case 6: //结算
            break;
        case 0: //重置
            break;
    }
}

Desk.prototype.orderStart = function () {
    const user = this.usersInfo.users[this.playInfo.currentPlayerIndex];
    if (this.usersInfo.playerInfo[user.userId].autoPlay) {
        this.autoPlayOnceStep(this.usersInfo.users[this.playInfo.currentPlayerIndex],
            this.playInfo.currentPlayerIndex)
        return;
    }
    const that = this;
    deskTasks.addOnceTask("orderTimeout", function () {
        that.autoPlayOnceStep(that.usersInfo.users[that.playInfo.currentPlayerIndex],
            that.playInfo.currentPlayerIndex)
    }, 15000)
}
Desk.prototype.nextOrder = function (specialIndex) {
    if (specialIndex !== undefined) {
        this.playInfo.currentPlayerIndex = specialIndex;
    } else {
        this.playInfo.currentPlayerIndex = (this.playInfo.currentPlayerIndex + 1) % this.usersInfo.users.length;
    }

    deskTasks.removeOnceTask("orderTimeout");
    var user = this.usersInfo.users[this.playInfo.currentPlayerIndex];
    if (this.usersInfo.playerInfo[user.userId].autoPlay) {
        this.autoPlayOnceStep(this.usersInfo.users[this.playInfo.currentPlayerIndex],
            this.playInfo.currentPlayerIndex)
        return;
    }
    const that = this;
    deskTasks.addOnceTask("orderTimeout", function () {
        that.autoPlayOnceStep(that.usersInfo.users[that.playInfo.currentPlayerIndex],
            that.playInfo.currentPlayerIndex);
        this.emit("orderTimeout", that.usersInfo.users[that.playInfo.currentPlayerIndex],
            that.playInfo.currentPlayerIndex)
    }, 15000)
}

Desk.prototype.autoPlayOnceStep = function (user, index) {
    //TODO Auto Play
    //1. QDZ
    //2. CHU PAI
    //0初始 1发牌 2明牌 3抢地主 4加倍 5出牌 6结算
    var message = {};
    switch (this.playInfo.stage) {
        case 2:
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                message = {type: "mingpai", data: {mingpai: true}}
                this.userMessage(this.usersInfo.users[i], message);
            }
            return;
        case 3:
            switch (index) {
                case 0:
                    if (this.playInfo.dzPlayerIndex >= 0) {
                        message = {type: "qiangdizhu", data: {order: {type: "不抢"}}}
                    } else {
                        message = {type: "qiangdizhu", data: {order: {type: "不叫"}}}
                    }
                    break;
                case 1:
                    if (this.playInfo.dzPlayerIndex >= 0) {
                        message = {type: "qiangdizhu", data: {order: {type: "不抢"}}}
                    } else {
                        message = {type: "qiangdizhu", data: {order: {type: "叫地主"}}}
                    }
                    break;
                case 2:
                    if (this.playInfo.dzPlayerIndex === index) return;
                    if (this.playInfo.dzPlayerIndex >= 0) {
                        message = {type: "qiangdizhu", data: {order: {type: "抢地主"}}}
                    } else {
                        message = {type: "qiangdizhu", data: {order: {type: "叫地主"}}}
                    }
                    break;
            }
            break;
        case 4:
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                message = {type: "jiabei", data: {jiabei: true}}
                this.userMessage(this.usersInfo.users[i], message);
            }
            return;
        case 5:

    }


    this.userMessage(user, message)
}

Desk.prototype.emit = function (env, user, index) {
    this.event.emit(env, user, message)
}

Desk.prototype.nextStage = function () {
    var next = (this.playInfo.stage + 1) % 7;
    var from = this.playInfo.stage;
    this.playInfo.stage = next;
    this.broadcast("stageChange");
    this.stageChange(from, next)
}

Desk.prototype.broadcast = function (type) {
    let data = {};
    switch (type) {
        case "fapai":
            data = {usersInfo: [], type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                //TODO user info
                data.usersInfo[i] = this.usersInfo.users[i].userInfo;
            }
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.leftCards = this.playInfo.leftCards;
                data.playerCards = this.playInfo.playerCards[i];
                data.currentPlayerIndex = this.playInfo.currentPlayerIndex;
                data.stage = this.playInfo.stage;
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "mingpai":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.mingpai = this.playInfo.playerMingPai;
                data.currentPlayerIndex = this.playInfo.currentPlayerIndex;
                data.stage = this.playInfo.stage;
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "jiabei":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.jiabei = this.playInfo.playerJiaBei;
                data.currentPlayerIndex = this.playInfo.currentPlayerIndex;
                data.stage = this.playInfo.stage;
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "qiangdz":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.currentDizhu = this.playInfo.dzPlayerIndex;
                data.QDZorders = this.playInfo.QDZorders;
                data.currentPlayerIndex = this.playInfo.currentPlayerIndex;
                data.stage = this.playInfo.stage;
                data.leftBeiShu = this.leftBeishu(this.playInfo.leftCards)
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "chupai":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.orders = this.playInfo.orders.slice(this.playInfo.orders.length - 4, this.playInfo.orders.length - 1);
                data.currentPlayerIndex = this.playInfo.currentPlayerIndex;
                data.stage = this.playInfo.stage;
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "stageChange":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.toStage = this.playInfo.stage;
                this.usersInfo.users[i].pushData(data);
            }
            break;
        case "jiesuan":
            data = {type: type};
            for (let i = 0; i < this.usersInfo.users.length; i++) {
                data.jieSuan = this.playInfo.playerJieSuan;
                this.usersInfo.users[i].pushData(data);
            }
            break;
    }
}

Desk.prototype.listen = function (event, handler) {
    this.event.on(event, handler)
}


Desk.prototype.reset = function () {
    //TODO reset
    this.playInfo.orders = [];
    this.playInfo.QDZorders = {finished: {}, orders: [], beishu: 1};
    this.playInfo.playerCards = {};
    this.playInfo.deskPokers = [];
    this.playInfo.leftCards = [];
    this.playInfo.dzPlayerIndex = -1;
    this.playInfo.currentPlayerIndex = 0;
    this.playInfo.playerJiaBei = {};
    this.playInfo.playerMingPai = {};
    this.playInfo.playerJieSuan = {};
    this.playInfo.stage = 0;// 0初始 1发牌 2明牌 3抢地主 4加倍 5出牌 6结算
    this.playInfo.started = false;
    this.playInfo.dzWin = false;
    this.playInfo.beishu = this.deskInfo.baseBeishu;
    this.event.emit('reset');
    this.start();
}

module.exports = Desk;
