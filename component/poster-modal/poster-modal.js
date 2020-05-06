// component/poster-modal/poster-modal.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        src: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        saveImage () {
            wx.saveImageToPhotosAlbum({
                filePath: this.data.src,
                success:(res) => {
                    wx.showToast({
                        title: '保存成功，快去分享到朋友圈吧',
                        icon: 'none'
                    })
                    this.triggerEvent('finish', true)
                },
                fail: () =>{
                    wx.showToast({
                      title: '保存失败，请稍后再试',
                      icon: 'none'
                    })
                }
              })
        },
        close () {
            this.triggerEvent('finish', false)
        }
    }
})
