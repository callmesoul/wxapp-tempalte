import fly from './config'

export function GetAreas (params) {
    return fly.get('/collectionSchool/getAreaList', params)
}

export function GetProvinces (params) {
    return fly.get('/collectionSchool/getProvinceList', params)
}

export function GetCitys (params) {
    return fly.get('/collectionSchool/getCityList', params)
}


export function GetTowns (params) {
    return fly.get('/collectionSchool/getTownList', params)
}

export function GetSchools (params) {
    return fly.post('/collectionSchool/getSchoolList', params)
}

export function GetClasss (params) {
    return fly.get('/collectionClass/getClassList', params)
}

export function SaveInfo (params) {
    return fly.post('/collectionStudent/saveOrUpdate', params)
}

export function GetSchoolConfig (params) {
    return fly.get('/collectionSchool/getPhotoUrlAndPrompt', params)
}

export function UploadPhoto (params) {
    return fly.post('/collectionStudent/uploadPhoto', params)
}

export function GetFaceToken (params) {
    return fly.post('/CollectionLoginController/accessToken', params)
}
