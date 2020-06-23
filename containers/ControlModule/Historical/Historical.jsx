
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import GMap from '../../../components/GMap/GMap'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, Select, DatePicker, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option, OptGroup } = Select
/*        历史方案 */
class Historical extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      eventTypeData: null,
      listByPage: null,
      current: 1,
      startValue: null,
      endValue: null,
      endOpen: false,
      reservePopup: null,
      operationData: null,
      userLimit: [],
      unitText: null,
      simpleHis: null
    }
    this.Parameters = {
      pageNo: 1,
      eventType: 0,
      pageSize: 10,
      roadName: '',
      startTime: '',
      endTime: '',
    }
    // this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.listByPageUrl = '/control/event/list/his'
    this.typesTreeUrl = '/control/event/get/all/types/tree' // 获取所有的事件类型，分上下级，树形结构'
    this.historyUrl = '/control/event/get/info/' // {eventType}/{eventId} //  查询历史事件详情'
    this.getInfoUrl = '/control/control/plan/get/by/' // {planNum}/{his}/' // {eventType}/{eventId} 获取管控方案'
    this.operationUrl = '/control/control/plan/get/operate/by/' // {planNum}根据管控方案编号获取管控方案操作步骤
    this.textUrl = '/control/event/get/define/unit/text'
    this.hisByUrl = '/control/control/plan/list/simple/his/by/' // {eventNum}根据事件编号，获取历史管控方案集合（用于事件查看管控方案列表接口）'
  }
  componentDidMount = () => {
    // 列表查询
    this.handleListByPage()
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    // 事件类型下拉查询
    this.handleUrlAjax(this.typesTreeUrl, 'eventTypeData')
    // this.handlelistDetail('eventTypeData', 13)
    this.handleUrlAjax(this.textUrl, 'unitText')
  }
  onStartChange = (value) => {
    this.onPickerChange('startValue', value)
    this.Parameters.startTime = value ? this.getDate(value._d) : ''
  }
  onEndChange = (value) => {
    this.onPickerChange('endValue', value)
    this.Parameters.endTime = value ? this.getDate(value._d) : ''
  }
  onPickerChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }
  formatDuring = (mss) => {
    if (mss <= 0) {
      return '0时0分0秒'
    } else {
      var days = parseInt(mss / (1000 * 60 * 60 * 24));
      const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = (mss % (1000 * 60)) / 1000;
      return days + '天' + hours + "时" + minutes + "分"
    }
  }
  getDate = (data) => {
    const today = new Date(data)
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return (navtime + navmse)
  }
  getLineCenterPoint = (latlng) => {
    const newCenter = []
    if (latlng.length > 1) {
      const startPoint = Math.abs(latlng[0][0] - latlng[latlng.length - 1][0]) / 2
      const endPoint = Math.abs(latlng[0][1] - latlng[latlng.length - 1][1]) / 2
      if (latlng[0][0] > latlng[latlng.length - 1][0]) {
        newCenter[0] = startPoint + Number(latlng[latlng.length - 1][0])
      } else {
        newCenter[0] = startPoint + Number(latlng[0][0])
      }
      if (latlng[1][1] > latlng[latlng.length - 1][1]) {
        newCenter[1] = endPoint + Number(latlng[latlng.length - 1][1])
      } else {
        newCenter[1] = endPoint + Number(latlng[0][1])
      }
    }
    const nowZoom = window.map.getZoom()
    window.map.setZoomAndCenter(nowZoom, newCenter)
  }
  //  事件详情
  handlehistory = (data, type) => {
    const url = type ? this.historyUrl : this.getInfoUrl
    getResponseDatas('get', url + data + '/1').then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ reservePopup: result.data }, () => {
          if (type) {
            setTimeout(() => {
              const latlngArr = JSON.parse(JSON.stringify(result.data.latlng))
              this.getLineCenterPoint(result.data.latlng)
              window.drawLine(latlngArr, window.lineFlag)
            }, 0)
          } else {
            this.handleoperation(data)
          }
        })
      }
    })
  }
  // 查询操作记录
  handleoperation = (num) => {
    getResponseDatas('get', this.operationUrl + num).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ operationData: result.data })
      } else {
        message.warning(result.message)
      }
    })
  }
  disabledStartDate = (startValue) => {
    const { endValue } = this.state
    if (!startValue || !endValue) {
      return false
    }
    return startValue.valueOf() > endValue.valueOf()
  }
  disabledEndDate = (endValue) => {
    const { startValue } = this.state
    if (!endValue || !startValue) {
      return false
    }
    return endValue.valueOf() <= startValue.valueOf()
  }
  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }
  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open })
  }
  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) })
      }
    })
  }
  // 通用呆板式接口请求
  handleUrlAjax = (url, name, callback) => {
    getResponseDatas('get', url).then((res) => {
      console.log(res)
      if (res) {
        const result = res.data
        if (result.code === 200) {
          this.setState({ [name]: result.data }, () => { callback && callback(result.data) })
        }
      }
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
    // console.log(pageNumber);
  }
  // input
  handleInput = (e, name, type) => {
    this[type][name] = e.target.value
  }
  // select
  handleSelect = (value, name, type) => {
    this[type][name] = value
  }
  // close
  handleClose = (name, value) => {
    this.setState({ [name]: value, operationData: null })
  }
  render() {
    const {
      eventTypeData, userLimit, operationData, reservePopup, listByPage, current, endOpen, endValue, startValue, simpleHis,
    } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.OperationItem}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="事件类型"
                  showSearch
                  optionFilterProp="children"
                  onChange={(e) => { this.handleSelect(e, 'eventType', 'Parameters') }}
                >
                  <Option value={0}>请选择</Option>
                  {
                    eventTypeData && eventTypeData.map((items) => {
                      if (items.childs) {
                        return (
                          <OptGroup label={items.eventTypeName} key={items.eventType}>
                            {
                              items.childs.map((item) => {
                                return <Option key={item.eventType} value={item.eventType}>{item.eventTypeName}</Option>
                              })
                            }
                          </OptGroup>
                        )
                      } else {
                        return <Option key={items.eventType} value={items.eventType}>{items.eventTypeName}</Option>
                      }
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Input onChange={(e) => { this.handleInput(e, 'roadName', 'Parameters') }} placeholder="道路名称" />
              </div>
              <div className={styles.OperationItem}>
                <DatePicker
                  disabledDate={this.disabledStartDate}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={startValue}
                  placeholder="开始时间"
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
              </div>
              <div className={styles.OperationItem}>
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="结束时间"
                  onChange={this.onEndChange}
                  value={endValue}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              </div>
              <div className={styles.OperationItem}>
                <Button className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</Button>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >事件ID</div>
                <div className={styles.listTd} >事件类型</div>
                <div className={styles.listTd} >高速名称</div>
                <div className={styles.listTd} >路段名称</div>
                <div className={styles.listTd} >起点</div>
                <div className={styles.listTd} >终点</div>
                <div className={styles.listTd} >上报开始时间</div>
                <div className={styles.listTd} >持续时间</div>
                <div className={styles.listTd} >是否管控</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item) => {
                  return (
                    <div className={styles.listItems} key={item.eventNum}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.eventNum}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.eventTypeName}>{item.eventTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.roadName}>{item.hwayName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[0]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[1]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.startTime ? this.getDate(item.startTime) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.sustainTime ? this.formatDuring(item.sustainTime) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controllId ? '是' : '否'}</span></div>
                      <div className={styles.listTd} >
                        <Button className={styles.Button} onClick={() => { this.handlehistory(item.eventNum, true) }}>事件详情</Button>
                        <Button className={item.controlPlanExists ? styles.Button : styles.Buttondeb} disabled={!item.controlPlanExists} onClick={() => { this.handleUrlAjax(this.hisByUrl + item.eventNum, 'simpleHis') }}>管控记录</Button>
                      </div>
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
        </div >
        {
          reservePopup ?
            <div className={styles.MaskBox} style={{ zIndex: '9999' }}>
              <div className={styles.AddBox}>
                <div className={styles.Title}>{reservePopup.devices ? '管控详情' : '事件详情'}<Icon onClick={() => { this.handleClose('reservePopup', false) }} className={styles.Close} type="close" /></div>
                <div className={styles.Conten}>
                  <div className={styles.Header}>
                    <span>事件编号&nbsp;:&nbsp;&nbsp;{reservePopup.eventNum}</span>
                    <span>事件类型&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventTypeName}</span></span>
                  </div>
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>基本信息</div>
                    <div className={styles.RowBox}>
                      <p>高速编号&nbsp;:&nbsp;&nbsp;{reservePopup.hwayCode}</p>
                      <p>高速名称&nbsp;:&nbsp;&nbsp;{reservePopup.hwayName}</p>
                      <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopup.roadDirectionName}</p>
                    </div>
                    <div className={styles.RowBox}>
                      <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopup.pileNum && reservePopup.pileNum.split(' ')[0]}</span></p>
                      {
                        (reservePopup.planSource === 1 || reservePopup.planSource === 2) || <p key="situation">{this.state.unitText[reservePopup.eventType].tipsText}&nbsp;:&nbsp;&nbsp;<span>{reservePopup.showValue + this.state.unitText[reservePopup.eventType].unit}</span></p>
                      }
                      <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventLength}m</span></p>
                    </div>
                    <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{reservePopup.planSourceName}</span></div>
                  </div>

                  {
                    operationData ?
                      <div>
                        {/* <div className={styles.guanBox}>
                          <Button className={styles.Button}>管控效果评估</Button>
                        </div> */}
                        <div className={styles.guanBox}>
                          <span className={styles.guanTitle}>操作记录</span>
                        </div>
                        <div className={styles.listBox}>
                          <div className={styles.listBoxHead}>
                            <div className={styles.listItems}>
                              <div className={styles.listTd} >序号</div>
                              <div className={styles.listTd} >操作人员</div>
                              <div className={styles.listTd} >操作名称</div>
                              <div className={styles.listTd} >操作部门</div>
                              <div className={styles.listTd} >操作时间</div>
                            </div>
                          </div>
                          <div className={styles.listBoxBody}>
                            {
                              operationData && operationData.map((item, index) => {
                                return (
                                  <div className={styles.listItems} key={item.row_id}>
                                    <div className={styles.listTd} >{index + 1}</div>
                                    <div className={styles.listTd} >{item.operateUserName}</div>
                                    <div className={styles.listTd} >{item.operateName}</div>
                                    <div className={styles.listTd} >{item.operateUserDeptName}</div>
                                    <div className={styles.listTd} >{item.operateTime ? this.getDate(item.operateTime) : '-'}</div>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      </div> : null}
                  {reservePopup.devices ? null :
                    <div className={styles.guanBox} style={{ height: '310px' }}>
                      <GMap mapID="HistorcalMap" styles={{ width: '100%', height: '100%' }} />
                    </div>
                  }

                </div>
              </div>
            </div> : null
        }
        {
          simpleHis ?
            <div className={styles.MaskBox}>
              <div className={styles.AddBox}>
                <div className={styles.Title}> 管控记录列表<Icon onClick={() => { this.setState({ simpleHis: null }) }} className={styles.Close} type="close" /></div>
                <div className={styles.Conten}>
                  <div className={styles.listBox}>
                    <div className={styles.listBoxHead}>
                      <div className={styles.listItems}>
                        <div className={styles.listTd} >序号</div>
                        <div className={styles.listTd} >管控名称</div>
                        <div className={styles.listTd} >管控编号</div>
                        <div className={styles.listTd} >开始时间</div>
                        <div className={styles.listTd} >结束时间</div>
                        <div className={styles.listTd} >操作</div>
                      </div>
                    </div>
                    <div className={styles.listBoxBody}>
                      {
                        simpleHis && simpleHis.map((item, index) => {
                          return (
                            <div className={styles.listItems} key={item.planNum}>
                              <div className={styles.listTd} >{index + 1}</div>
                              <div className={styles.listTd} >{item.planName}</div>
                              <div className={styles.listTd} >{item.planNum}</div>
                              <div className={styles.listTd} >{item.startTime ? this.getDate(item.startTime) : '-'}</div>
                              <div className={styles.listTd} >{item.endTime ? this.getDate(item.endTime) : '-'}</div>
                              <div className={styles.listTd} >
                                <Button className={styles.Button} onClick={() => { this.handlehistory(item.planNum, false) }}>管控详情</Button>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div> : null}
      </div>
    )
  }
}

export default Historical
