
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../EquipmentModule.scss'
import { Pagination, Input } from 'antd'
/*         收费站 */
class TollGate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount = () => {

  }
  handlepage = (pageNumber) => {
    console.log('Page: ', pageNumber);
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
                <div><Input /></div>
                <span className={styles.Button}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                <span className={styles.Button}>新&nbsp;&nbsp;增</span>
                <span className={styles.Button}>修&nbsp;&nbsp;改</span>
                <span className={styles.Button}>删&nbsp;&nbsp;除</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >设备编号</div>
                <div className={styles.listTd} >设备名称</div>
                <div className={styles.listTd} >设备厂商</div>
                <div className={styles.listTd} >型号</div>
                <div className={styles.listTd} >高速公路</div>
                <div className={styles.listTd} >桩号</div>
                <div className={styles.listTd} >经纬度坐标</div>
                <div className={styles.listTd} >放心</div>
                <div className={styles.listTd} >IP地址</div>
                <div className={styles.listTd} >端口号</div>
              </div>
              {/* {
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                    </div>
                  )
                })
              } */}
              <div className={styles.noData}>当前查询无数据</div>
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{150}条，每页显示10条</span><Pagination showQuickJumper defaultCurrent={2} total={500} onChange={this.handlepage} /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TollGate
