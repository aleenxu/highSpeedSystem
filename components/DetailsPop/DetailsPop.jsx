import React from 'react'
import { Icon, Collapse } from 'antd'
import styles from './DetailsPop.scss'
import NoData from '../NoData/NoData'

const { Panel } = Collapse
class DetailsPop extends React.Component { // 事件详情
  constructor(props) {
    super(props)
    const { detailsPopup } = props
    this.state = {
      detailsPopup,
    }
  }
  componentDidMount = () => {

  }
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.detailsPopup !== this.props.detailsPopup) {
      this.setState({ detailsPopup: nextProps.detailsPopup })
    }
  }
  componentWillUnmount = () => {

  }
  genExtraAdd = (item, data) => (
    <Icon
      type="plus"
      onClick={(e) => {
        this.props.genExtraAddOnclick(e, item, data)
      }}
    />
  )
  handleSubDetailsPopupList = (ind, index) => {
    const { detailsPopup } = this.state
    detailsPopup.devices[ind].device.splice(index, 1)
    this.setState({ detailsPopup })
  }
  render() {
    const { detailsPopup } = this.state
    console.log(detailsPopup);
    
    const { unitText, handleSelect, handleEventTag, handleClose, handleViewControl, handleControl } = this.props
    return (
      <div className={styles.Eventdetails}>
        <Icon className={styles.Close} style={{ zIndex: '99' }} onClick={handleClose} type="close" />
        <Collapse
          defaultActiveKey={[0, 1, 2, 3, 4, 5]}
          expandIconPosition="right"
        >
          <Panel header="事件详情" key={0}>
            <div className={styles.Content}>
              <div className={styles.Header}>
                <span>事件编号&nbsp;:&nbsp;&nbsp;{detailsPopup.eventNum}</span>
              </div>
              <div className={styles.Header}>
                <span>事件类型&nbsp;:&nbsp;&nbsp;<em style={{ color: '#f31113', fontStyle: 'normal' }}>{detailsPopup.eventTypeName}</em></span>
              </div>
              <div className={styles.ItemBox}>
                <div className={styles.HeadItem}>基本信息</div>
                <div className={styles.RowBox}>高速编号&nbsp;:&nbsp;&nbsp;{detailsPopup.hwayCode}</div>
                <div className={styles.RowBox}>高速名称&nbsp;:&nbsp;&nbsp;{detailsPopup.hwayName}</div>
                <div className={styles.RowBox}>
                  <p>行驶方向&nbsp;:&nbsp;&nbsp;{detailsPopup.roadDirectionName}</p>
                  <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{detailsPopup.pileNum && detailsPopup.pileNum.split(' ')[0]}</span></p>
                </div>
                <div className={styles.RowBox}>
                  {
                    (detailsPopup.planSource === 1 || detailsPopup.planSource === 2) || <p key="situation">{unitText ? unitText[detailsPopup.eventType].tipsText : ''}&nbsp;:&nbsp;&nbsp;<span>{detailsPopup.showValue + (unitText ? unitText[detailsPopup.eventType].unit : '')}</span></p>
                  }
                  <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p>
                </div>
                <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{detailsPopup.eventSourceName}</span></div>
              </div>
            </div>
          </Panel>
        </Collapse>
        <div className={styles.detailCollapse}>
          <Collapse
            defaultActiveKey={[0, 1, 2, 3, 4, 5]}
            expandIconPosition="right-bottom"
          >
            {
              detailsPopup.devices && detailsPopup.devices.map((item, ind) => {
                return (
                  <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode} extra={detailsPopup.planSource > -1000 ? null : this.genExtraAdd(item, detailsPopup)}>
                    <div>
                      {
                        item.device && item.device.map((items, index) => {
                          return <div className={styles.PanelBox} key={items.appendId}><p className={styles.PanelItem} onClick={() => { handleSelect(items.latlng, items.appendId, 'Click', items) }}>{`${index + 1}. ${items.deviceName} ${items.roadDirectionName} ${item.codeName} `}</p>{detailsPopup.planSource > 0 || <Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                        })
                      }
                      {(item.device && item.device.length === 0) ? <NoData /> : null}
                    </div>
                  </Panel>
                )
              })
            }
          </Collapse>
        </div>
        <div className={styles.panelBtnBox}>
          {detailsPopup.planSource > 0 ?
            <div className={styles.Panelbutton}>
              <span onClick={() => { handleViewControl(detailsPopup.planNum) }}>查看管控方案</span>
            </div> :
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className={styles.Panelbutton}><span onClick={handleControl}>发起管控</span></div>
              {/* <div className={styles.Panelbutton}><span onClick={(e) => {handleEventTag(true, e) }}>修改管控方案</span></div> */}
            </div>
          }
        </div>
      </div>
    )
  }
}

export default DetailsPop
