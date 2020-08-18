import { observable, action } from 'mobx-miniprogram'

export const store = observable({

    // 数据字段
    userInfo: null,
    photoUrl: '',

    setUserInfo: action(function ({ userInfo }) {
      this.userInfo = userInfo
      this.photoUrl = userInfo.photoUrl
    }),

    changeUserInfo: action(function (params) {
      for (let i in params) {
        if(i === 'photoUrl') {
          this.photoUrl = params[i]
        } else {
          this.userInfo[i] = params[i]
        }
      }
    })
  
})