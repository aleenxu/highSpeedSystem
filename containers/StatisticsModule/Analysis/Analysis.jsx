
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input } from 'antd'
/*        路况分析 */
class Analysis extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount = () => {

  }
  handlepage = (pageNumber) => {
    // console.log('Page: ', pageNumber);
  }
  render() {
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字"/></div>
                <span className={styles.Button}>搜&nbsp;&nbsp;索</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                
              </div>
               
               
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Analysis
