import React from 'react'
import { Menu, Icon, message } from 'antd';
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
    const path = []
    this.limitArr.forEach((item) => { // 
      if (item.parentId === 0) {
        userLimit.push(item)  // 循环出一级菜单
      }
      path.push('#' + item.path) // 所有路由权限
    })
    console.log(path, window.location.hash);

    if (!path.includes(window.location.hash)) { // 判断当前是否有当前路由权限
      window.location.hash = '#/login'
      localStorage.clear()
    }
    userLimit.forEach((item) => { // 获取当前一级目录下子级目录
      item.Children = []
      this.limitArr.forEach((items) => {
        if (items.parentId === item.id && items.path) {
          item.Children.push(items) // 添加对应的一级目录子目录
        }
      })
      /*   return item.Children.length || item.path === '/monitoringmodule' // 筛选出要展示的目录 */
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
              if (item.Children && item.Children.length) {
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
                return item.path === '/monitoringmodule' ? <Menu.Item key={"#" + item.path}><a href={"#" + item.path}>{item.name}</a></Menu.Item> : <Menu.Item key={"#" + item.path}>{item.name}</Menu.Item>
              }
            })
          }
        </Menu>
      </div>
    )
  }
}

export default SystemMenu
