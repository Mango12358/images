//3,4,5,6,7,8,9,10,11,12,13,14,16,18,20
//0:R 1:F 3:M 4:B
//18 junerJoker 20 oldJoker 16 == 2
function Card(id) {
    this.id = id;
    this.value = this.id % 100;
    var tmpType = parseInt(this.id / 100);
    switch (tmpType) {
        case 0:
            this.type = "R";
            break
        case 1:
            this.type = "F";
            break
        case 2:
            this.type = "M";
            break
        case 3:
            this.type = "H";
            break
        default:
            this.type = "J";
            break
    }
}

Card.prototype.getValue = function () {
    return this.value;
}

Card.prototype.getType = function () {
    return this.type;
}

Card.prototype.isJoker = function () {
    return this.value == 18 || this.value == 20;
}

Card.prototype.comparable = function (c1, c2) {
    return c1.value - c2.value;
}

const cards = [new Card(3), new Card(4), new Card(5), new Card(6), new Card(7), new Card(8), new Card(9), new Card(10), new Card(11), new Card(12), new Card(13), new Card(14), new Card(16),
    new Card(103), new Card(104), new Card(105), new Card(106), new Card(107), new Card(108), new Card(109), new Card(110), new Card(111), new Card(112), new Card(113), new Card(114), new Card(116),
    new Card(203), new Card(204), new Card(205), new Card(206), new Card(207), new Card(208), new Card(209), new Card(210), new Card(211), new Card(212), new Card(213), new Card(214), new Card(216),
    new Card(303), new Card(304), new Card(305), new Card(306), new Card(307), new Card(308), new Card(309), new Card(310), new Card(311), new Card(312), new Card(313), new Card(314), new Card(316),
    new Card(18), new Card(20)
]
const getPokes = function () {
    return cards.slice(0);
}
const cardComparable = function (c1, c2) {
    return c1.value - c2.value;
}

module.exports = {Card, getPokes, cardComparable}