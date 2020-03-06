import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import { Collapse, Icon, Progress, Checkbox, message } from 'antd';
import styles from './ScrollList.scss'
import classNames from 'classnames'
import $ from 'jquery'
import iconTrafficJam from '../../imgs/icon_traffic_jam.png'
import iconBuild from '../../imgs/icon_build.png'
import iconWeather from '../../imgs/icon_weather.png'
import iconAccidents from '../../imgs/icon_accidents.png'
const { Panel } = Collapse;
class ScrollList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listType: this.props.type, // 类型
      data: this.props.dataRes, // 数据
      dataAll: this.props.dataAll, // 总数据
      listTit: this.props.Tit, // 模块标题
      listTitle: this.props.Title, // 标题名
      eachartData: this.props.eachartData,
      sideachart: null,
      ProgressData: this.props.ProgressData,
      typeNow: 0, //选中的是哪个模块  1；2；3；4；
      one: false,
      two: false,
      three: false,
      four: false,
    }
    this.eachartLength = 0
    this.ProgressLength = 0
  }
  componentDidMount = () => {
    const { eachartData, ProgressData } = this.props
    if (eachartData) {
      const data = []
      this.eachartLength = 0
      eachartData.forEach((item) => {
        this.eachartLength += item.total
        data.push({ value: item.total, name: item.name })
      })
      this.getOption(data)
    }
    if (ProgressData) {
      this.ProgressLength = 0
      ProgressData.forEach((item) => {
        this.ProgressLength += item.count
      })
    }
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.eachartData !== nextProps.eachartData) {
      if (nextProps.eachartData) {
        const data = []
        this.eachartLength = 0
        nextProps.eachartData.forEach((item) => {
          this.eachartLength += item.total
          data.push({ value: item.total, name: item.name })
        })
        this.getOption(data)
      }
      this.setState({ eachartData: nextProps.eachartData })
    }
    if (this.props.ProgressData !== nextProps.ProgressData) {
      if (nextProps.ProgressData) {
        this.ProgressLength = 0
        nextProps.ProgressData.forEach((item) => {
          this.ProgressLength += item.count
        })
      }
      this.setState({ ProgressData: nextProps.ProgressData })
    }
    if (this.props.dataRes !== nextProps.dataRes) {
      this.setState({ data: nextProps.dataRes })
    }
    if (this.props.dataAll !== nextProps.dataAll) {
      this.setState({ dataAll: nextProps.dataAll })
    }
  }
  getOption = (data) => {
    const option = {
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          label: {
            normal: {
              position: 'inner',
              show: false
            }
          },
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
            normal: {
              color: function (params) {
                //自定义颜色
                var colorList = [
                  '#74ccd3', '#2762a5', '#5cff6b', '#2777a5', '#74ccd3',
                ];
                return colorList[params.dataIndex]
              }
            }
          }
        },

      ],

    }
    this.setState({ sideachart: option })
  }
  callback = (key) => {
    console.log(key);

  }
  handleEventPopup = (e, type, boolean) => {
    console.log(type);

    if (type === 'Details') {
      const listItem = document.getElementsByClassName('listItem')
      if (e.currentTarget.style.background === '#74ccd3') {
        e.currentTarget.style.background = ''
      } else {
        for (let i = 0; i < listItem.length; i++) {
          listItem[i].style.background = ''
        }
        e.currentTarget.style.background = '#74ccd3'
        window.listItemDom = e.currentTarget
      }
    }

    const { handleEventPopup } = this.props
    if (handleEventPopup) {
      handleEventPopup(type, boolean)
    }
  }
  formatDuring = (mss) => {
    if (mss <= 0) {
      return '已超时'
    } else {
      var days = parseInt(mss / (1000 * 60 * 60 * 24));
      const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = (mss % (1000 * 60)) / 1000;
      return days + '天' + hours + "时" + minutes + "分" + seconds + '秒';
    }
  }
  getDate = (time) => {
    const today = new Date(time)
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '.' + month + '.' + day + '' + ' ' + hour + ':' + minutes + ':' + seconds
    return navtime
  }
  genExtra = (data, name) => (
    <Icon
      type="setting"
      onClick={(event) => {
        event.stopPropagation()
        this.handleEventPopup('', name, data)
      }}
    />
  )
  checkBoxClick = event => {
    this.setState({
      typeNow:$(event.currentTarget).attr('nowtype')
    },() =>{
    const type = this.state.typeNow
    switch(type){
      case "1":
        const dataLength = this.state.dataAll[0].eventData.length
        !this.state.one ? this.setState({one: true},()=>{dataLength > 0 ? window.leftModuleOne.show() : message.info('暂无数据！')}):this.setState({one: false},()=>{window.leftModuleOne.hide()})
        break;
      case "2":
        const dataLength1 = this.state.dataAll[1].eventData.length
        !this.state.two ? this.setState({two: true},()=>{dataLength1 > 0 ? window.leftModuleTwo.show() : message.info('暂无数据！')}):this.setState({two: false},()=>{window.leftModuleTwo.hide()})
        break;
      case "3":
        const dataLength2 = this.state.dataAll[2].eventData.length
        !this.state.three ? this.setState({three: true},()=>{dataLength2 > 0 ? window.leftModuleThree.show() : message.info('暂无数据！')}):this.setState({three: false},()=>{window.leftModuleThree.hide()})
        break;
      case "4":
        const dataLength3 = this.state.dataAll[3].eventData.length
        !this.state.four ? this.setState({four: true},()=>{dataLength3 > 0 ? window.leftModuleFour.show() : message.info('暂无数据！')}):this.setState({four: false},()=>{window.leftModuleFour.hide()})
        break;
    }
    })
  }
  
  render() {
    const { listType, listTit, listTitle, ProgressData, data, eachartData, sideachart } = this.state
    return (
      <div className={styles.scrollBox}>
        {listType === '1' &&
          <div>
            {/*  <Icon type="setting" className={styles.setting} onClick={(e) => { this.handleEventPopup(e, 'Event', true) }} /> */}
            <div className={styles.settingTitle}><span><i />未管控</span><span><i />已管控</span></div>
            <Collapse
              defaultActiveKey={['1']}
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Icon type="pie-chart" />
              <Panel header="事件监视" key="1">

                <div className={styles.eachartsBox}>
                  <div className={styles.leftEacharts}>
                    {!!sideachart && <ReactEcharts option={sideachart} style={{ height: '100px', width: '100%' }} />}
                  </div>
                  <div className={styles.rightInfoBox}>
                    <p>重大事件 {this.eachartLength}起 </p>
                    <p>
                      {!!eachartData && eachartData.map((item) => {
                        return <span key={item.total + item.name}>{item.total}<br />{item.name}</span>
                      })}
                      {/* <span>30<br />交通拥堵</span>
                      <span>80<br />道路施工</span>
                      <span>20<br />极端天气</span>
                      <span>10<br />交通事故</span> */}
                    </p>
                  </div>
                </div>
              </Panel>

            </Collapse>
          </div>
        }
        {listType === '2' &&
          <div>
            {/*  <Icon type="setting" className={styles.setting} onClick={(e) => { this.handleEventPopup(e, 'Control', true) }} /> */}
            <Collapse
              defaultActiveKey={['1']}
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Icon type="appstore" />
              <Panel header="管控方案管理" key="1">
                <div>
                  <div className={styles.ProgressTotal}><em>管控方案发布管理</em>方案总数:{this.ProgressLength}</div>
                  {
                    ProgressData && ProgressData.map((item) => {
                      return (
                        <div className={styles.ProgressBox}><em>{item.name}</em><Progress strokeColor={`rgba(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)}`} percent={item.count} format={percent => `${item.count}`} status="active" /></div>
                      )
                    })
                  }
                  {/* <div className={styles.ProgressTotal}><em>管控方案发布管理</em>方案总数：16</div>
                  <div className={styles.ProgressBox}><em>待发布</em><Progress strokeColor="#ed7d30" showInfo="false" percent={18.75} format={percent => `${3}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>请求发布</em><Progress strokeColor="#34baff" percent={25} format={percent => `${4}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>已发布</em><Progress strokeColor="#f4ea2a" percent={12.5} format={percent => `${2}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>撤销</em><Progress strokeColor="#6d6e6e" percent={6.25} format={percent => `${1}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>延时</em><Progress strokeColor="#ef6c77" percent={6.25} format={percent => `${1}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>完成</em><Progress strokeColor="#619540" percent={31.25} format={percent => `${5}`} status="active" /></div> */}
                </div>
              </Panel>
            </Collapse>
          </div>
        }
        {listType === '3' &&
          <div>
            <Checkbox.Group style={{position: "absolute",zIndex: 9,left: "12px",top: "12px"}} nowtype={listTitle.type} options ={[{ label: '', value: listTitle }]} onClick={this.checkBoxClick} />
            <Collapse
              onChange={this.callback}
              expandIconPosition="right"
            >
              {listTitle.type === 1 &&
                <img className={styles.iconImg} src={ iconTrafficJam } />
              }
              {listTitle.type === 2 &&
                <img className={styles.iconImg} src={ iconBuild } />
              }
              {listTitle.type === 3 &&
                <img className={styles.iconImg} src={ iconWeather } />
              }
              {listTitle.type === 4 &&
                <img className={styles.iconImg} src={ iconAccidents } />
              }
              <Panel header={listTit} key="2" extra={this.genExtra(listTitle, 'Event')}>
                <div className={styles.listBox}>
                  {listTitle &&
                    <div className={styles.listItem}>
                      <i />
                      <span className={styles.tit}>{listTitle.id}</span>
                      <span className={styles.tit}>{listTitle.roadName}</span>
                      <span className={styles.tit}>{listTitle.upTime}</span>
                      <span className={styles.tit}>{listTitle.traffic}</span>
                      <span>{listTitle.state}</span>
                    </div>
                  }
                  {data && data.map((item, index) => (
                    <div key={item.roadCode + item.locs} className={classNames(styles.listItem, 'listItem')} onClick={(e) => { this.handleEventPopup(e, 'Details', item) }}>
                      <i style={{ background: item.controlStatusType>0 ? 'green' : 'red', boxShadow: item.controlStatusType > 0 ? 'green 0px 0px 20px' : 'red 0px 0px 20px' }} />
                      <span>{item.roadCode}</span>
                      <span title={item.locs}>{item.locs}</span>
                      <span>{item.directionName}</span>
                      <span>{item.situation}</span>
                      <span>{this.getDate(item.updateTime)}</span>
                    </div>
                  ))
                  }
                </div>
              </Panel>
            </Collapse>
          </div>
        }
        {listType === "4" &&
          <div>
            <Collapse
              onChange={this.callback}
              expandIconPosition="right"
            >
              {/* <Icon type="menu-unfold" /> */}
              {/*   <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'accidentCheck') }}>
                <Checkbox value={1} />
              </Checkbox.Group> */}
              <Panel header={listTit} key="2" extra={this.genExtra(listTitle, 'Control')}>
                <div className={styles.listBox}>
                  {listTitle &&
                    <div className={styles.listItem}>
                      <span className={styles.tit}>{listTitle.id}</span>
                      <span className={styles.tit}>{listTitle.roadName}</span>
                      <span className={styles.tit}>{listTitle.upTime}</span>
                      <span className={styles.tit}>{listTitle.traffic}</span>
                      <span>{listTitle.state}</span>
                    </div>
                  }
                  {data && data.map((item, index) => (
                    <div key={item.eventId + item.roadName} className={classNames(styles.listItem, 'listItem')} >
                      <span>{item.eventId}</span>
                      <span title={item.roadName}>{item.roadName}</span>
                      <span>{this.formatDuring(new Date(item.endTime).getTime() - new Date(item.startTime).getTime())}</span>
                      <span>{this.formatDuring(new Date().getTime() - new Date(item.endTime).getTime())}</span>
                      <span>{item.planStatusName}</span>
                    </div>
                  ))
                  }
                </div>
              </Panel>
            </Collapse>
          </div>
        }
      </div>
    )
  }
}

export default ScrollList
