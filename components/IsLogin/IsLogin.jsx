import React from 'react'
import { Menu, Dropdown, Icon, message, Input } from 'antd';
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import styles from './IsLogin.scss'


class IsLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      password: null,
    }

    this.loginKeys = {
      password: '',
      oldPassword: '',
      id: '',
    }
    this.logoutUrl = '/control/sys/user/logout'
    this.updatePassUrl = '/control/sys/user/updatePassword'
  }
  componentDidMount = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.loginKeys.id = userInfo.id
    this.menu = (
      <Menu>
        <Menu.Item key={userInfo.userName + userInfo.id || '--'} >用户：{userInfo ? userInfo.userName : '--'}</Menu.Item>
        <Menu.Item key="Change Password" onClick={() => { this.handleClose(true) }}>修改密码</Menu.Item>
        <Menu.Item key="Exit system" onClick={this.handleLogout}>退出系统</Menu.Item>
      </Menu>
    );
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
  getupdatePwd = () => {
    const { password, oldPassword, id } = this.loginKeys
    if (password === '') {
      message.error('请填写新密码！')
      return
    }
    if (oldPassword === '') {
      message.error('请再次填写新密码！')
      return
    }
    if (oldPassword !== password) {
      message.error('密码输入不一致！')
      return
    }

    getResponseDatas('post', this.updatePassUrl, this.getFormData(this.loginKeys)).then((res) => {
      const result = res.data
      if (result.code === 0) {
        console.log(result.data)
        this.handleClose(null)
        message.error('密码修改成功,3秒后返回登录页面！')
        setTimeout(() => {
          this.handleLogout()
        }, 3000)
      } else {
        message.error('网络异常，请稍后再试!')
      }
    })
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
  handleClose = (value) => {
    this.setState({ password: value })
  }
  handleInputChange = (e, name) => {
    this.loginKeys[name] = e.target.value
  }
  render() {
    const { password } = this.state
    return (
      [<div className={styles.isLoginBox} key="isLoginBox">
        <Dropdown overlay={this.menu}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Icon className={styles.imgHead} type="user" /> <Icon className={styles.arrow} type="down" />
          </a>
        </Dropdown>
      </div>,
      password ?
        <div className={styles.traBox} key="traBox">
          <div className={styles.addListBox}>
            <div className={styles.titleBox}>
              <div className={styles.title} style={{ marginRight: 15 }}><span>修改密码</span></div>
              <Icon type="close" onClick={() => { this.handleClose(null) }} className={styles.close} />
            </div>
            <div className={styles.content}>
              <div className={styles.syetemItem}>
                <div className={styles.inSle}>
                  <Input.Password placeholder="输入新密码" onChange={(e) => { this.handleInputChange(e, 'password') }} />
                </div>
              </div>
              <div className={styles.syetemItem}>
                <div className={styles.inSle}>
                  <Input.Password placeholder="再次输入新密码" onChange={(e) => { this.handleInputChange(e, 'oldPassword') }} />
                </div>
              </div>
              <div className={styles.syetemItem}>
                <span className={styles.Button} onClick={this.getupdatePwd}>确认</span>
                <span className={styles.Button} onClick={() => { this.handleClose(null) }}>取消</span>
              </div>
            </div>
          </div>
        </div> : null
      ]
    )
  }
}

export default IsLogin
