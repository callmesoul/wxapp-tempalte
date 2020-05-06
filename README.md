## 项目包含有
- `flyio` 实现`api`接口拦截
- 不同环境的`api`接口域名
- `mobx-miniprogram-bindings` 作为全局的状态数据管理

## 目录说明
- api 接口
- assets 静态资源可以相对路径，也可使用/表示根目录觉得路径
- pages 页面
- utils 公共工具类/方法

## 用户无感登陆流程

进入小程序程序-》请求数据，如果没有token，则会锁住请求，想去登陆获取token再继续原来的请求（也就是说无伦如何，用户都有token，用户一进来就无感知登陆，后台根据code获取用户openid）

token失效请求失败时，锁住请求，重新登陆获取新的token，再重新发起失败请求，返回数据（用户无感知，重新登陆换取新token）


## 字体图标
assets/styles/font.wxss

## 组件
- 图片裁剪(image-cropper)
- 空内容提示(is-null)
- 分页加载提示（pagination）
- 生成分享海报（poster-modal）[https://github.com/jasondu/wxa-plugin-canvas](https://github.com/jasondu/wxa-plugin-canvas)
- 骨架屏（skeleton）