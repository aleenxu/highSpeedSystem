import React from 'react'
import { Menu, Icon } from 'antd'
import styles from './Navigation.scss'

const { SubMenu } = Menu

class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      CatalogList: [], // 目录 
    }
    this.limitArr = JSON.parse(localStorage.getItem('userLimit'))||[]
  }

  componentDidMount = () => {
    const CatalogList = []
    this.limitArr.forEach((item) => {
      if (item.path === window.location.hash.slice(1)) { // 找到当前路由的数据
        this.limitArr.forEach((items) => {
          if (items.parentId === item.parentId) { // 找到当前目录
            CatalogList.push(items)
          }
        })
      }
    })
    this.setState({ CatalogList })

  }
  handleClick = (e) => {
    if (e.key) {
      window.location.href = e.key
    }
  }
  render() {
    const { CatalogList } = this.state
    return (
      <div className={styles.MenuBox}>
        <Menu
          onClick={this.handleClick}
          style={{ width: 'calc(100% - 1px)' }}
          selectedKeys={[window.location.hash]}
          openKeys={['sub']}
          mode="inline"
        >
          <SubMenu
            key="sub"
            title={
              <span>
                <Icon type='appstore' />
                <span>设置目录</span>
              </span>
            }
          >
            {
              CatalogList && CatalogList.map((item) => {
                return <Menu.Item key={`#${item.path}`}>{item.name}</Menu.Item>
              })
            }
          </SubMenu>
        </Menu>
      </div>
    )
  }
}

export default Navigation
