import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'

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
        <div>
            <SystemMenu />
            <SidePop left="5px"></SidePop>
            <SidePop right="5px"></SidePop>
            <GMap />
            <div className={styles.searchBox}></div>
            <div className={styles.mapIconManage}></div>
            <div className={styles.roadState}></div>
        </div>
    )
  }
}

export default MonitoringModule
