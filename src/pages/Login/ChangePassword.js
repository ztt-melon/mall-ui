import React, {PureComponent} from 'react'
import {Input, Button, Select, Dialog} from 'nowrapper/lib/antd'
import Form, {FormItem, FormCore} from 'noform'
import {Card, message} from "antd"
import request from "../../utils/request"
import Constants from '../../utils/constants'

const userPath = Constants.backContextPath+'/sysUser'
const validate = {
    loginPassword: {type: "string", required: true, message: '原密码不能为空'},
    newPassword: {type: "string", required: true, message: '新密码不能为空'},
}

class ChangePassword extends PureComponent {
    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    componentWillMount() {

    }

    handleOperator = () => {
        this.core.validate((err) => {
            if (!err) {
                request.post(userPath + '/changePassword', {data: this.core.value}).then(res => {
                    if (res && res.code === 1) {
                        window.location.href = '/user/login'
                        message.success("修改成功")

                    } else {
                        message.error(res.msg || "修改错误")
                    }
                })
            }
        })
    }

    render() {
        return (
            <Card title="修改密码">
                <Form core={this.core} layout={{label: 7}}>
                    <FormItem label="原密码" name="loginPassword"><Input.Password placeholder="请输入旧密码"/></FormItem>
                    <FormItem label="新密码" name="newPassword"><Input.Password placeholder="请输入新密码"/></FormItem>
                    <FormItem>
                        <Button type="primary" onClick={this.handleOperator}>确认修改</Button>
                    </FormItem>
                </Form>
            </Card>
        );
    }
}

export default ChangePassword