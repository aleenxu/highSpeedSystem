import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'
import classNames from 'classnames'
import { Input, Checkbox, Radio, Icon } from 'antd';

const { Search } = Input;
const options = [
  { label: '交通拥堵', value: '1' },
  { label: '道路施工', value: '2' },
  { label: '极端天气', value: '3' },
  { label: '交通事故', value: '4' },
]
const plainOptions = [
  { label: '一级', value: '1' },
  { label: '二级', value: '2' },
  { label: '三级', value: '3' },
  { label: '四级', value: '4' },
]
class MonitoringModule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      eventPopup: null,// 事件检测过滤设置弹窗数据
      controlPopup: null, // 管控方案检测过滤设置
    }
  }
  componentDidMount = () => {

  }
  // 控制事件检测过滤设置弹窗
  handleEventPopup = (type, boolean) => {
    console.log(type, boolean);
    
    if (type === 'Event') {
      this.setState({
        eventPopup: boolean,
      })
    }
    if (type === 'Control') {
      this.setState({
        controlPopup: boolean,
      })
    }

  }
  render() {
    const { eventPopup, controlPopup } = this.state
    return (
      <div className={styles.MonitoringModule}>
        <SystemMenu />
        <SidePop left="5px" handleEventPopup={this.handleEventPopup} />
        <SidePop right="5px" handleEventPopup={this.handleEventPopup}/>
        <GMap />
        <div className={styles.searchBox}><Search placeholder="请输入内容" onSearch={value => console.log(value)} enterButton /></div>
        <div className={styles.mapIconManage}>
          <span>设备显示</span><span>事件标注</span>
        </div>
        <div className={styles.roadState}>
          <p><h5>路况</h5></p>
          <p>
            <span>严重拥堵</span>
            <span>拥挤</span>
            <span>缓行</span>
            <span>畅通</span>
          </p>
          <p><h5>事故地点</h5></p>
        </div>
        {/* 事件检测过滤设置弹窗 */}
        {eventPopup ?
          <div className={styles.MaskBox}>
            <div className={styles.EventPopup}>
              <div className={styles.Title}>事件检测过滤设置<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Event', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>道&nbsp;路&nbsp;名&nbsp;称&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Input />
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>事&nbsp;件&nbsp;类&nbsp;型&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Checkbox.Group options={options} defaultValue={['1', '3']} />
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>上&nbsp;报&nbsp;时&nbsp;间&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Radio.Group name="radiogroup" defaultValue={1}>
                      <Radio value={1}>十分钟以内</Radio>
                      <Radio value={2}>三十分钟以内</Radio>
                      <Radio value={3}>无限制</Radio>
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>时间严重程度:</span>
                  <div className={styles.ItemInput}>
                    <Checkbox.Group options={plainOptions} defaultValue={['2', '4']} />
                  </div>
                </div>
                <div className={styles.ItemFooter}>
                  <span onClick={() => { this.handleEventPopup('Event', false) }}>确认</span>
                  <span onClick={() => { this.handleEventPopup('Event', false) }}>返回</span>
                </div>
              </div>
            </div>
          </div> : null}
        {/* 管控方案检测过滤设置 */}
        {controlPopup ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.EventPopup, styles.ControlPopup)}>
              <div className={styles.Title}>管控方案检测过滤设置<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Control', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>上&nbsp;报&nbsp;时&nbsp;间&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Radio.Group name="radiogroup" defaultValue={1}>
                      <Radio value={1}>待发布</Radio>
                      <Radio value={2}>请求发布</Radio>
                      <Radio value={3}>发布中</Radio>
                      <Radio value={4}>撤销</Radio>
                      <Radio value={5}>延时</Radio>
                      <Radio value={6}>完成</Radio>
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.ItemFooter}>
                  <span onClick={() => { this.handleEventPopup('Control', false) }}>确认</span>
                  <span onClick={() => { this.handleEventPopup('Control', false) }}>返回</span>
                </div>
              </div>
            </div>
          </div> : null}
      </div>
    )
  }
}

export default MonitoringModule
