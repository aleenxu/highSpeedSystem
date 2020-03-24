
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
/*        管控统计             */
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
      RoadSection: '',
      endTime: this.getDate('endTime'),
      startTime: this.getDate('startTime'),
      eventType: '',
      region: '',
      road: '',
    }
    this.StatisticsUrl = '/control/statis/controllerStatistics' // 管控统计
    this.MessageUrl = '/control/statis/getRoadMessage' // 获取高速信息'
  }
  componentDidMount = () => {
    // 获取高速信息
    this.getRoadMessage()
  }
  onSecondChange = (value, name) => {
    this.setState({
      [name]: value,
    })
  }
  getJurisdiction = (value, type) => {
    const { RoadMessage = [] } = this.state
    RoadMessage.forEach((item) => {
      if (item.key === value) {
        this.setState({
          Jurisdiction: value,
          RoadData: item.value,
          RoadValue: item.value[0].key,
          RoadsectionData: item.value[0].value,
          Roadsection: item.value[0].value[0].road_sec_id,
        }, () => {
          // 初始化查询
          if (type === 'DidMount') {
            this.geteventStatistics()
          }
        })
      }
    })
  }
  getRoadData = (value) => {
    const { RoadData } = this.state
    RoadData.forEach((item) => {
      if (item.key === value) {
        this.setState({
          RoadValue: value,
          RoadsectionData: item.value,
          Roadsection: item.value[0].road_sec_id,
        })
      }
    })
  }
  geteventStatistics = () => {
    const { Roadsection, RoadValue, Jurisdiction, eventValue } = this.state
    const data = {
      ...this.Parameters,
      RoadSection: Roadsection,
      eventType: eventValue,
      region: Jurisdiction,
      road: RoadValue,
    }
    getResponseDatas('get', this.StatisticsUrl, data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        console.log(result.data)
        const dataX = []
        const dataY = []
        result.data.forEach((item) => {
          dataX.push(Object.keys(item)[0])
          dataY.push(Object.values(item)[0])
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
        console.log(result.data)
        this.setState({
          RoadMessage: result.data,
          Jurisdiction: result.data[0].key,
        }, () => {
          this.getJurisdiction(result.data[0].key, 'DidMount')
        })
      }
    })
  }
  getDate = (name) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    if (name === 'startTime') {
      return navtime + '00:00:00'
    } else {
      return navtime + navmse
    }
  }
  handleDatastring = (value, dateString) => {
    console.log('Selected Time: ', value)
    console.log('Formatted Selected Time: ', dateString);
    this.Parameters.startTime = dateString[0]
    this.Parameters.endTime = dateString[1]
  }

  handleDataonOk = (value) => {
    console.log('onOk: ', value)
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
                  <Option value={1}>管控类型</Option>
                  <Option value={2}>完成状态</Option>
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  style={{ width: '100%' }} // 辖区
                  onChange={this.getJurisdiction}
                  value={Jurisdiction}
                >
                  {
                    RoadMessage && RoadMessage.map((item) => {
                      return <Option key={item.key} value={item.key}>{item.key}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  onChange={this.getRoadData}
                  style={{ width: '100%' }}
                  value={RoadValue}
                >
                  {
                    RoadData && RoadData.map((item) => {
                      return <Option value={item.key} key={item.key}>{item.key}</Option>
                    })
                  }
                </Select>
              </div>
              <div className={styles.OperationItem}>
                <Select
                  style={{ width: '100%' }}
                  value={Roadsection}
                  onChange={(e) => { this.onSecondChange(e, 'Roadsection') }}
                >
                  {
                    RoadsectionData && RoadsectionData.map((item) => {
                      return <Option value={item.road_sec_id} key={item.road_sec_id}>{item.sec_name}</Option>
                    })
                  }

                </Select>
              </div>
              <div className={styles.OperationItem}>
                <RangePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  onChange={this.handleDatastring}
                  onCalendarChange={this.aaa}
                  defaultValue={[moment(this.getDate('startTime'), 'YYYY-MM-DD HH:mm:ss'), moment(this.getDate('endTime'), 'YYYY-MM-DD HH:mm:ss')]}
                  onOk={this.handleDataonOk}
                />
              </div>
              <div className={styles.OperationItem}>
                <Button className={styles.Button} onClick={this.geteventStatistics}>搜&nbsp;&nbsp;索</Button>
              </div>
            </div>
            {chartsData &&
              <div className={styles.ContetList}>
                <SystemCharts height="95%" chartsItems={chartsData} />
              </div>}
          </div>
        </div>
      </div>
    )
  }
}

export default Traffic
