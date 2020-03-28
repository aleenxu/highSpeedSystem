import React from 'react'
import { Menu, Icon } from 'antd';
import styles from './SystemMenu.scss'
import Times from '../DateTime/DateTime'
import IsLogin from '../IsLogin/IsLogin'
import IconLogo from '../../imgs/logo.png'
const { SubMenu } = Menu;
class SystemMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: '#/monitoringmodule',
      userLimit: null,
    }
    this.limitArr = []
  }

  componentDidMount = () => {
    this.handleClick()
    this.limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    this.limitArr.forEach((item) => { // 循环出一级菜单
      if (item.parentId === 0) {
        userLimit.push(item)
      }
    })
    userLimit.forEach((item) => {
      item.Children = []
      this.limitArr.forEach((items) => {
        if (items.parentId === item.id && items.path) {
          item.Children.push(items)
        }
      })
    })
    this.setState({ userLimit })
  }
  handleGoDefault = () => {
    const hashName = window.location.hash
    window.location.href = window.location.hash.replace(hashName, '#/monitoringmodule') // 默认主页
  }
  handleClick = (e) => {
    const hashName = window.location.hash
    if (hashName) {
      this.setState({
        current: hashName,
      })
    } else {
      this.setState({
        current: '#/monitoringmodule',
      })
    }
  }
  render() {
    const { userLimit } = this.state
    return (
      <div className={styles.SystemMenuBox}>
        <IsLogin />
        <Times />
        <a className={styles.logoBox} href="#/monitoringmodule"><img src={IconLogo} /></a>
        <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
          {
            userLimit && userLimit.map((item) => {
              if (item.Children.length) {
                return (
                  <SubMenu key={"#" + item.path} title={<span className="submenu-title-wrapper">{item.name}</span>}>
                    {
                      item.Children.map((items) => {
                        return (
                          <Menu.Item key={"#" + items.path}><a href={"#" + items.path}>{items.name}</a></Menu.Item>
                        )
                      })
                    }
                  </SubMenu>
                )
              } else {
                return <Menu.Item key={"#" + item.path}><a href={"#" + item.path}>{item.name}</a></Menu.Item>
              }
            })
          }
        </Menu>
      </div>
    )
  }
}

export default SystemMenu
