// pages/picture/index.js
import {
    WxAuthor,
    ChooseImage,
    FileToBase64,
    ImageIdentify
} from '../../utils/util'
import {
    GetSchoolConfig,
    UploadPhoto
} from '../../api/util'
import {
    createStoreBindings
} from 'mobx-miniprogram-bindings'
import {
    store
} from '../../store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowSkeleton: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ['userInfo'],
            actions: ['changeUserInfo'],
        })
        await this.getConfig()
        this.setData({
            isShowSkeleton: false
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
    onUnload: async function () {

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

    async toCamera() {
        const result = await WxAuthor('camera')
        if (result) {
            wx.navigateTo({
                url: '/pages/picture/shoot',
            })
        }
    },

    async chooseImage() {
        const files = await ChooseImage(1)
        if (files && files[0]) {
            //获取到image-cropper对象
            this.setData({
                isShowImageCropper: true
            })
            wx.nextTick(() => {
                this.cropper = this.selectComponent("#image-cropper");
                //开始裁剪
                this.setData({
                    'apply.picture': files[0]
                });
                wx.showLoading({
                    title: '加载中'
                })
            })

        }
    },

    cropperload(e) {
        console.log("cropper初始化完成");
    },

    loadimage(e) {
        console.log("图片加载完成", e.detail);
        wx.hideLoading();
        //重置图片角度、缩放、位置
        this.cropper.imgReset();
    },
    async clickcut(e) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        const base64 = await FileToBase64(e.detail.url)
        if (base64) {
            const result = await ImageIdentify(base64)
            if (result) {
                const res = await UploadPhoto({
                    photo: base64,
                    openId: wx.getStorageSync('token'),
                    schoolId: this.data.userInfo.schoolId,
                    studentId: this.data.userInfo.id,
                    path: 'user/avatar'
                })
                if (res.code === 200) {
                    this.changeUserInfo({
                        photoUrl: res.data.photo
                    })
                    wx.nextTick(() => {
                        wx.navigateBack({
                            delta: 1,
                            success: () => {
                                wx.showToast({
                                    title: '上传成功',
                                })
                            }
                        })
                    })
                }
            }
        }
        wx.hideLoading({
          success: (res) => {},
        })
    },

    hidenImageCropper(e) {
        this.setData({
            isShowImageCropper: false,
            'apply.picture': ''
        })
    },

    getConfig() {
        return new Promise(async resolve => {
            const res = await GetSchoolConfig({
                schoolId: 6
            })
            if (res.code === 200) {
                this.setData({
                    config: res.data
                })
            }
            resolve()
        })
    }
})