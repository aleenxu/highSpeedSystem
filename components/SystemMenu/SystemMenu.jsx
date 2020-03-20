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
    };
  }
  handleClick = e => {
    console.log('click ', e);
    /* this.setState({
      current: e.key,
    }); */
    const hashName = window.location.hash
    if (hashName == "#/reserveplan") {
      this.setState({
        current: '#/reserveplan',
      });
    } else if (hashName == "#/historical") {
      this.setState({
        current: '#/historical',
      });
    } else if (hashName == "#/basics") {
      this.setState({
        current: '#/basics',
      });
    } else if (hashName == "#/traffic") {
      this.setState({
        current: '#/traffic',
      });
    } else if (hashName == "#/analysis") {
      this.setState({
        current: '#/analysis',
      });
    } else if (hashName == "#/simulationmodule") {
      this.setState({
        current: '#/simulationmodule',
      });
    } else if (hashName == "#/plan") {
      this.setState({
        current: '#/plan',
      });
    } else if (hashName == "#/intelligence") {
      this.setState({
        current: '#/intelligence',
      });
    } else if (hashName == "#/speedLimit") {
      this.setState({
        current: '#/speedLimit',
      });
    } else if (hashName == "#/fIntelboard") {
      this.setState({
        current: '#/fIntelboard',
      });
    } else if (hashName == "#/tollgate") {
      this.setState({
        current: '#/tollgate',
      });
    } else if (hashName == "#/user") {
      this.setState({
        current: '#/user',
      });
    } else if (hashName == "#/institution") {
      this.setState({
        current: '#/institution',
      });
    } else if (hashName == "#/rolemana") {
      this.setState({
        current: '#/rolemana',
      });
    } else if (hashName == "#/journal") {
      this.setState({
        current: '#/journal',
      });
    } else {
      this.setState({
        current: '#/monitoringmodule',
      });
    }

  };
  componentDidMount = () => {
    this.handleClick()
  }
  handleGoDefault = () => {
    const hashName = window.location.hash
    window.location.href = window.location.hash.replace(hashName, '#/monitoringmodule') // 默认主页
  }
  render() {
    return (
      <div className={styles.SystemMenuBox}>
        <IsLogin />
        <Times />
        <a className={styles.logoBox} href="#/monitoringmodule"><img src={IconLogo} /></a>
        <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
          <Menu.Item key="#/monitoringmodule"><a href="#/monitoringmodule">全局监控</a>
          </Menu.Item>
          <SubMenu key="#/controlmodule" title={
            <span className="submenu-title-wrapper">
              管控业务
            </span>
          }>
            <Menu.Item key="#/reserveplan"><a href="#/reserveplan">预案库</a></Menu.Item>
            <Menu.Item key="#/historical"><a href="#/historical">历史事件</a></Menu.Item>
            <Menu.Item key="#/basics"><a href="#/basics">历史管控方案</a></Menu.Item>
          </SubMenu>
          <Menu.Item key="#/simulationmodule">
            {/* <a href="#/simulationmodule">
              仿真优化
            </a> */}
            <a>仿真优化</a>
          </Menu.Item>
          <SubMenu key="#/statisticsmodule" title={
            <span className="submenu-title-wrapper">
              统计分析
            </span>
          }>
            <Menu.Item key="#/traffic"><a href="#/traffic">事件统计</a></Menu.Item>
            <Menu.Item key="#/plan"><a href="#/plan">管控统计</a></Menu.Item>
            <Menu.Item key="#/analysis"><a href="#/analysis">路况分析</a></Menu.Item>
          </SubMenu>
          <SubMenu key="#/equipmentmodule" title={
            <span className="submenu-title-wrapper">
              设备运维
            </span>
          }>
            <Menu.Item key="#/intelligence"><a href="#/intelligence">可变情报板</a></Menu.Item>
            <Menu.Item key="#/tollgate"><a href="#/tollgate">收费站</a></Menu.Item>
            <Menu.Item key="#/speedLimit"><a href="#/speedLimit">限速牌</a></Menu.Item>
            <Menu.Item key="#/fIntelboard"><a href="#/fIntelboard">F型情报板</a></Menu.Item>
          </SubMenu>
          <SubMenu key="#/systemmodule" title={
            <span className="submenu-title-wrapper">
              系统管理
            </span>
          }>
            <Menu.Item key="#/user"><a href="#/user">用户管理</a></Menu.Item>
            <Menu.Item key="#/institution"><a href="#/institution">组织机构管理</a></Menu.Item>
            <Menu.Item key="#/rolemana"><a href="#/rolemana">角色管理</a></Menu.Item>
            <Menu.Item key="#/journal"><a href="#/journal">日志管理</a></Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    )
  }
}

export default SystemMenu
