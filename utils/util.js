import Upload from './upload'
import {
  Update,
  GetSelfInfo
} from '../api/user'
import {
  GetOssToken, GetFaceToken
} from '../api/util'
import {
  store
} from '../store'

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const Compare = (value) => {
  let _now = new Date();
  let dayNow = _now.getDate();
  let dayOld = new Date(value).getDate();
  let dayNum = dayNow - dayOld;
  let monNum = _now.getMonth() - new Date(value).getMonth();
  let yearNum = _now.getYear() - new Date(value).getYear();

  var now = _now.getTime(),
    old = new Date(value),
    oldTime = old.getTime(),
    difference = now - oldTime,
    result = '',
    minute = 1000 * 60,
    hour = minute * 60,
    day = hour * 24,
    halfamonth = day * 15,
    month = day * 30,
    year = month * 12,
    _year = difference / year,
    _month = difference / month,
    _week = difference / (7 * day),
    _day = difference / day,
    _hour = difference / hour,
    _min = difference / minute;

  var o_month = old.getMonth() + 1;
  var o_day = old.getDate() > 9 ? old.getDate() : '0' + old.getDate();
  var o_hour = old.getHours() > 9 ? old.getHours() : '0' + old.getHours();
  var o_minute = old.getMinutes() > 9 ? old.getMinutes() : '0' + old.getMinutes();

  var today_zero = new Date(new Date().toLocaleDateString()).getTime(); // 今天0时
  var yesterday_zero = today_zero - 24 * 60 * 60 * 60 * 1000; // 昨天0时

  if (yearNum >= 1 || monNum >= 1 || dayNum > 1) {
    result = DateFormat(value, "MM-DD HH:mm")
  } else if (yearNum <= 0 && monNum <= 0 && dayNum == 1) {
    result = "昨天 " + DateFormat(value, "HH:mm")
  } else if (_hour >= 1) {
    result = DateFormat(value, "HH:mm")
  } else if (_min >= 2) {
    result = (parseInt(_min)) + "分钟前"
  } else result = "刚刚";
  return result;
}

function DateFormat(value, formatString) {
  var formateArr = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];
  var returnArr = [];

  var date = new Date(value);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    formatString = formatString.replace(formateArr[i], returnArr[i]);
  }
  return formatString;
}


const chooseImage = (params) => {
  return new Promise((resolve, reject) => {
    const config = {
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }
    if (typeof (params) === 'number') {
      config.count = params
    }
    if (typeof (params) === 'object') {
      for (let i in params) {
        config[i] = params[i]
      }
    }
    wx.chooseImage({
      ...config,
      success: (res) => {
        checkFileSize(res.tempFiles).then(() => {
          resolve(res.tempFilePaths)
        }).then(() => {
          resolve([])
        })
      },
      fail: (error) => {
        resolve([])
      }
    })
  })
}


// 检查文件大小
const checkFileSize = (files) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 1048576) { // 不超过1mb
        wx.showToast({
          title: '单张图片超过1MB，请重新选择',
          icon: 'none'
        })
        reject()
        break
      }
    }
    resolve()
  })
}

// 下载文件
const DownloadFile = (file) => {
  return new Promise(resolve => {
    wx.downloadFile({
      url: file, //仅为示例，并非真实的资源
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (error) => {
        console.log(error)
        resolve(null)
      }
    })
  })
}

// 获取登陆code
const GetLoginCode = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject()
        }
      },
      fail: (res) => {
        console.log(res)
        reject()
      },
    })
  })
}

const GetImageInfo = (src) => {
  return new Promise(async resolve => {
    wx.getImageInfo({
      src: src,
      success(res) {
        resolve({
          width: res.width,
          height: res.height
        })
      },
      fail: (eror) => {
        resolve(null)
      }
    })
  })
}

// 获取Wxml详情
const GetWxmlInfo = (target, component) => {
  return new Promise(async resolve => {
    if (component) {
      wx.createSelectorQuery().in(component).select(target).boundingClientRect(function (rect) {
        resolve(rect)
      }).exec()
    } else {
      wx.createSelectorQuery().select(target).boundingClientRect(function (rect) {
        resolve(rect)
      }).exec()
    }
  })
}

// 微信授权
const WxAuthor = (type) => {
  const types = {
    userInfo: '用户信息',
    userLocation: '地理位置',
    userLocationBackground: '	后台定位',
    address: '通讯地址',
    invoiceTitle: '发票抬头',
    invoice: '获取发票',
    werun: '微信运动步数',
    record: '录音功能',
    writePhotosAlbum: '保存到相册',
    camera: '摄像头',
  }
  return new Promise(async resolve => {
    wx.authorize({
      scope: `scope.${type}`,
      success() {
        resolve(true)
      },
      fail(error) {
        wx.showModal({
          title: '提示',
          content: `请先授权${types[type]}`,
          success(res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  if (res.authSetting[`scope.${type}`]) {
                    resolve(true)
                  } else {
                    resolve(false)
                  }
                },
                fail(error) {
                  resolve(false)
                }
              })
            } else if (res.cancel) {
              resolve(false)
            }
          }
        })
      }
    })
  })
}


// 选择位置
const ChooseLocation = () => {
  return new Promise(async resolve => {
    wx.chooseLocation({
      success(res) {
        resolve(res)
      },
      fail(error) {
        resolve(false)
      }
    })
  })
}



// Ip定位
const IpLocation = (type) => {
  return new Promise(async resolve => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/location/v1/ip?key=Z5IBZ-OBE3J-FLTFH-F3PO2-RO4OV-NLFWQ&output=json',
      success(res) {
        if (res && res.data && res.data.status === 0) {
          resolve(res.data.result)
        }
      },
      fail(error) {
        resolve({
          ad_info: {
            city: '中山市'
          },
          location: {
            lat: 22.51595,
            lng: 113.3926
          }
        })
      }
    })
  })
}

const SubscribeMessage = (tmplIds) => {
  return new Promise(resolve => {
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success(res) {
        resolve()
      },
      fail() {
        resolve()
      }
    })
  })
}

const UploadOss = (fileUrl, dir) => {
  return new Promise(async (resolve, reject) => {
    let key;
    let isUploaded = true;
    if (fileUrl.indexOf('http://tmp/') != -1) {
      key = fileUrl.split('http://tmp/');
      isUploaded = false;
      key = key[key.length - 1];
      key = key.replace(/\/\//g, '');
    } else if (fileUrl.indexOf('wxfile://tmp_') != -1) {
      isUploaded = false;
      key = fileUrl.split('wxfile://tmp_');
      key = key[key.length - 1];
      key = key.replace(/\/\//g, '');
    }
    let name = key
    key = `${dir}/${key}`
    if (isUploaded) {
      resolve(fileUrl);
    } else {
      const oss = await GetOssToken({
        key: key
      })
      if (oss) {
        const params = {
          name: name,
          key: oss.key,
          policy: oss.policy,
          OSSAccessKeyId: oss.OSSAccessKeyId,
          success_action_status: 200,
          signature: oss.signature
        }
        wx.uploadFile({
          url: oss.host, //仅为示例，非真实的接口地址
          filePath: fileUrl,
          name: 'file',
          formData: params,
          success(res) {
            const url = `${oss.host}/${oss.key}`
            resolve(url)
          },
          fail() {
            wx.showToast({
              title: '上传失败，请稍后再试',
            })
            reject(new Error('upload fail'))
          }
        })
      }
    }
  })
}

const UploadsOss = (files, dir) => {
  return new Promise(async (resolve, reject) => {
    const tasks = []
    for (let i = 0; i < files.length; i++) {
      tasks.push(UploadOss(files[i], dir))
    }
    const res = await Promise.all(tasks)
    resolve(res)
  })
}

const GetSetting = (type) => {
  return new Promise(resolve => {
    wx.getSetting({
      success(res) {
        if(res.authSetting[`scope.${type}`] || res.authSetting[`scope.${type}`] === undefined){
          resolve(true)
        } else{
          resolve(false)
        }
      }
    })
  })
}

const GetLocation = () => {
  return new Promise(resolve => {
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        resolve(res)
      }
    })
  })
}

const ChooseVideo = (params) => {
  return new Promise((resolve, reject) => {
    const _params = {
      sourceType: ['album', 'camera'],
      maxDuration: 60,
    }
    if (params) {
      for (let i in params) {
        _params[i] = params[i]
      }
    }
    wx.chooseVideo({
      ...params,
      success: (res) => {
        resolve(res)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

const ShowActionSheet = (types) => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: types,
      success: async (res) => {
        resolve(res.tapIndex)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

const UpdateUserInfo = (userInfo) => {
  return new Promise(async resolve => {
    if(userInfo.gender) {
      userInfo.sex = userInfo.gender
    }
    if (userInfo.nickName) {
      userInfo.nickname = userInfo.nickName
    }
    if (userInfo.avatarUrl) {
      const _res = await DownloadFile(userInfo.avatarUrl)
      if (_res) {
        const result = await UploadOss(_res, 'user/avatar')
        if (result) {
          userInfo.headimgurl = result
        }
      }
    }
    const res = await Update({
      ...userInfo,
      id: store.userInfo.id
    })
    if (res) {
      const response = await GetSelfInfo()
      if (response) {
        store.setUserInfo({ userInfo: response })
        resolve()
      }
    }
  })
}

// 文件转base64编码
const FileToBase64 = (image) => {
  return new Promise(async (resolve,reject)=>{
    // 转base64
    if(image){
      const fileManage = wx.getFileSystemManager()
      fileManage.readFile({
        filePath: image,
        encoding: 'base64',
        success:(res)=>{
          resolve(res.data)
        },
        fail:(error)=>{
          console.log('readFile',error)
          resolve(null)
        }
      })
    }
  })
}


// 图像识别 验证
const ImageIdentify = (imgBase64) => {
  return new Promise(async (resolve) =>{
    if(imgBase64){
      let res = await GetFaceToken()
      if(res.code === 200){
        wx.request({
          url: `https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=${res.data}`,
          method: 'POST',
          data: {
            image: imgBase64,
            face_field: 'quality',
            image_type: 'BASE64',
            max_face_num: 2,
            face_type: 'LIVE',
            liveness_control: 'NORMAL'
          },
          success:async (res) => {
            if(res.data.error_code === 0){
              if(res.data.result){
                if(res.data.result.face_num === 1){
                  let face = res.data.result.face_list[0]
                  // face_probability 代表这是一张人脸的概率，0最小、1最大。
                  if(face.face_probability >= 0.7){
                    let quality = face.quality
                    if(quality.blur > 0.6){
                      wx.showToast({
                        title: '图片不清晰',
                        icon: 'none'
                      })
                      resolve(false)
                    }else{
                      if(quality.illumination < 60){
                        wx.showToast({
                          title: '图片亮度较低',
                          icon: 'none'
                        })
                        resolve(false)
                      }else{
                        let angle = face.angle
                        if(angle.pitch > 20 || angle.roll > 20 || angle.yaw > 20){
                          wx.showToast({
                            title: '人脸角度不正',
                            icon: 'none'
                          })
                          resolve(false)
                        }else{
                          let occlusion = quality.occlusion
                          let num =0.5
                          if(occlusion.left_eye > num || occlusion.right_eye > num || occlusion.nose > num || occlusion.mouth > num || occlusion.left_cheek > num || occlusion.right_cheek > num || occlusion.chin_contour > num){
                            wx.showToast({
                              title: '脸部不全或有遮挡',
                              icon: 'none'
                            })
                            resolve(false)
                          }else{
                            if(quality.completeness === 0){
                              wx.showToast({
                                title: '人脸不完整',
                                icon: 'none'
                              })
                              resolve(false)
                            }else{
                              resolve(face.location)
                            }
                          }
                        }
                      }
                    }
                  }else{
                    wx.showToast({
                      title: '图片不规范，请重新选择图片或拍摄',
                      icon: 'none'
                    })
                    resolve(false)
                  }
                } else{
                  wx.showToast({
                    title: '必须为单人照，请重新选择图片或拍摄',
                    icon: 'none'
                  })
                  resolve(false)
                }
              }else{
                wx.showToast({
                  title: '检测不到人脸，请重新选择图片或拍摄',
                  icon: 'none'
                })
                resolve(false)
              }
            }else{
              wx.showToast({
                title: '检测不到人脸，请重新选择图片或拍摄',
                icon: 'none'
              })
              resolve(false)
            }
          },
          fail:(error)=>{
            console.log(error)
            resolve(false)
          }
        })
      }else{
        resolve(false)
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  ChooseImage: chooseImage,
  DownloadFile,
  Upload,
  GetLoginCode: GetLoginCode,
  GetImageInfo,
  GetWxmlInfo,
  WxAuthor,
  IpLocation,
  ChooseLocation,
  SubscribeMessage,
  UploadOss,
  GetSetting,
  GetLocation,
  UploadsOss,
  ShowActionSheet,
  ChooseVideo,
  Compare,
  UpdateUserInfo,
  FileToBase64,
  ImageIdentify
}