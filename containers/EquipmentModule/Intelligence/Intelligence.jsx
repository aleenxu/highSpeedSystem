import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import styles from '../EquipmentModule.scss'
import { Pagination, Input, message, Modal, Icon } from 'antd'

const { confirm } = Modal
/*         可变情报板 */
class Intelligence extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: null,
      current: 1,
      directionList: [],
    }
    this.Parameters = {
      keyword: '',
      pageNo: 1,
    }
    this.listByPageUrl = '/control/inforBoard/listByPage' // 分页查询设备
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.deleteUrl = '/control/inforBoard/delete' //  删除情报板'
  }
  componentDidMount = () => {
    this.handleListByPage()
    this.handlelistDetail('directionList', 1)
  }
  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) })
      }
    })
  }
  handleDelect = (rowId) => {
    const that = this
    confirm({
      title: '确认要删除当前用户?',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          getResponseDatas('get', that.deleteUrl, { id: rowId }).then((res) => {
            const result = res.data
            if (result.code === 200) {
              that.handleListByPage()
              resolve()
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 字典查询
  handlelistDetail = (name, value) => {
    getResponseDatas('get', this.listDetailUrl + value).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  handlepage = (pageNumber) => {
    this.Parameters.pageNo = pageNumber
    this.handleListByPage()
  }
  handleInputChange = (e, name) => {
    this.Parameters[name] = e.target.value
  }
  handledirection = (id) => {
    const { directionList } = this.state
    for (let i = 0; i < directionList.length; i++) {
      if (directionList[i].id === id) {
        return directionList[i].name
      }
    }
  }
  render() {
    const { listByPage, current } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input onChange={(e) => { this.handleInputChange(e, 'keyword') }} /></div>
                <span className={styles.Button} onClick={this.handleListByPage}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                <span className={styles.Button}>新&nbsp;&nbsp;增</span>
                {/* <span className={styles.Button}>修&nbsp;&nbsp;改</span>
                <span className={styles.Button}>删&nbsp;&nbsp;除</span> */}
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >设备编号</div>
                <div className={styles.listTd} >设备名称</div>
                <div className={styles.listTd} >设备厂商</div>
                {/* <div className={styles.listTd} >型号</div> */}
                <div className={styles.listTd} >高速公路</div>
                <div className={styles.listTd} >桩号</div>
                <div className={styles.listTd} >经纬度坐标</div>
                <div className={styles.listTd} >方向</div>
                <div className={styles.listTd} >IP地址</div>
                <div className={styles.listTd} >端口号</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceId}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.vendor}</span></div>
                      {/* <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum}</span></div> */}
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.pileNum}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.latlng}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.handledirection(item.direction)}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.deviceIp}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.port}</span></div>
                      <div className={styles.listTd} >
                        <span className={styles.Button}>修&nbsp;&nbsp;改</span>
                        <span className={styles.Button} onClick={() => { this.handleDelect(item.rowId) }}>删&nbsp;&nbsp;除</span>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{listByPage && listByPage.total}条，每页显示10条</span><Pagination showQuickJumper current={current} total={listByPage && listByPage.total} onChange={this.handlepage} /></div>
            </div>
          </div>
        </div>
        {/* <div className={styles.MaskBox}>
          <div className={styles.AddBox}>
            <div className={styles.Title}>新增<Icon className={styles.Close} type="close" /></div>
            <div className={styles.Conten}></div>
          </div>
        </div> */}
      </div>
    )
  }
}

export default Intelligence
