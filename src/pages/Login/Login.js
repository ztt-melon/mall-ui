import React, {PureComponent} from 'react'
import {Button, Input} from 'nowrapper/lib/antd'
import Form, {FormCore, FormItem} from 'noform'
import {Icon, message} from "antd";
import request from "../../utils/request"
import Constants from '../../utils/constants'
import styles from './login.less'
import router from 'umi/router'

const validate = {
    loginName: {type: "string", required: true, message: '登录名不能为空'},
    loginPassword: {type: "string", required: true, message: '登录密码不能为空'},
}
const userPath = Constants.backContextPath+'/admin'

class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
    }

    handleOperator = () => {
        this.core.validate((err) => {
            if (!err) {
                request.post(userPath + '/login', {data: this.core.value}).then(res => {
                    if (res && res.code === 1) {
                        sessionStorage.setItem("loginName", res.data.loginName)
                        sessionStorage.setItem("companyType", res.data.company.type)
                        this.go(res.data.company.type + '')
                    } else {
                        message.error("账号或密码错误")
                    }
                })
            }
        })
    }
    //跳转到后台页面,0：159厂，1：159分厂，2：供应商，3：管理员
    go = (companyType) => {
        if ('0' === companyType) {
            router.push('/orderList')
        } else if ('1' === companyType) {
            router.push('/orderList')
        } else if ('2' === companyType) {
            router.push('/orderList')
        } else if ('3' === companyType) {
            router.push('/itemList')
        }
    }
    handleEnterKey = (e) => {
        if (e.keyCode === 13) {
            //do somethings
            this.handleOperator()
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleEnterKey);
    }

    render() {
        return (
            <div className={styles.wrapper}>
                <Form core={this.core} className={styles.login}>
                    <div className={styles.loginText}>登录</div>
                    <div className={styles.content}>
                        <FormItem name="loginName" defaultMinWidth={false}><Input style={{width: 255}}
                                                                                  autocomplete="off"
                                                                                  prefix={<Icon type="user"
                                                                                                style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                                                  placeholder="登录名"
                                                                                  size='large'/></FormItem>
                        <FormItem name="loginPassword" defaultMinWidth={false}><Input style={{width: 255}}
                                                                                      type="password" autocomplete="off"
                                                                                      prefix={<Icon type="lock"
                                                                                                    style={{color: 'rgba(0,0,0,.25)'}}/>}
                                                                                      placeholder="密码"
                                                                                      size='large'/></FormItem>
                        <FormItem onKeydown={this.handleEnterKey}><Button size='large'
                                                                          style={{width: 255, marginTop: 20}}
                                                                          onClick={this.handleOperator}
                                                                          type="primary">登&nbsp;&nbsp;&nbsp;&nbsp;录</Button></FormItem>
                    </div>
                    {/*<div className={styles.registerText}><Link to="">商家入驻</Link></div>*/}
                </Form>
            </div>
        )
    }
}

export default Login;