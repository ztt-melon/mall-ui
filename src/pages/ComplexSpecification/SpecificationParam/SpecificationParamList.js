import React, {PureComponent} from 'react'
import {Breadcrumb, Col, message, Modal, Row, Tree} from 'antd'
import List, {Pagination, Table} from 'nolist/lib/wrapper/antd'
import {Button, Dialog} from 'nowrapper/lib/antd'
import styles from '../../common.less'

import SpecificationParamForm from './SpecificationParamForm'
import request from '../../../utils/request'
import Constants from '../../../utils/constants'

let globalList1, globalList2
const complexSpecGroupPath = Constants.backContextPath + '/complexSpecGroup'
const complexSpecParamPath = Constants.backContextPath + '/complexSpecParam'
const categoryPath = Constants.backContextPath + '/category'

class SpecificationParamList extends PureComponent {
    state = {
        treeData: [],
        selectedRowKeys: []
    }
    handleOperator2 = (type) => {
        if ('create' === type) {
            if (this.state.categoryId && this.state.groupId) {
                Dialog.show({
                    title: '新增',
                    footerAlign: 'label',
                    locale: 'zh',
                    width: 400,
                    enableValidate: true,
                    content: <SpecificationParamForm
                        option={{type, categoryId: this.state.categoryId, groupId: this.state.groupId}}/>,
                    onOk: (values, hide) => {
                        hide()
                        request.post(complexSpecParamPath + '/add', {data: {...values}}).then(res => {
                            if (res && res.code === 1) {
                                message.success("操作成功")
                                globalList2.refresh()
                            } else {
                                message.error("操作失败")
                            }
                        })
                    }
                })
            } else {
                message.warning('请选择-商品类目和规格组')
            }
        } else if ('edit' === type || 'view' === type) {
            if (this.state.record === undefined) {
                message.warning('请先单击一条数据!')
                return
            }
            let title = 'edit' === type ? '编辑' : '浏览'
            request(complexSpecParamPath + '/getById?id=' + this.state.record.id).then(res => {
                if (res && res.code === 1) {
                    Dialog.show({
                        title: title,
                        footerAlign: 'label',
                        locale: 'zh',
                        width: 400,
                        enableValidate: true,
                        content: <SpecificationParamForm option={{type, record: res.data}}/>,
                        onOk: (values, hide) => {
                            hide()
                            request.post(complexSpecParamPath + '/edit', {data: {...values}}).then(res => {
                                if (res && res.code === 1) {
                                    message.success("操作成功")
                                    globalList2.refresh()
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
                content: <p>确定要删除<span style={{fontWeight: 'bold'}}>参数组名称=<span
                    style={{color: 'red'}}>{this.state.record.name}</span></span>的数据吗?</p>,
                onOk: (values, hide) => {
                    hide()
                    request(complexSpecParamPath + '/delete?id=' + this.state.record.id).then(res => {
                        if (res && res.code === 1) {
                            globalList2.refresh()
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

    onMount1 = (list1) => {
        this.list1 = globalList1 = list1;
    }

    onMount2 = (list2) => {
        this.list2 = globalList2 = list2;
    }

    clickOperation2 = (type, record) => {
        this.setState({record})
        if ('onDoubleClick' === type) {
            this.handleOperator2('edit')
        }
    }

    renderTreeNodes = data => data.map((item) => {
        if (item.children) {
            return (
                <Tree.TreeNode title={item.title} key={item.key} dataRef={item} checked={true}>
                    {this.renderTreeNodes(item.children)}
                </Tree.TreeNode>
            )
        }
        return <TreeNode {...item} />
    })

    componentWillMount() {
        //取出 上级类目
        request.get(categoryPath + '/tree').then(res => {
            if (res && res.code === 1) {
                this.setState({treeData: res.data})
            }
        })
    }

    onSelect = selectedKeys => {
        //请求 规格组
        if (selectedKeys.length > 0) {
            let categoryId = parseInt(selectedKeys[0])
            this.setState({categoryId})//点击分页时，传递的参数
            this.list1.setUrl(complexSpecGroupPath + '/list?categoryId=' + categoryId)
            this.list1.refresh()
        } else {
            this.list1.setUrl(complexSpecGroupPath + '/list?categoryId=-1')
            this.list1.refresh()
        }
        //清空 选中的规格组
        this.setState({selectedRowKeys: []})
        //清空 规格参数
        this.list2.setUrl(complexSpecParamPath + '/list?categoryId=-1&groupId=-1')
        this.list2.refresh()
    }

    onChange = (selectedRowKeys, selectedRows) => {
        this.setState({selectedRowKeys, groupId: selectedRows[0].id})
        //请求规格参数
        this.list2.setUrl(complexSpecParamPath + '/list?categoryId=' + this.state.categoryId + '&groupId=' + selectedRows[0].id)
        this.list2.refresh()
    }

    render() {
        let rowSelection = {
            type: 'radio',
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onChange
        }
        return (
            <div>
                <Row>
                    <p>
                        <Breadcrumb style={{fontSize: 18}}>
                            <Breadcrumb.Item>商品类目</Breadcrumb.Item>
                            <Breadcrumb.Item>规格组</Breadcrumb.Item>
                        </Breadcrumb>
                    </p>
                    <Col span={5}>
                        <Tree onSelect={this.onSelect} showLine>
                            {this.renderTreeNodes(this.state.treeData)}
                        </Tree>
                    </Col>
                    <Col span={19}>
                        <List url={complexSpecGroupPath + '/list?categoryId=' + (this.state.categoryId || -1)}
                              onMount={this.onMount1}>
                            <Table rowSelection={rowSelection}>
                                <Table.Column title="规格组" dataIndex="name"/>
                            </Table>
                            <Pagination/>
                        </List>
                    </Col>
                </Row>
                <Row>
                    <p>
                        <Breadcrumb style={{fontSize: 18}}>
                            <Breadcrumb.Item>规格组</Breadcrumb.Item>
                            <Breadcrumb.Item>规格参数</Breadcrumb.Item>
                        </Breadcrumb>
                    </p>
                    <List
                        url={complexSpecParamPath + '/list?categoryId=' + (this.state.categoryId || -1) + '&groupId=' + (this.state.groupId || -1)}
                        onMount={this.onMount2}>
                        <div className={styles.marginBottom10}>
                            <Button icon="plus" type="primary"
                                    onClick={() => this.handleOperator2('create')}>新增</Button>
                            <Button icon="edit" type="primary" onClick={() => this.handleOperator2('edit')}
                                    className={styles.marginLeft20}>编辑</Button>
                            <Button icon="search" type="primary" onClick={() => this.handleOperator2('view')}
                                    className={styles.marginLeft20}>浏览</Button>
                            <Button icon="delete" type="primary" onClick={() => this.handleOperator2('delete')}
                                    className={styles.marginLeft20}>删除</Button>
                        </div>
                        <Table onRow={record => {
                            return {
                                onClick: () => this.clickOperation2('onClick', record),
                                onDoubleClick: () => this.clickOperation2('onDoubleClick', record)
                            }
                        }}>
                            <Table.Column title="规格参数" dataIndex="name"/>
                            <Table.Column title="是否为数值" dataIndex="digit" render={val => val === 0 ? '否' : '是'}/>
                            <Table.Column title="单位" dataIndex="unit"/>
                            <Table.Column title="是否通用" dataIndex="generic" render={val => val === 0 ? '否' : '是'}/>
                            <Table.Column title="排序" dataIndex="sort"
                                          defaultSortOrder={'ascend'} sorter={(a, b) => a.sort - b.sort}/>
                        </Table>
                        <Pagination/>
                    </List>
                </Row>
            </div>
        )
    }
}

export default SpecificationParamList