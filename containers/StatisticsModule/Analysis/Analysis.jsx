
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import style from './Analysis.scss'
import classNames from 'classnames'
import AnalysisCharts from '../../../components/SystemCharts/AnalysisCharts'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Select, DatePicker, Button, TimePicker, Input, message } from 'antd'
import moment from 'moment'

const { Option } = Select
/*        路况分析 */
class Analysis extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      startValue: moment(),
      endValue: moment().add(-1, 'day'),
      endOpen: false,
      listByPage: null,
      hwayList: null,
      hwayId: null,
      directionId: null,
      directionList: null,
      officialNum: 1,
      roadList: null,
      roadId: null,
      chartsItems: { dataX: [], dataYOne: [], dataYTwo: [] },
    }
    this.getRoadByUrl = '/control/customize/road/get/road/by/' // {hwayId}/{directionId} // 根据高速id和上下行方向查询出当前登录用户所能看到的系统自定义路段'
    this.getDataUrl = '/control/statistics/get/data/'
    this.hwayUrl = '/control/static/hway/list/direction' //  获取高速编号，用于下拉框'
    this.Parameters = {
      contrastEndTime: '',
      contrastStartTime: '',
      endTime: '',
      startTime: '',
      startPileNum: '',
      endPileNum: '',
    }
    this.endTime = '23:59:59'
    this.startTime = '00:00:00'
  }
  componentDidMount = () => {
    this.start = true
    // 高速下拉
    this.handleUrlAjax(this.hwayUrl, 'hwayList', (data) => {
      if (data.length) {
        const item = data[0]
        this.handleRefresh(item)
      }
    })
  }
  onChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }

  onStartChange = (value) => {
    this.onChange('startValue', value)
  }

  onEndChange = (value) => {
    this.onChange('endValue', value)
  }
  disabledEndDate = (endValue) => {
    const { startValue } = this.state
    if (!endValue || !startValue) {
      return false
    }
    return endValue.valueOf() <= startValue.valueOf()
  }
  disabledStartDate = (startValue) => {
    const { endValue } = this.state
    if (!startValue || !endValue) {
      return false
    }
    return startValue.valueOf() > endValue.valueOf()
  }
  // 通用模板式接口请求
  handleUrlAjax = (url, name, callback) => {
    console.log(url);
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data }, () => {
          if (callback) {
            callback(result.data)
          }
        })
      }
    })
  }
  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open })
  }
  handleInput = (e, name, type) => {
    this[type][name] = e.target.value
  }
  handleSelect = (value, name, type) => {
    if (type) {
      this[type][name] = value
    } else {
      if (name === 'hwayId') {
        const { hwayList } = this.state
        hwayList.forEach((item) => {
          if (item.hwayId === value) {
            this.handleRefresh(item)
          }
        })
      } else if (name === 'directionId') {
        const { hwayId } = this.state
        this.setState({ directionId: value })
        this.handlegetRoadBy({ hwayId, directionId: value })
      } else {
        this.setState({ [name]: value })
      }
    }
  }
  handleRefresh = (item) => {
    this.setState({
      hwayId: item.hwayId,
      directionList: item.direction,
      directionId: item.direction[0] ? item.direction[0].directionId : '',
    })
    this.handlegetRoadBy({ hwayId: item.hwayId, directionId: item.direction[0] ? item.direction[0].directionId : '' })
  }
  handlegetRoadBy = (item) => {
    this.handleUrlAjax(`${this.getRoadByUrl + item.hwayId}/${item.directionId}`, 'roadList', (data) => {
      if (data.length) {
        this.setState({
          roadId: data[0].roadId,
        }, () => {
          if (this.start) {
            this.handleStatistics()
            this.start = false
          }
        })
      }
    })
  }
  handleStatistics = () => {
    const { officialNum, roadId, hwayId, directionId, startValue, endValue } = this.state
    if (officialNum) {
      if (!roadId) {
        message.warning('请选择路段')
        return
      }
    } else {
      if (!this.Parameters.startPileNum) {
        message.info('请输入起始桩号！')
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.Parameters.startPileNum))) {
        message.info('请输入正确起始桩号！')
        return
      }
      if (!this.Parameters.endPileNum) {
        message.info('请输入结束桩号！')
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.Parameters.endPileNum))) {
        message.info('请输入正确结束桩号！')
        return
      }
    }
    this.Parameters.startTime = `${moment(startValue).format('YYYY-MM-DD')} ${this.startTime}`
    this.Parameters.endTime = `${moment(startValue).format('YYYY-MM-DD')} ${this.endTime}`
    this.Parameters.contrastStartTime = `${moment(endValue).format('YYYY-MM-DD')} ${this.startTime}`
    this.Parameters.contrastEndTime = `${moment(endValue).format('YYYY-MM-DD')} ${this.endTime}`
    console.log(this.Parameters)
    getResponseDatas('get', `${this.getDataUrl + hwayId}/${directionId}/${officialNum ? roadId : 0}`, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        console.log(result.data)
        const dataX = []
        let dataYOne = []
        let dataYTwo = []
        const dataList = []
        const data = result.data.one.length > result.data.two.length ? result.data.one : result.data.two
        data.forEach((item, index) => {
          dataX.push(moment(item.time).format('HH:mm'))
          dataList.push({
            Ntime: result.data.one[index] ? result.data.one[index].time : 0,
            Otime: result.data.two[index] ? result.data.two[index].time : 0,
            Nspeed: result.data.one[index] ? result.data.one[index].speed : 0,
            Ospeed: result.data.two[index] ? result.data.two[index].speed : 0,
          })
        })
        console.log(dataList, moment(0).format('HH:mm'));

        result.data.one.forEach((item) => {
          dataYOne.push(item.speed)
        })
        result.data.two.forEach((item) => {
          dataYTwo.push(item.speed)
        })
        if (dataYOne.length === 0) {
          dataYOne = new Array(data.length).fill(0)
        }
        if (dataYTwo.length === 0) {
          dataYTwo = new Array(data.length).fill(0)
        }
        this.setState({ listByPage: dataList, chartsItems: { dataX, dataYOne, dataYTwo } })
      }
    })
  }
  render() {
    const {
      endValue,
      startValue,
      listByPage,
      hwayList,
      hwayId,
      directionList,
      directionId,
      endOpen,
      officialNum,
      roadList,
      roadId,
      chartsItems,
    } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div>
                <div className={style.Listlable} >
                  高速公路&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择高速"
                    value={hwayId}
                    onChange={(e) => { this.handleSelect(e, 'hwayId') }}
                  >
                    <Option value="">请选择</Option>
                    {
                      hwayList && hwayList.map((item) => {
                        return <Option key={item.hwayId} value={item.hwayId}>{item.hwayName}</Option>
                      })
                    }
                  </Select>
                </div>
                <div className={style.Listlable}>
                  道路方向&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择方向"
                    value={directionId}
                    onChange={(e) => { this.handleSelect(e, 'directionId') }}
                  >
                    <Option value="">请选择</Option>
                    {
                      directionList && directionList.map((item) => {
                        return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                      })
                    }
                  </Select>
                </div>
                <div className={style.Listlable}>
                  是否选择系统路段&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="是否选择系统路段"
                    value={officialNum}
                    onChange={(e) => { this.setState({ officialNum: e }) }}
                  >
                    <Option key={1} value={1}>是</Option>
                    <Option key={0} value={0}>否</Option>
                  </Select>
                </div>
                {
                  officialNum ?
                    [
                      <div className={style.Listlable} key="lable2">
                        路段&nbsp;&nbsp;:&nbsp;&nbsp;
                      </div>,
                      <div className={styles.OperationItem} key="lable3">
                        <Select
                          style={{ width: '100%' }}
                          placeholder="路段"
                          onChange={(e) => { this.setState({ roadId: e }) }}
                          value={roadId}
                        >
                          <Option value="">请选择路段</Option>
                          {
                            roadList && roadList.map((item) => {
                              return <Option key={item.roadId} value={item.roadId}>{item.roadName}</Option>
                            })
                          }
                        </Select>
                      </div>,
                    ] :
                    [
                      <div className={style.Listlable} key="lable4">
                        起始桩号&nbsp;&nbsp;:&nbsp;&nbsp;
                      </div>,
                      <div className={styles.OperationItem} key="lable5">
                        <Input onChange={(e) => { this.handleInput(e, 'startPileNum', 'Parameters') }} style={{ width: '100%' }} placeholder="起始桩号" />
                      </div>,
                      <div className={styles.OperationItem} key="lable6">
                        <Input onChange={(e) => { this.handleInput(e, 'endPileNum', 'Parameters') }} style={{ width: '100%' }} placeholder="结束桩号" />
                      </div>,
                    ]
                }
              </div>
              <div>
                <div className={style.Listlable}>
                  当前日期&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="当前日期"
                    value={startValue}
                    onChange={this.onStartChange}
                  />
                  {/* disabledDate={this.disabledStartDate}
                    onOpenChange={this.handleStartOpenChange} */}
                </div>
                <div className={style.Listlable}>
                  对比日期&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="对比日期"
                    value={endValue}
                    onChange={this.onEndChange}
                  />
                  {/* open={endOpen}
                   disabledDate={this.disabledEndDate}
                    onOpenChange={this.handleEndOpenChange} */}
                </div>
                <div className={style.Listlable}>
                  开始时间&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm:ss"
                    placeholder="开始时间"
                    defaultValue={moment('00:00:00', 'HH:mm:ss')}
                    onChange={(e, value) => { this.startTime = value }}
                  />
                </div>
                <div className={style.Listlable}>
                  结束时间&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm:ss"
                    placeholder="结束时间"
                    defaultValue={moment('23:59:59', 'HH:mm:ss')}
                    onChange={(e, value) => { this.endTime = value }}
                  />
                </div>
                <div className={styles.OperationItem} style={{ minWidth: 'auto' }}>
                  <Button className={styles.Button} onClick={this.handleStatistics}>查&nbsp;&nbsp;询</Button>
                  {/* <Button className={styles.Button}>下&nbsp;&nbsp;载</Button> */}
                </div>
              </div>
            </div>
            <div className={styles.ContetList} style={{ paddingLeft: '20px', height: 'calc(100% - 160px)', position: 'relative' }}>
              <div className={style.listLift}>
                <div className={style.listCont}>
                  <div className={style.listButtons}>
                    <span className={style.listButton}>当前</span>
                    <span className={style.listButton}>对比</span>
                    <span className={style.listButton}>涨跌</span>
                  </div>
                  <div className={classNames(style.listItems, style.firstlistItems)}>
                    <div className={style.listTd} >日期</div>
                    <div className={style.listTd} >速度</div>
                    <div className={style.listTd} >日期</div>
                    <div className={style.listTd} >速度</div>
                    <div className={style.listTd} >%</div>
                  </div>
                  <div className={style.listItemsBox}>
                    {
                      !!listByPage && listByPage.map((item) => {
                        return (
                          <div className={style.listItems} key={(item.Ntime ? moment(item.Ntime).format('DD HH:mm') : '--') + (item.Otime ? moment(item.Otime).format('DD HH:mm') : '--')}>
                            <div className={style.listTd} ><span className={style.roadName}>{item.Ntime ? moment(item.Ntime).format('DD HH:mm') : '--'}</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>{item.Nspeed}</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>{item.Otime ? moment(item.Otime).format('DD HH:mm') : '--'}</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>{item.Ospeed}</span></div>
                            <div className={style.listTd} ><span className={style.roadName} style={{ color: item.Nspeed - item.Ospeed > 0 ? '#22bb09' : '#fe0000' }}>{item.Ospeed ? ((item.Nspeed - item.Ospeed) / item.Ospeed * 100).toFixed(2) : 100}</span></div>
                          </div>
                        )
                      })
                    }
                    {
                      !!listByPage && listByPage.length === 0 ? <div className={style.center}>当前查询无数据</div> : null
                    }
                  </div>
                </div>

              </div>
              <div className={style.listRight}>
                <div className={style.ChartsBox}>
                  <AnalysisCharts chartsItems={chartsItems} height="100%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Analysis
