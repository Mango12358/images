const { message: { checkSignature } } = require('../qcloud')
const db = require('../tools/db.js')

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get(ctx, next) {
  const { signature, timestamp, nonce, echostr } = ctx.query
  if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  if (ctx.state.$wxInfo.loginState === 1) {
  } else {
    throw new Error("User Login Failed.");
  }
  var openId = ctx.state.$wxInfo.userinfo.openId;
  console.log(openId)
  sql = db.select().from('collections').where('openid', openId).toString()
  await db.raw(sql).then(res => {
    if (res[0].length == 0 ) {
      ctx.body = "{}";
    } else{
      ctx.body = JSON.parse(res[0][0].content)
    }
    console.log(ctx.body)
  }, err => {
    throw new Error(err)
  })
}

async function remove(ctx, next) {
  const { signature, timestamp, nonce, echostr } = ctx.query
  if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  if (ctx.state.$wxInfo.loginState === 1) {
  } else {
    throw new Error("User Login Failed.");
  }
  var openId = ctx.state.$wxInfo.userinfo.openId;

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const sid = ctx.request.body.sourceId
  var sql = db.select().from('collections').where('openid', openId).toString()
  console.log(sql)
  await db.raw(sql).then(async res => {
    if (res[0].length == 0) throw Error("NOT Found");
    var content = JSON.parse(res[0][0].content)
    delete content.sources[sid];
    var newContent = JSON.stringify(content);
    await db('collections').update('content', newContent).where('openid', openId);
    ctx.body = newContent
  }, err => {
    throw new Error(err)
  })
}

async function add(ctx, next) {
  const { signature, timestamp, nonce, echostr } = ctx.query
  if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  if (ctx.state.$wxInfo.loginState === 1) {
  } else {
    throw new Error("User Login Failed.");
  }
  var openId = ctx.state.$wxInfo.userinfo.openId;

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const sid = ctx.request.body.sourceId
  const imageUri = ctx.request.body.imgUri

  var sql = db.select().from('collections').where('openid', openId).toString()
  await db.raw(sql).then(async res => {
    if (res[0].length == 0) {
      var content = { sources: {} };
      content.sources[sid] = { data: new Date(), imgUri: imageUri };
      var newContent = JSON.stringify(content);
      await db('collections').insert({ 'content': newContent, "openid": openId });
      ctx.body = newContent
    } else {
      var content = JSON.parse(res[0][0].content)
      content.sources[sid] = { data: new Date, imgUri: imageUri };
      var newContent = JSON.stringify(content);
      await db('collections').update('content', newContent).where('openid', openId);
      ctx.body = newContent
    }
  }, err => {
    throw new Error(err)
  })
}

module.exports = {
  get,
  remove,
  add
}