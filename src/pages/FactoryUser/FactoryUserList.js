import React, {PureComponent} from 'react'
import {message, Modal} from 'antd'
import List, {Filter, Pagination, Table} from 'nolist/lib/wrapper/antd'
import {Button, Dialog, Input} from 'nowrapper/lib/antd'

import request from '../../utils/request'
import Constants from '../../utils/constants'
import FactoryUserForm from "./FactoryUserForm"
import classNames from "classnames";
import styles from "../common.less";

let globalList
const factoryUserPath = Constants.backContextPath + '/factoryUser'

class FactoryUserList extends PureComponent {
    state = {}
    onMount = (list) => {
        this.list = globalList = list;
    }

    handleOperator = (type) => {
        if ('create' === type) {
            Dialog.show({
                title: '新增',
                footerAlign: 'left',
                locale: 'zh',
                width: 400,
                enableValidate: true,
                content: <FactoryUserForm option={{type}}/>,
                onOk: (values, hide) => {
                    hide()
                    request.post(factoryUserPath + '/add', {data: {...values}}).then(res => {
                        if (res && res.code === 1) {
                            message.success("操作成功")
                            globalList.refresh()
                        } else {
                            message.error("操作失败")
                        }
                    })
                }
            })
        } else if ('edit' === type || 'view' === type) {
            if (this.state.record === undefined) {
                message.warning('请先单击一条数据!')
                return
            }
            let title = 'edit' === type ? '编辑' : '浏览'
            request(factoryUserPath + '/getById?id=' + this.state.record.id).then(res => {
                if (res && res.code === 1) {
                    Dialog.show({
                        title: title,
                        footerAlign: 'left',
                        locale: 'zh',
                        width: 400,
                        enableValidate: true,
                        content: <FactoryUserForm option={{type, record: res.data}}/>,
                        onOk: (values, hide) => {
                            hide()
                            request.post(factoryUserPath + '/edit', {data: {...values}}).then(res => {
                                if (res && res.code === 1) {
                                    message.success("操作成功")
                                    globalList.refresh()
                                } else {
                                    message.error("操作失败")
                                }
                            })
                        }
                    })
                } else {
                    message.error("操作失败")
                }
            })
        } else if ('delete' === type) {
            if (this.state.record === undefined) {
                message.warning('请先单击一条数据!')
                return
            }
            Dialog.show({
                title: '提示',
                footerAlign: 'label',
                locale: 'zh',
                width: 380,
                content: <p>确定要删除<span style={{fontWeight: 'bold'}}>分厂名称=<span
                    style={{color: 'red'}}>{this.state.record.name}</span></span>的数据吗?</p>,
                onOk: (values, hide) => {
                    hide()
                    request(factoryUserPath + '/delete?id=' + this.state.record.id).then(res => {
                        if (res && res.code === 1) {
                            globalList.refresh()
                            message.success("删除成功")
                        } else {
                            Modal.error({
                                title: '错误提示',
                                content: res.msg || "删除失败"
                            })
                        }
                    })
                }
            })
        }
    }

    clickOperation = (type, record) => {
        this.setState({record})
        if ('onDoubleClick' === type) {
            this.handleOperator('edit')
        }
    }

    render() {
        return (
            <List url={factoryUserPath + '/list'} onMount={this.onMount}>
                <div className={classNames(styles.marginBottom10)}>
                    <Button icon="plus" type="primary" onClick={() => this.handleOperator('create')}>新增</Button>
                    <Button icon="edit" type="primary" onClick={() => this.handleOperator('edit')}
                            className={styles.marginLeft20}>编辑</Button>
                </div>
                <Table onRow={record => {
                    return {
                        onClick: () => this.clickOperation('onClick', record),
                        onDoubleClick: () => this.clickOperation('onDoubleClick', record)
                    }
                }}>
                    <Table.Column title="分厂名称" dataIndex="company.name"/>
                    <Table.Column title="登录名" dataIndex="loginName"/>
                    <Table.Column title="创建时间" dataIndex="createTime"/>
                </Table>
                <Pagination/>
            </List>
        )
    }
}

export default FactoryUserList