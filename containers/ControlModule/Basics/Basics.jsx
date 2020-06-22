
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, Select, DatePicker, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option, OptGroup } = Select
/*        历史管控方案 */
class Basics extends React.Component {
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
    }
    this.Parameters = {
      pageNo: 1,
      eventType: 0,
      pageSize: 10,
      roadName: '',
      startTime: '',
      endTime: '',
    }
    this.typesTreeUrl = '/control/event/get/all/types/tree' // 获取所有的事件类型，分上下级，树形结构'
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.listByPageUrl = '/control/control/plan/list/his'
    this.historyUrl = '/control/event/get/history/' // {eventType}/{eventId} //  查询历史事件详情'
    this.getInfoUrl = '/control/control/plan/get/by/' // {eventType}/{eventId} 获取管控方案'
    this.operationUrl = '/control/control/plan/get/operate/by/' // {planNum}根据管控方案编号获取管控方案操作步骤
    this.textUrl = '/control/event/get/define/unit/text'
    this.controlUrl = '/control/control/plan/add/his/to/reserve/' // {eventType}/{eventId}
    this.hisByUrl = '/control/control/plan/list/simple/his/by/' // {eventNum}根据事件编号，获取历史管控方案集合（用于事件查看管控方案列表接口）'
  }
  componentDidMount = () => {
    // 列表查询
    this.handleListByPage()
    // 事件类型下拉查询
    // this.handlelistDetail('eventTypeData', 13)
    this.handleUrlAjax(this.textUrl, 'unitText')
    // 事件类型下拉查询
    this.handleUrlAjax(this.typesTreeUrl, 'eventTypeData')
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
  //  管控详情
  handlehistory = (data) => {
    getResponseDatas('get', this.getInfoUrl + data + '/1').then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ reservePopup: result.data })
      }
    })
    this.handleoperation(data)
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
  // 添加至预案库
  handlecontrol = (data) => {
    const { eventId, eventType } = data
    getResponseDatas('post', this.controlUrl + data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.handleListByPage()
        message.success(result.message)
      } else {
        message.error(result.message)
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
  handleanalysisEchart = () => {
    // const analysisEchart = JSON.parse(localStorage.getItem('analysisEchart'))
    window.open('#/analysisEchart')
  }
  render() {
    const { simpleHis, eventTypeData, operationData, reservePopup, listByPage, current, endOpen, endValue, startValue } = this.state
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
                  className={styles.OptGroup}
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
                <div className={styles.listTd} >预案名称</div>
                <div className={styles.listTd} >方案ID</div>
                <div className={styles.listTd} >事件类型</div>
                <div className={styles.listTd} >管控类型</div>
                <div className={styles.listTd} >高速名称</div>
                <div className={styles.listTd} >管控路段名称</div>
                <div className={styles.listTd} >起点</div>
                <div className={styles.listTd} >终点</div>
                <div className={styles.listTd} >管控开始时间</div>
                <div className={styles.listTd} >持续时间</div>
                <div className={styles.listTd} style={{ flex: 1.8 }}>操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item) => {
                  return (
                    <div className={styles.listItems} key={item.planNum}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.planName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.planNum}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.eventTypeName}>{item.eventTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.controlTypeName}>{item.controlTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.roadName}>{item.hwaName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.secName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[0]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[1]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.startTime ? this.getDate(item.startTime) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controllLongTime ? this.formatDuring(item.controllLongTime) : '-'}</span></div>
                      <div className={styles.listTd} style={{ flex: 1.8 }}>
                        <Button className={styles.Button} onClick={() => { this.handlehistory(item.planNum, false) }}>管控详情</Button>
                        <Button className={item.canAdd ? styles.Button : styles.Buttondeb} disabled={!item.canAdd} onClick={() => { this.handlecontrol(item.planNum) }}>添加至预案库</Button>
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
        </div>
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
                </div>
              </div>
            </div> : null
        }
      </div >
    )
  }
}

export default Basics
