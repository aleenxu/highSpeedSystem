import React from 'react'
import { Menu, Dropdown, Icon, message } from 'antd';
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import styles from './IsLogin.scss'

class IsLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      successInfo: null,
    }
    this.menu = (
      <Menu>
        <Menu.Item key="0">用户：admin</Menu.Item>
        <Menu.Item key="1" onClick={this.handleLogout}>退出系统</Menu.Item>
      </Menu>
    );
    this.logoutUrl = '/control/sys/user/logout'
  }
  componentDidMount = () => {
    
  }
  handleLogout = () => {
    getResponseDatas('post', this.logoutUrl).then((res) => {
      const { code, msg } = res.data
      if (code === 0) {
        localStorage.clear()
        window.location.hash = '#/login'
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
