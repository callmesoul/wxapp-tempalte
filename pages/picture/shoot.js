// pages/picture/shoot.js
import { FileToBase64, ImageIdentify } from '../../utils/util'
import { UploadPhoto } from '../../api/util'
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { store } from '../../store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        devicePosition: 'back',
        src:'',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.storeBindings = createStoreBindings(this, {
        store,
        fields: ['userInfo'],
        actions: ['changeUserInfo'],
      })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.ctx = wx.createCameraContext()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    error(e) {
        console.log(e.detail)
      },
      // 拍照
      async takePhoto() {
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        this.ctx.takePhoto({
          quality: 'normal',
          success: async (res) => {
            this.setData({
              src: res.tempImagePath
            })
            let imgBase64 = await FileToBase64(res.tempImagePath)
            if(imgBase64){
              let location  = await ImageIdentify(imgBase64)
              if(location){
                let res = await UploadPhoto({
                  photo: imgBase64,
                  openId: wx.getStorageSync('token'),
                  schoolId: this.data.userInfo.schoolId,
                  studentId: this.data.userInfo.id,
                  path: 'user/avatar'
                })
                if(res.code === 200){
                  this.changeUserInfo({
                    photoUrl: res.data.photo
                  })
                  wx.navigateBack({
                    delta: 2,
                    success: () =>{
                        wx.showToast({
                            title: '上传成功',
                        })
                    }
                  })
                }
              }else{
                wx.showToast({
                  title: '拍照图片不合规范，检测不到人脸，请重新拍摄',
                  icon: 'none'
                })
                this.setData({
                  src: ''
                })
                return false
              }
            }
          },
          fail:(error)=>{
            console.log(error)
            wx.hideLoading({
              success: (res) => {},
            })
          }
        })
        wx.hideLoading({
          success: (res) => {},
        })
      },
      // 切换前后摄像头
      changePoition(){
        if(this.data.devicePosition === 'back'){
          this.setData({
            devicePosition: 'front'
          })
        }else{
          this.setData({
            devicePosition: 'back'
          })
        }
      },
      // 取消
      back(){
        wx.navigateBack()
      }
})