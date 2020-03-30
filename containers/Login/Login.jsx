import React from 'react'
import { Icon, Checkbox, message, Input, Button } from 'antd'

import styles from './Login.scss'
import getResponseDatas from '../../plugs/HttpData/getResponseData'
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.loginParams = {
      loginName: '',
      password: '',
    }
    this.loginUrl = '/control/sys/user/login' // 登录
    this.limitUrl = '/control/sys/menu/getUserMentList?userId='
  }
  componentDidMount = () => {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 13) {
        console.log(e, e.keCode)
        this.handleLogin()
      }
    })
  }
  getUserLimit = (id) => {
    getResponseDatas('post', `${this.limitUrl}${id}`).then((res) => {
      const { code, data } = res.data
      if (code === 0) {
        localStorage.setItem('userLimit', JSON.stringify(data))
        this.props.history.push('/monitoringmodule')
      }
    })
  }
  // 转格式
  getFormData = (obj) => {
    const formData = new FormData()
    Object.keys(obj).forEach((item) => {
      formData.append(item, obj[item])
    })
    return formData
  }
  handleUserName = (e, name) => {
    this.loginParams[name] = e.target.value
  }
  handleCheckbox = (e) => {
    console.log(`checked = ${e.target.checked}`)
  }
  handleLogin = () => {
    const { loginName, passWord } = this.loginParams
    console.log(loginName, passWord);

    if (loginName !== '' && passWord !== '') {
      getResponseDatas('post', this.loginUrl, this.getFormData(this.loginParams)).then((res) => {
        const { code, data, msg } = res.data
        if (code === 0) {
          this.getUserLimit(data.id)
          localStorage.setItem('userInfo', JSON.stringify(data))
          this.loginParams = {
            loginName: '',
            passWord: '',
          }

        } else {
          message.warning(msg)
        }
      })
    }
  }
  render() {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.cententBox}>
          <div className={styles.earthBox} />
          <div className={styles.loginBox}>
            <h1 className={styles.title}>智慧高速管控系统</h1>
            <div className={styles.login}>
              <div className={styles.loginTitle}>用户登录</div>
              <div className={styles.loginInput}><Input onChange={(e) => { this.handleUserName(e, 'loginName') }} placeholder="请输入用户名" prefix={<Icon className={styles.IconLogin} type="user" />} /></div>
              <div className={styles.loginInput}><Input.Password onChange={(e) => { this.handleUserName(e, 'password') }} placeholder="请输入用户密码" prefix={<Icon className={styles.IconLogin} type="lock" />} /></div>
              <div className={styles.loginItem}><Checkbox onChange={this.handleCheckbox}>记住密码</Checkbox></div>
              <div className={styles.loginBon}><Button onClick={this.handleLogin} className={styles.ButtonItem}>登&nbsp;&nbsp;录</Button></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
