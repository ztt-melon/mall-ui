import mockjs from 'mockjs'

export default {
    'GET /demo/list': mockjs.mock({
        "code": 0,
        "data": {
            "dataList": [
                {
                    "id": "aa",
                    "username": "aa",
                    "age": 10
                },
                {
                    "id": "bb",
                    "username": "bb",
                    "age": 10
                },
                {
                    "id": "cc",
                    "username": "cc",
                    "age": 10
                }
            ],
            "total": 3,
            "totalPage": 2,
            "pageSize": 2,
            "currentPage": 1,
        }
    })
}