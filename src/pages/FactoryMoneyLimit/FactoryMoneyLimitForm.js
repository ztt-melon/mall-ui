import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem} from 'noform'
import {Input, Select} from 'nowrapper/lib/antd'
import {InlineRepeater, Selectify} from 'nowrapper/lib/antd/repeater'
import request from '../../utils/request'
import Constants from '../../utils/constants'

let SelectInlineRepeater = Selectify(InlineRepeater)

const validate = {
    name: {type: "string", required: true, message: '分厂名称不能为空'}
}
const factoryPath = Constants.backContextPath+'/factory'
const quarterOptions = [
    {label: '一季度', value: 0},
    {label: '二季度', value: 1},
    {label: '三季度', value: 2},
    {label: '四季度', value: 3},
]

class FactoryMoneyLimitForm extends PureComponent {
    state = {
        selectData: []
    }

    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    componentWillMount() {
        //取出分厂
        request.get(factoryPath + '/factoryList').then(res => {
            if (res && res.code === 1) {
                this.setState({selectData: res.data})
            }
        })
        let {type, record} = this.props.option
        if ('edit' === type || 'view' === type) {
            this.core.setValues({...record})
            this.core.setGlobalStatus('edit' === type ? type : 'preview')
        }
    }

    render() {
        return (
            <Form core={this.core} layout={{label: 8, control: 16}} direction="vertical-top">
                <FormItem label="分厂名称" name="companyId" required={true}>
                    <Select options={this.state.selectData}/>
                </FormItem>
                <FormItem name="moneyLimits">
                    <SelectInlineRepeater locale='zh' selectMode="multiple" multiple>
                        <FormItem label='季度' name="quarter" defaultMinWidth={false}>
                            <Select options={quarterOptions} style={{width: 120}}/>
                        </FormItem>
                        <FormItem label='金额' name="money" defaultMinWidth={false}><Input
                            style={{width: 120}}/></FormItem>
                    </SelectInlineRepeater>
                </FormItem>
            </Form>
        )
    }
}

export default FactoryMoneyLimitForm