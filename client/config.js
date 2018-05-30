/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://rest.nhjoke.xyz';

var config = {
    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,
        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,
        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,
        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,
        // 图片获取接口
        imageGetUrl: `${host}/weapp/image/get`,
        // 图片查询接口
        imageQueryUrl: `${host}/weapp/image/query`
    },
    properties:{
      imageHost:"https://rest.nhjoke.xyz/",
      imageType:"",
      swiperImages: ["/pages/index/1.jpg", "/pages/index/2.jpg", "/pages/index/1.jpg"]
    }
};

module.exports = config;
