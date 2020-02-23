import React from 'react'
import { Menu, Dropdown, Icon } from 'antd';
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
      
    }
  }
  componentDidMount = () => {
    
  }

  render() {
    return (
        <div className={styles.isLoginBox}>
            <Dropdown overlay={menu}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Icon className={styles.imgHead} type="user" /> <Icon className={styles.arrow} type="down" />
                </a>
            </Dropdown>
        </div>
    )
  }
}

export default IsLogin
