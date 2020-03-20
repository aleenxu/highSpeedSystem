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
    this.Equipment = [  // 设备运维目录
      { hash: '#/intelligence', name: '可变情报板' },
      { hash: '#/tollgate', name: '收费站' },
      { hash: '#/speedLimit', name: '限速牌' },
      { hash: '#/fIntelboard', name: 'F型情报板' },
    ]
    this.systemMana = [ // 系统管理目录
      { hash: '#/user', name: '用户管理' },
      { hash: '#/institution', name: '组织机构管理' },
      { hash: '#/rolemana', name: '角色管理' },
      { hash: '#/journal', name: '日志管理' },
    ]
    this.Control = [ // 管控业务目录
      { hash: '#/reserveplan', name: '预案库' },
      { hash: '#/historical', name: '历史事件' },
      { hash: '#/basics', name: '历史管控方案' },
    ]
    this.Statistics = [ // 统计分析目录
      { hash: '#/traffic', name: '事件统计' },
      { hash: '#/plan', name: '管控统计' },
      { hash: '#/analysis', name: '路况分析' },
    ]
    this.CatalogList = [this.Equipment, this.systemMana, this.Control, this.Statistics]
  }

  componentDidMount = () => {
    this.CatalogList.forEach((items) => {
      items.forEach((item) => {
        if (item.hash === window.location.hash) {
          this.setState({ CatalogList: items })
        }
      })
    })
  }
  handleClick = (e) => {
    console.log('click ', e, e.key, e.key.slice(1))
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
                <span>管控设置</span>
              </span>
            }
          >
            {
              CatalogList && CatalogList.map((item) => {
                return <Menu.Item key={item.hash}>{item.name}</Menu.Item>
              })
            }
            {/* <Menu.Item key="9">可变情报板</Menu.Item>
						<Menu.Item key="10">F型情报板</Menu.Item>
						<Menu.Item key="11">限速牌</Menu.Item>
						<Menu.Item key="12">收费站</Menu.Item> */}
          </SubMenu>
        </Menu>
      </div>
    )
  }
}

export default Navigation
