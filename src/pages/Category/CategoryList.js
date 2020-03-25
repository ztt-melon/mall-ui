import React, {PureComponent} from 'react'
import {message, Modal} from 'antd'
import List, {Filter, Pagination, Table} from 'nolist/lib/wrapper/antd'
import {Button, Dialog, Input} from 'nowrapper/lib/antd'

import classNames from 'classnames'
import styles from '../common.less'

import CategoryForm from './CategoryForm'
import request from '../../utils/request'
import Constants from '../../utils/constants'

let globalList
const categoryPath = Constants.backContextPath+'/category'

class CategoryList extends PureComponent {
    state = {}
    handleOperator = (type) => {
        if ('create' === type) {
            Dialog.show({
                title: '新增',
                footerAlign: 'label',
                locale: 'zh',
                width: 450,
                enableValidate: true,
                content: <CategoryForm option={{type}}/>,
                onOk: (values, hide) => {
                    hide()
                    request.post(categoryPath + '/add', {data: {...values}}).then(res => {
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
            request(categoryPath + '/getById?id=' + this.state.record.id).then(res => {
                if (res && res.code === 1) {
                    Dialog.show({
                        title: title,
                        footerAlign: 'label',
                        locale: 'zh',
                        width: 400,
                        enableValidate: true,
                        content: <CategoryForm option={{type, record: res.data}}/>,
                        onOk: (values, hide) => {
                            hide()
                            request.post(categoryPath + '/edit', {data: {...values}}).then(res => {
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
                width: 400,
                content: <p>确定要删除<span style={{fontWeight: 'bold'}}>类目名称=<span
                    style={{color: 'red'}}>{this.state.record.name}</span></span>的数据吗?</p>,
                onOk: (values, hide) => {
                    hide()
                    request(categoryPath + '/delete?id=' + this.state.record.id).then(res => {
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

    handleError = (err) => {
        console.log('err', err);
    }

    onMount = (list) => {
        this.list = globalList = list;
    }

    clickOperation = (type, record) => {
        this.setState({record})
        if ('onDoubleClick' === type) {
            this.handleOperator('edit')
        }
    }

    render() {
        return (
            <List url={categoryPath + '/list'} onError={this.handleError} onMount={this.onMount}>
                <div style={{float: 'right'}}>
                    <Filter noDefaultLayout>
                        <Filter.Item label="类目名称：" name="categoryName"><Input style={{width:200}}/></Filter.Item>
                        <Filter.Search><Button icon="search" type='primary'>查询</Button></Filter.Search>
                    </Filter>
                </div>
                <div className={classNames( styles.marginBottom10)}>
                    <Button icon="plus" type="primary" onClick={() => this.handleOperator('create')}>新增</Button>
                    <Button icon="edit" type="primary" onClick={() => this.handleOperator('edit')}
                            className={styles.marginLeft20}>编辑</Button>
                    <Button icon="eye" type="primary" onClick={() => this.handleOperator('view')}
                            className={styles.marginLeft20}>浏览</Button>
                    <Button icon="delete" type="primary" onClick={() => this.handleOperator('delete')}
                            className={styles.marginLeft20}>删除</Button>
                </div>
                <Table onRow={record => {
                    return {
                        onClick: () => this.clickOperation('onClick', record),
                        onDoubleClick: () => this.clickOperation('onDoubleClick', record)
                    }
                }}>
                    <Table.Column title="类目名称" dataIndex="name"/>
                    {/*<Table.Column title="规格模板" dataIndex="template" render={val => val === 0 ? '简单规格' : '复杂规格'}/>*/}
                    <Table.Column title="排序" dataIndex="sort"
                                  defaultSortOrder={'ascend'} sorter={(a, b) => a.sort - b.sort}/>
                </Table>
                <Pagination/>
            </List>
        )
    }
}

export default CategoryList