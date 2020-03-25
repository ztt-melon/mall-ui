import request from '../utils/request'

export async function add(data) {
    console.log('/zybadmin/demo/add', data)
    return request('/zybadmin/demo/add', {method: 'POST', data: {...data}});
}