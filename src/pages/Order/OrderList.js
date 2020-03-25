import React, {PureComponent} from 'react'
import {Button, Descriptions, Pagination} from 'antd'
import Form, {FormCore, FormItem} from 'noform'
import {Input, Select} from 'nowrapper/lib/antd'
import Link from 'umi/link'

import request from '../../utils/request'
import Constants from '../../utils/constants'

const factoryPath = Constants.backContextPath + '/factory'
const orderPath = Constants.backContextPath + '/order'
const hostPath = Constants.hostPath

//0、等待商家发货 3、已发货,未确认 8、确认收货 4、交易成功 7、取消订单
const statusOption = [
    {label: '所有', value: '100'},
    {label: '等待商家发货', value: '0'},
    {label: '已发货,未确认', value: '3'},
    {label: '确认收货', value: '8'},
    {label: '交易成功', value: '4'},
    {label: '取消订单', value: '7'},
]

class OrderList extends PureComponent {
    state = {
        currentPage: 1,
        pageSize: 5
    }

    constructor(props) {
        super(props);
        this.core = new FormCore();
    }

    getOrderData = (currentPage) => {
        request.get(orderPath + '/orderList?currentPage=' + currentPage + "&pageSize=" + this.state.pageSize + "&orderId=" + (this.core.getValue("orderId") || "") + "&companyId=" + (this.core.getValue("companyId") || "") + "&status=" + (this.core.getValue("status") || "")).then(res => {
            if (res && res.code === 1) {
                this.setState({orderData: res.data})
            }
        })
    }

    componentWillMount() {
        //判断是否已登录
        let companyType = sessionStorage.getItem("companyType")
        if (!companyType) {
            //未登录
            window.location.href = hostPath + '/user/login'
            return
        }
        //取出分厂
        request.get(factoryPath + '/factoryList').then(res => {
            if (res && res.code === 1) {
                this.setState({selectData: res.data})
            }
        })
        //获取订单
        this.getOrderData(this.state.currentPage)
    }

    onClick = (orderId, status) => {
        request.get(orderPath + '/orderStatus?orderId=' + orderId + '&status=' + status).then(res => {
            if (res && res.code === 1) {
                //重新获取订单
                this.getOrderData(this.state.currentPage)
            }
        })
    }
    orderStatus = (status) => {
        let statusInfo = ''
        if (status === 0) {
            statusInfo = '等待商家发货'
        } else if (status === 3) {
            statusInfo = '已发货,未确认'
        } else if (status === 8) {
            statusInfo = '确认收货'
        } else if (status === 4) {
            statusInfo = '交易成功'
        } else if (status === 7) {
            statusInfo = '取消订单'
        }
        return statusInfo
    }
    showOrderStatusButton = (order) => {
        //0、等待商家发货 3、已发货,未确认 8、确认收货 4、交易成功 7、取消订单
        let arr = []
        let companyType = sessionStorage.getItem("companyType")
        if (companyType === '1') {
            //分厂人员：取消订单、确认收货
            if (order.orderStatus.status === 0) {
                arr.push(<Button type="link" size="small" style={{paddingLeft: 5}}
                                 onClick={() => this.onClick(order.orderId, '7')}>取消订单</Button>)
            }
            if (order.orderStatus.status === 3) {
                arr.push(<Button type="link" size="small" style={{paddingLeft: 5}}
                                 onClick={() => this.onClick(order.orderId, '8')}>确认收货</Button>)
            }
        } else if (companyType === '2') {
            //商家：确认发货
            if (order.orderStatus.status === 0) {
                arr.push(<Button type="link" size="small" style={{paddingLeft: 5}}
                                 onClick={() => this.onClick(order.orderId, '3')}>确认发货</Button>)
            }
        } else if (companyType === '3') {
            //管理员：取消订单
            if (order.orderStatus.status === 0) {
                arr.push(<Button type="link" size="small" style={{paddingLeft: 5}}
                                 onClick={() => this.onClick(order.orderId, '7')}>取消订单</Button>)
            }
        }
        return arr
    }
    showOrder = () => {
        if (this.state.orderData) {
            let count = 0
            return this.state.orderData.dataList.map(order => {
                if (count === 0) {
                    count++
                    return <div style={{border: '1px solid #e8e8e8'}}>
                        <div style={{height: 32, background: '#f5f5f5', color: '#aaa'}}>
                            <span style={{paddingLeft: 15}}>订单编号：{order.orderId}</span>
                            <span style={{paddingLeft: 15}}>下单时间：{order.createTime}</span>
                            <span style={{paddingLeft: 15}}>订单总额：￥{order.totalPay}</span>
                            <span style={{paddingLeft: 15}}>状态：{this.orderStatus(order.orderStatus.status)}</span>
                            <Link to={"/orderDetail?orderId=" + order.orderId} style={{paddingLeft: 15}}>查看订单</Link>
                            {
                                this.showOrderStatusButton(order)
                            }
                        </div>
                        <Descriptions size="small" column={6}>
                            {this.showItem(order.orderDetails)}
                        </Descriptions>
                    </div>
                } else {
                    return <div style={{marginTop: 5, border: '1px solid #e8e8e8'}}>
                        <div style={{height: 32, background: '#f5f5f5', color: '#aaa'}}>
                            <span style={{paddingLeft: 15}}>订单编号：{order.orderId}</span>
                            <span style={{paddingLeft: 15}}>下单时间：{order.createTime}</span>
                            <span style={{paddingLeft: 15}}>订单总额：￥{order.totalPay}</span>
                            <span style={{paddingLeft: 15}}>状态：{this.orderStatus(order.orderStatus.status)}</span>
                            <Link to={"/orderDetail?orderId=" + order.orderId} style={{paddingLeft: 15}}>查看订单</Link>
                            {
                                this.showOrderStatusButton(order)
                            }
                        </div>
                        <Descriptions size="small" column={6}>
                            {this.showItem(order.orderDetails)}
                        </Descriptions>
                    </div>
                }
            })
        }
    }

    showItem = (items) => {
        let arr = []
        arr.push(<Descriptions.Item span={4}><span style={{paddingLeft: 15}}>商品信息</span></Descriptions.Item>)
        arr.push(<Descriptions.Item>{"价格"}</Descriptions.Item>)
        arr.push(<Descriptions.Item>{"数量"}</Descriptions.Item>)
        items.map(item => {
            arr.push(<Descriptions.Item span={4}>
                <img src={item.image} width="60px" height="60px"/>
                {<a target="_blank" href={hostPath + '/item.html?id=' + item.id}>{item.title}</a>}
            </Descriptions.Item>)
            arr.push(<Descriptions.Item>{item.price}</Descriptions.Item>)
            arr.push(<Descriptions.Item>{item.num}</Descriptions.Item>)
        })
        return arr
    }

    onChange = (currentPage) => {
        this.setState({currentPage})
        this.getOrderData(currentPage)
    }
    showPagination = () => {
        if (this.state.orderData) {
            let total = this.state.orderData.totalPage
            return <div style={{marginTop: 7, float: 'right'}}>
                <Pagination showQuickJumper defaultCurrent={this.state.currentPage}
                            pageSize={this.state.pageSize}
                            total={this.state.orderData.total}
                            showTotal={total => `共${total}条`}
                            onChange={this.onChange}/>
            </div>

        }
    }

    search = () => {
        this.getOrderData(this.state.currentPage)
    }

    showFactoryName = () => {
        let companyType = sessionStorage.getItem("companyType")
        if (sessionStorage.getItem("companyType") === '0') {
            return <FormItem label="分厂名称" name="companyId" defaultMinWidth={false}>
                <Select options={this.state.selectData} style={{width: 150}}/>
            </FormItem>
        }
    }

    render() {
        return (
            <div>
                <Form core={this.core} direction="horizontal">
                    <FormItem label="订单号" name="orderId"><Input style={{width: 200}}/></FormItem>
                    {this.state.orderData ? this.showFactoryName() : ''}
                    <FormItem label="订单状态" name="status" defaultMinWidth={false} defaultValue={'100'}>
                        <Select options={statusOption} style={{width: 150}}/>
                    </FormItem>
                    <Button onClick={this.search} icon="search" type='primary'>查询</Button>
                </Form>
                {this.state.orderData ? this.showOrder() : ''}
                {this.state.orderData ? this.showPagination() : ''}
            </div>
        )
    }
}

export default OrderList