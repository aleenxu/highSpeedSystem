import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import styles from '../EquipmentModule.scss'
import classNames from 'classNames'
import { Pagination, Input, message, Modal, Icon, Form, Select, Button } from 'antd'

const { confirm } = Modal
const { Option } = Select
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
/*         可变情报板 */
class Intelligence extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: null,
      current: 1,
      directionList: [],
      boardData: null,
      hwayList: [],
      vendorList: [],
      deviceTypeList: null,
      ControlStatus: { showContent: '', statusName: '' },
      hwayDirection: null,
      directions: null,
      roadSecIddata: null,
      roadSecIdItem: null,
      userLimit: [],
      deviceSizeList: null,
    }
    this.Parameters = {
      keyword: '',
      pageNo: 1,
    }
    this.board = {
      currentDisplay: '',
      deviceId: '',
      deviceIp: '',
      deviceName: '',
      deviceTypeId: '1',
      direction: '',
      displayCode: '',
      latlng: '',
      online: '',
      pileNum: '',
      port: '',
      roadName: '',
      roadSecId: '',
      rowId: '',
      vendor: '',
      deviceSize: '',
    }
    this.listByPageUrl = '/control/inforBoard/listByPage' // 分页查询设备
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.deleteUrl = '/control/inforBoard/delete' //  删除情报板'
    this.hwayUrl = '/control/road/list/hway' //  获取高速编号，用于下拉框'
    this.updateUrl = '/control/inforBoard/update' // 修改情报板'
    this.insertUrl = '/control/inforBoard/insert' // 新增情报板'
    this.Status = '/control/inforBoard/getControlStatus' // 获取情报板状态'
    this.directionUrl = '/control/road/list/hway/direction' //  获取高速和方向的级联下拉框，用于下拉框'
    this.secUrl = '/control/road/list/sec' // 根据公路名和方向获取路段'
  }
  componentDidMount = () => {
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    this.boardData = this.board
    this.handleListByPage()
    this.handlelistDetail('directionList', 1)
    this.handlelistDetail('vendorList', 24)
    this.handlelistDetail('deviceTypeList', 18)
    this.handlelistDetail('deviceSizeList', 25)
    // 获取级联方向下拉
    this.handlehwayDirection()
  }
  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) })
      }
    })
  }
  handlehwayDirection = () => {
    getResponseDatas('get', this.directionUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ hwayList: result.data })
      }
    })
  }
  handleControlStatus = () => {
    const { deviceId, deviceTypeId } = this.board
    if (!deviceId) {
      message.warning('请填写设备编号')
      return
    }
    if (!deviceTypeId) {
      message.warning('请选择设备类型')
      return
    }
    getResponseDatas('post', this.Status, { deviceId, deviceTypeId }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ ControlStatus: result.data })
      } else {
        message.warning('无数据')
      }
    })
  }
  // 获取路干
  handlelistSec = (name) => {
    const { direction, roadName } = this.board
    getResponseDatas('get', this.secUrl, { direction, roadName }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (name) {
          console.log(result.data.length > 0 ? result.data[0].roadSecId : null);

          this.board.roadSecId = result.data.length > 0 ? result.data[0].roadSecId : null
          this.setState({ roadSecIdItem: result.data.length > 0 ? result.data[0].roadSecId : null })
        }
        this.setState({ roadSecIddata: result.data })
      } else {
        message.warning('暂无无数据')
      }
    })
  }
  // 添加与编辑
  handleListupdate = () => {
    const url = this.board.rowId ? this.updateUrl : this.insertUrl
    getResponseDatas('post', url, this.board).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.board = this.boardData
        this.setState({ boardData: null, directions: null, roadSecIddata: null })
        this.handleListByPage()
      }
      message.success(result.message)
    })
  }
  // 通用呆板式接口请求
  handleUrlAjax = (type, url, name, data) => {
    getResponseDatas(type, url, data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  handleDelect = (rowId) => {
    const that = this
    confirm({
      title: '确认要删除当前用户?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('get', that.deleteUrl, { id: rowId }).then((res) => {
            const result = res.data
            if (result.code === 200) {
              that.handleListByPage()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 字典查询
  handlelistDetail = (name, value) => {
    getResponseDatas('get', this.listDetailUrl + value).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  handlepage = (pageNumber) => {
    this.Parameters.pageNo = pageNumber
    this.handleListByPage()
  }

  handledirection = (data, id) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        return data[i].name
      }
    }
  }
  handleInput = (e, name, type) => {
    this[type][name] = e.target.value
  }
  handleSelect = (value, name, type) => {
    this[type][name] = value
    if (name === 'roadName' && type === 'board') {
      this.handlehwaySelect(value, name)
    }
    if (name === 'direction' && type === 'board') {
      this.setState({ directions: value })
      this.handlelistSec(name)
    }
    if (name === 'roadSecId' && type === 'board') {
      this.setState({ roadSecIdItem: value })
    }
  }
  handlehwaySelect = (value, name) => {
    const { hwayList } = this.state
    hwayList.forEach((item) => {
      if (item.roadId === value) {
        if (name) {
          this.board.direction = item.directions[0].directionId
          this.handlelistSec(name)
          this.setState({ directions: item.directions[0].directionId })
        }
        this.setState({ hwayDirection: item.directions })
      }
    })
  }
  // 查看当前方案详情
  handleboardData = (data) => {
    this.board = data
    this.setState({ boardData: data, directions: data ? data.direction : null, roadSecIdItem: data ? data.roadSecId : null }, () => {
      if (data) {
        // 获取方向下拉
        this.handlehwaySelect(data.roadName)
        // 获取路干下拉
        this.handlelistSec()
      }
    })
  }
  handleAddData = () => {
    console.log(this.board, this.boardData);
    this.board = this.boardData
    this.setState({ boardData: this.board, hwayDirection: null, roadSecIddata: null })
  }
  render() {
    const { listByPage, current, userLimit, deviceSizeList, boardData, directionList, roadSecIddata, roadSecIdItem, directions, hwayList, vendorList, deviceTypeList, ControlStatus, hwayDirection } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input onChange={(e) => { this.handleInput(e, 'keyword', 'Parameters') }} /></div>
                <Button className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</Button>
              </div>
              <div className={styles.rightItem}>
                {userLimit.includes(85) && <Button className={styles.Button} onClick={this.handleAddData}>新&nbsp;&nbsp;增</Button>}
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >设备编号</div>
                <div className={styles.listTd} >设备名称</div>
                <div className={styles.listTd} >设备厂商</div>
                {/* <div className={styles.listTd} >型号</div> */}
                <div className={styles.listTd} >高速公路</div>
                <div className={styles.listTd} >桩号</div>
                <div className={styles.listTd} >经纬度坐标</div>
                <div className={styles.listTd} >方向</div>
                <div className={styles.listTd} >IP地址</div>
                <div className={styles.listTd} >端口号</div>
                {userLimit.includes(86) || userLimit.includes(87) ? <div className={styles.listTd} >操作</div> : null}
              </div>
              {
                !!listByPage && listByPage.data.map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceId}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.handledirection(vendorList, item.vendor)}</span></div>
                      {/* <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum}</span></div> */}
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.latlng}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.handledirection(directionList, item.direction)}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceIp}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.port}</span></div>
                      {userLimit.includes(86) || userLimit.includes(87) ?
                        <div className={styles.listTd} >
                          {userLimit.includes(86) && <Button className={styles.Button} onClick={() => { this.handleboardData(item) }}>修&nbsp;&nbsp;改</Button>}
                          {userLimit.includes(87) && <Button className={styles.Button} onClick={() => { this.handleDelect(item.rowId) }}>删&nbsp;&nbsp;除</Button>}
                        </div> : null}
                    </div>
                  )
                })
              }
              {
                !!listByPage && listByPage.data.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{listByPage && listByPage.total}条，每页显示10条</span><Pagination showQuickJumper current={current} total={listByPage && listByPage.total} onChange={this.handlepage} /></div>
            </div>
          </div>
        </div>
        {boardData ?
          <div className={styles.MaskBox}>
            <div className={styles.AddBox}>
              <div className={styles.Title}>{boardData.rowId ? '编辑' : '新增'}<Icon onClick={() => { this.handleboardData(null) }} className={styles.Close} type="close" /></div>
              <div className={styles.Conten}>
                <Form
                  name="validate_other"
                  {...formItemLayout}
                >
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceId"
                        label="设备编号"
                      >
                        <Input disabled={boardData.rowId} onChange={(e) => { this.handleInput(e, 'deviceId', 'board') }} defaultValue={boardData.deviceId} />
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceName"
                        label="设备名称"
                      >
                        <Input onChange={(e) => { this.handleInput(e, 'deviceName', 'board') }} defaultValue={boardData.deviceName} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="vendor"
                        label="设备厂家"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select your country!' }]}
                      >
                        <Select onChange={(e) => { this.handleSelect(e, 'vendor', 'board') }} defaultValue={boardData.vendor}>
                          {
                            vendorList && vendorList.map((item) => {
                              return <Option key={item.id} value={item.id}>{item.name}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div>
                    {/* <div className={styles.Item}>
                      <Form.Item
                        name="deviceTypeId"
                        label="设备类型"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select your country!' }]}
                      >
                        <Select disabled onChange={(e) => { this.handleSelect(e, 'deviceTypeId', 'board') }} defaultValue={1}> //boardData.deviceTypeId
                          {
                            deviceTypeList && deviceTypeList.map((item) => {
                              return <Option key={item.id} value={item.id}>{item.name}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div> */}
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceSize"
                        label="设备尺寸"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select your country!' }]}
                      >
                        <Select onChange={(e) => { this.handleSelect(e, 'deviceSize', 'board') }} defaultValue={boardData.deviceSize}>{/*  //boardData.deviceTypeId */}
                          {
                            deviceSizeList && deviceSizeList.map((item) => {
                              return <Option key={item.id} value={item.name}>{item.name}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="roadName"
                        label="高速公路"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select your country!' }]}
                      >
                        <Select onChange={(e) => { this.handleSelect(e, 'roadName', 'board') }} defaultValue={boardData.roadName}>

                          {
                            hwayList && hwayList.map((item) => {
                              return <Option value={item.roadId}>{item.roadName}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="pileNum"
                        label="桩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号"
                      >
                        <Input onChange={(e) => { this.handleInput(e, 'pileNum', 'board') }} defaultValue={boardData.pileNum} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="direction"
                        label="方&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;向"
                        hasFeedback
                        rules={[{ required: true, message: 'Please select your country!' }]}
                      >
                        <Select onChange={(e) => { this.handleSelect(e, 'direction', 'board') }} value={directions}>
                          {
                            hwayDirection && hwayDirection.map((item) => {
                              return <Option value={item.directionId}>{item.directionName}</Option>
                            })
                          }
                        </Select>
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="roadSecId"
                        label="所属路段"
                      >
                        <Select onChange={(e) => { this.handleSelect(e, 'roadSecId', 'board') }} value={roadSecIdItem}>
                          {
                            roadSecIddata && roadSecIddata.map((item) => {
                              return <Option value={item.roadSecId}>{item.secName}</Option>
                            })
                          }
                        </Select>
                        {/* <Input onChange={(e) => { this.handleInput(e, 'roadSecId', 'board') }} value={roadSecIddata} /> */}
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceIp"
                        label="IP&nbsp;地&nbsp;址"
                      >
                        <Input onChange={(e) => { this.handleInput(e, 'deviceIp', 'board') }} defaultValue={boardData.deviceIp} />
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="port"
                        label="端&nbsp;口&nbsp;号"
                      >
                        <Input onChange={(e) => { this.handleInput(e, 'port', 'board') }} defaultValue={boardData.port} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="latlng"
                        label="经&nbsp;纬&nbsp;度"
                      >
                        <Input onChange={(e) => { this.handleInput(e, 'latlng', 'board') }} defaultValue={boardData.latlng} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className={classNames(styles.ItemLine, styles.ItemLineList)}>
                    <div className={styles.Item}>
                      <Button onClick={this.handleControlStatus} className={classNames(styles.Button, styles.ItemBt)}>状态查询</Button>
                      <div className={styles.ItemGuan}>
                        <Form.Item label="管控状态">
                          <span className={styles.anttext}>{ControlStatus && ControlStatus.statusName}</span>
                        </Form.Item>
                      </div>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item label="当前显示内容">
                        <span className={styles.anttext}>{ControlStatus && ControlStatus.showContent}</span>
                      </Form.Item>
                    </div>
                  </div>
                </Form>
                <div className={styles.Footer}>
                  <Button className={styles.Button} onClick={this.handleListupdate} type="primary" htmlType="submit">保&nbsp;&nbsp;存</Button>
                  <Button className={styles.Button} onClick={() => { this.handleboardData(null) }}>返&nbsp;&nbsp;回</Button>
                </div>
              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default Intelligence
