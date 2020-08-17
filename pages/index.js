// pages/index.js
import { GetAreas, GetSchools, GetClasss, SaveInfo, GetProvinces, GetCitys, GetTowns } from '../api/util'
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { store } from '../store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showTopTips: false,
        formData: {
            schoolName: '',
            areaName: '',
            className: '',
            name: '',
            remarks: '',
            stuCard: ''
        },
        rules: [{
            name: 'areaName',
            rules: {required: true, message: '地区是必选项'},
        }, {
            name: 'schoolName',
            rules: {required: true, message: '学校是必选项'},
        }, {
            name: 'className',
            rules: [{ required: true, message: '班级是必选项'}],
        }, {
            name: 'name',
            rules: [{required: true, message: '学生姓名必填'}],
        }],
        areas: [],
        schools: [],
        schoolIndex: '',
        areaIndex: '',
        classIndex: '',
        classs: [],
        provinces: [[], [], []],
        areaIndex: [0, 0, 0],
        isShowSkeleton: true,
        isShowImageCropper: false
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
        await this.getProvinces()
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

    formInputChange (e) {
        const field = e.currentTarget.dataset.field
        this.setData({
            [`formData.${field}`]: e.detail.value
        })
    },

    async bindAreaChange (e) {
        const column = e.detail.column
        const value = e.detail.value
        if(column === 0) {
            await this.getCitys(this.data.areas[0][value].name)
            await this.getTowns(this.data.areas[1][0].name)
        } if (column === 1) {
            await this.getTowns(this.data.areas[1][value].name)
        }
    },

    bindSchoolChange (e) {
        const index = parseInt(e.detail.value)
        this.setData({
            [`schoolIndex`]: index,
            [`formData.schoolName`]: this.data.schools[index].schoolName,
        })
        if (this.data.classIndex !== '') {
            this.setData({
                classIndex: '',
                'formData.className': ''
            })
        }
        this.getClasss()
    },

    bindClassChange (e) {
        const index = e.detail.value
        this.setData({
            [`classIndex`]: index,
            [`formData.className`]: this.data.classs[index].name,
        })
    },

    submitForm() {
        this.selectComponent('#form').validate(async (valid, errors) => {
            console.log('valid', valid, errors)
            if (!valid) {
                const firstError = Object.keys(errors)
                if (firstError.length) {
                    this.setData({
                        error: errors[firstError[0]].message
                    })
                }
            } else {
                wx.showLoading({
                  title: '加载中...',
                  mask: true
                })
                const openId = wx.getStorageSync('token')
                const accountInfo = wx.getAccountInfoSync()
                const areas = this.data.areas
                const values = this.data.areaIndex
                const res = await SaveInfo({
                    ...this.data.formData,
                    appId: accountInfo.miniProgram.appId,
                    province: areas[0][values[0]].name,
                    city: areas[1][values[1]].name,
                    town: areas[2][values[2]].name,
                    classId: this.data.classs[this.data.classIndex].id,
                    className: this.data.classs[this.data.classIndex].className,
                    gradeName: this.data.classs[this.data.classIndex].gradeName,
                    schoolId: this.data.schools[this.data.schoolIndex].id,
                    schoolName: this.data.schools[this.data.schoolIndex].schoolName,
                    openId,
                    id: this.data.userInfo && this.data.userInfo.id ? this.data.userInfo.id : null
                })
                if (res.code === 200) {
                    this.changeUserInfo({
                        city: areas[1][values[1]].name,
                        classId: this.data.classs[this.data.classIndex].id,
                        className: this.data.classs[this.data.classIndex].className,
                        name: this.data.formData.name,
                        province: areas[0][values[0]].name,
                        remarks: this.data.formData.remarks,
                        schoolId: this.data.schools[this.data.schoolIndex].id,
                        schoolName: this.data.schools[this.data.schoolIndex].schoolName,
                        stuCard: this.data.formData.stuCard,
                        town: areas[2][values[2]].name,
                        id: res.data.studentId
                    })
                    wx.navigateTo({
                      url: `/pages/picture/show`,
                    })
                }
                wx.hideLoading({
                  success: (res) => {},
                })
            }
        })
    },

    getProvinces () {
        return new Promise(async resolve => {
            const res = await GetProvinces()
            if (res.code === 200) {
                for(let i = 0; i < res.data.length; i++){
                    res.data[i].name = res.data[i].province
                }
                this.data.areas[0] = res.data
                this.setData({
                    areas: this.data.areas
                })
                
                if (this.data.userInfo && this.data.userInfo.province && this.data.userInfo.province !== '') {
                    const provinceIndex = this.data.areas[0].findIndex(item=> item.name === this.data.userInfo.province)
                    this.data.areaIndex[0] = provinceIndex
                    await this.getCitys(this.data.areas[0][this.data.areaIndex[0]].name)
                    const cityIndex = this.data.areas[1].findIndex(item=> item.name === this.data.userInfo.city)
                    this.data.areaIndex[1] = cityIndex
                    await this.getTowns(this.data.areas[1][this.data.areaIndex[1]].name)
                    const townIndex = this.data.areas[2].findIndex(item=> item.name === this.data.userInfo.town)
                    this.data.areaIndex[2] = townIndex
                    await this.getSchools()
                    const schoolIndex = this.data.schools.findIndex(item => item.id === this.data.userInfo.schoolId)
                    this.data.schoolIndex = schoolIndex
                    await this.getClasss()
                    const classIndex = this.data.classs.findIndex(item => item.id === this.data.userInfo.classId)
                    this.setData({
                        areas: this.data.areas,
                        areaIndex: this.data.areaIndex,
                        schoolIndex: this.data.schoolIndex,
                        classIndex: classIndex,
                        'formData.name': this.data.userInfo.name,
                        'formData.stuCard': this.data.userInfo.stuCard,
                        'formData.remarks': this.data.userInfo.remarks,
                        'formData.schoolName': this.data.userInfo.schoolName,
                        'formData.className': this.data.userInfo.className,
                        'formData.areaName': this.data.areas[0][this.data.areaIndex[0]].name + this.data.areas[1][this.data.areaIndex[1]].name + this.data.areas[2][this.data.areaIndex[2]].name,
                    })
                } else {
                    await this.getCitys(this.data.areas[0][0].name)
                    await this.getTowns(this.data.areas[1][0].name)
                }
            }
            resolve()
        })
    },

    getCitys (name) {
        return new Promise(async resolve => {
            const res = await GetCitys({
                province: name
            })
            if (res.code === 200) {
                const citys = []
                res.data.map(item => {
                    citys.push({
                        name: item
                    })
                })
                this.data.areas[1] = citys
                this.setData({
                    areas: this.data.areas
                })
            }
            resolve()
        })
    },

    getTowns (name) {
        return new Promise(async resolve => {
            const res = await GetTowns({
                city: name
            })
            if (res.code === 200) {
                const towns = []
                res.data.map(item => {
                    towns.push({
                        name: item
                    })
                })
                this.data.areas[2] = towns
                this.setData({
                    areas: this.data.areas
                })
            }
            resolve()
        })
    },

    getSchools () {
        return new Promise(async resolve => {
            const areas = this.data.areas
            const areaIndex = this.data.areaIndex
            const res = await GetSchools({
                province: areas[0][areaIndex[0]].name,
                city: areas[1][areaIndex[1]].name,
                town: areas[2][areaIndex[2]].name
            })
            if (res.code === 200) {
                this.setData({
                    schools: res.data
                })
            }
            resolve()
        })
    },

    areaChange (e) {
        const areas = this.data.areas
        const values = e.detail.value
        this.setData({
            areaIndex: e.detail.value,
            'formData.areaName': areas[0][values[0]].name + areas[1][values[1]].name + areas[2][values[2]].name
        })
        if(this.data.schoolIndex !== '') {
            this.setData({
                schoolIndex: '',
                'formData.schoolName': ''
            })
        }
        if (this.data.classIndex !== '') {
            this.setData({
                classIndex: '',
                'formData.className': ''
            })
        }
        this.getSchools()
    },

    getClasss () {
        return new Promise(async resolve => {
            const res = await GetClasss({
                schoolId: this.data.schools[this.data.schoolIndex].id
            })
            if (res.code === 200) {
                res.data.map(item=>{
                    item.name = `${item.gradeName} ${item.className}`
                })
                this.setData({
                    classs: res.data
                })
            }
            resolve()
        })
    }
})