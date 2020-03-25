import React, {PureComponent} from 'react'
import {Icon} from 'antd'
import Form, {FormCore, FormItem} from 'noform'
import {Input, TreeSelect, Upload} from 'nowrapper/lib/antd'
import uploadStyle from './upload.less'
import Constants from '../../../utils/constants'

const hostPath = Constants.hostPath
export default class SubImageUpload extends PureComponent {
    state = {
        defaultFileList: []
    }

    beforeUpload = file => {
        this.props.putFileToState(file)
        return false
    }
    onRemove = file => {
        this.props.removeFileFromState(file)
    }

    componentWillMount() {
        let images = this.props.images
        let fileList = []
        fileList = images.split(',').map((img, index) => ({
            uid: -index,
            status: 'done',
            url: hostPath + img
        }))
        this.props.initFileToState(fileList)
        this.setState({defaultFileList: fileList})
    }

    render() {
        return (<div style={{width: 200}}>
                <Upload.Dragger listType='picture'
                                beforeUpload={this.beforeUpload} onRemove={this.onRemove}
                                className={uploadStyle.upload} defaultFileList={this.state.defaultFileList}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="plus"/>
                    </p>
                </Upload.Dragger>
            </div>
        )
    }
}