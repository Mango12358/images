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
  var _picsetId = body.picsetId;
  if (_page == undefined) {
    _page = 0;
  }
  console.log(_choice)

  if (_picsetId != undefined) {
    // case 2: picset
    sql = db.select("content").from('picset').where("id", _picsetId).toString()
    await db.raw(sql).then(res => {
      if (res[0].length == 0) {
        throw new Error("NOT Found");
      } else {
        ctx.body = JSON.parse(res[0][0].content);
      }
    }, err => {
      throw new Error(err)
    })
  } else {

    var sql;
    if (_query != undefined) {
      // case 1: query
      if (_query.length > 20 || _query == "") {
        throw new Error("Query too long");
      }
      var words = segment.doSegment(_query);
      console.log(words);
      var subquery = db.select("target_id").from('tags').orderBy("random_index", "asc").offset(20 * _page).limit(20);

      for (var i = 0; i < words.length; i++) {
        if (i == 0) {
          console.log(subquery)
          subquery = subquery.where("tag", "like", words[i].w + "%")
        } else {
          subquery = subquery.orWhere("tag", "like", words[i].w + "%")
        }
      }
      subquery = db.select("target_id").from(subquery.as("tmp"))
      sql = db.select().column("id", "cos_uri", "height", "width", "status", "choice").from('images').orderBy("random_index", "asc").where("id", "in", subquery).toString()
    } else {
      // case 3: type + choice
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


  sql = db.column("id", "cos_uri", "height", "width", "status", "choice").select().from("images").where("id", _id).toString()

  await db.raw(sql).then(async res => {
    if (res[0].length == 0) {
      throw new Error("NOT Found")
    }
    var result = {}
    result["id"] = res[0][0].id
    result["uri"] = res[0][0].cos_uri
    sql = db.column("id", "cos_uri").select().from("images").where("id", ">", _id).limit(2).toString()
    await db.raw(sql).then(res => {
      result["similar"] = [];
      for (var x = 0; x < res[0].length; x++) {
        var tmp = {};
        tmp["id"] = res[0][x].id
        tmp["uri"] = res[0][x].cos_uri
        result["similar"].push(tmp)
      }
      ctx.body = result;
    }, err => { })
  }, err => {
    throw new Error(err)
  })
}

async function filltag(ctx, next) {
  // 检查签名，确认是微信发出的请求
  // const { signature, timestamp, nonce } = ctx.query
  // if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

  var offset = 0;
  var step = 10;
  var isFinished = false;
  console.log("test")
  await db.raw("truncate table `tags`").then(res => { }, err => { throw new Error(err) })

  while (true) {

    if (isFinished) {
      break
    }

    sql = db.column("id", "type", "tag_list").select().from("images").offset(offset).limit(step).toString()
    await db.raw(sql).then(res => {
      var data = res[0]
      offset += data.length;
      if (data.length == 0) {
        isFinished = true;
      }
      for (var i = 0; i < data.length; i++) {
        var tmp = data[i].tag_list.split(",");
        tmp.push(data[i].type)
        tmp = unique(tmp);
        var rows = [];
        for (var j = 0; j < tmp.length; j++) {
          var row = {};
          row.target_id = data[i].id;
          row.target_type = "image";
          row.tag = tmp[j];
          rows.push(row);
        }
        db.batchInsert("tags", rows).toString();
      }
    }, err => {
      throw new Error(err)
    })
  }

  ctx.body = 'success'
}

function unique(arr) {
  var result = [], hash = {};
  for (var i = 0, elem; (elem = arr[i]) != null; i++) {
    if (!hash[elem.toLowerCase()]) {
      result.push(elem);
      hash[elem.toLowerCase()] = true;
    }
  }
  return result;
}

module.exports = {
  query,
  get,
  filltag
}