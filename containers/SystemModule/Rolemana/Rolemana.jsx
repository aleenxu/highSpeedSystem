
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
      checkedKeys: [38],
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
      menuIds: '38',
      name: '',
      remark: '',
    }
    this.TreeData = []
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
        this.handleTreeData(data)
        console.log(this.TreeData);
        this.setState({ treeData: data })
      }
    })
  }
  onExpand = (expandedKeys) => {
    // console.log('onExpand', expandedKeys)
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }
  
  onCheck = (check, e) => {
    // console.log('onCheck', checkedKeys, e, this.state.treeData)
    const { checkedKeys } = this.state
    // console.log(checked);
    const Item = e.checkedNodes[e.checkedNodes.length - 1]
    const dataRefs = Item.props.dataRef
    this.Ids = []
    this.parentIds = []
    this.childrenItem = null
    this.Ids.push(Item.key)
    if (e.checked) {
      if (dataRefs.parentId) {
        this.Ids.push((dataRefs.parentId).toString())
        // console.log(dataRefs.parentId, '1111111111111');
        this.handleCheckparentId(dataRefs.parentId)
        this.Ids.push(...this.parentIds)
      }
      this.handleCheckedKeys(Item.props.children)
      // console.log(this.Ids);
      this.defaultparams.menuIds = [...new Set([...check.checked, ...this.Ids])]
    } else {
      checkedKeys.forEach((item) => { // 取出取消的项id
        if (!check.checked.includes(item)) {
          this.handleCheckparentId(item, true) // 拿到this.childrenItem 当前取消项数据
          // this.handleCheckparentId(item) // 拿到 this.parentIds 当前取消项所有的父亲id
          this.TreeData.forEach((it) => {
            if (it.id === Number(item)) { // 找到当前级别是否取消父节
              this.TreeData.forEach((ite) => {
                if (ite.id === Number(it.parentId)) { // 找到当前的父亲项
                  const childrenId = []
                  ite.children.forEach((t) => {
                    childrenId.push(check.checked.includes((t.id).toString())) // 判断是受当前父亲项下有勾选
                  })
                  const bl = childrenId.some((x) => { return x === true }) // 有一项为true时候就是true
                  if (!bl) { // 无勾选则取消父亲项的勾选
                    if (it.type === 1) { // 判断是否是按钮，1的时候为菜单 2的时候为按钮
                      if (check.checked.includes((it.parentId).toString())) {
                        check.checked.splice(check.checked.indexOf((it.parentId).toString()), 1)
                      }
                    }
                  }
                }
              })

              if (it.children) { // 取消掉当前项下所有子项的勾选
                it.children.forEach((i) => {
                  // console.log(check.checked, i.id);
                  if (check.checked.includes((i.id).toString())) {
                    check.checked.splice(check.checked.indexOf((i.id).toString()), 1)
                  }
                })
              }
            }
          })
        }
      })
      console.log(checkedKeys, check.checked, this.childrenItem)
      this.defaultparams.menuIds = [...new Set(check.checked)]
    }
    this.setState({ checkedKeys: this.defaultparams.menuIds })
  }

  onSelect = (selectedKeys, e) => {
    // console.log(selectedKeys, e);
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
          <TreeNode title={item.name} key={item.id} dataRef={item} disabled={item.id === 38}>
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
    // console.log(formData)
    return formData
  }
  handleCheckedKeys = (data) => {
    data.map((item) => {
      this.Ids.push(item.key || item.id)
      console.log(item);
      if (item.props.children) {
        this.handleCheckedKeys(item.props.children)
      }
    })
  }
  handleTreeData = (data) => {
    this.TreeData.push(...data)
    data.forEach((item) => {
      if (item.children) {
        this.handleTreeData(item.children)
      }
    })
  }
  handleCheckparentId = (id, bool) => {
    for (let i = 0; i < this.TreeData.length; i++) {
      const item = this.TreeData[i]
      // console.log(item, item.id === id);
      if (item.id === Number(id)) {
        if (bool) {
          this.childrenItem = item
          return
        } else if (item.parentId) {
          this.parentIds.push((item.parentId).toString())
          this.handleCheckparentId(item.parentId)
          return
        }
      }
    }
  }
  handlePagination = (pageNumber) => {
    // console.log('Page: ', pageNumber)
    this.listParams.pageNo = pageNumber
    this.getDeptList()
  }
  handleAddGroup = () => {
    this.isAdd = true
    this.setState({
      listItems: null,
      showGroupMsg: true,
    })
  }
  handleCloseGroupMsg = () => {
    this.defaultparams = {
      id: '',
      menuIds: '38',
      name: '',
      remark: '',
    }
    this.setState({ showGroupMsg: false, expandedKeys: [], checkedKeys: [38], selectedKeys: [], autoExpandParent: true })
  }
  handleEditItems = (id) => {
    this.isAdd = false
    let menuId = []
    const listItem = (this.state.listDatas.filter(item => item.id === id))[0]
    // console.log(listItem)
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
                <div> <Input placeholder="请输入关键字" onChange={(e) => { this.handleInputChange(e, 'keyword') }} /></div>
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
                    <div className={styles.listItems} key={item.name + item.id}>
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
                      autoComplete="off"
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
                            })(<Input maxLength={18} onChange={(e) => { this.handleGroupMsgChange(e, 'name') }} />)}
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
                            })(<Input maxLength={50} onChange={(e) => { this.handleGroupMsgChange(e, 'remark') }} />)}
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
                              defaultExpandAll
                              onExpand={this.onExpand}
                              expandedKeys={this.state.expandedKeys}
                              autoExpandParent={this.state.autoExpandParent}
                              onCheck={this.onCheck}
                              checkedKeys={this.state.checkedKeys}
                              onSelect={this.onSelect}
                              selectedKeys={this.state.selectedKeys}
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