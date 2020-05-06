import Upload from './upload'
import { GetUserInfo, BindWx } from '../api/user'
import { store } from '../store'

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

const chooseImage = (params) => {
    return new Promise(resolve => {
      const config = {
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      }
      if(typeof(params) === 'number') {
        config.count = params
      }
      if(typeof(params) === 'object') {
        for(let i in params) {
          config[i] = params[i]
        }
      }
      wx.chooseImage({
        ...config,
        success: (res) =>{
          checkFileSize(res.tempFiles).then(() => {
            resolve(res.tempFilePaths)
          }).then(() => {
            resolve([])
          })
        },
        fail: () =>{
          resolve([])
        }
      })
    })
}

// 检查是否已授权用户信息
const Auth = (e) => {
  return new Promise(async (resolve,reject) => {
    const rawData = e.detail.rawData
    if (rawData) {
        const user = JSON.parse(e.detail.rawData)
        let avatarUrl
        if(user.avatarUrl === "") {
          avatarUrl = ''
        } else{
            const res = await DownloadFile(user.avatarUrl)
            if (res) {
              const result = await Upload(res, 'user/avatar', 1)
              if (result) {
                avatarUrl = result
              }
            }
        }
        const code = await GetLoginCode()
        if (code) {
          const res = await BindWx({
              avatarUrl: avatarUrl,
              name: user.nickName,
              code: code
          })
          if(res.code === 'C200') {
              wx.setStorageSync('token', res.data.sessionKey)
              GetUserInfo().then((res) => {
                  store.setUserInfo({ userInfo: res.data })
                  resolve()
              }).then(() => {
                reject()
              })
          }
        }
    } else {
        wx.showToast({
          title: '请先授权用户信息',
          icon: 'none'
        })
        reject()
    }
  })
}

// 检查文件大小
const checkFileSize = (files) => {
  return new Promise((resolve,reject) => {
    for(let i = 0; i < files.length; i++) {
      if (files[i].size > 1048576){ // 不超过1mb
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
      fail: () => {
        resolve(null)
      }
    })
  })
}

// 获取登陆code
const GetLoginCode = () => {
  return new Promise((resolve,reject) => {
    wx.login({
      success: (res) => {
        if(res.code){
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

module.exports = {
  formatTime: formatTime,
  ChooseImage: chooseImage,
  DownloadFile,
  Upload,
  GetLoginCode: GetLoginCode,
  Auth
}
