import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, message, Modal, Icon, Form, Select, Button } from 'antd'

const { confirm } = Modal
const { Option } = Select
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
/* 部门方案管理 */
class Institution extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listDatas: null,
      showGroupMsg: false,
      listItems: null,
      parentGroup: null,
      userLimit: [],
      current: 1,
    }
    this.deptListUrl = '/control/sys/dept/listPage'
    this.addListUrl = '/control/sys/dept/save'
    this.updateUrl = '/control/sys/dept/update'
    this.deleteUrl = '/control/sys/dept/delete'
    this.listUrl = '/control/sys/dept/list'
    this.deleteParams = {
      deptIds: []
    }
    this.listParams = {
      keyword: '',
      pageNo: 1,
    }
    this.defaultparams = {
      id: '',
      deptCode: '',
      deptName: '',
      leaderName: '',
      parentId: '',
      remark: '',
      sort: '',
    }
  }
  componentDidMount = () => {
    this.getDeptList()
    this.getparentGroup()
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
  }
  getDeptList = () => {
    getResponseDatas('post', this.deptListUrl, this.getFormData(this.listParams)).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({
          listDatas: data,
          current: Number(this.listParams.pageNo)
        })
      }
    })
  }
  getparentGroup = () => {
    getResponseDatas('post', this.listUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({
          parentGroup: data,
        })
      }
    })
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    // console.log(formData)
    return formData
  }
  handleAddGroup = () => {
    this.isAdd = true
    this.setState({
      listItems: null,
      showGroupMsg: true,
    })
  }
  handleCloseGroupMsg = () => {
    this.setState({ showGroupMsg: false })
  }
  handleEditItems = (id) => {
    this.isAdd = false
    const listItem = (this.state.listDatas.list.filter(item => item.id === id))[0]
    this.setState({
      listItems: listItem,
      showGroupMsg: true,
    })
    Object.keys(this.defaultparams).map((item) => {
      this.defaultparams[item] = listItem[item]
    })
  }
  handleGroupMsgChange = (e, itemname) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    this.defaultparams[itemname] = value
    // console.log(this.defaultparams)
  }
  /* handleAddEdit = () => {
    if (this.isAdd) {
      getResponseDatas('post', this.addListUrl, this.getFormData(this.defaultparams)).then((res) => {
        const { code, msg } = res.data
        if (code === 0) {
          this.listParams.keyword = ''
          this.listParams.pageNo = 1
          message.success('操作成功！')
          this.getDeptList()
        } else {
          message.info(msg)
        }
      })
    } else {
      getResponseDatas('post', this.updateUrl, this.getFormData(this.defaultparams)).then((res) => {
        const { code, msg } = res.data
        if (code === 0) {
          this.listParams.keyword = ''
          this.listParams.pageNo = 1
          this.getDeptList()
        } else {
          message.info(msg)
        }
      })
    }
    this.handleCloseGroupMsg()
  } */
  handleDeleteItem = (id) => {
    const that = this
    this.deleteParams.deptIds.push(id)
    confirm({
      title: '确认要删除当前部门?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.deleteUrl, that.getFormData(that.deleteParams)).then((res) => {
            const { code, msg } = res.data
            if (code === 0) {
              message.info('删除成功！')
              /* that.listParams.keyword = '' */
              // this.listParams.pageNo = 1
              that.getDeptList()
              resolve()
            } else {
              message.info(msg)
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  handleChangePage = (page) => {
    this.listParams.pageNo = page
    this.getDeptList()
  }
  handleKeywordChange = (e) => {
    const { value } = e.target
    this.listParams.keyword = value
  }
  handlePagination = (pageNumber) => {
    this.listParams.pageNo = pageNumber
    this.getDeptList()
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const url = this.defaultparams.id ? this.updateUrl : this.addListUrl
        getResponseDatas('post', url, this.getFormData(this.defaultparams)).then((res) => {
          const { code, msg } = res.data
          if (code === 0) {
            /* this.listParams.keyword = ''
            this.listParams.pageNo = 1 */
            message.success(msg)
            this.handleCloseGroupMsg()
            this.getDeptList()
          } else {
            message.info(msg)
          }
        })
      }
    })
  }
  validateNoChinese = (rule, value, callback) => {
    let reg = /^[^\u4e00-\u9fa5]+$/g;
    let regEmpty = /^\s*$/g;
    if (value && !reg.test(value)) {
      callback('书写格式错误');
    } else if (value && regEmpty.test(value)) {
      callback('缺陷编号不能为空');
    } else {
      callback();
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { listItems, listDatas, showGroupMsg, parentGroup, userLimit, current } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字" onChange={this.handleKeywordChange} /></div>
                <span className={styles.Button} onClick={() => { this.handlePagination('1') }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                {userLimit.includes(28) && <span className={styles.Button} onClick={this.handleAddGroup} >新&nbsp;&nbsp;增</span>}
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >序号</div>
                <div className={styles.listTd} >部门编号</div>
                <div className={styles.listTd} >部门名称</div>
                <div className={styles.listTd} >描述</div>
                <div className={styles.listTd} >上级部门</div>
                <div className={styles.listTd} >部门负责人</div>
                {userLimit.includes(30) || userLimit.includes(29) ? <div className={styles.listTd} >操作</div> : null}
              </div>
              {
                listDatas && listDatas.list.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item.id + index}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item['sort']}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deptCode}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deptName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.remark}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.parentName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.leaderName}</span></div>
                      {userLimit.includes(30) || userLimit.includes(29) ?
                        <div className={styles.listTd} >
                          {userLimit.includes(30) && <Button className={styles.Button} onClick={() => { this.handleEditItems(item.id) }}>修&nbsp;&nbsp;改</Button>}
                          {userLimit.includes(29) && <Button className={styles.Button} onClick={() => { this.handleDeleteItem(item.id) }}>删&nbsp;&nbsp;除</Button>}
                        </div> : null}
                    </div>
                  )
                })
              }
              {
                !!listDatas && listDatas.list.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{listDatas && listDatas.totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={listDatas && listDatas.totalCount} onChange={this.handlePagination} /></div>
            </div>
          </div>
          {
            showGroupMsg ?
              <div className={styles.MaskBox}>
                <div className={styles.AddBox}>
                  <div className={styles.Title}>{listItems ? '编辑' : '新增'}<Icon onClick={this.handleCloseGroupMsg} className={styles.Close} type="close" /></div>
                  <div className={styles.Conten}>
                    <Form
                      onSubmit={this.handleSubmit}
                      {...formItemLayout}
                      autoComplete="off"
                    >
                      <div className={styles.ItemLine}>
                        <div className={styles.Item}>
                          <Form.Item
                            name="deptCode"
                            label="部门编号"
                          >
                            {getFieldDecorator('deptCode', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入部门编号!',
                                },
                                {
                                  validator: this.validateNoChinese,
                                },
                              ],
                              initialValue: listItems && listItems.deptCode,
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'deptCode') }} />)}
                          </Form.Item>
                        </div>
                        <div className={styles.Item}>
                          <Form.Item
                            name="deptName"
                            label="部门名称"
                          >
                            {getFieldDecorator('deptName', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入部门名称!',
                                },
                                {
                                  max: 18,
                                  message: '超出最大长度',
                                },
                              ],
                              initialValue: listItems && listItems.deptName,
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'deptName') }} />)}
                          </Form.Item>
                        </div>
                      </div>
                      <div className={styles.ItemLine}>
                        <div className={styles.Item}>
                          <Form.Item
                            name="leaderName"
                            label="负责人"
                          >
                            {getFieldDecorator('leaderName', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入负责人!',
                                },
                                {
                                  max: 18,
                                  message: '超出最大长度',
                                },
                              ],
                              initialValue: listItems && listItems.leaderName,
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'leaderName') }} />)}

                          </Form.Item>
                        </div>
                        <div className={styles.Item}>
                          <Form.Item
                            name="parentId"
                            label="父部门"
                          >
                            {getFieldDecorator('parentId', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入父部门!',
                                },
                              ],
                              initialValue: listItems ? listItems.parentId : 0,
                            })(
                              <Select onChange={(e) => { this.handleGroupMsgChange(e, 'parentId') }}>
                                <Option value={0} key={0}>请选择所属用父部门</Option>
                                {
                                  !!parentGroup && parentGroup.map((item) => {
                                    return (
                                      <Option value={item.id} key={item.id}>{item.deptName}</Option>
                                    )
                                  })
                                }
                              </Select>
                            )}


                          </Form.Item>
                        </div>
                      </div>
                      <div className={styles.ItemLine}>
                        <div className={styles.Item}>
                          <Form.Item
                            name="remark"
                            label="备注"
                          >
                            {getFieldDecorator('remark', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入备注!',
                                },
                                {
                                  max: 50,
                                  message: '超出最大长度',
                                },
                              ],
                              initialValue: listItems && listItems.remark,
                            })(<Input maxLength={50} onChange={(e) => { this.handleGroupMsgChange(e, 'remark') }} />)}
                          </Form.Item>
                        </div>
                        <div className={styles.Item}>
                          <Form.Item
                            name="sort"
                            label="序号"
                          >
                            {getFieldDecorator('sort', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入序号!',
                                },
                                {
                                  pattern: new RegExp(/^[1-9]\d*$/, 'g'),
                                  message: '请输入正确的部门编号',
                                },
                              ],
                              initialValue: listItems && listItems['sort'],
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'sort') }} />)}

                          </Form.Item>
                        </div>
                      </div>
                      <Form.Item >
                        <div className={styles.Footer} style={{ width: '170%' }}>
                          <Button className={styles.Button} type="primary" htmlType="submit">保&nbsp;&nbsp;存</Button>
                          <Button className={styles.Button} onClick={this.handleCloseGroupMsg}>返&nbsp;&nbsp;回</Button>
                        </div>
                      </Form.Item>
                    </Form>

                  </div>
                </div>
              </div> : null
          }
        </div>
      </div>
    )
  }
}

export default Form.create()(Institution)
