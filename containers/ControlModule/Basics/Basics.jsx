
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, Select, DatePicker, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option } = Select
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
      eventTypeId: 0,
      pageSize: 10,
      roadSecId: '',
      startTime: '',
      endTime: '',
    }
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.listByPageUrl = '/control/plan/list/history'
    this.historyUrl = '/control/event/get/history/' // {eventTypeId}/{eventId} //  查询历史事件详情'
    this.getInfoUrl = '/control/plan/get/info/' // {eventType}/{eventId} 获取管控方案'
    this.operationUrl = '/control/plan/list/operation/' // {eventTypeId}/{eventId} 查询方案操作记录集合'
    this.controlUrl = '/control/plan/generate/reserve/by/control/' // {eventTypeId}/{eventId}
  }
  componentDidMount = () => {
    // 事件类型下拉查询
    this.handlelistDetail('eventTypeData', 13)
    // 列表查询
    this.handleListByPage()
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
    const { eventId, eventTypeId } = data
    getResponseDatas('get', this.getInfoUrl + eventTypeId + '/' + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ reservePopup: result.data })
      }
    })
    this.handleoperation(eventId, eventTypeId)
  }
  // 查询操作记录
  handleoperation = (eventId, eventTypeId) => {
    getResponseDatas('get', this.operationUrl + eventTypeId + '/' + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ operationData: result.data })
      }
    })
  }
  // 添加至预案库
  handlecontrol = (data) => {
    const { eventId, eventTypeId } = data
    getResponseDatas('put', this.controlUrl + eventTypeId + '/' + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
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
  render() {
    const { eventTypeData, operationData, reservePopup, listByPage, current, endOpen, endValue, startValue } = this.state
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
                  onChange={(e) => { this.handleSelect(e, 'eventTypeId', 'Parameters') }}
                >
                  <Option value={0}>请选择</Option>
                  {
                    eventTypeData && eventTypeData.map((item) => {
                      return <Option value={item.id}>{item.name}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Input onChange={(e) => { this.handleInput(e, 'roadSecId', 'Parameters') }} placeholder="道路编号" />
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
                <div className={styles.listTd} >方案ID</div>
                <div className={styles.listTd} >事件类型</div>
                <div className={styles.listTd} >管控类型</div>
                <div className={styles.listTd} >道路名称</div>
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
                    <div className={styles.listItems} key={item.eventTypeName + item.eventId}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.eventId}P</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.eventTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controlTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.secName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[0]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[1]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.publishTime ? this.getDate(item.publishTime) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.publishTime && item.endTime ? this.formatDuring(new Date(item.endTime).getTime() - new Date(item.publishTime).getTime()) : '-'}</span></div>
                      <div className={styles.listTd} style={{ flex: 1.8 }}>
                        <Button className={styles.Button} onClick={() => { this.handlehistory(item) }}>管控详情</Button>
                        <Button className={item.publishTime ? styles.Button : styles.Buttondeb} disabled={!item.publishTime} onClick={() => { this.handlecontrol(item) }}>添加至预案库</Button>
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
        {reservePopup ?
          <div className={styles.MaskBox}>
            <div className={styles.AddBox}>
              <div className={styles.Title}>管控详情<Icon onClick={() => { this.handleClose('reservePopup', false) }} className={styles.Close} type="close" /></div>
              <div className={styles.Conten}>
                <div className={styles.Header}>
                  <span>方案编号&nbsp;:&nbsp;&nbsp;{reservePopup.eventId}P</span>
                  <span>事件类型&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventTypeName}</span></span>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>基本信息</div>
                  <div className={styles.RowBox}>
                    <p>道路编号&nbsp;:&nbsp;&nbsp;{reservePopup.roadName && reservePopup.roadName.split(' ')[0]}</p>
                    <p>道路名称&nbsp;:&nbsp;&nbsp;{reservePopup.roadName && reservePopup.roadName.split(' ')[1]}</p>
                    <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopup.directionName}</p>
                  </div>
                  <div className={styles.RowBox}>
                    <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopup.pileNum && reservePopup.pileNum.split(' ')[0]}</span></p>
                    {
                      reservePopup.eventTypeId === 1 ? [<p>平均车速&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#c67f03' }}>{reservePopup.situation}km/h</sapn> </p>,
                      <p>拥堵路段长度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#f31113' }}>{reservePopup.eventLength}m</sapn></p>] :
                        [<p>能见度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#c67f03' }}>{reservePopup.situation}km/h</sapn> </p>,
                        <p>影响道路长度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#f31113' }}>{reservePopup.eventLength}m</sapn></p>]
                    }
                  </div>
                  <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#03af01' }}>{reservePopup.dataSourceName}</sapn></div>
                </div>

                {operationData ?
                  <div>
                    <div className={styles.guanBox}>
                      <Button className={styles.Button}>管控方案评估</Button>
                    </div>
                    <div className={styles.guanBox}>
                      <span className={styles.guanTitle}>操作记录</span>
                    </div>
                    <div className={styles.listBox}>
                      <div className={styles.listBoxHead}>
                        <div className={styles.listItems}>
                          <div className={styles.listTd} >序号</div>
                          <div className={styles.listTd} >操作人</div>
                          <div className={styles.listTd} >操作</div>
                          <div className={styles.listTd} >剩余管控时常</div>
                          <div className={styles.listTd} >操作时间</div>
                        </div>
                      </div>
                      <div className={styles.listBoxBody}>
                        {
                          operationData && operationData.map((item, index) => {
                            return (
                              <div className={styles.listItems}>
                                <div className={styles.listTd} >{index + 1}</div>
                                <div className={styles.listTd} >{item.operationUser}</div>
                                <div className={styles.listTd} >{item.operationName}</div>
                                <div className={styles.listTd} >{item.operationTime && item.endTime ? this.formatDuring(new Date(item.endTime).getTime() - new Date(item.operationTime).getTime()) : '-'}</div>
                                <div className={styles.listTd} >{item.operationTime}</div>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div> : null}

              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default Basics
