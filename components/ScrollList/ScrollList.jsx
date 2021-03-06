import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import { Collapse, Icon, Progress, Checkbox, message, Badge } from 'antd';
import styles from './ScrollList.scss'
import classNames from 'classnames'
import $ from 'jquery'
import iconTrafficJam from '../../imgs/icon_traffic_jam.png'
import iconBuild from '../../imgs/icon_build.png'
import iconWeather from '../../imgs/icon_weather.png'
import iconAccidents from '../../imgs/icon_accidents.png'
import iconTagging from '../../imgs/icon_tagging.png'
const { Panel } = Collapse
class ScrollList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listType: this.props.type, // 类型
      data: this.props.dataRes, // 数据
      dataAll: this.props.dataAll, // 总数据
      listTit: this.props.Tit, // 模块标题
      listTitle: this.props.Title, // 标题名
      eachartData: this.props.eachartData || [],
      sideachart: null,
      ProgressData: this.props.ProgressData,
      typeNow: 0, //选中的是哪个模块  1；2；3；4；
      one: false,
      two: false,
      three: false,
      four: false,
      five: false,
      userLimit: [],
    }
    this.eachartLength = 0
    this.ProgressLength = 0
    this.examineLength = 0
  }
  componentDidMount = () => {
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    this.setState({ userLimit })
    const { eachartData, ProgressData } = this.props
    if (eachartData) {
      const data = []
      this.eachartLength = 0
      eachartData.forEach((item) => {
        this.eachartLength += item.total
        window[item.eventTypeName] = item.total
        data.push({ value: item.total, name: item.eventTypeName })
      })

      this.getOption(data)
    }
    if (ProgressData) {
      this.ProgressLength = 0
      this.examineLength = 0
      ProgressData.forEach((item) => {
        this.ProgressLength += item.total
        // 获取待审核数量
        /*  if (item.code === 2 || item.code === 4) {
           this.examineLength += item.total
         } */
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
          window[item.eventTypeName] = item.total
          data.push({ value: item.total, name: item.eventTypeName })
        })
        this.getOption(data)
      }
      this.setState({ eachartData: nextProps.eachartData })
    }
    if (this.props.ProgressData !== nextProps.ProgressData) {
      if (nextProps.ProgressData) {
        this.ProgressLength = 0
        this.examineLength = 0
        nextProps.ProgressData.forEach((item) => {
          this.ProgressLength += item.total
          // 获取待审核数量
          /* if (item.code === 2 || item.code === 4) {
            this.examineLength += item.total
          } */
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
  getLineCenterPoint = (latlng) => {
    let newCenter = []
    if (latlng && latlng.length > 1) {
      const startPoint = Math.abs(latlng[0][0] - latlng[latlng.length - 1][0]) / 2
      const endPoint = Math.abs(latlng[0][1] - latlng[latlng.length - 1][1]) / 2
      if (latlng[0][0] > latlng[latlng.length - 1][0]) {
        newCenter[0] = startPoint + Number(latlng[latlng.length - 1][0])
      } else {
        newCenter[0] = startPoint + Number(latlng[0][0])
      }
      if (latlng[1][1] > latlng[latlng.length - 1][1]) {
        newCenter[1] = endPoint + Number(latlng[latlng.length - 1][1])
      } else {
        newCenter[1] = endPoint + Number(latlng[0][1])
      }
    }
    return newCenter
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
                  '#ed7e2f', '#35baff', '#f3ea29', '#619540', '#f06c79',
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
  }
  handleEventPopup = (e, type, boolean) => {
    // console.log($(e.target).parent().attr("latlng"), '当前')
    window.centerPoint = $(e.target).parent().attr("latlng");
    const { handleEventPopup } = this.props
    if (type === 'Details') {
      if (window.infoWindowClose) {
        window.infoWindowClose.close()
      }
      const listItem = document.getElementsByClassName('listItem')
      if (e.currentTarget.style.background === '#0d2645') {
        e.currentTarget.style.background = ''
      } else {
        for (let i = 0; i < listItem.length; i++) {
          listItem[i].style.background = ''
        }
        $('#deviceBox').attr('style', 'transition:all .5s;')
        e.currentTarget.style.background = '#0d2645'
        window.listItemDom = e.currentTarget
        /* handleEventPopup('setTimeOut', boolean) */
      }
    }
    if (handleEventPopup) {
      handleEventPopup(type, boolean)
      // this.checkBoxClick()
      // console.log($($('.ant-checkbox-input')), '多少个')

    }
  }
  formatDuring = (mss) => {
    if (mss === null) {
      return '--'
    } else if (mss <= 0) {
      return '已超时'
    } else {
      // var days = parseInt(mss / (1000 * 60 * 60 * 24));
      // const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const hours = parseInt((mss / (1000 * 60 * 60)))
      const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
      // const seconds = (mss % (1000 * 60)) / 1000;
      return hours + "时" + minutes + "分"
    }
  }
  getDate = (time) => {
    const today = new Date(time)
    // const year = today.getFullYear()
    // const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    // const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = day + '日' + hour + '时' + minutes + '分'
    return navtime
  }
  getColor = (index) => {
    if (index === 1) {
      return '#ed7e2f'
    } else if (index === 2) {
      return '#35baff'
    } else if (index === 3) {
      return '#f3ea29'
    } else if (index === 4) {
      return '#35bb'
    } else if (index === 5) {
      return '#619540'
    } else if (index === 6) {
      return '#6d6f6e'
    } else if (index === 7) {
      return '#f06c79'
    }
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
  genExtraexamine = () => (
    <Badge count={this.examineLength} title="待审核与待撤销总数">
      <Icon
        type="solution"
        className="BadgeIcon"
        onClick={(event) => {
          event.stopPropagation()
          let boolean = false
          if ($('.BadgeIcon').css('color') == 'rgb(53, 186, 255)') {
            $('.BadgeIcon').css({ color: 'rgb(255, 255, 255)' })
            boolean = false
          } else {
            $('.BadgeIcon').css({ color: 'rgb(53, 186, 255)' })
            boolean = true
          }
          this.handleEventPopup('', 'examine', boolean)
        }}
      />
    </Badge>
  )
  checkBoxClick = event => {
    let checkArr = []
    checkArr.push(event)
    setTimeout(() => {
      checkArr.map((item) => {
        // item.target.checked = false
        // console.log(item, '看看效果')
      })
      // this.setState({
      //   one: false,
      //   two: false,
      //   three: false,
      //   four: false,
      //   five: false,
      // })
    }, 3000)
    // debugger
    // console.log(event, this.state.listTitle, event.target.checked)
    this.setState({
      typeNow: event.target.nowtype
    }, () => {
      const type = this.state.typeNow
      switch (this.state.typeNow) {
        case 1:
          const dataLength = event.target.nowLength
          !this.state.one ? this.setState({ one: true }, () => { dataLength > 0 ? window.leftModule0.show() : message.info('暂无数据！') }) : this.setState({ one: false }, () => { window.leftModule0.hide() })
          break;
        case 2:
          const dataLength1 = event.target.nowLength
          !this.state.two ? this.setState({ two: true }, () => { dataLength1 > 0 ? window.leftModule1.show() : message.info('暂无数据！') }) : this.setState({ two: false }, () => { window.leftModule1.hide() })
          break;
        case 3:
          const dataLength2 = event.target.nowLength
          !this.state.three ? this.setState({ three: true }, () => { dataLength2 > 0 ? window.leftModule2.show() : message.info('暂无数据！') }) : this.setState({ three: false }, () => { window.leftModule2.hide() })
          break;
        case 4:
          const dataLength3 = event.target.nowLength
          !this.state.four ? this.setState({ four: true }, () => { dataLength3 > 0 ? window.leftModule3.show() : message.info('暂无数据！') }) : this.setState({ four: false }, () => { window.leftModule3.hide() })
          break;
        case 5:
          const dataLength4 = event.target.nowLength
          !this.state.five ? this.setState({ five: true }, () => { dataLength4 > 0 ? window.leftModule4.show() : message.info('暂无数据！') }) : this.setState({ five: false }, () => { window.leftModule4.hide() })
          break;
      }
    })
  }

  render() {
    const { typeNow, listType, listTit, listTitle, ProgressData, data, eachartData, sideachart, userLimit } = this.state
    return (
      <div className={styles.scrollBox}>
        {listType === '1' &&
          <div>
            <div className={styles.settingTitle}><span><i />未管控</span><span><i />已管控</span></div>
            <Icon style={{ left: '10px', top: '15px', position: 'absolute', zIndex: '999', color: 'white' }} type="pie-chart" />
            <Collapse
              defaultActiveKey={['1']}
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Panel header="事件监视" key="1">
                <div className={styles.eachartsBox}>
                  <div className={styles.leftEacharts}>
                    {!!sideachart && <ReactEcharts option={sideachart} style={{ height: '100px', width: '100%' }} />}
                  </div>
                  <div className={styles.rightInfoBox}>
                    <p style={{ fontSize: '12px' }}>重大事件 {this.eachartLength}起 </p>
                    <p>
                      {!!eachartData && eachartData.map((item) => {
                        return <span key={item.total + item.eventTypeName}>{item.total}<br />{item.eventTypeName}</span>
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
            <Icon style={{ left: '10px', top: '15px', position: 'absolute', zIndex: '999', color: 'white' }} type="appstore" />
            <Collapse
              defaultActiveKey={['1']}
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Panel header="管控方案管理" key="1" extra={userLimit.includes(101) ? this.genExtraexamine() : null}>
                <div>
                  <div className={styles.ProgressTotal}><em>管控方案发布管理</em>方案总数&nbsp;:&nbsp;{this.ProgressLength}</div>
                  {
                    ProgressData && ProgressData.map((item) => {
                      return (
                        <div key={item.codeName + item.total} className={styles.ProgressBox}><em>{item.codeName}</em><Progress strokeColor={this.getColor(item.planStatus)} percent={this.ProgressLength ? item.total / this.ProgressLength * 100 : 0} format={_ => `${item.total}`} status="active" /></div>
                      )
                    })
                  }
                </div>
              </Panel>
            </Collapse>
          </div>
        }
        {listType === '3' &&
          <div>
            <Checkbox defaultChecked={this.state.one} style={{
              position: "absolute", zIndex: 9, paddingLeft: "12px", paddingRight: "12px", top: "12px",
              paddingBottom: '13px', background: 'rgba(19, 27, 37, 0.8)',
            }} nowLength={(window[listTit] || 0)} nowtype={listTitle.type} onChange={this.checkBoxClick} />
            {/* <Checkbox.Group style={{
              position: "absolute", zIndex: 9, paddingLeft: "12px", top: "12px", borderBottom: '1px #fff solid',
              paddingBottom: '13px'
            }} nowtype={listTitle.type} defaultValue={['1']} options={['1','2','3','4','5']} onClick={this.checkBoxClick} /> */}
            {listTitle.type === 1 &&
              <img className={styles.iconImg} src={iconTrafficJam} />
            }
            {listTitle.type === 2 &&
              <img className={styles.iconImg} src={iconBuild} />
            }
            {listTitle.type === 3 &&
              <img className={styles.iconImg} src={iconWeather} />
            }
            {listTitle.type === 4 &&
              <img className={styles.iconImg} src={iconAccidents} />
            }
            {listTitle.type === 5 &&
              <img className={styles.iconImg} src={iconTagging} />
            }
            <Collapse
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Panel header={listTit + ' ( ' + (window[listTit] || 0) + ' )'} key="1" extra={this.genExtra(listTitle, 'Event')}>
                {data.systemEnabled ?
                  <div className={styles.listBox}>
                    {listTitle &&
                      <div className={styles.listItem}>
                        <i />
                        <span className={styles.tit}>{listTitle.id}</span>
                        <span className={styles.tit}>{listTitle.roadName}</span>
                        <span className={styles.tit}>{listTitle.upTime}</span>
                        <span className={styles.tit}>{listTitle.traffic}</span>
                        <span className={styles.tit}>{listTitle.state}</span>
                      </div>
                    }
                    {data.eventInfos.length > 0 ? data.eventInfos.map((item, index) => (
                      <div key={item.eventNum} className={classNames(styles.listItem, 'listItem')} latlng={this.getLineCenterPoint(item.latlng)} onClick={(e) => { this.handleEventPopup(e, 'Details', item) }}>
                        <i style={{ background: item.planSource > 0 ? 'green' : 'red', boxShadow: item.planSource > 0 ? 'green 0px 0px 20px' : 'red 0px 0px 20px' }} />
                        <span>{item.hwayCode}</span>
                        <span title={item.roadName}>{item.roadName}</span>
                        <span>{item.eventType === 6 ? '双方向' : item.roadDirectionName}</span>
                        <span>{item.showValue}</span>
                        <span>{this.getDate(item.reportTime)}</span>
                      </div>
                    )) : <p className={styles.PanelItemNone}>暂无数据</p>
                    }
                  </div> :
                  data.childs.map((items) => {
                    return (
                      <Collapse key={items.eventTypeName}>
                        <Panel header={items.eventTypeName + ` ( ${items.count} )`}>
                          <div className={styles.listBox}>
                            {listTitle &&
                              <div className={styles.listItem}>
                                <i />
                                <span className={styles.tit}>{listTitle.id}</span>
                                <span className={styles.tit}>{listTitle.roadName}</span>
                                <span className={styles.tit}>{listTitle.upTime}</span>
                                {/* <span className={styles.tit}>{listTitle.traffic}</span> */}
                                <span className={styles.tit}>{listTitle.state}</span>
                              </div>}
                            {items.eventInfos.length > 0 ? items.eventInfos.map((item, index) => (
                              <div key={item.eventNum} className={classNames(styles.listItem, 'listItem')} latlng={this.getLineCenterPoint(item.latlng)} onClick={(e) => { this.handleEventPopup(e, 'Details', item) }}>
                                <i style={{ background: item.planSource > 0 ? 'green' : 'red', boxShadow: item.planSource > 0 ? 'green 0px 0px 20px' : 'red 0px 0px 20px' }} />
                                <span>{item.hwayCode}</span>
                                <span title={item.roadName}>{item.roadName}</span>
                                <span>{item.eventType === 6 ? '双方向' : item.roadDirectionName}</span>
                                {/* <span>{item.showValue}</span> */}
                                <span>{this.getDate(item.reportTime)}</span>
                              </div>
                            )) : <p className={styles.PanelItemNone}>暂无数据</p>
                            }
                          </div>
                        </Panel>
                      </Collapse>
                    )
                  })
                }
              </Panel>
            </Collapse>
          </div>
        }
        {listType === '4' &&
          <div>
            <Collapse
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Panel header={listTit} key="2" extra={this.genExtra(listTitle, 'Control')}>
                <div className={styles.listBox}>
                  {listTitle &&
                    <div className={classNames(styles.listItem)}>
                      <span className={styles.tit}>{listTitle.id}</span>
                      <span className={styles.tit}>{listTitle.name}</span>
                      <span className={styles.tit}>{listTitle.roadName}</span>
                      <span className={styles.tit}>{listTitle.upTime}</span>
                      <span className={styles.tit}>{listTitle.time}</span>
                      <span className={styles.tit}>{listTitle.traffic}</span>
                      <span className={styles.tit}>{listTitle.state}</span>
                    </div>
                  }
                  <div style={{ maxHeight: 'calc(100vh - 385px)', overflow: 'auto' }}>
                    {data.length > 0 ? data.map((item, index) => (
                      <div key={item.planNum} className={classNames(styles.listItem, 'listItem')} onClick={(e) => { this.handleEventPopup(e, 'controldet', item) }} >
                        <span>{item.hwayCode}</span>
                        <span>{item.planName}</span>
                        <span>{item.planSourceName}</span>
                        <span>{item.roadDirectionName}</span>
                        <span>{this.formatDuring(item.controllLongTime)}</span>
                        <span>{this.formatDuring(item.surplusTime)}</span>
                        <span style={{ color: this.getColor(item.planStatus) }}>{item.planStatusName}</span>
                      </div>
                    )) : <p className={styles.PanelItemNone}>暂无数据</p>
                    }
                  </div>
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
