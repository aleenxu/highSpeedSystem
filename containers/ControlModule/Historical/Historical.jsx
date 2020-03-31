
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input, Select, DatePicker, Button, Icon, message } from 'antd'
import moment from 'moment'
const { Option } = Select
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
    this.listByPageUrl = '/control/event/list/history'
    this.historyUrl = '/control/event/get/history/' // {eventTypeId}/{eventId} //  查询历史事件详情'
    this.getInfoUrl = '/control/plan/get/info/' // {eventType}/{eventId} 获取管控方案'
    this.operationUrl = '/control/plan/list/operation/' // {eventTypeId}/{eventId} 查询方案操作记录集合'
  }
  componentDidMount = () => {
    // 获取用户权限
    const limitArr = JSON.parse(localStorage.getItem('userLimit'))||[]
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
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
  formatDuring = (mss) => {
    if (mss <= 0) {
      return '已超时'
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
  //  事件详情
  handlehistory = (data, type) => {
    const { eventId, eventTypeId, controllId } = data
    if ((!controllId) && type) {
      message.warning('当前未管控')
      return
    }
    const url = type ? this.getInfoUrl : this.historyUrl
    getResponseDatas('get', url + eventTypeId + '/' + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ reservePopup: result.data })
      }
    })
    if (controllId && type) {
      this.handleoperation(eventId, eventTypeId)
    }
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
    console.log(pageNumber);
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
    const { eventTypeData, userLimit, operationData, reservePopup, listByPage, current, endOpen, endValue, startValue } = this.state
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
                <div className={styles.listTd} >事件ID</div>
                <div className={styles.listTd} >事件类型</div>
                <div className={styles.listTd} >道路名称</div>
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
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.eventTypeId}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.eventTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.secName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[0]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum && item.pileNum.split(' ')[1]}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.startTime ? this.getDate(item.startTime) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.startTime && item.updateTime ? this.formatDuring(new Date(item.updateTime).getTime() - new Date(item.startTime).getTime()) : '-'}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controllId ? '是' : '否'}</span></div>
                      <div className={styles.listTd} >
                        <Button className={styles.Button} onClick={() => { this.handlehistory(item, false) }}>事件详情</Button>
                        <Button className={styles.Button} onClick={() => { this.handlehistory(item, true) }}>管控详情</Button>
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
              <div className={styles.Title}>{reservePopup.devices ? '管控详情' : '事件详情'}<Icon onClick={() => { this.handleClose('reservePopup', false) }} className={styles.Close} type="close" /></div>
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

                {operationData
                  ? <div>
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
                                <div className={styles.listTd} >{index}</div>
                                <div className={styles.listTd} >{item.operationUser}</div>
                                <div className={styles.listTd} >{item.operationName}</div>
                                <div className={styles.listTd} >{item.operationTime}</div>
                                <div className={styles.listTd} >{item.surplusTime}</div>
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

export default Historical
