import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'
import { Input } from 'antd';

const { Search } = Input;

class MonitoringModule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount = () => {

  }

  render() {
    return (
      <div className={styles.MonitoringModule}>
        <SystemMenu />
        <SidePop left="5px"></SidePop>
        <SidePop right="5px"></SidePop>
        <GMap />
        <div className={styles.searchBox}><Search placeholder="请输入内容" onSearch={value => console.log(value)} enterButton /></div>
        <div className={styles.mapIconManage}>
          <span>设备显示</span><span>事件标注</span>
        </div>
        <div className={styles.roadState}>
          <p><h5>路况</h5></p>
          <p>
            <span>严重拥堵</span>
            <span>拥挤</span>
            <span>缓行</span>
            <span>畅通</span>
          </p>
          <p><h5>事故地点</h5></p>
        </div>
      </div>
    )
  }
}

export default MonitoringModule
