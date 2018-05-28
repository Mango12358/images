const { message: { checkSignature } } = require('../qcloud')
const db = require('../tools/db.js')

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function query(ctx, next) {
  // const { token } = ctx.query
  var page = ctx.request.body.page
  if(page == undefined){
    page = 0;
  }
  var step = 20 ;
  var offset = page * step;

  sql = db.select().from('picset').offset(offset).limit(step).orderBy("lastchange","desc").toString()
  console.log(sql)
  await db.raw(sql).then(res => {
    if (res[0].length == 0) {
      throw new Error("NOT Found");
    } else {
      ctx.body = res[0]
    }
  }, err => {
    throw new Error(err)
  })
}

async function del(ctx, next) {

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const { token } = ctx.query
  const id = ctx.request.body.id

  if (token != "xxxxxxxxxx") {
    throw new Error("Token Failed.")
  }

  await db.delete().from("picset").where('id', id).then(res => { ctx.body = { id: res[0] } }, err => { throw new Error("SQL Error") })
}

async function add(ctx, next) {
  // 检查签名，确认是微信发出的请求
  // const { signature, timestamp, nonce } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const { token } = ctx.query
  const source = ctx.request.body

  if (token != "xxxxxxxxxx") {
    throw new Error("Token Failed.")
  }
  await db('picset').insert(source).then(res => { ctx.body = { id: res[0] } }, err => { throw new Error("SQL Error") })
}

async function update(ctx, next) {
  // 检查签名，确认是微信发出的请求
  // const { signature, timestamp, nonce } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const { token } = ctx.query
  const source = ctx.request.body

  if (token != "xxxxxxxxxx") {
    throw new Error("Token Failed.")
  }
  await db('picset').update(source).where("id", source.id).then(res => { ctx.body = res }, err => { throw new Error("SQL ERROR") });
}

module.exports = {
  query,
  add,
  update,
  del
}