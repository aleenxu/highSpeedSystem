import React from 'react'
import { Menu, Icon } from 'antd'
import styles from './Navigation.scss'

const { SubMenu } = Menu

class Navigation extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount = () => {

    }
    handleClick = (e) => {
        console.log('click ', e)
    }
    render() {
        return (
            <div className={styles.MenuBox}>
                <Menu
                    onClick={this.handleClick}
                    style={{ width: 'calc(100% - 1px)' }}
                    defaultSelectedKeys={['9']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                >
                    <SubMenu
                        key="sub1"
                        title={
                            <span>
                                <Icon type='appstore' />
                                <span>管控设置</span>
                            </span>
                        }
                    >
                        <Menu.Item key="9">可变情报板</Menu.Item>
                        <Menu.Item key="10">F型情报板</Menu.Item>
                        <Menu.Item key="11">限速牌</Menu.Item>
                        <Menu.Item key="12">收费站</Menu.Item>
                    </SubMenu>
                </Menu>
            </div >
        )
    }
}

export default Navigation
