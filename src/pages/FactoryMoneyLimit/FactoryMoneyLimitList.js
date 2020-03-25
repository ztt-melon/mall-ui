import React, {PureComponent} from 'react'
import {message, Modal} from 'antd'
import List, {Pagination, Table} from 'nolist/lib/wrapper/antd'
import {Button, Dialog} from 'nowrapper/lib/antd'

import request from '../../utils/request'
import Constants from '../../utils/constants'
import FactoryMoneyLimitForm from "./FactoryMoneyLimitForm"
import classNames from "classnames";
import styles from "../common.less";

let globalList
const factoryMoneyLimitPath = Constants.backContextPath+'/factoryMoneyLimit'
const factoryPath = Constants.backContextPath+'/factory'

class FactoryMoneyLimitList extends PureComponent {
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
                content: <FactoryMoneyLimitForm option={{type}}/>,
                onOk: (values, hide) => {
                    hide()
                    request.post(factoryMoneyLimitPath + '/add', {data: {...values}}).then(res => {
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
            request(factoryMoneyLimitPath + '/getById?id=' + this.state.record.id).then(res => {
                if (res && res.code === 1) {
                    Dialog.show({
                        title: title,
                        footerAlign: 'left',
                        locale: 'zh',
                        width: 400,
                        enableValidate: true,
                        content: <FactoryMoneyLimitForm option={{type, record: res.data}}/>,
                        onOk: (values, hide) => {
                            hide()
                            request.post(factoryMoneyLimitPath + '/edit', {data: {...values}}).then(res => {
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
            <List url={factoryPath + '/list'} onMount={this.onMount}>
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
                    <Table.Column title="分厂名称" dataIndex="name"/>
                    <Table.Column title="创建时间" dataIndex="createTime"/>
                </Table>
                <Pagination/>
            </List>
        )
    }
}

export default FactoryMoneyLimitList