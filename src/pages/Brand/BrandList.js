import React, {PureComponent} from 'react'
import {message, Modal, Spin} from 'antd'
import List, {Filter, Pagination, Table} from 'nolist/lib/wrapper/antd'
import {Button, Dialog, Input} from 'nowrapper/lib/antd'

import classNames from 'classnames'
import styles from '../common.less'

import BrandForm from './BrandForm'
import request from '../../utils/request'
import Constants from '../../utils/constants'

let globalList
const adminContextPath = Constants.backContextPath
const brandPath = Constants.backContextPath+'/brand'


class BrandList extends PureComponent {
    state = {
        fileList: [],
        defaultFileList: []
    }

    putFileToState = file => {
        this.setState({fileList: [...this.state.fileList, file]})
        return false
    }
    removeFileFromState = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {fileList: newFileList}
        })
    }

    handleOperator = (type) => {
        if ('create' === type) {
            Dialog.show({
                title: '新增',
                footerAlign: 'label',
                locale: 'zh',
                width: 400,
                enableValidate: true,
                content: <BrandForm option={{type}} putFileToState={this.putFileToState}
                                   removeFileFromState={this.removeFileFromState}/>,
                onOk: (values, hide) => {
                    hide()
                    //准备附件数据
                    const formData = new FormData();
                    this.state.fileList.forEach((file) => {
                        formData.append('files', file)
                    })
                    const modal = Modal.info({
                        title: '提示',
                        content: <div><Spin/>正在操作中...</div>,
                        okButtonProps: {disabled: true}
                    })
                    //将表单数据放入formData
                    formData.append("form", JSON.stringify(values))
                    //异步请求
                    request.post(brandPath + '/add', {data: formData}).then(res => {
                        if (res && res.code === 1) {
                            message.success("操作成功")
                            modal.destroy()
                            globalList.refresh()
                        } else {
                            modal.update({content: '操作失败,请联系管理员!', okButtonProps: {disabled: false}})
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
            request(brandPath + '/getById?id=' + this.state.record.id).then(res => {
                if (res && res.code === 1) {
                    Dialog.show({
                        title: title,
                        footerAlign: 'label',
                        locale: 'zh',
                        width: 400,
                        enableValidate: true,
                        content: <BrandForm option={{type, record: res.data}} putFileToState={this.putFileToState}
                                           removeFileFromState={this.removeFileFromState}/>,
                        onOk: (values, hide) => {
                            hide()
                            //准备附件数据
                            const formData = new FormData();
                            this.state.fileList.forEach((file) => {
                                formData.append('files', file)
                            })
                            const modal = Modal.info({
                                title: '提示',
                                content: <div><Spin/>正在操作中...</div>,
                                okButtonProps: {disabled: true}
                            })
                            //将表单数据放入formData
                            formData.append("form", JSON.stringify(values))
                            //异步请求
                            request.post(brandPath + '/edit', {data: formData}).then(res => {
                                if (res && res.code === 1) {
                                    message.success("操作成功")
                                    modal.destroy()
                                    globalList.refresh()
                                } else {
                                    modal.update({content: '操作失败,请联系管理员!', okButtonProps: {disabled: false}})
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
                    request(brandPath + '/delete?id=' + this.state.record.id).then(res => {
                        hide()
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
            <List url={brandPath + '/list'} onError={this.handleError} onMount={this.onMount}>
                <div style={{float: 'right'}}>
                    <Filter noDefaultLayout>
                        <Filter.Item label="品牌名称：" name="brandName"><Input style={{width:200}}/></Filter.Item>
                        <Filter.Search><Button icon="search" type='primary'>查询</Button></Filter.Search>
                    </Filter>
                </div>
                <div className={classNames(styles.marginBottom10)}>
                    <Button icon="plus" type="primary" onClick={() => this.handleOperator('create')}>新增</Button>
                    <Button icon="edit" type="primary" onClick={() => this.handleOperator('edit')}
                            className={styles.marginLeft20}>编辑</Button>
                    <Button icon="delete" type="primary" onClick={() => this.handleOperator('delete')}
                            className={styles.marginLeft20}>删除</Button>
                </div>
                <Table onRow={record => {
                    return {
                        onClick: () => this.clickOperation('onClick', record),
                        onDoubleClick: () => this.clickOperation('onDoubleClick', record)
                    }
                }}>
                    <Table.Column title="名称" dataIndex="name"/>
                    <Table.Column title="LOGO" dataIndex="image"
                                  render={text => text ?
                                      <img src={adminContextPath + text} style={{width: 102, height: 36}}/> : ''}/>
                    <Table.Column title="首字母" dataIndex="letter"/>
                    <Table.Column title="排序" dataIndex="sort"
                                  defaultSortOrder={'ascend'} sorter={(a, b) => a.sort - b.sort}/>
                </Table>
                <Pagination/>
            </List>
        )
    }
}

export default BrandList