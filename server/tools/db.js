const { mysql: config } = require('../config')

const DB = require('knex')({
  client: 'mysql',
  debug: false,
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.pass,
    database: config.db,
    charset: config.char,
    multipleStatements: true
  },
  pool: { //指明数据库连接池的大小，默认为{min: 2, max: 10}
    min: 1,
    max: 10,
  },
  acquireConnectionTimeout: 10000
})

module.exports = DB;