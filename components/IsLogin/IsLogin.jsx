import React from 'react'
import { Menu, Dropdown, Icon, message } from 'antd';
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import styles from './IsLogin.scss'


class IsLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }


    this.logoutUrl = '/control/sys/user/logout'
  }
  componentDidMount = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.menu = (
      <Menu>
        <Menu.Item key={userInfo.userName + userInfo.id || '--'} >用户：{userInfo ? userInfo.userName : '--'}</Menu.Item>
        <Menu.Item key="1" onClick={this.handleLogout}>退出系统</Menu.Item>
      </Menu>
    );
  }
  handleLogout = () => {
    getResponseDatas('post', this.logoutUrl).then((res) => {
      const { code, msg } = res.data
      if (code === 0) {
        window.location.hash = '#/login'
        localStorage.clear()
      } else {
        message.warning(msg)
      }
    })
  }
  render() {
    return (
      <div className={styles.isLoginBox}>
        <Dropdown overlay={this.menu}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Icon className={styles.imgHead} type="user" /> <Icon className={styles.arrow} type="down" />
          </a>
        </Dropdown>
      </div>
    )
  }
}

export default IsLogin
