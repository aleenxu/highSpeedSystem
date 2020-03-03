import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import { Collapse, Icon, Progress, Checkbox } from 'antd';
import styles from './ScrollList.scss'
import classNames from 'classnames'
const { Panel } = Collapse;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
class ScrollList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listType: this.props.type, // 类型
      data: this.props.dataRes, // 数据
      listTit: this.props.Tit, // 模块标题
      listTitle: this.props.Title, // 标题名
      eachartData: this.props.eachartData,
      sideachart: null,
    }
  }
  componentDidMount = () => {
    const { eachartData } = this.props
    if (eachartData) {
      const data = []
      eachartData.forEach((item) => {
        data.push({ value: item.total, name: item.name })
      })
      this.getOption(data)
    }
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.eachartData !== nextProps.eachartData) {
      if (nextProps.eachartData) {
        const data = []
        nextProps.eachartData.forEach((item) => {
          data.push({ value: item.total, name: item.name })
        })
        this.getOption(data)
      }
      this.setState({ eachartData: nextProps.eachartData })
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
  genExtra = (data) => (
    <Icon
      type="setting"
      onClick={(event) => {
        event.stopPropagation()
        this.handleEventPopup('', 'Event', data)
      }}
    />
  )
  render() {
    const { listType, listTit, listTitle, data, eachartData, sideachart } = this.state
    return (
      <div className={styles.scrollBox}>
        {listType === "1" &&
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
                    <p>重大事件 140起 </p>
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
        {listType === "2" &&
          <div>
            {/*  <Icon type="setting" className={styles.setting} onClick={(e) => { this.handleEventPopup(e, 'Control', true) }} /> */}
            <Collapse
              defaultActiveKey={['1']}
              onChange={this.callback}
              expandIconPosition="right"
            >
              <Icon type="appstore" />
              <Panel header="管控方案管理" key="1" extra={this.genExtra()}>
                <div>
                  <div className={styles.ProgressTotal}><em>管控方案发布管理</em>方案总数：16</div>
                  <div className={styles.ProgressBox}><em>待发布</em><Progress strokeColor="#ed7d30" showInfo="false" percent={18.75} format={percent => `${3}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>请求发布</em><Progress strokeColor="#34baff" percent={25} format={percent => `${4}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>已发布</em><Progress strokeColor="#f4ea2a" percent={12.5} format={percent => `${2}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>撤销</em><Progress strokeColor="#6d6e6e" percent={6.25} format={percent => `${1}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>延时</em><Progress strokeColor="#ef6c77" percent={6.25} format={percent => `${1}`} status="active" /></div>
                  <div className={styles.ProgressBox}><em>完成</em><Progress strokeColor="#619540" percent={31.25} format={percent => `${5}`} status="active" /></div>
                </div>
              </Panel>
            </Collapse>
          </div>
        }
        {!listType &&
          <div>
            <Collapse
              onChange={this.callback}
              expandIconPosition="right"
            >
              {/* <Icon type="menu-unfold" /> */}
              {/*   <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'accidentCheck') }}>
                <Checkbox value={1} />
              </Checkbox.Group> */}
              <Panel header={listTit} key="2" extra={this.genExtra(listTitle)}>
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
                    <div key={item.roadCode + item.locs} className={classNames(styles.listItem, 'listItem')} onClick={(e) => { this.handleEventPopup(e, 'Details', true) }}>
                      <i style={{ background: index / 2 ? 'green' : 'red', boxShadow: index / 2 ? 'green 0px 0px 20px' : 'red 0px 0px 20px' }} />
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
      </div>
    )
  }
}

export default ScrollList
