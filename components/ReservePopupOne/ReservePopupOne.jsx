import React from 'react'
import { Icon, Collapse } from 'antd'
import styles from './ReservePopupOne.scss'
import classNames from 'classNames'
class ReservePopupOne extends React.Component { // 事件详情
  constructor(props) {
    super(props)
    const { reservePopupOne, operationData } = props
    this.state = {
      reservePopupOne,
      operationData,
    }
  }
  componentDidMount = () => {

  }
  componentWillReceiveProps = (nextProps) => {

  }
  componentWillUnmount = () => {

  }
  render() {
    const { reservePopupOne, operationData } = this.state
    return (
      <div className={styles.MaskBox}>
        <div className={classNames(styles.DetailsBox, styles.ReserveBox)} style={{ height: 'auto', maxHeight: '630px' }}>
          <div className={styles.Title}>{reservePopupOne.devices ? '管控详情' : '事件详情'}<Icon className={styles.Close} onClick={() => { this.setState({ reservePopupOne: null }) }} type="close" /></div>
          <div className={styles.Content}>
            <div className={styles.Header} style={{ marginTop: '5px' }} >
              <span>事件编号&nbsp;:&nbsp;&nbsp;{reservePopupOne.eventNum}</span>
              <span>事件类型&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopupOne.eventTypeName}</span></span>
            </div>
            <div className={styles.ItemBox}>
              <div className={styles.HeadItem}>基本信息</div>
              <div className={styles.RowBox}>
                <p>高速编号&nbsp;:&nbsp;&nbsp;{reservePopupOne.hwayCode}</p>
                <p>高速名称&nbsp;:&nbsp;&nbsp;{reservePopupOne.hwayName}</p>
                <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopupOne.roadDirectionName}</p>
              </div>
              <div className={styles.RowBox}>
                <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopupOne.pileNum && reservePopupOne.pileNum.split(' ')[0]}</span></p>
                {
                  ((reservePopupOne.planSource === 1 || reservePopupOne.planSource === 2) && reservePopupOne.eventType) || <p key="situation">{this.state.unitText[reservePopupOne.eventType].tipsText}&nbsp;:&nbsp;&nbsp;<span>{reservePopupOne.showValue + this.state.unitText[reservePopupOne.eventType].unit}</span></p>
                }
                <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopupOne.eventLength || 0}m</span></p>
              </div>
              <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{reservePopupOne.planSourceName}</span></div>
            </div>
            {
              operationData ?
                <div>
                  {/* <div className={styles.guanBox}>
                          <Button className={styles.Button}>管控效果评估</Button>
                        </div> */}
                  <div className={styles.guanBox}>
                    <span className={styles.guanTitle}>操作记录</span>
                  </div>
                  <div className={styles.listBox}>
                    <div className={styles.listBoxHead}>
                      <div className={styles.listItems}>
                        <div className={styles.listTd} >序号</div>
                        <div className={styles.listTd} >操作人员</div>
                        <div className={styles.listTd} >操作名称</div>
                        <div className={styles.listTd} >操作部门</div>
                        <div className={styles.listTd} >操作时间</div>
                      </div>
                    </div>
                    <div className={styles.listBoxBody}>
                      {
                        operationData.map((item, index) => {
                          return (
                            <div className={styles.listItems} key={item.row_id}>
                              <div className={styles.listTd} >{index + 1}</div>
                              <div className={styles.listTd} >{item.operateUserName}</div>
                              <div className={styles.listTd} >{item.operateName}</div>
                              <div className={styles.listTd} >{item.operateUserDeptName}</div>
                              <div className={styles.listTd} >{item.operateTime ? this.getDate(item.operateTime) : '-'}</div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div> : null}
          </div>
        </div>

      </div>
    )
  }
}

export default ReservePopupOne
