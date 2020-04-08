
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import classNames from 'classNames'
import { Pagination, Input, message } from 'antd'
/*         收费站 */
class Journal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hash: window.location.hash,
      current: 1,
    }
    this.sysUser = {
      pageNo: 1,
      keyword: '',
    }
    this.listUrl = '/control/log/list'
  }
  componentDidMount = () => {
    this.getSystemList()
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    console.log(formData)
    return formData
  }
  getSystemList = () => {
    getResponseDatas('post', this.listUrl, this.getFormData(this.sysUser)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        console.log(result.data)
        this.setState({ systemList: result.data, current: Number(this.sysUser.pageNo) })
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
  }
  getDate = (data) => {
    const today = new Date(data)
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return navtime + navmse
  }
  handlePagination = (pageNumber) => {
    console.log('Page: ', pageNumber)
    this.sysUser.pageNo = pageNumber
    this.getSystemList()
  }
  handleInputChange = (e, name) => {
    this.sysUser[name] = e.target.value
  }
  render() {
    const { systemList, current } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div> <Input placeholder="请输入关键字" onChange={(e) => { this.handleInputChange(e, 'keyword') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlePagination('1') }}>搜&nbsp;&nbsp;索</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >用户编号</div>
                <div className={styles.listTd} >用户名称</div>
                <div className={styles.listTd} >操作内容</div>
                <div className={styles.listTd} >ip</div>
                <div className={styles.listTd} >操作时间</div>
              </div>
              {
                systemList && systemList.list.map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.username}>{item.id}</span></div>
                      <div className={styles.listTd} ><span className={styles.username}>{item.username}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.operation}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.ip}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{this.getDate(item.createDate)}</span></div>
                    </div>
                  )
                })
              }
              {
                !!systemList && systemList.list.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{systemList && systemList.totalCount}条，每页显示10条</span><Pagination showQuickJumper current={current} total={systemList && systemList.totalCount} onChange={this.handlePagination} /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Journal
