import React from 'react'
import 'antd/dist/antd.css'

class UserLayout extends React.Component {
    render() {
        return <div> {this.props.children}</div>
    }
}

export default UserLayout