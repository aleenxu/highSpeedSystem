import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import styles from '../EquipmentModule.scss'
import classNames from 'classNames'
import MainMap from '../../../components/MainMap/MainMap'
import { Pagination, Input, message, Modal, Icon, Form, Select, Button } from 'antd'

const { confirm } = Modal
const { Option } = Select
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}
class SpeedLimit extends React.Component {
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
      boardLatlng: null,
      Intelatlng: null,
    }
    this.Parameters = {
      keyword: '',
      pageNo: 1,
      deviceTypeId: '3',
    }
    this.board = {
      currentDisplay: '',
      deviceId: '',
      deviceIp: '',
      deviceName: '',
      deviceTypeId: '3',
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
      /* deviceSize: '', */
    }
    this.listByPageUrl = '/control/inforBoard/listByPage' // 分页查询设备
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.deleteUrl = '/control/inforBoard/delete' //  删除情报板'
    // this.hwayUrl = '/control/road/list/hway' //  获取高速编号，用于下拉框'
    this.updateUrl = '/control/inforBoard/update' // 修改情报板'
    this.insertUrl = '/control/inforBoard/insert' // 新增情报板'
    this.Status = '/control/inforBoard/getControlStatus' // 获取情报板状态'
    this.directionUrl = '/control/static/hway/list/direction' //  获取高速和方向的级联下拉框，用于下拉框'
    this.secUrl = '/control/customize/road/by/hway/direction' // 根据公路名和方向获取路段'
  }
  componentDidMount = () => {
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    this.boardData = JSON.parse(JSON.stringify(this.board))
    this.handleListByPage()
    this.handlelistDetail('directionList', 1)
    this.handlelistDetail('vendorList', 24)
    this.handlelistDetail('deviceTypeList', 18)
    this.handlelistDetail('deviceSizeList', 25)
    this.handlelistDetail('currentList', 15)
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
  const { direction, hwayId } = this.board
  getResponseDatas('get', this.secUrl, { directionId: direction, hwayId }).then((res) => {
    const result = res.data
    if (result.code === 200) {
      if (name) {
        this.board.roadSecId = result.data.length > 0 ? result.data[0].roadId : null
        this.props.form.setFieldsValue({
          roadSecId: this.board.roadSecId,
        })
        this.setState({ roadSecIdItem: this.board.roadSecId })
      }
      this.setState({ roadSecIddata: result.data })
    } else {
      message.warning('暂无无数据')
    }
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
      title: '确认要删除当前可变情报板?',
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
    if (name === 'latlng') {
      this.setState({ boardLatlng: e.target.value })
    }
    this[type][name] = e.target.value
  }
  handleSelect = (value, name, type) => {
    this[type][name] = value
    if (name === 'hwayId' && type === 'board') {
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
      if (item.hwayId === value) {
        if (name) {
          this.board.direction = item.direction[0].directionId
          this.handlelistSec(name)
          this.props.form.setFieldsValue({
            direction: item.direction[0].directionId,
          })
          this.setState({ directions: item.direction[0].directionId })
        }
        this.setState({ hwayDirection: item.direction })
      }
    })
  }
  // 查看当前方案详情
  handleboardData = (data) => {
    this.board = JSON.parse(JSON.stringify(data))
    this.setState({ boardData: data, Intelatlng: null, boardLatlng: data ? data.latlng : null, directions: data ? data.direction : null, roadSecIdItem: data ? data.roadSecId : null }, () => {
      if (data) {
        // 获取方向下拉
        this.handlehwaySelect(data.hwayId)
        // 获取路干下拉
        this.handlelistSec()
      }
    })
  }
  handleAddData = () => {
    this.board = JSON.parse(JSON.stringify(this.boardData))
    this.setState({ boardData: this.board, boardLatlng: null, hwayDirection: null, roadSecIddata: null })
  }
  handlemainMap = (latlng) => {
    this.board.latlng = latlng
    this.props.form.setFieldsValue({
      latlng,
    })
    this.setState({ boardLatlng: latlng })
  }
  handleIntelatlng = (value) => {
    this.setState({ Intelatlng: value })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const url = this.board.rowId ? this.updateUrl : this.insertUrl
        getResponseDatas('post', url, this.board).then((res) => {
          const result = res.data
          if (result.code === 200) {
            this.board = JSON.parse(JSON.stringify(this.boardData))
            this.setState({ boardData: null, boardLatlng: null, directions: null, roadSecIddata: null,Intelatlng:null, })
            this.handleListByPage()
            message.success(result.message)
          }else{
            message.error(result.message)
          }
        })
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form
    const { listByPage, Intelatlng, current, currentList, userLimit, boardLatlng, deviceSizeList, boardData, directionList, roadSecIddata, roadSecIdItem, directions, hwayList, vendorList, deviceTypeList, ControlStatus, hwayDirection } = this.state
    return (
      <div>
        <SystemMenu />
        {Intelatlng ? <MainMap boardLatlng={boardLatlng} handlemainMap={this.handlemainMap} handleIntelatlng={this.handleIntelatlng} /> : null}
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字" onChange={(e) => { this.handleInput(e, 'keyword', 'Parameters') }} /></div>
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
                <div className={styles.listTd} >高速公路</div>
                <div className={styles.listTd} >所属路段</div>
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
                    <div className={styles.listItems} key={item.deviceName + item.deviceId}>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.deviceId}>{item.deviceId}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.handledirection(vendorList, item.vendor)}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.hwayName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.latlng}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.directionName}</span></div>
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
                  onSubmit={this.handleSubmit}
                  {...formItemLayout}
                  autoComplete="off"
                >
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceId"
                        label="设备编号"
                      >
                        {getFieldDecorator('deviceId', {
                          rules: [
                            {
                              required: true,
                              message: '请输入设备编号!',
                            },
                            {
                              max: 50,
                              message: '超出最大长度',
                            },
                          ],
                          initialValue: boardData.deviceId,
                        })(<Input disabled={Boolean(boardData.rowId)} onChange={(e) => { this.handleInput(e, 'deviceId', 'board') }} />)}
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="deviceName"
                        label="设备名称"
                      >
                        {getFieldDecorator('deviceName', {
                          rules: [
                            {
                              required: true,
                              message: '请输入设备名称!',
                            },
                            {
                              max: 20,
                              message: '超出最大长度',
                            },
                          ],
                          initialValue: boardData.deviceName,
                        })(<Input onChange={(e) => { this.handleInput(e, 'deviceName', 'board') }} />)}
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="vendor"
                        label="设备厂家"
                      >
                        {getFieldDecorator('vendor', {
                          rules: [
                            {
                              required: true,
                              message: '请输入设备厂家!',
                            },
                          ],
                          initialValue: boardData.vendor,
                        })(
                          <Select
                            showSearch
                            optionFilterProp="children"
                            onChange={(e) => { this.handleSelect(e, 'vendor', 'board') }}
                          >
                            {
                              vendorList && vendorList.map((item) => {
                                return <Option key={item.id} value={item.id}>{item.name}</Option>
                              })
                            }
                          </Select>
                        )}
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="latlng"
                        label="经&nbsp;纬&nbsp;度"
                      >
                        {getFieldDecorator('latlng', {
                          rules: [
                            {
                              required: true,
                              message: '请输入经纬度!',
                            },
                          ],
                          initialValue: boardLatlng,
                        })(<Input onChange={(e) => { this.handleInput(e, 'latlng', 'board') }} onClick={(e) => { this.handleIntelatlng(true) }} />)}
                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="hwayId"
                        label="高速公路"
                      >
                        {getFieldDecorator('hwayId', {
                          rules: [
                            {
                              required: true,
                              message: '请输入高速公路!',
                            },
                          ],
                          initialValue: boardData.hwayId,
                        })(
                          <Select
                            showSearch
                            optionFilterProp="children"
                            onChange={(e) => { this.handleSelect(e, 'hwayId', 'board') }}
                          >
                            {
                              hwayList && hwayList.map((item) => {
                                return <Option key={item.hwayId} value={item.hwayId}>{item.hwayName}</Option>
                              })
                            }
                          </Select>
                        )}
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="pileNum"
                        label="桩&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号"
                      >
                        {getFieldDecorator('pileNum', {
                          rules: [
                            {
                              required: true,
                              message: '请输入桩号!',
                            },
                            {
                              max: 20,
                              message: '超出最大长度',
                            },
                          ],
                          initialValue: boardData.pileNum,
                        })(<Input onChange={(e) => { this.handleInput(e, 'pileNum', 'board') }} />)}


                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="direction"
                        label="方&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;向"
                      >
                        {getFieldDecorator('direction', {
                          rules: [
                            {
                              required: true,
                              message: '请输入方向!',
                            },
                          ],
                          initialValue: directions,
                        })(
                          <Select
                            showSearch
                            optionFilterProp="children"
                            onChange={(e) => { this.handleSelect(e, 'direction', 'board') }}
                          >
                            {
                              hwayDirection && hwayDirection.map((item) => {
                                return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                              })
                            }
                          </Select>
                        )}
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="roadSecId"
                        label="所属路段"
                      >
                        {getFieldDecorator('roadSecId', {
                          rules: [
                            {
                              required: true,
                              message: '请输入所属路段!',
                            },
                          ],
                          initialValue: roadSecIdItem,
                        })(
                          <Select
                            onChange={(e) => { this.handleSelect(e, 'roadSecId', 'board') }}
                            showSearch
                            optionFilterProp="children"
                          >
                            {
                              roadSecIddata && roadSecIddata.map((item) => {
                                return <Option key={item.roadId} value={item.roadId}>{item.roadName}</Option>
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
                        name="deviceIp"
                        label="IP&nbsp;地&nbsp;址"
                      >
                        {getFieldDecorator('deviceIp', {
                          rules: [
                            {
                              pattern: /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[1-9])\.((([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))))\.((([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))))\.((([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))))$/,
                              message: '请输入正确的IP',
                            },
                            {
                              required: this.board.vendor == 1 ? true : false,
                              message: '请输入IP地址!',
                            },
                            {
                              max: 20,
                              message: '超出最大长度',
                            },
                          ],
                          initialValue: boardData.deviceIp,
                        })(<Input onChange={(e) => { this.handleInput(e, 'deviceIp', 'board') }} />)}
                      </Form.Item>
                    </div>
                    <div className={styles.Item}>
                      <Form.Item
                        name="port"
                        label="端&nbsp;口&nbsp;号"
                      >
                        {getFieldDecorator('port', {
                          rules: [
                            {
                              required: false,
                              pattern: new RegExp(/^[1-9]\d*$/, "g"),
                              message: '请输入正确的端口'
                            },
                            {
                              required: this.board.vendor == 1 ,
                              message: '请输入端口号!',
                            },
                            {
                              max: 5,
                              message: '超出最大长度',
                            },
                          ],
                          initialValue: boardData.port?(boardData.port + ''):'',
                        })(<Input onChange={(e) => { this.handleInput(e, 'port', 'board') }} />)}

                      </Form.Item>
                    </div>
                  </div>
                  <div className={styles.ItemLine}>
                    <div className={styles.Item}>
                      <Form.Item
                        name="currentDisplay"
                        label="默认显示内容"
                      >
                        {getFieldDecorator('currentDisplay', {
                          rules: [
                            {
                              required: true,
                              message: '请选择默认显示内容!',
                            },
                          ],
                          initialValue: boardData.currentDisplay,
                        })(
                          <Select onChange={(e) => { this.handleSelect(e, 'currentDisplay', 'board') }}>
                            {
                              currentList && currentList.map((item) => {
                                return <Option key={item.name} value={item.name}>{item.name}</Option>
                              })
                            }
                          </Select>
                        )}
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
                  <Form.Item>
                    <div className={styles.Footer} style={{ width: '170%' }}>
                      <Button className={styles.Button}  htmlType="submit">保&nbsp;&nbsp;存</Button>
                      <Button className={styles.Button} onClick={() => { this.handleboardData(null) }}>返&nbsp;&nbsp;回</Button>
                    </div>
                  </Form.Item>
                </Form>

              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default Form.create()(SpeedLimit)
