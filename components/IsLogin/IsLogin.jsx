import React from 'react'
import { Menu, Dropdown, Icon, message } from 'antd';
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import styles from './IsLogin.scss'
const menu = (
    <Menu>
      <Menu.Item key="0">用户：admin</Menu.Item>
      <Menu.Item key="1">退出系统</Menu.Item>
    </Menu>
  );
class IsLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      successInfo: null,
    }
    this.logoutUrl = '/control/sys/user/logout' // 退出系统
  }
  componentWillMount = () => {
    this.setState({
      successInfo: JSON.parse(localStorage.userInfo),
    })
  }
  componentDidMount = () => {
    
  }
  loginOut = () => {
    getResponseDatas('post', this.logoutUrl, {Authorization: this.state.successInfo.token }).then((res) => {
      if (res.data.code === 0) {
        message.success('退出成功!')
        localStorage.removeItem('userInfo')
        window.location.hash = '#/login'
      } else {
        message.warning(msg)
      }
    })
  }
  render() {
    const { successInfo } = this.state
    const { loginName } = successInfo
    return (
        <div className={styles.isLoginBox}>
            <Dropdown overlay={
              (<Menu>
                <Menu.Item key="0">用户：{loginName}</Menu.Item>
                <Menu.Item key="1" onClick={this.loginOut}>退出系统</Menu.Item>
              </Menu>)
              }>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Icon className={styles.imgHead} type="user" /> <Icon className={styles.arrow} type="down" />
                </a>
            </Dropdown>
        </div>
    )
  }
}

export default IsLogin
