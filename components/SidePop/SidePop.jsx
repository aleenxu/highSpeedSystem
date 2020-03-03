import React from 'react'
import ScrollList from '../ScrollList/ScrollList'

class SidePop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      boxLeft: this.props.left ? this.props.left : 'unset',
      boxRight: this.props.right ? this.props.right : 'unset',
      SidePopLeft: this.props.SidePopLeft || '',
      groupType: this.props.groupType || '',
      groupStatus: this.props.groupStatus,
      SidplanList: this.props.SidplanList,
    }
    this.styles = {
      position: 'fixed',
      top: '55px',
      bottom: '5px',
      left: this.state.boxLeft,
      right: this.state.boxRight,
      width: '24%',
      display: 'flex',
      alignItems: 'flexStart',
      backgroundColor: 'rgba(20,21,24,.9)',
      zIndex: '99',
      overflowY: 'auto',
    }
  }
  componentDidMount = () => {

  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.SidePopLeft !== nextProps.SidePopLeft) {
      this.setState({ SidePopLeft: nextProps.SidePopLeft })
    }
    if (this.props.groupType !== nextProps.groupType) {
      this.setState({ groupType: nextProps.groupType })
    }
    if (this.props.groupStatus !== nextProps.groupStatus) {
      this.setState({ groupStatus: nextProps.groupStatus })
    }
    if (this.props.SidplanList !== nextProps.SidplanList) {
      this.setState({ SidplanList: nextProps.SidplanList })
    }
    console.log(this.props.SidplanList , nextProps.SidplanList,'===============8555');
  }
  handleEventPopup = (type, boolean) => {
    const { handleEventPopup } = this.props
    console.log(type, boolean, handleEventPopup)
    if (handleEventPopup) {
      handleEventPopup(type, boolean)
    }
  }

  render() {
    const { boxLeft, boxRight, SidplanList, SidePopLeft, groupType, groupStatus } = this.state
    const eachartsData = {} //eacharts数据
    const progressData = {} //进度条数据
    const listData = [
      {
        id: '1001',
        roadName: 'G2京沪高速江阴大桥北向南',
        upTime: '18:14:02',
        traffic: '严重',
        state: '未管控'
      },
      {
        id: '1002',
        roadName: 'G2京沪高速江阴大桥北向南',
        upTime: '18:14:02',
        traffic: '严重',
        state: '未管控'
      }
    ]
    const listTit = {
      id: '方案编号',
      roadName: '道路名称',
      upTime: '管控时常',
      traffic: '剩余时间',
      state: '状态'
    }
    //列表数据
    const listTitData = {
      id: '道路编号',
      roadName: '路段',
      upTime: '方向',
      traffic: '路况(km/h)',
      state: '上报时间'
    } //标题数据
    return (
      <div style={this.styles} >
        {boxRight === 'unset' &&
          <div style={{ width: '100%' }}>
            {!!groupType && <ScrollList eachartData={groupType} type="1" dataRes="eacharts" handleEventPopup={this.handleEventPopup}></ScrollList>}
            {!!SidePopLeft && SidePopLeft.map((item, index) => {
              const listTit = {
                id: '道路编号',
                roadName: '路段',
                upTime: '方向',
                traffic: item.eventName === '交通拥堵' ? '路况(km/h)' : item.eventName === '极端天气' ? '能见度(m)' : '影响车道',
                state: '上报时间',
                type: item.eventType,
                name: item.eventName,
              }
              return <ScrollList type="3" key={item.eventName + item.eventLength} Tit={item.eventName + ' (' + item.eventLength + ')'} Title={listTit} dataRes={item.eventData} handleEventPopup={this.handleEventPopup}></ScrollList>
            })}
            {/* <ScrollList Tit="交通拥堵(1)" Title={listTitData} dataRes={listData} handleEventPopup={this.handleEventPopup}></ScrollList>
            <ScrollList Tit="道路施工(1)" Title={listTitData} dataRes={listData} handleEventPopup={this.handleEventPopup}></ScrollList>
            <ScrollList Tit="极端天气(1)" Title={listTitData} dataRes={listData} handleEventPopup={this.handleEventPopup}></ScrollList>
            <ScrollList Tit="交通事故(1)" Title={listTitData} dataRes={listData} handleEventPopup={this.handleEventPopup}></ScrollList> */}
          </div>
        }
        {
          boxLeft === 'unset' &&
          <div style={{ width: '100%' }}>
            {groupStatus && <ScrollList type="2" ProgressData={groupStatus} dataRes="进度条" handleEventPopup={this.handleEventPopup}></ScrollList>}
            {SidplanList && <ScrollList type="4" Tit="管控方案" Title={listTit} dataRes={SidplanList} handleEventPopup={this.handleEventPopup}></ScrollList>}
          </div>
        }
      </div >
    )
  }
}

export default SidePop
