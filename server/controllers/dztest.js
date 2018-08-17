const {message: {checkSignature}} = require('../qcloud')
const DeskManager = require('../service/engine/desk-manager.js')
const User = require('../service/engine/user.js')

var users = [];
for (let i = 0; i < 3; i++) {
    let x = new User();
    x.userId = i;
    x.userIsAI = true;
    users.push(x);
}
var desk = DeskManager.getInstance().createDesk("Test", users, 1, 1)

async function get(ctx, next) {

}

/**
 * Test 1 User
 * @type {{get: get}}
 */


module.exports = {
    get
}