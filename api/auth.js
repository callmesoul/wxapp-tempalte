import fly from './config'

export function Get (params) {
    return fly.get('/api', params)
}