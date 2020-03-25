import React, {PureComponent} from 'react'
import {Button, Icon, message} from 'antd'
import {Input, Upload} from "nowrapper/lib/antd"
import Form, {FormCore, FormItem} from 'noform'
import styles from './upload.less'
import request from '../../utils/request'
//editor
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor'
import {ContentUtils} from 'braft-utils'

import Constants from '../../utils/constants'

const adminPath = Constants.hostPath

const adminControllerPath = Constants.backContextPath+'/spu'


export default class ImageRichText extends PureComponent {
    state = {
        fileList: [],
        defaultFileList: [],
        //editor
        editorState: BraftEditor.createEditorState(''),
    }

    constructor(props) {
        super(props);
        this.core = new FormCore();
    }

    putFileToState = file => {
        this.setState({fileList: [...this.state.fileList, file]})
        return false
    }
    removeFileFromState = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {fileList: newFileList}
        })
    }


    onClick = () => {
        alert(this.state.fileList.length)
        alert(this.state.outputHTML)
        alert(this.state.outputHTML.length)
        return
        //准备附件数据
        const formData = new FormData();
        this.state.fileList.forEach((file) => {
            formData.append('files', file)
        })
        //异步请求
        request.post(adminControllerPath + '/add', {data: formData}).then(res => {
            if (res && res.code === 1) {
                message.success("操作成功")
            } else {
                message.error("操作失败")
            }
        })
    }

    //editor
    componentDidMount() {
        /*        this.setState({
                    editorState: BraftEditor.createEditorState('<p>你好，<b>世界!</b><p>')
                })*/
    }

    handleChange = (editorState) => {
        this.setState({
            editorState: editorState,
            outputHTML: editorState.toHTML()
        })
    }

    uploadHandler = (param) => {
        if (!param.file) {
            return false
        }
        if (param.file.type.indexOf('image') === -1) {
            message.warning('上传的不是图片')
            return
        }
        //将图片上传到后台
        const formData = new FormData();
        formData.append('imageFile', param.file)
        //异步请求
        request.post(adminControllerPath + '/uploadImage', {data: formData}).then(res => {
            if (res && res.code === 1) {
                this.setState({
                    editorState: ContentUtils.insertMedias(this.state.editorState, [{
                        type: 'IMAGE',
                        url: adminPath + res.data
                    }])
                })
            } else {
                message.error("上传图片失败！")
            }
        })
    }

    render() {
        const extendControls = [
            {
                key: 'antd-uploader',
                type: 'component',
                component: (
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        customRequest={this.uploadHandler}
                    >
                        {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
                        <button type="button" className="control-item button upload-button" data-title="插入图片">
                            <Icon type="picture" theme="filled"/>
                        </button>
                    </Upload>
                )
            }
        ]
        return (
            <Form core={this.core} layout={{label: 8, control: 16}}>
                <FormItem label="价格" name="letter"><Input/></FormItem>
                <p/>
                <Upload.Dragger listType='picture'
                                beforeUpload={this.putFileToState} onRemove={this.removeFileFromState}
                                className={styles.upload} defaultFileList={this.state.defaultFileList}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="plus"/>
                    </p>
                </Upload.Dragger>
                <p/>
                <div className="editor-wrapper" style={{border: '1px solid #d1d1d1', borderRadius: 5}}>
                    <BraftEditor
                        value={this.state.editorState}
                        onChange={this.handleChange}
                        extendControls={extendControls}
                        excludeControls={['media', 'fullscreen']}
                        contentStyle={{height: 400}}
                    />
                </div>
                <p/>
                <Button onClick={this.onClick}>提交</Button>
            </Form>)
    }
}
