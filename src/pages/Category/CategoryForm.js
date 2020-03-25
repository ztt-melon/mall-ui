import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem} from 'noform'
import {Input, Radio, TreeSelect, Select} from 'nowrapper/lib/antd'
import request from '../../utils/request'
import Constants from '../../utils/constants'

const validate = {
    name: {type: "string", required: true, message: '类目名称不能为空'}
}
const statusOption = [
    {label: '正常', value: 1},
    {label: '禁用', value: 0}
]

const templateOption = [
    {label: '简单规格', value: 0},
    {label: '复杂规格', value: 1}
]

const categoryPath = Constants.backContextPath+'/category'

class CategoryForm extends PureComponent {
    state = {
        treeSelectData: [],
        display: 'none'
    }

    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    componentWillMount() {
        let {type, record} = this.props.option
        if ('edit' === type || 'view' === type) {
            if (record.pid === 0) {
                delete record.pid
            }
            this.core.setValues({...record})
            this.core.setGlobalStatus('edit' === type ? type : 'preview')
            //显示出 排序和使用状态
            this.setState({display: 'block'})
        }
        //取出 上级类目
        request.get(categoryPath + '/treeSelect').then(res => {
            if (res && res.code === 1) {
                this.setState({treeSelectData: res.data})
            }
        })
    }

    render() {
        return (
            <Form core={this.core} layout={{label: 8, control: 16}}>
                <FormItem style={{display: 'none'}} name="id"><Input/></FormItem>
                <FormItem label="类目名称" name="name" required={true}><Input style={{width: 200}}/></FormItem>
                <FormItem label="上级类目" name="pid">
                    <TreeSelect treeData={this.state.treeSelectData} style={{width: 200}}/>
                </FormItem>
{/*                <FormItem label="规格模板" name="template" defaultValue={0}>
                    <Select options={templateOption} style={{width: 200}}/>
                </FormItem>*/}
                <FormItem style={{display: this.state.display}} label="使用状态" name="status">
                    <Radio.Group options={statusOption} style={{width: 200}}/>
                </FormItem>
                <FormItem style={{display: this.state.display}} label="排序" name="sort"
                          defaultMinWidth={false} layout={{label: 8, control: 4}}>
                    <Input/>
                </FormItem>
                <FormItem label="备注" name="comment"><Input.TextArea style={{width: 200}}/></FormItem>
            </Form>
        )
    }
}

export default CategoryForm