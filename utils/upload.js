import { GetQiNiuToken } from '../api/utils'
const qiniuUploader = require("./qiniuUploader-min")
/**
   * 以wx.request作为底层方法
   * @param {String}  fileUrl           微信文件地址 eg: xxxx.jpg
   * @param {String}  sourceName        如： dhg = 读后感 dd =导读  sfm 书封面  avatar 头像
   * @param {Int}     type             1 图片 2 音频 3 视频 99 其他
 */
export default function upload (fileUrl,sourceName,type) {
    return new Promise((resolve,reject)=>{
      let key;
      let isUploaded=true;
      if(fileUrl.indexOf('http://tmp/')!=-1){
        key=fileUrl.split('http://tmp/');
        isUploaded=false;
        key=key[key.length-1];
        key=key.replace(/\/\//g,'');
      }else if(fileUrl.indexOf('wxfile://tmp_')!=-1){
        isUploaded=false;
        key=fileUrl.split('wxfile://tmp_');
        key=key[key.length-1];
        key=key.replace(/\/\//g,'');
      }
      if(isUploaded){
        resolve(fileUrl);
      }else{
        GetQiNiuToken({fileKey:key,sourceName:sourceName,type:type}).then((res)=>{
          console.log(res);
          if(res.code=='C200'){
            let config=res.data;
            wx.showLoading({
              title: '加载中',
              mask:true
            })
            qiniuUploader.upload(fileUrl, (res) => {
              console.log("uploadPath",res.imageURL);
              resolve(res.imageURL);
              wx.hideLoading()
            }, (error) => {
              console.log('error: ' + error);
              reject(error);
              wx.hideLoading()
            }, {
              region: 'SCN',
              domain: config.bucketDomain, // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
              key: config.bucketKey,
              uptoken: config.token, // 由其他程序生成七牛 uptoken
            });
          }
        })
      }
    })
}