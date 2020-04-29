import React from 'react'
import CryptoJS from 'crypto-js'
import { Icon, Checkbox, message, Input, Button, Form } from 'antd'

import styles from './Login.scss'
import getResponseDatas from '../../plugs/HttpData/getResponseData'
const key = CryptoJS.enc.Utf8.parse("1234567890000000"); //16位
const iv = CryptoJS.enc.Utf8.parse("1234567890000000");
class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rememberPassword: false,
      loginName: '',
      password: '',
    }
    this.loginParams = {
      loginName: '',
      password: '',
    }
    this.loginUrl = '/control/sys/user/login' // 登录
    this.limitUrl = '/control/sys/menu/getUserMentList?userId='
  }
  componentDidMount = () => {
    document.addEventListener('keydown', this.handleEnter)
    // 在componentDidMount中执行读取cookie
    this.loadAccountInfo()
  }
  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleEnter)
  }
  //aes加密
  encrypt = (word) => {
    let encrypted = "";
    if (typeof word == "string") {
      const srcs = CryptoJS.enc.Utf8.parse(word);
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    } else if (typeof word == "object") {
      //对象格式的转成json字符串
      const data = JSON.stringify(word);
      const srcs = CryptoJS.enc.Utf8.parse(data);
      encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    }
    return encrypted.ciphertext.toString();
  }
  // aes解密
  decrypt = (word) => {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }
  loadAccountInfo = () => {
    //读取cookie
    let arr, reg = new RegExp("(^| )" + 'accountInfo' + "=([^;]*)(;|$)");
    let accountInfo = ''
    if (arr = document.cookie.match(reg)) {
      accountInfo = unescape(arr[2]);
    }
    else {
      accountInfo = null;
    }
    if (Boolean(accountInfo) == false) {
      return false;
    } else {
      let userName = "";
      let passWord = "";
      let i = new Array()
      i = accountInfo.split("&");
      userName = i[0],
        passWord = this.decrypt(i[1])
      this.setState({
        rememberPassword: true,
        loginName: userName,
        password: passWord,
      }, () => {
        this.loginParams.loginName = userName
        this.loginParams.password = passWord
      })
    }
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
  handleEnter = (e) => {
    if (e.keyCode === 13) {
      this.handleLogin()
    }
  }
  handleUserName = (e, name) => {
    this.loginParams[name] = e.target.value
    this.setState({
      [name]: e.target.value,
    })
  }
  handleCheckbox = (e) => { // 记住密码
    this.setState({
      rememberPassword: e.target.checked,
    })
  }
  handlerememberPassword = () => {
    if (this.state.rememberPassword) {   //是否保存密码
      let accountInfo = this.loginParams.loginName + '&' + this.encrypt(this.loginParams.password) + '&' + this.state.rememberPassword;
      let Days = 1;  //cookie保存时间
      let exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = 'accountInfo' + "=" + escape(accountInfo) + ";expires=" + exp.toGMTString();
    } else {
      let exp = new Date();
      exp.setTime(exp.getTime() - 1);
      let accountInfo = document.cookie
      var cookie_pos = accountInfo.indexOf('accountInfo');
      if (cookie_pos != -1) {
        document.cookie = 'accountInfo' + "=" + ' ' + ";expires=" + exp.toGMTString();
      }
      /* this.loginParams.loginName = '';
      this.loginParams.password = ''; */
    }
  }
  handleLogin = () => {
    const { loginName, password } = this.loginParams
    console.log(this.loginParams);

    if (!loginName) {
      message.warning('请输入用户名！')
      return
    }
    if (!password) {
      message.warning('请输入密码！')
      return
    }
    this.handlerememberPassword()
    if (loginName !== '' && password !== '') {
      getResponseDatas('post', this.loginUrl, this.getFormData(this.loginParams)).then((res) => {
        const { code, data, msg } = res.data
        if (code === 0) {
          this.getUserLimit(data.id)
          localStorage.setItem('userInfo', JSON.stringify(data))
        } else {
          if (code === 1000) {
            message.warning('系统异常,请联系管理员')
          } else {
            message.warning(msg)
          }
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
            <h1 className={styles.title}>车路协同智慧管控系统</h1>
            <div className={styles.login}>
              <div className={styles.loginTitle}>用户登录</div>
              <div className={styles.loginInput}><Input value={this.state.loginName} onChange={(e) => { this.handleUserName(e, 'loginName') }} placeholder="请输入用户名" prefix={<Icon className={styles.IconLogin} type="user" />} /></div>
              <div className={styles.loginInput}><Input.Password value={this.state.password} onChange={(e) => { this.handleUserName(e, 'password') }} placeholder="请输入用户密码" prefix={<Icon className={styles.IconLogin} type="lock" />} /></div>
              <div className={styles.loginItem}><Checkbox checked={this.state.rememberPassword} value={this.state.rememberPassword} onChange={this.handleCheckbox}>记住密码</Checkbox></div>
              <div className={styles.loginBon}><Button onClick={this.handleLogin} className={styles.ButtonItem}>登&nbsp;&nbsp;录</Button></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
