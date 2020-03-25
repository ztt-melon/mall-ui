import React, {PureComponent} from 'react'
import {Breadcrumb, Button, Card, Icon, InputNumber, message} from 'antd'
import Form, {FormCore, FormItem, If} from 'noform'
import {Input, Radio, Select, TreeSelect, Upload} from 'nowrapper/lib/antd'
import {InlineRepeater, Selectify} from 'nowrapper/lib/antd/repeater'
import request from '../../../utils/request'
import uploadStyle from './upload.less'
//editor
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor'
import {ContentUtils} from 'braft-utils'

import Constants from '../../../utils/constants'

const SelectInlineRepeater = Selectify(InlineRepeater)

const validate = {
    categoryId: {type: "number", required: true, message: '商品类目不能为空'},
    title: {type: "string", required: true, message: '商品标题不能为空'},
    tmpPrice: {type: "number", required: true, message: '商品价格不能为空'},
    tmpStock: {type: "number", required: true, message: '商品库存不能为空'},
}
const trueOrFalse = [
    {label: '是', value: 1},
    {label: '否', value: 0}
]

const categoryPath = Constants.backContextPath+'/category'
const spuPath = Constants.backContextPath+'/spu'
const brandPath = Constants.backContextPath+'/brand'
const hostPath = Constants.hostPath
export default class ItemAdd extends PureComponent {
    state = {
        treeSelectData: [],
        //商品图片
        fileList: [],
        defaultFileList: [],
        //editor
        editorState: BraftEditor.createEditorState(''),
        //
        genericSpecDisplay: 'none',
        specialSpecDisplay: 'none',
    }

    constructor(props) {
        super(props);
        this.core = new FormCore({validateConfig: validate});
        this.core2 = new FormCore();
    }

    //商品图片
    beforeUpload = file => {
        this.setState({fileList: [...this.state.fileList, file]})
        return false
    }
    onRemove = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {fileList: newFileList}
        })
    }

    //editor
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
        request.post(spuPath + '/uploadImage', {data: formData}).then(res => {
            if (res && res.code === 1) {
                this.setState({
                    editorState: ContentUtils.insertMedias(this.state.editorState, [{
                        type: 'IMAGE',
                        url: hostPath + res.data
                    }])
                })
            } else {
                message.error("上传图片失败！")
            }
        })
    }

    componentWillMount() {
        //取出 商品类目
        request.get(categoryPath + '/treeSelect').then(res => {
            if (res && res.code === 1) {
                this.setState({treeSelectData: res.data})
            }
        })
    }

    showCategoryNames = () => {
        if (this.state.categoryNames.length > 1) {
            return this.state.categoryNames.map((name) => <Breadcrumb.Item>{name}</Breadcrumb.Item>)
        }
    }
    onSelect = (value, node, extra) => {
        //先重置数据
        this.core.reset()
        this.core2.reset()
        this.core.setValue('tmpStock',50000)
        this.setState({
            //商品图片
            fileList: [],
            defaultFileList: [],
            //editor
            editorState: BraftEditor.createEditorState(''),
            //
            genericSpecDisplay: 'none',
            specialSpecDisplay: 'none',
            specAll: {}
        })

        let categoryId = value
        this.setState({categoryId})
        // let title = node.props.title
        //根据categoryId获取所有父级节点的名称
        request.get(categoryPath + '/categoryNames?categoryId=' + categoryId).then(res => {
            if (res && res.code === 1) {
                this.setState({categoryNames: res.data})
            }
        })
        //根据categoryId获取品牌
        request.get(brandPath + '/selectOptions?categoryId=' + categoryId).then(res => {
            if (res && res.code === 1) {
                this.setState({brandSelectOptions: res.data})
            }
        })
        //根据categoryId获取规格参数
        request.get(spuPath + '/specAll?categoryId=' + categoryId).then(res => {
            if (res && res.code === 1) {
                this.setState({specAll: res.data})
            }
        })
    }

    showGenericSpec = () => {
        let arr = []
        if (this.state.specAll.genericSpec) {
            this.setState({genericSpecDisplay: ''})
            this.state.specAll.genericSpec.map(tmp => arr.push(<FormItem label={tmp.label}
                                                                         name={tmp.name} inline><Input/></FormItem>))
        }
        return arr
    }
    showSpecialSpec = () => {
        if (this.state.specAll.specialSpec) {
            this.setState({specialSpecDisplay: ''})
            return this.state.specAll.specialSpec.map(tmp => <FormItem onChange={this.skuChange} label={tmp.label}
                                                                       name={tmp.name}>
                <SelectInlineRepeater locale='zh' selectMode="multiple" multiple>
                    <FormItem label='属性值' name="value"><Input/></FormItem>
                </SelectInlineRepeater>
            </FormItem>)
        }
    }
    showSkuItem = () => {
        let arr = []
        if (this.state.specAll.specialSpec) {
            this.state.specAll.specialSpec.map(tmp => {
                arr.push(<FormItem status="disabled" label={tmp.label} name={tmp.name}
                                   defaultMinWidth={false}><Input style={{width: 120}}/></FormItem>)
            })
        }
        arr.push(<FormItem label='商品价格' name="price" defaultMinWidth={false}><InputNumber
            style={{width: 120}}/></FormItem>)
        arr.push(<FormItem label='库存' name="stock" defaultMinWidth={false}><InputNumber
            style={{width: 120}}/></FormItem>)
        arr.push(<FormItem label='商品货号' name="skuCode" defaultMinWidth={false}><Input
            style={{width: 120}}/></FormItem>)
        arr.push(<FormItem label='是否上架' name="saleable" defaultMinWidth={false}><Radio.Group
            options={trueOrFalse} style={{width: 0}}/></FormItem>)
        arr.push(<FormItem style={{display: 'none'}} name="indexes"><Input/></FormItem>)
        arr.push(<FormItem style={{display: 'none'}} name="spuSpec"><Input/></FormItem>)
        return arr
    }

    skuChange = () => {
        if (this.core.getValue('tmpPrice') != null && this.core.getValue('tmpStock') != null) {
            this.generateSkuItem()
        }
    }

    generateSkuItem = () => {
        let skuItemData = {dataSource: []}
        //取出-价格、库存
        let price = this.core.getValue('tmpPrice')
        let stock = this.core.getValue('tmpStock')
        if (this.state.specAll.specialSpec) {
            //取出特有属性
            let arr = []
            this.state.specAll.specialSpec.map(tmp => {
                //tmp：4,机身颜色
                if (this.core.getValue(tmp.name).dataSource.length > 0) {
                    let propArr = []
                    this.core.getValue(tmp.name).dataSource.map(prop => {
                        if (prop.value) {
                            propArr.push(prop.value)
                        }
                    })
                    if (propArr.length > 0) {
                        arr.push({name: tmp.name, propArr})
                    }
                }
            })
            //遍历-[{name:4,propArr:[红色，蓝色]},{[4G,8G]},{[长,宽]}]
            if (arr.length > 0) {
                if (arr.length > 5) {
                    //预设5个特有属性
                    message.warning('特有属性=' + arr.length + ',多余预设特性,请联系管理员')
                    return
                }
                //遍历
                if (arr[0]) {
                    for (let a = 0; a < arr[0].propArr.length; a++) {
                        if (arr[1]) {
                            for (let b = 0; b < arr[1].propArr.length; b++) {
                                if (arr[2]) {
                                    for (let c = 0; c < arr[2].propArr.length; c++) {
                                        if (arr[3]) {
                                            for (let d = 0; d < arr[3].propArr.length; d++) {
                                                if (arr[4]) {
                                                    for (let e = 0; e < arr[4].propArr.length; e++) {
                                                        let data = {}
                                                        data[arr[0].name] = arr[0].propArr[a]
                                                        data[arr[1].name] = arr[1].propArr[b]
                                                        data[arr[2].name] = arr[2].propArr[c]
                                                        data[arr[3].name] = arr[3].propArr[d]
                                                        data[arr[4].name] = arr[4].propArr[e]
                                                        data.price = price
                                                        data.stock = stock
                                                        data.saleable = 1
                                                        data.indexes = a + '_' + b + '_' + c + '_' + d + '_' + e
                                                        let spec = {}
                                                        spec[arr[0].name] = arr[0].propArr[a]
                                                        spec[arr[1].name] = arr[1].propArr[b]
                                                        spec[arr[2].name] = arr[2].propArr[c]
                                                        spec[arr[3].name] = arr[3].propArr[d]
                                                        spec[arr[4].name] = arr[4].propArr[e]
                                                        data.skuSpec = JSON.stringify(spec)
                                                        skuItemData.dataSource.push(data)
                                                    }
                                                } else {
                                                    let data = {}
                                                    data[arr[0].name] = arr[0].propArr[a]
                                                    data[arr[1].name] = arr[1].propArr[b]
                                                    data[arr[2].name] = arr[2].propArr[c]
                                                    data[arr[3].name] = arr[3].propArr[d]
                                                    data.price = price
                                                    data.stock = stock
                                                    data.saleable = 1
                                                    data.indexes = a + '_' + b + '_' + c + '_' + d
                                                    let spec = {}
                                                    spec[arr[0].name] = arr[0].propArr[a]
                                                    spec[arr[1].name] = arr[1].propArr[b]
                                                    spec[arr[2].name] = arr[2].propArr[c]
                                                    spec[arr[3].name] = arr[3].propArr[d]
                                                    data.skuSpec = JSON.stringify(spec)
                                                    skuItemData.dataSource.push(data)
                                                }
                                            }
                                        } else {
                                            let data = {}
                                            data[arr[0].name] = arr[0].propArr[a]
                                            data[arr[1].name] = arr[1].propArr[b]
                                            data[arr[2].name] = arr[2].propArr[c]
                                            data.price = price
                                            data.stock = stock
                                            data.saleable = 1
                                            data.indexes = a + '_' + b + '_' + c
                                            let spec = {}
                                            spec[arr[0].name] = arr[0].propArr[a]
                                            spec[arr[1].name] = arr[1].propArr[b]
                                            spec[arr[2].name] = arr[2].propArr[c]
                                            data.skuSpec = JSON.stringify(spec)
                                            skuItemData.dataSource.push(data)
                                        }
                                    }
                                } else {
                                    let data = {}
                                    data[arr[0].name] = arr[0].propArr[a]
                                    data[arr[1].name] = arr[1].propArr[b]
                                    data.price = price
                                    data.stock = stock
                                    data.saleable = 1
                                    data.indexes = a + '_' + b
                                    let spec = {}
                                    spec[arr[0].name] = arr[0].propArr[a]
                                    spec[arr[1].name] = arr[1].propArr[b]
                                    data.skuSpec = JSON.stringify(spec)
                                    skuItemData.dataSource.push(data)
                                }
                            }
                        } else {
                            let data = {}
                            data[arr[0].name] = arr[0].propArr[a]
                            data.price = price
                            data.stock = stock
                            data.saleable = 1
                            data.indexes = a + ''
                            let spec = {}
                            spec[arr[0].name] = arr[0].propArr[a]
                            data.skuSpec = JSON.stringify(spec)
                            skuItemData.dataSource.push(data)
                        }
                    }
                }
            } else {
                let data = {}
                data.price = price
                data.stock = stock
                data.saleable = 1
                skuItemData.dataSource.push(data)
                this.core.setValue('skuItem', skuItemData)
            }
            if (skuItemData.dataSource.length > 0) {
                this.core.setValue('skuItem', skuItemData)
            }
        } else {
            let data = {}
            data.price = price
            data.stock = stock
            data.saleable = 1
            skuItemData.dataSource.push(data)
            this.core.setValue('skuItem', skuItemData)
        }
        console.log("aa");
    }

    onClick = () => {
        this.core.validate((err) => {
            if (!err) {
                //校验商品图片
                if (this.state.fileList.length === 0) {
                    message.warning('请上传商品图片')
                    return
                }
                //商品图片的数据
                const formData = new FormData();
                this.state.fileList.forEach((file) => {
                    formData.append('images', file)
                })
                //商品描述的数据
                formData.append('description', this.state.outputHTML)
                //商品表单的数据
                formData.append("form", JSON.stringify(this.core.getValues()))
                //通用规格
                formData.append('genericSpec', JSON.stringify(this.core2.getValues()))
                //异步请求
                request.post(spuPath + '/add', {data: formData}).then(res => {
                    if (res && res.code === 1) {
                        message.success("操作成功")
                        // router.push('/itemList')
                        window.location.href ='/itemList'
                    } else {
                        message.error("操作失败")
                    }
                })
            }
        })
    }

    render() {
        //editor
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
            <div>
                <Form core={this.core} direction="vertical-top">
                    <FormItem style={{display: 'none'}} name="id"><Input/></FormItem>
                    <Card>
                        <FormItem label="商品的类目" name="categoryId" required={true}>
                            <TreeSelect treeData={this.state.treeSelectData}
                                        onSelect={(value, node, extra,) => this.onSelect(value, node, extra)}/>
                        </FormItem>
                        <div style={{marginTop: 20}}>
                            <Breadcrumb style={{fontSize: 16, marginLeft: 10}} separator=">">
                                {this.state.categoryNames ? this.showCategoryNames() : ''}
                            </Breadcrumb>
                        </div>
                    </Card>
                    <div style={{display: this.state.categoryId ? '' : 'none'}}>
                        <Card title='商品的基本信息' style={{marginTop: 10}}>
                            <FormItem label="品牌" name="brandId">
                                <Select options={this.state.brandSelectOptions}/>
                            </FormItem>
                            <FormItem label="商品标题" name="title" required={true} defaultMinWidth={false}>
                                <Input style={{width: 400}}/>
                            </FormItem>
                            <FormItem label="商品的副标题" name="subTitle" defaultMinWidth={false}>
                                <Input style={{width: 400}}/>
                            </FormItem>
                            <FormItem label="商品图片" required={true}/>
                            <div style={{width: 200}}>
                                <Upload.Dragger listType='picture'
                                                beforeUpload={this.beforeUpload} onRemove={this.onRemove}
                                                className={uploadStyle.upload}
                                                defaultFileList={this.state.defaultFileList}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="plus"/>
                                    </p>
                                </Upload.Dragger>
                            </div>
                            <FormItem label="包装清单" name="packingList" defaultMinWidth={false}>
                                <Input.TextArea style={{width: 400}}/>
                            </FormItem>
                            <FormItem label="售后服务" name="afterService" defaultMinWidth={false}>
                                <Input.TextArea style={{width: 400}}/>
                            </FormItem>
                        </Card>
                        <Card title='商品描述' style={{marginTop: 10}}>
                            <div className="editor-wrapper">
                                <BraftEditor
                                    value={this.state.editorState}
                                    onChange={this.handleChange}
                                    extendControls={extendControls}
                                    excludeControls={['media', 'fullscreen']}
                                    contentStyle={{height: 400}}
                                />
                            </div>
                        </Card>
                        <Form core={this.core2} direction="vertical-top">
                            <Card title='商品的通用属性' style={{marginTop: 10, display: this.state.genericSpecDisplay}}>
                                {this.state.specAll ? this.showGenericSpec() : ''}
                            </Card>
                        </Form>
                        <Card title='商品的特有属性' style={{marginTop: 10, display: this.state.specialSpecDisplay}}>
                            {this.state.specAll ? this.showSpecialSpec() : ''}
                        </Card>
                        <Card title='商品的其他属性' style={{marginTop: 10}}>
                            <FormItem name="specSellerDefine">
                                <SelectInlineRepeater locale='zh' selectMode="multiple" multiple>
                                    <FormItem label='属性名称' name="name"><Input/></FormItem>
                                    <FormItem label='属性值' name="value"><Input/></FormItem>
                                </SelectInlineRepeater>
                            </FormItem>
                        </Card>
                        <Card title='商品的价格、库存' style={{marginTop: 10}}>
                            <FormItem onChange={this.skuChange} label="商品价格" name="tmpPrice" required={true}
                                      inline><InputNumber/></FormItem>
                            <FormItem onChange={this.skuChange} label="商品库存" name="tmpStock" required={true}
                                      inline><InputNumber/></FormItem>
                            <If when={(values) => {
                                return values.tmpPrice !== null && values.tmpStock !== null
                            }}>
                                <FormItem label={<b style={{color: 'red'}}>* 库存商品</b>} name="skuItem" required={true}>
                                    <SelectInlineRepeater locale='zh' selectMode="multiple" multiple>
                                        {this.state.specAll ? this.showSkuItem() : ''}
                                    </SelectInlineRepeater>
                                </FormItem>
                            </If>
                        </Card>
                        <div style={{marginTop: 20}}>
                            <Button size='large' type="primary" onClick={this.onClick} style={{width: 200}}>发布</Button>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
}
