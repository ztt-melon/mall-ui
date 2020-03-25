import React from 'react'
import {ConfigProvider, Dropdown, Icon, Layout, Menu} from 'antd'
//antd、noform、nowrapper、nolist的样式
import 'antd/dist/antd.less'
import 'nowrapper/dist/antd/index.css'
import 'noform/dist/index.css'
import 'nolist/dist/wrapper/antd.css'

import zhCN from 'antd/es/locale/zh_CN'
import Link from 'umi/link'
import styles from './AdminLayout.less'

const {Header, Sider, Content} = Layout;
const {SubMenu} = Menu

const menu = (
    <Menu>
        <Menu.Item>
            <div style={{float: "left", width: 20}}>
                <Icon type="edit"/>
            </div>
            <Link to='/user/changePassword'>修改密码</Link>
        </Menu.Item>
        <Menu.Item>
            <div style={{float: "left", width: 20}}>
                <Icon type="left-square"/>
            </div>
            <Link to='/user/login'>退出登录</Link>
        </Menu.Item>
    </Menu>
)

class AdminLayout extends React.Component {
    state = {
        collapsed: false,
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }
    //显示菜单，,0：159厂，1：159分厂，2：供应商，3：管理员
    displayMenu = () => {
        let companyType = sessionStorage.getItem("companyType")
        if ('0' === companyType) {
            return <Menu theme="dark" mode="inline" defaultSelectedKeys={['']}
                         defaultOpenKeys={['sub4', 'sub5']}>
                <SubMenu
                    key="sub4"
                    title={<span><Icon type="money-collect"/><span>交易管理</span></span>}
                >
                    <Menu.Item key="31"><Link to="/orderList">订单列表</Link></Menu.Item>
                </SubMenu>
                <SubMenu
                    key="sub5"
                    title={<span><Icon type="project"/><span>159厂信息</span></span>}
                >
                    <Menu.Item key="40"><Link to="/factoryList">分厂管理</Link></Menu.Item>
                    <Menu.Item key="50"><Link to="/factoryUserList">分厂人员维护</Link></Menu.Item>
                    <Menu.Item key="60"><Link to="/factoryMoneyLimitList">下单金额限制</Link></Menu.Item>
                </SubMenu>
            </Menu>
        } else if ('1' === companyType) {
            return <Menu theme="dark" mode="inline" defaultSelectedKeys={['']}
                         defaultOpenKeys={['sub4']}>
                <SubMenu
                    key="sub4"
                    title={<span><Icon type="money-collect"/><span>交易管理</span></span>}
                >
                    <Menu.Item key="31"><Link to="/orderList">订单列表</Link></Menu.Item>
                    <Menu.Item key="331"><Link to="/receiveAddressList">收货人信息</Link></Menu.Item>
                </SubMenu>
            </Menu>
        } else if ('2' === companyType) {
            return <Menu theme="dark" mode="inline" defaultSelectedKeys={['']}
                         defaultOpenKeys={['sub1', 'sub4']}>
                <SubMenu
                    key="sub1"
                    title={<span><Icon type="credit-card"/><span>商品管理</span></span>}
                >
                    <Menu.Item key="99"><Link to="/itemAdd">发布商品</Link></Menu.Item>
                    <Menu.Item key="8"><Link to="/itemList">商品列表</Link></Menu.Item>
                </SubMenu>
                <SubMenu
                    key="sub4"
                    title={<span><Icon type="money-collect"/><span>交易管理</span></span>}
                >
                    <Menu.Item key="31"><Link to="/orderList">订单列表</Link></Menu.Item>
                </SubMenu>
            </Menu>
        } else if ('3' === companyType) {
            return <Menu theme="dark" mode="inline" defaultSelectedKeys={['']}
                         defaultOpenKeys={['sub1', 'sub22', 'sub33']}>
                <SubMenu
                    key="sub1"
                    title={<span><Icon type="credit-card"/><span>商品管理</span></span>}
                >
                    <Menu.Item key="3"><Link to="/categoryList">商品类目</Link></Menu.Item>
                    <Menu.Item key="4"><Link to="/brandList">品牌管理</Link></Menu.Item>
                    <Menu.Item key="8"><Link to="/itemList">商品列表</Link></Menu.Item>
                </SubMenu>
                <SubMenu
                    key="sub2"
                    title={<span><Icon type="tool"/><span>规格参数</span></span>}
                >
                    <SubMenu
                        key="sub3"
                        title={<span>复杂规格</span>}
                    >
                        <Menu.Item key="5"><Link to="/complexSpecGroupList">规格组</Link></Menu.Item>
                        <Menu.Item key="6"><Link to="/complexSpecParamList">规格参数</Link></Menu.Item>
                    </SubMenu>
                    <Menu.Item key="7"><Link to="/easySpecParamList">简单规格</Link></Menu.Item>
                </SubMenu>
                <SubMenu
                    key="sub4"
                    title={<span><Icon type="money-collect"/><span>交易管理</span></span>}
                >
                    <Menu.Item key="31"><Link to="/orderList">订单列表</Link></Menu.Item>
                </SubMenu>
            </Menu>
        }
    }

    render() {
        return (
            <ConfigProvider locale={zhCN}>
                <Layout>
                    <Sider trigger={null} collapsible collapsed={this.state.collapsed} width={256}
                           style={{minHeight: '100vh', color: 'white'}}>
                        <div className={styles.logo}>
                            <div style={{
                                color: '#1DA57A',
                                display: this.state.display,
                                width: '200px',
                                lineHeight: '32px',
                                letterSpacing: 8,
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}>职业健康商城
                            </div>
                        </div>
                        {this.displayMenu()}
                    </Sider>
                    <Layout>
                        <Header style={{background: '#fff', padding: 0}}>
                            {/*                            <Icon
                                className={styles.trigger}
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                onClick={this.toggle}
                            />*/}
                            <span><h2 style={{
                                color: '#1DA57A',
                                fontWeight: 'bold',
                                letterSpacing: 8,
                                paddingLeft: 24,
                                display: 'inline'
                            }}>职业健康云-健康商城平台</h2></span>
                            <Dropdown overlay={menu}>
                                <span style={{paddingRight: 40, float: "right"}}><Icon type="user"
                                                                                       style={{marginRight: 10}}/>欢迎你,{sessionStorage.getItem("loginName")}</span>
                            </Dropdown>
                        </Header>
                        <Content
                            style={{
                                margin: '24px 16px',
                                padding: 24,
                                background: '#fff',
                                minHeight: 280,
                            }}
                        >
                            {this.props.children}

                        </Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        );
    }
}

export default AdminLayout