const Koa = require('koa')
const app = new Koa()
const debug = require('debug')('koa-weapp-demo')
const response = require('./middlewares/response')
const bodyParser = require('koa-bodyparser')
const config = require('./config')

// 使用响应处理中间件
app.use(response)

// 解析请求体
app.use(bodyParser())

// 引入路由分发
const router = require('./routes')
app.use(router.routes())

// 启动程序，监听端口
// app.listen(config.port, () => debug(`listening on port ${config.port}`))
const static = require('koa-static')
const path = require('path')
app.use(static("E:\\images\\"))

// const Koa = require('koa');
const fs = require('fs');
const https = require('https');
const enforceHttps = require('koa-sslify');

var options = {
  key: fs.readFileSync('D:\\文档\\Nginx\\2_rest.nhjoke.xyz.key'),
  cert: fs.readFileSync('D:\\文档\\Nginx\\1_rest.nhjoke.xyz_bundle.crt')
};

https.createServer(options, app.callback()).listen(config.port);
