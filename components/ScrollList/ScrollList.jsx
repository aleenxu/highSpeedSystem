import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import { Collapse, Icon, Progress } from 'antd';
import styles from './ScrollList.scss'

const { Panel } = Collapse;
function callback(key) {
  console.log(key);
}

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
    }
  }
  componentDidMount = () => {

  }
  getOption = () => {
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
          data: [
            { value: 30, name: '交通拥堵' },
            { value: 80, name: '道路施工' },
            { value: 20, name: '极端天气' },
            { value: 10, name: '交通事故' }
          ],
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
                  '#74ccd3', '#2762a5', '#5cff6b', '#2777a5',
                ];
                return colorList[params.dataIndex]
              }
            }
          }
        },

      ],

    }
    return option
  }
  render() {
    const { listType, listTit, listTitle, data } = this.state
    return (
      <div>
        {listType === "1" &&
          <div>
            <Collapse
              defaultActiveKey={['1']}
              onChange={callback}
              expandIconPosition="right"
            >
              <Icon type="pie-chart" /><Panel header="事件监视" key="1">
                <div className={styles.eachartsBox}>
                  <div className={styles.leftEacharts}>
                    <ReactEcharts option={this.getOption()} style={{ height: '100px', width: '100%' }} />
                  </div>
                  <div className={styles.rightInfoBox}>
                    <p>重大事件 140起 <span>详情 ></span></p>
                    <p>
                      <span>30<br />交通拥堵</span>
                      <span>80<br />道路施工</span>
                      <span>20<br />极端天气</span>
                      <span>10<br />交通事故</span>
                    </p>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>
        }
        {listType === "2" &&
          <div>
            <Collapse
              defaultActiveKey={['1']}
              onChange={callback}
              expandIconPosition="right"
            >
              <Icon type="appstore" /><Panel header="管控方案管理" key="1">
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
              onChange={callback}
              expandIconPosition="right"
            >
              <Icon type="menu-unfold" /><Panel header={listTit} key="2">
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
                    <div className={styles.listItem}>
                      <span>{item.id}</span>
                      <span title={item.roadName}>{item.roadName}</span>
                      <span>{item.upTime}</span>
                      <span>{item.traffic}</span>
                      <span>{item.state}</span>
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
