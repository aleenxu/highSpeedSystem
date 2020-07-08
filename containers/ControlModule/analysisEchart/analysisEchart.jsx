import React from 'react'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import style from '../../StatisticsModule/Analysis/Analysis.scss'
import classNames from 'classnames'
import AnalysisCharts from '../../../components/SystemCharts/AnalysisCharts'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { DatePicker, Button, TimePicker } from 'antd'
import moment from 'moment'
/*        路况分析 */
class analysisEchart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: null,
      startValue: moment(),
      endValue: moment().add(-1, 'day'),
      endOpen: false,
      startTimeValue: '00:00:00',
      endTimeValue: '23:59:59',
      chartsItems: { dataX: [], dataYOne: [], dataYTwo: [] },
    }
    this.getDataUrl = '/control/statistics/get/data/'
    this.Parameters = {
      contrastEndTime: '',
      contrastStartTime: '',
      endTime: '',
      startTime: '',
      startPileNum: '',
      endPileNum: '',
    }
  }
  componentDidMount = () => {
    this.handleanalyData()
  }
  onEndChange = (value) => {
    this.onChange('endValue', value)
  }
  onStartChange = (value) => {
    this.onChange('startValue', value)
  }
  onChange = (field, value) => {
    this.setState({
      [field]: value,
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
  handleanalyData = () => {
    const analyData = JSON.parse(localStorage.getItem('analysisEchart'))
    console.log(analyData)
    console.log(this.props)
    if (!analyData) {
      this.props.history.push('/login')
    } else {
      this.Parameters.startPileNum = analyData.pileNum && analyData.pileNum.split(' ')[0]
      this.Parameters.endPileNum = analyData.pileNum && analyData.pileNum.split(' ')[1]
      this.setState({
        startValue: moment(analyData.startTime),
        endValue: moment(analyData.startTime).add(-1, 'day'),
        startTimeValue: moment(analyData.startValue).format('HH:mm:ss'),
        endTimeValue: moment(analyData.endTime).format('HH:mm:ss'),
      })
    }
    this.setState({ analyData }, () => {
      this.handleStatistics()
    })
  }
  handleStatistics = () => {
    const { startValue, endValue, analyData, startTimeValue, endTimeValue } = this.state
    const { hwayId, directionId, roadId } = analyData
    this.Parameters.startTime = `${moment(startValue).format('YYYY-MM-DD')} ${startTimeValue}`
    this.Parameters.endTime = `${moment(startValue).format('YYYY-MM-DD')} ${endTimeValue}`
    this.Parameters.contrastStartTime = `${moment(endValue).format('YYYY-MM-DD')} ${startTimeValue}`
    this.Parameters.contrastEndTime = `${moment(endValue).format('YYYY-MM-DD')} ${endTimeValue}`
    console.log(this.Parameters)
    getResponseDatas('get', `${this.getDataUrl + hwayId}/${directionId}/${roadId || 0}`, this.Parameters).then((res) => {
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
      startTimeValue,
      endTimeValue,
      startValue,
      endValue,
      endOpen,
      listByPage,
      analyData,
      chartsItems,
    } = this.state
    return (
      <div>
        <div className={styles.EqMain} style={{ height: '100vh' }}>
          <div className={styles.EqCentent} style={{ width: 'calc(100% - 40px )', right: '20px' }}>
            <div className={styles.Operation}>
              {analyData ?
                <div className={style.analysis}>
                  {analyData.hwayName}&nbsp;&nbsp;&nbsp;&nbsp;{analyData.roadDirectionName}&nbsp;&nbsp;&nbsp;&nbsp;长度{analyData.eventLength}米
                </div>
                : null}
            </div>
            <div className={styles.ContetList} style={{ paddingLeft: '20px', height: 'calc(100% - 100px)' }}>
              <div className={styles.Operation}>
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
                </div>
                <div className={style.Listlable}>
                  开始时间&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm:ss"
                    placeholder="开始时间"
                    value={moment(startTimeValue, 'HH:mm:ss')}
                    onChange={(e, value) => { this.setState({ startTimeValue: value }) }}
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
                    value={moment(endTimeValue, 'HH:mm:ss')}
                    onChange={(e, value) => { this.setState({ endTimeValue: value }) }}
                  />
                </div>
                <div className={styles.OperationItem} style={{ minWidth: 'auto' }}>
                  <Button className={styles.Button} onClick={this.handleStatistics}>查&nbsp;&nbsp;询</Button>
                  {/* <Button className={styles.Button}>下&nbsp;&nbsp;载</Button> */}
                </div>
              </div>
              <div className={style.listLift} style={{ height: 'calc(100% - 78px)' }} >
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
              <div className={style.listRight} style={{ height: 'calc(100% - 60px)' }}>
                <div className={style.ChartsBox}>
                  <AnalysisCharts chartsItems={chartsItems} height="100%" />
                </div>
              </div>
            </div>
            <div style={{ height: '40px', background: '#0a1a29' }} />
          </div>

        </div>
      </div>
    )
  }
}

export default analysisEchart
