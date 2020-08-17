import { observable, action } from 'mobx-miniprogram'

export const store = observable({

    // 数据字段
    userInfo: null,

    setUserInfo: action(function ({ userInfo }) {
      this.userInfo = userInfo
    }),

    changeUserInfo: action(function (params) {
      for (let i in params) {
        this.userInfo[i] = params[i]
      }
    })
  
})