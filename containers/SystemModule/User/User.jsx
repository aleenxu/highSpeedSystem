import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import { Pagination, Input, message, Modal, Icon, Form, Select, Button } from 'antd'

/* 用户管理 */
class User extends React.Component {
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
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >用户ID</div>
                <div className={styles.listTd} >用户姓名</div>
                <div className={styles.listTd} >组织机构</div>
                <div className={styles.listTd} >角色</div>
                <div className={styles.listTd} >上次登陆时间</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => {
                  return (
                    <div className={styles.listItems}>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>11111</span></div>
                      <div className={styles.listTd} >
                        <Button className={styles.Button} >修&nbsp;&nbsp;改</Button>
                        <Button className={styles.Button} >重置密码</Button>
                        <Button className={styles.Button} >删&nbsp;&nbsp;除</Button>
                      </div>
                    </div>
                  )
                })
              }
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

export default User
