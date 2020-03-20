
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Pagination, Input } from 'antd'
/* 历史管控方案 */
class Basics extends React.Component {
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
                      <div className={styles.listTd} >
                        <Button className={styles.Button} onClick={() => { this.handleEditItems(item.id) }}>事件详情</Button>
                        <Button className={styles.Button} onClick={() => { this.handleDeleteItem(item.id) }}>管控详情</Button>
                      </div>
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

export default Basics
