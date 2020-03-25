import React, {PureComponent} from 'react'
import Form, {FormCore, FormItem} from 'noform'
import {Input, Select} from 'nowrapper/lib/antd'
import request from '../../utils/request'
import Constants from '../../utils/constants'


const validate = {
    companyId: {type: "number", required: true, message: '分厂名称不能为空'},
    loginName: {type: "string", required: true, message: '登录名不能为空'},
    loginPassword: {type: "string", required: true, message: '登录密码不能为空'},
    mobile: {type: "string", required: true, message: '手机号不能为空'}
}
const factoryPath = Constants.backContextPath+'/factory'

class FactoryUserForm extends PureComponent {
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
                <FormItem style={{display: 'none'}} name="id"><Input/></FormItem>
                <FormItem label="分厂名称" name="companyId" required={true}>
                    <Select options={this.state.selectData} style={{width: 200}}/>
                </FormItem>
                <FormItem label="登录名" name="loginName" required={true}>
                    <Input style={{width: 200}}/>
                </FormItem>
                <FormItem label="登录密码" name="loginPassword" required={true}>
                    <Input style={{width: 200}}/>
                </FormItem>
                <FormItem label="手机号" name="mobile" required={true}>
                    <Input style={{width: 200}}/>
                </FormItem>
            </Form>
        )
    }
}

export default FactoryUserForm