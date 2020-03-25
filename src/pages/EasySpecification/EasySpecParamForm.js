import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem, If} from 'noform'
import {Input, Radio} from 'nowrapper/lib/antd'
import request from '../../utils/request'
import Constants from '../../utils/constants'

const validate = {
    name: {type: "string", required: true, message: '规格参数不能为空'}
}
const categoryPath = Constants.backContextPath+'/category'
const trueOrFalse = [
    {label: '是', value: 1},
    {label: '否', value: 0}
]

class EasySpecParamForm extends PureComponent {
    state = {
        treeSelectData: [],
        display: 'none'
    }

    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    componentWillMount() {
        this.core.setValues({digit: 0,  searching: 0})

        let {type, record, categoryId} = this.props.option
        if ('create' === type) {
            this.core.setValues({categoryId})
        } else if ('edit' === type || 'view' === type) {
            this.core.setValues({...record})
            this.core.setGlobalStatus('edit' === type ? type : 'preview')
            //显示出 排序
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
                <FormItem style={{display: 'none'}} name="categoryId"><Input/></FormItem>
                <FormItem label="规格参数" name="name" required={true}><Input/></FormItem>
                <FormItem label="是否为数值" name="digit"><Radio.Group options={trueOrFalse}/></FormItem>
                <If when={(values) => {
                    return values.digit === 1;
                }}>
                    <FormItem label="单位" name="unit"><Input/></FormItem>
                </If>
                <FormItem label="是否用于搜索" name="searching"><Radio.Group options={trueOrFalse}/></FormItem>
                <If when={(values) => {
                    return values.digit === 1 && values.searching === 1;
                }}>
                    <FormItem label="分段间隔" name="segments" help={<b>例如,电池容量:0~2000mAh</b>}><Input/></FormItem>
                </If>
                <FormItem style={{display: this.state.display}} label="排序" name="sort"
                          defaultMinWidth={false} layout={{label: 8, control: 4}}>
                    <Input/>
                </FormItem>
            </Form>
        )
    }
}

export default EasySpecParamForm