/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
  prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)


// 查询Image接口
router.post('/image/query', controllers.images.query)
router.post('/image/get', controllers.images.get)
router.post('/image/filltag', controllers.images.filltag)

// 收藏接口
router.post('/collection/add', validationMiddleware, controllers.collection.add)
router.post('/collection/remove', validationMiddleware, controllers.collection.remove)
router.post('/collection/get', validationMiddleware, controllers.collection.get)

//图集接口
router.post('/picset/add', controllers.picset.add)
router.post('/picset/update', controllers.picset.update)
router.post('/picset/query', controllers.picset.query)
router.post('/picset/delete', controllers.picset.del)

module.exports = router
