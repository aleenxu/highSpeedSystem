import React from 'react'
import ScrollList from '../ScrollList/ScrollList'
class SidePop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      boxLeft: this.props.left ? this.props.left : 'unset',
      boxRight: this.props.right ? this.props.right : 'unset',
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
  handleEventPopup = (type, boolean) => {
    const { handleEventPopup } = this.props
    console.log(type, boolean,handleEventPopup);
    if (handleEventPopup) {
      handleEventPopup(type, boolean)
    }
  }
  render() {
    const { boxLeft, boxRight } = this.state
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
    ] //列表数据
    const listTitData = {
      id: '事件编号',
      roadName: '道路名称',
      upTime: '上报时间',
      traffic: '路况',
      state: '管控状态'
    } //标题数据
    return (
      <div style={this.styles}>
        {boxRight === 'unset' &&
          <div style={{ width: '100%' }}>
            <ScrollList type="1" dataRes="eacharts" handleEventPopup={this.handleEventPopup}></ScrollList>
            <ScrollList Tit="交通拥堵(1)" Title={listTitData} dataRes={listData}></ScrollList>
            <ScrollList Tit="道路施工(1)" Title={listTitData} dataRes={listData}></ScrollList>
            <ScrollList Tit="极端天气(1)" Title={listTitData} dataRes={listData}></ScrollList>
            <ScrollList Tit="交通事故(1)" Title={listTitData} dataRes={listData}></ScrollList>
          </div>
        }
        {boxLeft === 'unset' &&
          <div style={{ width: '100%' }}>
            <ScrollList type="2" dataRes="进度条" handleEventPopup={this.handleEventPopup}></ScrollList>
            <ScrollList Tit="管控方案" Title={listTitData} dataRes={listData} handleEventPopup={this.handleEventPopup}></ScrollList>
          </div>
        }
      </div>
    )
  }
}

export default SidePop
