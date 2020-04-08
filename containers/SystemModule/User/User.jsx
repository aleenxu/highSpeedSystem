import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, message, Modal, Icon, Form, Select, Button } from 'antd'

/* 用户管理 */
const { confirm } = Modal
const { Option } = Select
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
class User extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      systemList: null,
      depList: null,
      roleList: null,
      dataList: null,
      userLimit: [],
      boardData: null,
      current: 1,
    }
    this.sysUser = {
      pageNo: 1,
      keyword: '',
    }
    this.dataList = {
      address: '',
      avatar: '',
      deptIds: '',
      email: '',
      loginName: '',
      password: '123456',
      phone: '',
      roleIds: '',
      status: 0,
      userName: '',
    }
    this.listUrl = '/control/sys/user/list' // 获取列表
    this.resetPassUrl = '/control/sys/user/resetPassword' // 重置密码
    this.deleteUrl = '/control/sys/user/delete' // 删除
    this.userUrl = '/control/sys/user/getUser' // 查看
    this.deptUrl = '/control/sys/dept/list' // 获取用户组
    this.roleUrl = '/control/sys/role/list' // 获取角色
    this.saveUrl = '/control/sys/user/save'
    this.updateUrl = '/control/sys/user/update'
  }
  componentDidMount = () => {
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    this.dataListData = JSON.parse(JSON.stringify(this.dataList))
    this.getSystemList()
    this.getSystemdep()
  }
  getSystemdep = () => {
    // 获取角色
    getResponseDatas('post', this.roleUrl).then((res) => {
      const result = res.data
      if (result.code === 0) {
        const roleList = (result.data.filter(item => item.isDelete === 0))
        this.setState({ roleList })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
    getResponseDatas('post', this.deptUrl).then((res) => {
      const result = res.data
      if (result.code === 0) {
        this.setState({ depList: result.data })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    console.log(formData)
    return formData
  }
  getSystemList = () => {
    getResponseDatas('post', this.listUrl, this.getFormData(this.sysUser)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        console.log(result.data)
        this.setState({ systemList: result.data, current: Number(this.sysUser.pageNo) })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  getresetPwd = (userid) => {
    const that = this
    confirm({
      title: '确认要重置当前用户密码?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.resetPassUrl, that.getFormData({ id: [userid] })).then((resData) => {
            if (resData.data.code === 0) {
              message.success('重置密码成功!')
              that.getSystemList()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  getfaciDelete = (userid) => {
    const that = this
    confirm({
      title: '确认要删除当前用户?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('post', that.deleteUrl, that.getFormData({ userIds: [userid] })).then((resData) => {
            if (resData.data.code === 0) {
              message.success('删除成功!')
              that.getSystemList()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  /*   getAddUserList = () => {
      console.log(this.dataList);
      const url = this.dataList.id ? this.updateUrl : this.saveUrl
      if (!this.dataList.userName) {
        message.error('请填写用户名称!')
        return
      }
      if (!this.dataList.loginName) {
        message.error('请填写登录名称!')
        return
      }
      if (!this.dataList.phone) {
        message.error('请填写联系电话!')
        return
      }
      if (!this.dataList.email) {
        message.error('请填写电子邮箱!')
        return
      }
      if ((!this.dataList.deptIds) || (!this.dataList.deptIds.length)) {
        message.error('请选择组织机构!')
        return
      }
      if ((!this.dataList.roleIds) || (!this.dataList.roleIds.length)) {
        message.error('请选择角色!')
        return
      }
      getResponseDatas('post', url, this.getFormData(this.dataList)).then((res) => {
        const result = res.data
        if (result.code === 0) {
          message.success('保存成功!')
          this.getSystemList()
          this.setState({ boardData: null })
        } else {
          message.error(result.msg)
        }
      })
    } */
  getAddUser = () => {
    const boardData = JSON.parse(JSON.stringify(this.dataListData))
    this.boardData = boardData
    this.setState({ boardData })
  }
  handleDataLists = (id) => {
    if (id) {
      getResponseDatas('post', this.userUrl, this.getFormData({ type: 'id', value: id })).then((res) => {
        const result = res.data
        if (result.code === 0) {
          if (Object.keys(result.data).length) {
            console.log(this.dataList);
            this.dataList = result.data
            this.dataList.deptIds = [result.data.deptId]
            this.dataList.roleIds = [result.data.roleId]
            this.setState({ boardData: result.data })
          } else {
            message.error('查无数据！')
          }
        } else {
          message.error('网络异常，请稍后再试!')
        }
      })
    } else {
      this.dataList = this.dataListData
      this.setState({ boardData: null })
    }
  }
  handlepage = (pageNumber) => {
    this.sysUser.pageNo = pageNumber
    this.getSystemList()
  }
  handleInput = (e, name, type) => {
    this[type][name] = e.target.value
  }
  handleSelect = (value, name, type) => {
    console.log(value, name, type);
    this[type][name] = value
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const url = this.dataList.id ? this.updateUrl : this.saveUrl
        getResponseDatas('post', url, this.getFormData(this.dataList)).then((res) => {
          const result = res.data
          if (result.code === 0) {
            message.success('保存成功!')
            this.getSystemList()
            this.setState({ boardData: null })
          } else {
            message.error(result.msg)
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
    const { systemList, current, boardData, roleList, depList, userLimit } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字" onChange={(e) => { this.handleInput(e, 'keyword', 'sysUser') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                {userLimit.includes(14) && <span className={styles.Button} onClick={this.getAddUser} >新&nbsp;&nbsp;增</span>}
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >用户ID</div>
                <div className={styles.listTd} >用户姓名</div>
                <div className={styles.listTd} >登录名称</div>
                <div className={styles.listTd} >组织机构</div>
                <div className={styles.listTd} >角色</div>
                {userLimit.includes(16) || userLimit.includes(37) || userLimit.includes(15) ? <div className={styles.listTd} >操作</div> : null}
              </div>
              {
                systemList && systemList.list.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item.id + index}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.id}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.userName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.loginName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deptName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roleName}</span></div>
                      {/* <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div> */}
                      {
                        userLimit.includes(16) || userLimit.includes(37) || userLimit.includes(15) ?
                          <div className={styles.listTd} >
                            {userLimit.includes(16) && <Button className={styles.Button} onClick={() => { this.handleDataLists(item.id) }} >修&nbsp;&nbsp;改</Button>}
                            {userLimit.includes(37) && <Button className={styles.Button} onClick={() => { this.getresetPwd(item.id) }}>重置密码</Button>}
                            {userLimit.includes(15) && <Button className={styles.Button} onClick={() => { this.getfaciDelete(item.id) }}  >删&nbsp;&nbsp;除</Button>}
                          </div> : null
                      }
                    </div>
                  )
                })
              }
              {
                !!systemList && systemList.list.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{systemList && systemList.totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={systemList && systemList.totalCount} onChange={this.handlepage} /></div>
            </div>
          </div>
          {boardData ?
            <div className={styles.MaskBox}>
              <div className={styles.AddBox}>
                <div className={styles.Title}>{boardData.id ? '编辑' : '新增'}<Icon onClick={() => { this.handleDataLists(null) }} className={styles.Close} type="close" /></div>
                <div className={styles.Conten}>
                  <Form
                    {...formItemLayout}
                    onSubmit={this.handleSubmit}
                  >
                    <div className={styles.ItemLine}>
                      <div className={styles.Item}>
                        <Form.Item
                          name="userName"
                          label="用户名称"
                        >
                          {getFieldDecorator('userName', {
                            rules: [
                              {
                                required: true,
                                message: '请输入用户名称!',
                              },
                              {
                                max: 18,
                                message: '超出最大长度',
                              },
                            ],
                            initialValue: boardData.userName,
                          })(<Input onChange={(e) => { this.handleInput(e, 'userName', 'dataList') }} />)}

                        </Form.Item>
                      </div>
                      <div className={styles.Item}>
                        <Form.Item
                          name="loginName"
                          label="登录名称"
                        >
                          {getFieldDecorator('loginName', {
                            rules: [
                              {
                                required: true,
                                message: '请输入登录名称!',
                              },
                              {
                                max: 18,
                                message: '超出最大长度',
                              },
                              {
                                validator: this.validateNoChinese,
                              },
                            ],
                            initialValue: boardData.loginName,
                          })(<Input disabled={boardData.id} onChange={(e) => { this.handleInput(e, 'loginName', 'dataList') }} />)}
                        </Form.Item>
                      </div>
                    </div>
                    <div className={styles.ItemLine}>
                      <div className={styles.Item}>
                        <Form.Item label="电子邮箱">
                          {getFieldDecorator('email', {
                            rules: [
                              {
                                type: 'email',
                                message: '请输入正确的电子邮箱!',
                              },
                              {
                                required: true,
                                message: '请输入电子邮箱!',
                              },
                            ],
                            initialValue: boardData.email,
                          })(<Input onChange={(e) => { this.handleInput(e, 'email', 'dataList') }} />)}
                        </Form.Item>
                      </div>
                      <div className={styles.Item}>
                        <Form.Item
                          name="phone"
                          label="联系电话"
                        >
                          {getFieldDecorator('phone', {
                            rules: [
                              {
                                pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
                                message: '请输入正确的手机号',
                              },
                              {
                                required: true,
                                message: '请输入手机号!',
                              },
                            ],
                            initialValue: boardData.phone,
                          })(<Input onChange={(e) => { this.handleInput(e, 'phone', 'dataList') }} />)}
                        </Form.Item>
                      </div>
                    </div>
                    <div className={styles.ItemLine}>
                      <div className={styles.Item}>
                        <Form.Item
                          name="deptId"
                          label="组织机构"
                        >
                          {getFieldDecorator('deptId', {
                            rules: [
                              {
                                required: true,
                                message: '请输入组织机构!',
                              },
                            ],
                            initialValue: boardData.deptId,
                          })(
                            <Select onChange={(e) => { this.handleSelect(e, 'deptIds', 'dataList') }}>
                              {
                                depList && depList.map((item, index) => {
                                  return <Option value={item.id + ''} key={item.id}>{item.deptName}</Option>
                                })
                              }
                            </Select>)}
                        </Form.Item>
                      </div>
                      <div className={styles.Item}>
                        <Form.Item
                          name="roleId"
                          label="用户角色"
                        >
                          {getFieldDecorator('roleId', {
                            rules: [
                              {
                                required: true,
                                message: '请输入用户角色!',
                              },
                            ],
                            initialValue: boardData.roleId,
                          })(
                            <Select onChange={(e) => { this.handleSelect(e, 'roleIds', 'dataList') }}>
                              {
                                roleList && roleList.map((item) => {
                                  return <Option value={item.id + ''} key={item.id}>{item.name}</Option>
                                })
                              }
                            </Select>)}

                        </Form.Item>
                      </div>
                    </div>

                    <Form.Item >
                      <div className={styles.Footer} style={{ width: '170%' }}>
                        <Button className={styles.Button} type="primary" htmlType="submit">保&nbsp;&nbsp;存</Button>
                        <Button className={styles.Button} onClick={() => { this.handleDataLists(null) }}>返&nbsp;&nbsp;回</Button>
                      </div>
                    </Form.Item>
                  </Form>

                </div>
              </div>
            </div> : null}
        </div>
      </div>
    )
  }
}

export default Form.create()(User)
