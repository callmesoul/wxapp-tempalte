const Fly = require('../utils/fly')
const fly = new Fly

//添加请求拦截器
fly.interceptors.request.use((request)=>{
    const accountInfo = wx.getAccountInfoSync()
    //base url 
    if (accountInfo.miniProgram.envVersion === 'develop') {
        // 开发版
        request.baseURL = ''
    } else if (accountInfo.miniProgram.envVersion === 'trial') {
        // 体验版
        request.baseURL = ''
    } else if (accountInfo.miniProgram.envVersion === 'release') {
        // 正式版
        request.baseURL = ''
    }
    

    //给所有请求添加自定义header
    const token = wx.getStorageSync('token')
    if (token) {
        request.headers['token']= token
    }
    //给所有请求头部添加appid
    request.headers['appid']= accountInfo.miniProgram.appId
  	//终止请求
  	//var err=new Error("xxx")
  	//err.request=request
  	//return Promise.reject(new Error(""))
  
    //可以显式返回request, 也可以不返回，没有返回值时拦截器中默认返回request
    return request.body;
})
 
//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
    (response) => {
        //只将请求结果的data字段返回
        return response.data
    },
    (err) => {
        //发生网络错误后会走到这里
        //return Promise.resolve("ssss")
    }
)

export default fly