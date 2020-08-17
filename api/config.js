const Fly = require('../utils/fly')
const tokenFly = new Fly;
const fly = new Fly
const accountInfo = wx.getAccountInfoSync()
import { LoginUrl } from './auth'
import { GetUserInfoUrl } from './user'
import {
    store
} from '../store'
import config from '../config'
// base url 
if (accountInfo.miniProgram.envVersion === 'develop') {
    // 开发版
    fly.config.baseURL = config.apiBaseUrl.develop
    tokenFly.config.baseURL = config.apiBaseUrl.develop
} else if (accountInfo.miniProgram.envVersion === 'trial') {
    // 体验版
    fly.config.baseURL = config.apiBaseUrl.trial
    tokenFly.config.baseURL = config.apiBaseUrl.trial
} else if (accountInfo.miniProgram.envVersion === 'release') {
    // 正式版
    fly.config.baseURL = config.apiBaseUrl.release
    tokenFly.config.baseURL = config.apiBaseUrl.release
}

//添加请求拦截器
fly.interceptors.request.use(async (request) => {
    // 给所有请求添加自定义header
    const token = wx.getStorageSync('token')
    // 请求前先判断是否有token
    if (token && token !== '') {
        request.headers['openId'] = token
        // 如果有token 就判断是否已有用户信息，如果没有则锁住请求。先去获取用户信息，在继续原来请求
        if (!store.userInfo) {
            fly.lock();
            await getUserinfo(token)
            fly.unlock(); //解锁后，会继续发起请求队列中的任务，详情见后面文档
            return request; //只有最终返回request对象时，原来的请求才会继续
        }
    } else {
        // 如果没有token 则锁住请求，先去登陆获取token再继续原来请求
        fly.lock();
        const res = await login()
        if (res) {
            await getUserinfo(res)
            fly.unlock(); //解锁后，会继续发起请求队列中的任务，详情见后面文档
            return request; //只有最终返回request对象时，原来的请求才会继续
        }
    }

    //给所有请求头部添加appid
    request.headers['appid'] = accountInfo.miniProgram.appId
    //终止请求
    //var err=new Error("xxx")
    //err.request=request
    //return Promise.reject(new Error(""))

    //可以显式返回request, 也可以不返回，没有返回值时拦截器中默认返回request
    return request;
})

//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
    function (response) { //不要使用箭头函数，否则调用this.lock()时，this指向不对
        // 当token过期，请求失败时，先锁住，重新登陆获取新token再重新请求一次，再返回
        if (response.data.code === 'C501') {
            this.lock()
            const token = wx.getStorageSync('token')
            return tokenFly.get(`/util/checkSessionKey.do?sessionKey=${token}`)
                .then(async (result) => {
                    if (result.data.code === 'C200') {
                        if (!result.data.data) {
                            await login()
                        }
                    }
                    this.unlock()
                })
                .then(() => {
                    // log(`重新请求：path:${response.request.url}，baseURL:${response.request.baseURL}`)
                    return fly.request(response.request);
                })
        } else {
            //只将请求结果的data字段返回
            if (response.data.code === 'C500') {
                wx.showToast({
                    title: response.data.message,
                    icon: 'none'
                })
            }
            return response.data
        }
    },
    function (err) {
        //发生网络错误后会走到这里
        //return Promise.resolve("ssss")
    }
)

// 登陆获取token
function login() {
    return new Promise((resolve, reject) => {
        wx.login({
            success(res) {
                debugger
                if (res.code) {
                    //发起网络请求
                    return tokenFly.post(LoginUrl(), {
                        code: res.code,
                        appId: accountInfo.miniProgram.appId
                    }).then((result) => {
                        if (result.data.code === 200) {
                            wx.setStorageSync('token', result.data.data.openId)
                            resolve(result.data.data.openId)
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                    reject
                }
            },
            fail(err) {
                console.log('登录失败！' + err)
                reject()
            }
        })
    })
}

// 获取用户信息
function getUserinfo(sessionKey) {
    return new Promise((resolve, reject) => {
        tokenFly.get(GetUserInfoUrl(), {}, {
            headers: {
                openId: sessionKey
            }
        }).then((result) => {
            if (result.data.code === 200) {
                store.setUserInfo({
                    userInfo: result.data.data ? result.data.data : {}
                })
                resolve()
            } else if (result.data.code === 'C501') {
                // token 过期
                login().then((_sessionKey) => {
                    tokenFly.get(GetUserInfoUrl(), {}, {
                        headers: {
                            openId: _sessionKey
                        }
                    }).then((result) => {
                        if (result.data.code === 'C200') {
                            store.setUserInfo({
                                userInfo: result.data.data ? result.data.data : {}
                            })
                            resolve()
                        }
                    })
                })
            }
        })
    })
}

export default fly