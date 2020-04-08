
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import classNames from 'classNames'
import { Pagination, Icon, Select, Button, Input, message, Tree, Modal, Form } from 'antd'
/*  角色管理 */
const { confirm } = Modal
const { Option } = Select
const { TreeNode } = Tree
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
class Rolemana extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listDatas: null,
      showGroupMsg: false,
      totalCount: 1,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      treeData: null,
      userLimit: [],
      current: 1,
    }
    this.deptListUrl = '/control/sys/role/listPage'
    this.addListUrl = '/control/sys/role/save'
    this.updateUrl = '/control/sys/role/update'
    this.deleteUrl = '/control/sys/role/delete'
    this.sysMenuUrl = '/control/sys/menu/list'
    this.listTrueUrl = '/control/sys/menu/listTrue' // 获取树结构
    this.deleteParams = {
      roleIds: [],
    }
    this.listParams = {
      keyword: '',
      pageNo: 1,
    }
    this.defaultparams = {
      id: '',
      menuIds: '',
      name: '',
      remark: '',
    }
  }
  componentDidMount = () => {
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    this.getSystemMenu()
    this.getDeptList()
    this.onlistTrue()
  }
  onlistTrue = () => {
    getResponseDatas('post', this.listTrueUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        this.setState({ treeData: data })
      }
    })
  }
  handlePagination = (pageNumber) => {
    console.log('Page: ', pageNumber)
    this.listParams.pageNo = pageNumber
    this.getDeptList()
  }
  onExpand = (expandedKeys) => {
    console.log('onExpand', expandedKeys)
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }

  onCheck = (checkedKeys, e) => {
    console.log('onCheck', checkedKeys, e)
    this.defaultparams.menuIds = checkedKeys.checked
    /*  this.defaultparams.menuIds = [...e.halfCheckedKeys, ...checkedKeys] */
    this.setState({ checkedKeys: checkedKeys.checked })
  }

  onSelect = (selectedKeys, info) => {
    console.log('onSelect', info)
    this.setState({ selectedKeys })
  }
  getSystemMenu = () => {
    getResponseDatas('post', this.sysMenuUrl).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        const menuIdArr = []
        data.forEach((item) => {
          menuIdArr.push(item.id)
        })
        this.defaultparams.menuIds = menuIdArr
      }
    })
  }
  renderTreeNodes = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} {...item} />
    })
  getDeptList = () => {
    getResponseDatas('post', this.deptListUrl, this.getFormData(this.listParams)).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        const listdata = data.list.filter((item) => {
          return item.isDelete == 0
        })
        this.setState({
          listDatas: listdata,
          totalCount: data.totalCount,
          current: Number(this.listParams.pageNo)
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
    console.log(formData)
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
    this.state.checkedKeys = []
    this.defaultparams = {
      id: '',
      menuIds: '',
      name: '',
      remark: '',
    }
    this.setState({ showGroupMsg: false })
  }
  handleEditItems = (id) => {
    this.isAdd = false
    let menuId = []
    const listItem = (this.state.listDatas.filter(item => item.id === id))[0]
    console.log(listItem)
    if (listItem.menuId) {
      menuId = listItem.menuId.split(',')
    }
    this.setState({
      listItems: listItem,
      showGroupMsg: true,
      checkedKeys: menuId,
    })
    Object.keys(this.defaultparams).map((item) => {
      if (item === 'menuIds') {
        this.defaultparams[item] = listItem.menuId
      } else {
        this.defaultparams[item] = listItem[item]
      }
    })
  }
  handleGroupMsgChange = (e, itemname) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    this.defaultparams[itemname] = value
  }
  /* handleAddEdit = () => {
    if (this.isAdd) {
      getResponseDatas('post', this.addListUrl, this.getFormData(this.defaultparams)).then((res) => {
        const { code, msg } = res.data
        if (code === 0) {
          this.listParams.keyword = ''
          this.listParams.pageNo = 1
          this.state.checkedKeys = []
          this.defaultparams = {
            id: '',
            menuIds: '',
            name: '',
            remark: '',
          }
          message.info('添加成功!')
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
          this.state.checkedKeys = []
          this.defaultparams = {
            id: '',
            menuIds: '',
            name: '',
            remark: '',
          }
          message.info('修改成功!')
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
    this.deleteParams.roleIds.push(id)
    confirm({
      title: '确认要删除当前角色权限?',
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
  handleInputChange = (e) => {
    this.listParams.keyword = e.target.value
  }
  handleChangePage = (page) => {
    this.listParams.pageNo = page
    this.getDeptList()
  }
  handleKeywordChange = (e) => {
    const { value } = e.target
    this.listParams.keyword = value
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const url = this.defaultparams.id ? this.updateUrl : this.addListUrl
        getResponseDatas('post', url, this.getFormData(this.defaultparams)).then((res) => {
          const { code, msg } = res.data
          if (code === 0) {
            /*    this.listParams.keyword = ''
               this.listParams.pageNo = 1 */
            this.handleCloseGroupMsg()
            this.getDeptList()
            message.info(msg)
          } else {
            message.info(msg)
          }
        })
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { listDatas, showGroupMsg, treeData, listItems, totalCount, userLimit, current } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div> <Input onChange={(e) => { this.handleInputChange(e, 'keyword') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlePagination('1') }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                {userLimit.includes(19) && <span className={styles.Button} onClick={this.handleAddGroup} >新&nbsp;&nbsp;增</span>}
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >角色编号</div>
                <div className={styles.listTd} >角色名称</div>
                <div className={styles.listTd} >角色描述</div>
                <div className={styles.listTd} >创建时间</div>
                {userLimit.includes(20) || userLimit.includes(21) ? <div className={styles.listTd} >操作</div> : null}
              </div>
              {
                listDatas && listDatas.map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.id}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.name}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.remark}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.createTime}</span></div>
                      {userLimit.includes(20) || userLimit.includes(21) ?
                        <div className={styles.listTd} >
                          {userLimit.includes(20) && <Button className={styles.Button} onClick={() => { this.handleEditItems(item.id) }}>修&nbsp;&nbsp;改</Button>}
                          {userLimit.includes(21) && <Button className={styles.Button} onClick={() => { this.handleDeleteItem(item.id) }}>删&nbsp;&nbsp;除</Button>}
                        </div> : null}
                    </div>
                  )
                })
              }
              {
                !!listDatas && listDatas.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={totalCount} onChange={this.handlePagination} /></div>
            </div>
          </div>
          {
            showGroupMsg ?
              <div className={styles.MaskBox}>
                <div className={styles.AddBox} style={{ width: '550px' }}>
                  <div className={styles.Title}>{listItems ? '编辑' : '新增'}<Icon onClick={this.handleCloseGroupMsg} className={styles.Close} type="close" /></div>
                  <div className={classNames(styles.Conten, styles.treeData)}>
                    <Form
                      onSubmit={this.handleSubmit}
                      {...formItemLayout}
                    >
                      <div className={styles.ItemLine}>
                        <div className={styles.Item} style={{ width: '100%' }}>
                          <Form.Item
                            name="name"
                            label="角色名称"
                          >
                            {getFieldDecorator('name', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入角色名称!',
                                },
                                {
                                  max: 18,
                                  message: '超出最大长度',
                                },
                              ],
                              initialValue: listItems && listItems.name,
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'name') }} />)}
                          </Form.Item>
                        </div>
                      </div>
                      <div className={styles.ItemLine}>
                        <div className={styles.Item} style={{ width: '100%' }}>
                          <Form.Item
                            name="remark"
                            label="角色描述"
                          >
                            {getFieldDecorator('remark', {
                              rules: [
                                {
                                  required: true,
                                  message: '请输入角色描述!',
                                },
                              ],
                              initialValue: listItems && listItems.remark,
                            })(<Input onChange={(e) => { this.handleGroupMsgChange(e, 'remark') }} />)}
                          </Form.Item>
                        </div>
                      </div>
                      <div className={styles.ItemTree}>
                        <Form.Item
                          name="menuIds"
                          label="角色权限"
                        >
                          {treeData ?
                            <Tree
                              checkable
                              checkStrictly
                              onExpand={this.onExpand}
                              expandedKeys={this.state.expandedKeys}
                              autoExpandParent={this.state.autoExpandParent}
                              onCheck={this.onCheck}
                              checkedKeys={this.state.checkedKeys}
                              onSelect={this.onSelect}
                              selectedKeys={this.state.selectedKeys}
                              defaultExpandAll={true}
                            >
                              {this.renderTreeNodes(treeData)}
                            </Tree> : null}
                        </Form.Item>
                      </div>
                      <Form.Item>
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

export default Form.create()(Rolemana)
