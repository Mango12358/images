// 载入模块
var Segment = require('segment');
// 创建实例
var segment = new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();

module.exports = segment;

// console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
// 返回结果格式：

// [{ w: '这是', p: 0 },
// { w: '一个', p: 2097152 },
// { w: '基于', p: 262144 },
// { w: 'Node.js', p: 8 },
// { w: '的', p: 8192 },
// { w: '中文', p: 1048576 },
// { w: '分词', p: 4096 },
// { w: '模块', p: 1048576 },
// { w: '。', p: 2048 }]