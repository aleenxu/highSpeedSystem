
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import SystemCharts from '../../../components/SystemCharts/SystemCharts'
import { Select, DatePicker, Button } from 'antd'
import moment from 'moment'
const { Option } = Select
const { RangePicker } = DatePicker
/*        事件统计            */
class Traffic extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartsData: null,
      RoadMessage: null,
      eventValue: 1, // 事件类型
      Jurisdiction: null, // 辖区
      RoadData: null, // 道路下拉数据
      RoadValue: null, // 道路
      RoadsectionData: null, // 路段下拉数据
      Roadsection: null, // 路段
    }
    this.Parameters = {
      endTime: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      startTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    }
    this.start = true
    this.getRoadByUrl = '/control/customize/road/get/road/by/' // {hwayId}/{directionId} // 根据高速id和上下行方向查询出当前登录用户所能看到的系统自定义路段'
    this.eventStatisticsUrl = '/control/statistics/event/' // 事件统计
    this.MessageUrl = '/control/static/hway/list/direction' // 获取高速信息'
  }
  componentDidMount = () => {
    // 获取高速信息
    this.getRoadMessage()
    console.log(moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'))
    console.log(moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'))
  }
  onSecondChange = (value, name) => {
    this.setState({
      [name]: value,
    })
  }
  getJurisdiction = (value) => {
    const { RoadMessage = [] } = this.state
    if (value === '') {
      this.setState({
        Jurisdiction: value,
        RoadData: [],
        RoadValue: value,
        RoadsectionData: [],
        Roadsection: value,
      })
      return
    }
    RoadMessage.forEach((item) => {
      if (item.hwayId === value) {
        this.setState({
          Jurisdiction: value,
          RoadData: item.direction,
          RoadValue: item.direction[0].directionId,
        })
        this.handlegetRoadBy({ hwayId: item.hwayId, directionId: item.direction[0] ? item.direction[0].directionId : '' })
      }
    })
  }

  getRoadData = (value) => {
    const { RoadData, Jurisdiction } = this.state
    if (value === '') {
      this.setState({
        RoadValue: value,
        RoadsectionData: [],
        Roadsection: value,
      })
      return
    }
    RoadData.forEach((item) => {
      if (item.directionId === value) {
        this.setState({
          RoadValue: value,
        })
        this.handlegetRoadBy({ hwayId: Jurisdiction, directionId: value })
      }
    })
  }
  geteventStatistics = () => {
    const { Roadsection, eventValue } = this.state
    getResponseDatas('get', `${this.eventStatisticsUrl + eventValue}/${Roadsection || 0}`, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        console.log(result.data)
        const dataX = []
        const dataY = []
        result.data.forEach((item) => {
          dataX.push(item.x)
          dataY.push(item.y)
        })
        this.setState({
          chartsData: { dataX, dataY }
        })
      }
    })
  }
  getRoadMessage = () => {
    getResponseDatas('get', this.MessageUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (result.data.length) {
          this.setState({
            RoadMessage: result.data,
            Jurisdiction: result.data[0].hwayId,
          }, () => {
            this.getJurisdiction(result.data[0].hwayId, 'DidMount')
          })
        }
      }
    })
  }
  // 通用模板式接口请求
  handleUrlAjax = (url, name, callback) => {
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
  handlegetRoadBy = (item) => {
    this.handleUrlAjax(`${this.getRoadByUrl + item.hwayId}/${item.directionId}`, 'RoadsectionData', (data) => {
      if (data.length) {
        this.setState({
          Roadsection: data[0].roadId,
        }, () => {
          if (this.start) {
            this.geteventStatistics()
            this.start = false
          }
        })
      }
    })
  }
  handleDatastring = (value, dateString) => {
    this.Parameters.startTime = dateString[0]
    this.Parameters.endTime = dateString[1]
  }

  handleDataonOk = (value) => {
    // console.log('onOk: ', value)
  }
  render() {
    const {
      chartsData, RoadMessage, Jurisdiction, RoadData, RoadValue, Roadsection, RoadsectionData, eventValue,
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
                  value={eventValue}
                  onChange={(e) => { this.onSecondChange(e, 'eventValue') }}
                >
                  <Option value={1}>事件类型</Option>
                  <Option value={2}>管控状态</Option>
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  style={{ width: '100%' }} // 高速
                  onChange={this.getJurisdiction}
                  value={Jurisdiction}
                >
                  <Option value="">全部</Option>
                  {
                    RoadMessage && RoadMessage.map((item) => {
                      return <Option key={item.hwayId} value={item.hwayId}>{item.hwayName}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  onChange={this.getRoadData}
                  style={{ width: '100%' }}
                  value={RoadValue}
                  disabled={!Jurisdiction} // 方向
                >
                  <Option value="">全部</Option>
                  {
                    RoadData && RoadData.map((item) => {
                      return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  style={{ width: '100%' }}
                  value={Roadsection}
                  disabled={!RoadValue}
                  onChange={(e) => { this.onSecondChange(e, 'Roadsection') }}
                >
                  <Option value="">全部</Option>
                  {
                    RoadsectionData && RoadsectionData.map((item) => {
                      return <Option key={item.roadId} value={item.roadId}>{item.roadName}</Option>
                    })
                  }

                </Select>
              </div>
              <div className={styles.OperationItem}>
                <RangePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={this.handleDatastring}
                  defaultValue={[moment().startOf('day'), moment().endOf('day')]}
                  onOk={this.handleDataonOk}
                />
              </div>
              <div className={styles.OperationItem} style={{ minWidth: 'auto' }}>
                <Button className={styles.Button} onClick={this.geteventStatistics}>搜&nbsp;&nbsp;索</Button>
              </div>
            </div>
            {chartsData &&
              <div className={styles.ContetList} style={{ height: 'calc(100% - 100px)' }}>
                <div className={styles.SystemCharts}>
                  <div className={styles.chartsBox}>
                    <SystemCharts height="100%" chartsItems={chartsData} />
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    )
  }
}

export default Traffic
