const { message: { checkSignature } } = require('../qcloud')
const db = require('../tools/db.js')
const segment = require('../tools/segment.js')

/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function query(ctx, next) {
  // const { signature, timestamp, nonce, echostr } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  // else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
  console.log(ctx.request.body);
  const body = ctx.request.body;

  var _query = body.query;
  var _choice = body.choice;
  var _type = body.type;
  var _page = body.page;
  if (_page == undefined) {
    _page = 0;
  }
  console.log(_choice)

  var sql;
  if (_query != undefined) {
    if (_query.length > 20 || _query == "") {
      throw new Error("Query too long");
    }
    var words = segment.doSegment(_query);
    console.log(words);
    var subquery = db.select("target_id").from('tags').orderBy("random_index", "asc").offset(20 * _page).limit(20);

    for (var i = 0; i < words.lenght; i++) {
      if (i == 0) {
        subquery = subquery.where("tag", "like", words[i].w + "%")
      } else {
        subquery = subquery.orWhere("tag", "like", words[i].w + "%")
      }
    }
    subquery = db.select("target_id").from(subquery.as("tmp"))
    sql = db.select().column("id", "cos_uri", "height", "width", "status", "choice").from('images').orderBy("random_index", "asc").where("id", "in", subquery).toString()
  } else {
    var tmp = db.select().from('images').offset(20 * _page).limit(20).orderBy("random_index", "asc");
    if (_type != undefined) {
      tmp.where('type', _type);
      if (_choice != null) {
        tmp = tmp.andWhere("choice", _choice);
      }
    } else {
      if (_choice != null) {
        tmp = tmp.where("choice", _choice);
      }
    }
    sql = tmp.column("id", "cos_uri", "height", "width", "status", "choice").toString()
  }

  console.log(sql)
  await db.raw(sql).then(res => {
    // console.log(res[0])
    ctx.body = res[0]
  }, err => {
    throw new Error(err)
  })
}

async function get(ctx, next) {
  // 检查签名，确认是微信发出的请求
  // const { signature, timestamp, nonce } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  /**
   * 解析微信发送过来的请求体
   * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
   */
  const body = ctx.request.body

  var _id = body.id;

  sql = db.column("id", "cos_uri", "height", "width", "status", "choice").select().where("id", _id).toString()
  
  await db.raw(sql).then(res => {
    // console.log(res[0])
    ctx.body = res[0]
  }, err => {
    throw new Error(err)
  })
}

async function filltag(ctx, next) {
  // 检查签名，确认是微信发出的请求
  // const { signature, timestamp, nonce } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  const body = ctx.request.body

  ctx.body = 'success'
}

module.exports = {
  query,
  get,
  filltag
}