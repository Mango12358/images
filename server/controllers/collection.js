const { message: { checkSignature } } = require('../qcloud')
const db = require('../tools/db.js')

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  // const { signature, timestamp, nonce, echostr } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  // else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  if (ctx.state.$wxInfo.loginState === 1) {
    // loginState 为 1，登录态校验成功
    ctx.state.data = ctx.state.$wxInfo.userinfo
  } else {
    ctx.state.code = -1
  }

  const { query, page } = ctx.query

  var p = page;
  if (p == undefined) {
    p = 0;
    console.log(p)
  }
  sql = db.select().from('images').where('type', query).offset(20 * p).limit(20).orderBy("random_index", "asc").toString()
  console.log(sql)
  await db.raw(sql).then(res => {
    // console.log(res[0])
    ctx.body = res[0]
  }, err => {
    throw new Error(err)
  })
}

async function query(ctx, next) {
  // 检查签名，确认是微信发出的请求
  const { signature, timestamp, nonce } = ctx.query
  if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const body = ctx.request.body

  ctx.body = 'success'
}

module.exports = {
  get
}