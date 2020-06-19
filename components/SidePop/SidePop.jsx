import React from 'react'
import ScrollList from '../ScrollList/ScrollList'
import 'animate.css'
import RCloseIcon from '../../imgs/icon_r_close.png'
import ROpenIcon from '../../imgs/icon_r_open.png'
import LCloseIcon from '../../imgs/icon_left_close.png'
import LOpenIcon from '../../imgs/icon_left_open.png'
import $ from 'jquery'
const rdom = require('react-dom');
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
      transition: '',
      iconFlag: false,
      iconFlagR: false,
      scrollLength: 0, // 左滚动距离
      scrollLengthR: 0, // 右滚动距离
    }
    this.styles = {
      position: 'fixed',
      top: '55px',
      bottom: '5px',
      left: this.state.boxLeft,
      right: this.state.boxRight,
      width: '24%',
      height: 'calc(100% - 60px)',
      display: 'flex',
      alignItems: 'flexStart',
      backgroundColor: 'rgba(20,21,24,.9)',
      zIndex: '99',
      overflowY: 'auto',
    }
    this.stylesH = `position:fixed;
      bottom:5px;
      left: 5px;
      width: 24%;
      height:calc(100% - 60px);
      display: flex;
      background-color:rgba(20,21,24,.9);
      z-index: 99;
      overflow-y: auto;
      transition:all .5s;`

    this.stylesL = `
      position: fixed;
      bottom: 5px;
      left: 5px;
      width: 24px;
      height: 24px;
      display: flex;
      background-color: rgba(20,21,24,.9);
      z-index: 99;
      overflow: hidden;
      transition:all .5s;
    `
    this.stylesRH = `position:fixed;
      bottom:5px;
      right: 5px;
      width: 24%;
      height:calc(100% - 60px);
      display: flex;
      background-color:rgba(20,21,24,.9);
      z-index: 99;
      overflow-y: auto;
      transition:all .5s;`

    this.stylesR = `
      position: fixed;
      bottom: 5px;
      right: 5px;
      width: 24px;
      height: 24px;
      display: flex;
      background-color: rgba(20,21,24,.9);
      z-index: 99;
      overflow: hidden;
      transition:all .5s;
    `
  }
  componentDidMount = () => {
    this.state.boxRight === 'unset' ? this.setState({ transition: 'bounceInLeft' }) : this.setState({ transition: 'bounceInRight' })
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
  }
  handleEventPopup = (type, boolean) => {
    const { handleEventPopup } = this.props
    if (handleEventPopup) {
      handleEventPopup(type, boolean)
    }
  }
  // handlunitText=(eventType)=>{
  //   const {unitText}=this.props
  //   unitText.find((item)=>{
  //     return item.eventType===eventType
  //   })
  //   retutn unitText
  // }
  // 左边栏的收起和展开
  handleLeftClick = (e) => {
    const _this = this;
    const styleLeft = 'left:20px;transition:all .5s;'
    if (!this.state.iconFlag) {
      $(e.target).parent().parent().attr('style', _this.stylesL)
      $('#searchBox').attr('style', styleLeft)
      $('#roadStateBox').attr('style', styleLeft)
      $(e.target).attr('src', LOpenIcon)
      $(e.target).attr('title', '展开')
      this.setState({
        iconFlag: true,
      })
    } else {
      const styleLeftH = 'transition:all .5s;'
      $(e.target).parent().parent().attr('style', _this.stylesH)
      $('#searchBox').attr('style', styleLeftH)
      $('#roadStateBox').attr('style', styleLeftH)
      $(e.target).attr('src', LCloseIcon)
      $(e.target).attr('title', '收起')
      this.setState({
        iconFlag: false,
      })

    }
  }
  // 右边栏的收起和展开
  handleRightClick = (e) => {
    const styleR = 'right:5px;transition:all .5s;'
    const _this = this;
    if (!this.state.iconFlagR) {
      $(e.target).parent().parent().attr('style', _this.stylesR)
      $('#deviceBox').attr('style', styleR)
      $(e.target).attr('src', ROpenIcon)
      $(e.target).attr('title', '展开')
      this.setState({
        iconFlagR: true,
      })
    } else {
      const styleRH = 'transition:all .5s;'
      $(e.target).parent().parent().attr('style', _this.stylesRH)
      $('#deviceBox').attr('style', styleRH)
      $(e.target).attr('src', RCloseIcon)
      $(e.target).attr('title', '收起')
      this.setState({
        iconFlagR: false,
      })
    }
  }
  // 滚动监听
  handleScroll = e => {
    const ele = rdom.findDOMNode(this);
    // console.log(e.nativeEvent,e.nativeEvent.deltaY)
    if (e.nativeEvent.deltaY < 0) {
      /* scrolling up */
      // console.log( '往上滚动',ele.scrollTop)
      this.state.boxRight === 'unset' ? this.setState({ scrollLength: ele.scrollTop }) : this.setState({ scrollLengthR: ele.scrollTop })

    } else {
      /* scrolling down */
      // console.log('往下滚动',ele.scrollTop)
      this.state.boxRight === 'unset' ? this.setState({ scrollLength: ele.scrollTop }) : this.setState({ scrollLengthR: ele.scrollTop })
    }
  }
  render() {
    const { boxLeft, boxRight, SidplanList, SidePopLeft, groupType, groupStatus, scrollLength, scrollLengthR } = this.state
    const eachartsData = {} // eacharts数据
    const progressData = {} // 进度条数据
    const listData = [
      {
        id: '1001',
        roadName: 'G2京沪高速江阴大桥北向南',
        upTime: '18:14:02',
        traffic: '严重',
        state: '未管控',
      },
      {
        id: '1002',
        roadName: 'G2京沪高速江阴大桥北向南',
        upTime: '18:14:02',
        traffic: '严重',
        state: '未管控',
      },
    ]
    const listTit = {
      id: '道路',
      roadName: '管控方案标识',
      upTime: '方向',
      traffic: '剩余时间',
      time: '管控时常',
      state: '状态',
    }
    // 列表数据
    const listTitData = {
      id: '道路编号',
      roadName: '路段',
      upTime: '方向',
      traffic: '路况(km/h)',
      state: '上报时间',
    } // 标题数据
    return (
      <div style={this.styles} className={`animated ${this.state.transition}`}>
        {boxRight === 'unset' &&
          <div style={{ width: '100%' }} onWheel={(e) => { this.handleScroll(e) }}>
            {!!groupType && <ScrollList eachartData={groupType} type="1" dataRes="eacharts" handleEventPopup={this.handleEventPopup}></ScrollList>}
            {!!SidePopLeft && SidePopLeft.map((item, index) => {
              const listTit = {
                id: '高速编号',
                roadName: '路段',
                upTime: '方向',
                traffic: item.eventTypeName === '交通拥堵' ? '路况(km/h)' : item.eventTypeName === '极端天气' ? '能见度(m)' : item.eventTypeName === '主动管控' ? '事件类型' : '影响车道',
                state: '上报时间',
                type: item.eventType,
                name: item.eventTypeName,
              }
              return <ScrollList type="3" key={item.eventTypeName } Tit={item.eventTypeName } Title={listTit} dataAll={SidePopLeft} dataRes={item} handleEventPopup={this.handleEventPopup}></ScrollList>
            })}
          </div>
        }
        {
          boxLeft === 'unset' &&
          <div style={{ width: '100%' }} onWheel={(e) => { this.handleScroll(e) }}>
            {groupStatus && <ScrollList type="2" ProgressData={groupStatus} dataRes="进度条" handleEventPopup={this.handleEventPopup}></ScrollList>}
            {SidplanList && <ScrollList type="4" Tit="管控方案" Title={listTit} dataRes={SidplanList} handleEventPopup={this.handleEventPopup}></ScrollList>}
          </div>
        }
        {boxRight === 'unset' ?
          <div className={'animated'} style={{ position: 'absolute', transition: 'all .2s', zIndex: '9999', left: '0', bottom: scrollLength ? '-' + scrollLength + 'px' : '0' }}>
            <img style={{ cursor: 'pointer' }} title='收起' src={LCloseIcon} onClick={this.handleLeftClick} />
          </div> :
          <div className={'animated'} style={{ position: 'absolute', transition: 'all .2s', zIndex: '9999', right: '0', bottom: scrollLengthR ? '-' + scrollLengthR + 'px' : '0' }}>
            <img style={{ cursor: 'pointer' }} title='收起' src={RCloseIcon} onClick={this.handleRightClick} />
          </div>
        }
      </div>
    )
  }
}

export default SidePop
