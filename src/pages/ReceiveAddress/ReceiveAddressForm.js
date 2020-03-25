import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem} from 'noform'
import {Input, Radio} from 'nowrapper/lib/antd'

const validate = {
    name: {type: "string", required: true, message: '分厂名称不能为空'}
}
const trueOrFalse = [
    {label: '是', value: 1},
    {label: '否', value: 0}
]

class ReceiveAddressForm extends PureComponent {
    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    componentWillMount() {
        let {type, record} = this.props.option
        if ('edit' === type || 'view' === type) {
            this.core.setValues({...record})
            this.core.setGlobalStatus('edit' === type ? type : 'preview')
        }
    }

    render() {
        return (
            <Form core={this.core} layout={{label: 8, control: 16}}>
                <FormItem style={{display: 'none'}} name="id"><Input/></FormItem>
                <FormItem label="收货人姓名" name="realName" required={true}><Input/></FormItem>
                <FormItem label="手机号" name="mobile" required={true}><Input/></FormItem>
                <FormItem label="收货地址" name="address" required={true}><Input/></FormItem>
                <FormItem label="是否默认地址" name="isDefault" defaultValue={0}><Radio.Group options={trueOrFalse}/></FormItem>
            </Form>
        )
    }
}

export default ReceiveAddressForm