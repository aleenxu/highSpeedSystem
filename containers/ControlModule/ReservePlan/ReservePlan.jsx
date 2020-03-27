
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import GMap from '../../../components/GMap/GMap'
import classNames from 'classnames'
import { Pagination, Input, Button, Checkbox, Radio, Icon, Switch, DatePicker, Collapse, Select, Modal, message } from 'antd'
/*        预案库 */
class ReservePlan extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: null,
      current: 1,
    }
    this.addPlanUrlParams = {

    }
    this.updatePlanUrlParams = {

    }
    this.detailPlanUrlParams = {

    }
    this.getListPlanUrlParams = {

    }
    this.Parameters = {
      keyword: '',
      pageNo: 1,
    }
    this.addPlanUrl = '/control/contingencyPlan/addPlan' // 新增预案
    this.updatePlanUrl = '/control/contingencyPlan/updatePlan'//    修改预案
    this.detailPlanUrl = '/control/contingencyPlan/getDeviceDetail'   //根据方案ID查询方案中设备
    this.getListPlanUrl = '/control/contingencyPlan/getDeviceNameList'//    根据设备ID和设备类型查询设备名称
    this.listByPageUrl = '/control/contingencyPlan/listByPage' // 分页查询设备
  }
  componentDidMount = () => {
    this.handleListByPage()
  }
  handleAddPlan = () => {
    getResponseDatas('post', this.addPlanUrl, this.addPlanUrlParams ).then((res) => {
      const result = res.data
      if (result.code === 200) {
        
      }
    })
  }
  handleUpdatePlan = () => {
    getResponseDatas('post', this.updatePlanUrl, this.updatePlanUrlParams).then((res) => {
      const result = res.data
      if (result.code === 200) {
        
      }
    })
  }
  handleDetailPlan = () => {
    getResponseDatas('get', this.detailPlanUrl, this.detailPlanUrlParams).then((res) => {
      const result = res.data
      if (result.code === 200) {
        
      }
    })
  }
  handleGetListPlan = () => {
    getResponseDatas('post', this.getListPlanUrl, this.getListPlanUrlParams).then((res) => {
      const result = res.data
      if (result.code === 200) {
        
      }
    })
  }
  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        debugger
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) })
      }
    })
  }
  handlepage = (pageNumber) => {
    this.Parameters.pageNo = pageNumber
    this.handleListByPage()
  }
  handleInput = (e, name, type) => {
    this[type][name] = e.target.value
  }
  render() {
    const { listByPage, current, reservePopup } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input onChange={(e) => { this.handleInput(e, 'keyword', 'Parameters') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                <span className={styles.Button}>新&nbsp;&nbsp;增</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >预案ID</div>
                <div className={styles.listTd} >道路名称</div>
                <div className={styles.listTd} >路段名称</div>
                <div className={styles.listTd} >管控事件类型</div>
                <div className={styles.listTd} >管控类型</div>
                <div className={styles.listTd} >引用次数</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.rowId}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.secName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controlEventType}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controlDeviceTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.quoteNum}</span></div>
                      <div className={styles.listTd} >
                        <Button className={styles.Button}>修&nbsp;&nbsp;改</Button>
                        <Button className={styles.Button}>删&nbsp;&nbsp;除</Button>
                      </div>
                    </div>
                  )
                })
              }
              {
                !!listByPage && listByPage.data.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{listByPage && listByPage.total}条，每页显示10条</span><Pagination showQuickJumper current={current} total={listByPage && listByPage.total} onChange={this.handlepage} /></div>
            </div>
          </div>
        </div>
        <div className={styles.MaskBox}>
            <div className={styles.AddBox}>
              <div className={styles.Title}>{'新增预案'}<Icon onClick={() => { this.handleClose('reservePopup', false) }} className={styles.Close} type="close" /></div>
              <div className={styles.Conten}>
                <div className={styles.Header}>
                  <span>管控措施：</span>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>可变情报版</div>
                </div>
                
              </div>
            </div>
        </div>
      </div>
    )
  }
}

export default ReservePlan
