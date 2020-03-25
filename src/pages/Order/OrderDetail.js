import React, {PureComponent} from 'react'
import {Descriptions, PageHeader} from 'antd'

import request from '../../utils/request'
import Constants from '../../utils/constants'

const orderPath = Constants.backContextPath+'/order'
const hostPath = Constants.hostPath

class OrderDetail extends PureComponent {
    state = {
        currentPage: 1,
        pageSize: 5,
    }

    componentWillMount() {
        //获取订单id
        let orderId = this.props.location.query.orderId
        request.get(orderPath + '/queryById?orderId=' + orderId).then(res => {
            if (res && res.code === 1) {
                this.setState({orderData: res.data})
            }
        })
    }

    showOrderInfo = () => {
        if (this.state.orderData) {
            return <Descriptions title="订单信息">
                <Descriptions.Item label="订单编号">{this.state.orderData.orderId}</Descriptions.Item>
                <Descriptions.Item label="订单状态">
                    {this.orderStatus(this.state.orderData.orderStatus.status)}
                </Descriptions.Item>
                <Descriptions.Item label="下单时间">{this.state.orderData.createTime}</Descriptions.Item>
                <Descriptions.Item label="商品总额">{this.state.orderData.actualPay}</Descriptions.Item>
                <Descriptions.Item label="运费金额">{this.state.orderData.postFee}</Descriptions.Item>
                <Descriptions.Item label="应付金额">
                    {this.state.orderData.actualPay + this.state.orderData.postFee}
                </Descriptions.Item>
            </Descriptions>
        }
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

    showItem = () => {
        if (this.state.orderData) {
            let arr = []
            arr.push(<Descriptions.Item span={4}>商品名称</Descriptions.Item>)
            arr.push(<Descriptions.Item>{"价格"}</Descriptions.Item>)
            arr.push(<Descriptions.Item>{"数量"}</Descriptions.Item>)
            this.state.orderData.orderDetails.map(item => {
                arr.push(<Descriptions.Item span={4}>
                    <img src={item.image} width="60px" height="60px"/>
                    {<a target="_blank" href={hostPath + '/item.html?id=' + item.id}>{item.title}</a>}
                </Descriptions.Item>)
                arr.push(<Descriptions.Item>{item.price}</Descriptions.Item>)
                arr.push(<Descriptions.Item>{item.num}</Descriptions.Item>)
            })
            return <Descriptions title="商品信息" size="small" column={6}>
                {arr}
            </Descriptions>
        }
    }

    showReceiver = () => {
        if (this.state.orderData) {
            return <Descriptions title="收货人信息">
                <Descriptions.Item label="分厂名称">{this.state.orderData.company.name}</Descriptions.Item>
                <Descriptions.Item label="收货人">{this.state.orderData.receiver}</Descriptions.Item>
                <Descriptions.Item label="手机号码">{this.state.orderData.receiverMobile}</Descriptions.Item>
                <Descriptions.Item label="邮编">{this.state.orderData.receiverZip}</Descriptions.Item>
                <Descriptions.Item
                    label="收货地址">{this.state.orderData.receiverState + this.state.orderData.receiverCity + this.state.orderData.receiverDistrict + this.state.orderData.receiverAddress}</Descriptions.Item>
            </Descriptions>
        }
    }

    render() {
        return (
            <div>
                <PageHeader
                    style={{paddingLeft: 0, paddingTop: 0}}
                    onBack={() => history.back()}
                    subTitle="返回订单列表"
                />
                {this.state.orderData ? this.showOrderInfo() : ''}
                {this.state.orderData ? this.showItem() : ''}
                {this.state.orderData ? this.showReceiver() : ''}
            </div>
        )
    }
}

export default OrderDetail