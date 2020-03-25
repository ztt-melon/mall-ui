import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem} from 'noform'
import {Input} from 'nowrapper/lib/antd'

const validate = {
    name: {type: "string", required: true, message: '分厂名称不能为空'}
}

class FactoryForm extends PureComponent {
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
            <Form core={this.core} direction="vertical-top">
                <FormItem style={{display: 'none'}} name="id"><Input/></FormItem>
                <FormItem label="分厂名称" name="name" required={true}><Input/></FormItem>
            </Form>
        )
    }
}

export default FactoryForm