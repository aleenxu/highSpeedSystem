import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'
import classNames from 'classnames'
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import { Input, Checkbox, Radio, Icon, Switch, DatePicker, Collapse, Select } from 'antd'
const { Panel } = Collapse
const { Search } = Input
const { Option } = Select
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
      eventsPopup: null, // 事件检测过滤设置弹窗数据
      controlPopup: null, // 管控方案检测过滤设置
      detailsPopup: null,
      reservePopup: null,
      whethePopup: null,
      startValue: null,
      endValue: null,
      endOpen: false,
      groupType: null,
      SidePopLeft: null,
      groupStatus: null,
      planList: null,
      hwayList: null,
      VIboardPopup: null,
      roadNumber: null,
      conditionList: null,
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      plainOptionList: null,
    }
    this.eventQuery = {
      eventType: '',
      hWayId: '',
      roadName: '',
    }
    this.VIboardParameters = {
      deviceCode: '',
      deviceLocation: '',
      deviceName: '',
      deviceTypeId: '',
      roadCode: '',
      roadDirection: '',
      roadName: '',
    }
    this.planStatus = 0
    this.eventListUrl = '/control/event/list/events' // 根据条件查询所有事件
    this.groupTypeUrl = '/control/event/total/number/group/type' //  统计事件数量，根据事件状态分组
    this.groupStatusUrl = '/control/plan/total/number/group/status' // 统计方案数量，根据方案状态分组
    this.planListUrl = '/control/plan/list/' // {planStatus}'根据方案状态，查询方案集合，页面初始加载，查询所有，传0
    this.detailUrl = '/control/event/get/detail/' // {eventId}/{eventType}查看事件详情'
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.hwayUrl = '/control/road/list/hway' //  获取高速编号，用于下拉框'
    this.conditionUrl = '/control/device/list/condition' // {deviceTypeId} // 条件查询设备回显'
    this.controlUrl = '/control/plan/start/control' // 发起管控'
  }
  componentDidMount = () => {
    // 查询左侧列表数据
    this.handleEventList()
    // 查询饼图数据
    this.handlegroupType()
    // 查询右侧柱状图
    this.handleUrlAjax(this.groupStatusUrl, 'groupStatus')
    // 查询管控方案
    this.handleplanList()
    // 高速下拉
    this.handleUrlAjax(this.hwayUrl, 'hwayList')
  }
  onStartChange = (value) => {
    this.onPickerChange('startValue', value)
  }
  onEndChange = (value) => {
    this.onPickerChange('endValue', value)
  }
  onPickerChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }
  disabledStartDate = (startValue) => {
    const { endValue } = this.state
    if (!startValue || !endValue) {
      return false
    }
    return startValue.valueOf() > endValue.valueOf()
  }

  disabledEndDate = (endValue) => {
    const { startValue } = this.state
    if (!endValue || !startValue) {
      return false
    }
    return endValue.valueOf() <= startValue.valueOf()
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true })
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open })
  }
  // 控制事件检测过滤设置弹窗
  handleEventPopup = (type, boolean) => {
    console.log(type, boolean)
    if (type === 'Event') {
      if (boolean) {
        this.eventQuery = {
          eventType: boolean.type,
          hWayId: '',
          roadName: '',
        }
      }
      this.setState({
        eventsPopup: boolean,
      })
    }
    if (type === 'Control') {
      if (boolean) {
        this.planStatus = 0
        this.handlelistDetail('controlPopup', 14)
      } else {
        this.setState({
          controlPopup: boolean,
        })
      }
    }
    if (type === 'Details') {
      if (window.listItemDom && boolean === false) {
        window.listItemDom.style.background = ''
      }
      if (boolean) {
        this.handledetai(boolean)
      } else {
        this.setState({
          detailsPopup: false,
        })
      }
      /* this.setState({
        detailsPopup: boolean,
      }) */
    }
    if (type === 'Reserve') {
      this.setState({
        reservePopup: boolean,
      })
    }
    if (type === 'Whethe') {
      this.setState({
        whethePopup: boolean,
      })
    }
    if (type === 'VIboard') {
      this.setState({ VIboardPopup: boolean })
    }
    if (type === 'condition') {
      this.setState({ conditionList: boolean })
    }
  }
  genExtra = () => (
    <Icon
      type="setting"
      onClick={(event) => {
        event.stopPropagation()
        this.handleEventPopup('Reserve', true)
      }}
    />
  )
  genExtraAdd = (item) => (
    <Icon
      type="plus"
      onClick={(event) => {
        event.stopPropagation()
        this.VIboardParameters.deviceTypeId = item.dictCode
        this.getdeviceList(item)
        this.handlelistDetail('roadNumber', 1)
        this.handleEventPopup('VIboard', true)
      }}
    />
  )
  getdeviceList = (data) => {
    this.deviceList = []
    data.device.map((item) => {
      this.deviceList.push(item.deviceId)
    })
    console.log(this.deviceList, '==============111');

  }
  handleInput = (e, name, type) => {
    if (type === 'eventsPopup') {
      this.eventQuery[name] = e.target.value
    }
    if (type === 'VIboardPopup') {
      this.VIboardParameters[name] = e.target.value
    }
  }
  handleSelect = (value, name, type) => {
    if (type === 'eventsPopup') {
      this.eventQuery[name] = value
    }
    if (type === 'VIboardPopup') {
      this.VIboardParameters[name] = value
    }
  }
  handleradiog = (e, name) => {
    console.log(e, name, e.target.value);
    if (name === 'reportMinRange') {
      this.eventQuery[name] = e.target.value
    } else {
      this.planStatus = e.target.value
    }
  }
  handleCheckboxGroup = (value, name) => {
    console.log(value, name)
    if (name === 'eventLevel') {
      this.eventQuery[name] = value
    } else {
      this.eventQuery[name] = Boolean(value[0])
    }
  }
  // 获取左侧列表数据
  handleEventList = () => {
    getResponseDatas('get', this.eventListUrl, this.eventQuery).then((res) => {
      const result = res.data
      console.log(result)
      if (result.code === 200) {
        const { eventType } = this.eventQuery
        if (eventType) {
          const { SidePopLeft } = this.state
          window.dataAll = SidePopLeft
          SidePopLeft.forEach((item, index) => {
            if (item.eventType === eventType) {
              SidePopLeft[index].eventData = result.data
              SidePopLeft[index].eventLength = result.data.length
            }
          })
          console.log(SidePopLeft);
          this.setState({ eventsPopup: null, SidePopLeft })
        } else {
          this.setState({ eventsPopup: null, SidePopLeft: result.data })
        }
      }
    })
  }
  // 获取饼图数据
  handlegroupType = () => {
    getResponseDatas('get', this.groupTypeUrl).then((res) => {
      const result = res.data
      console.log(result)
      if (result.code === 200) {
        this.setState({ groupType: result.data })
      }
    })
  }
  // 获取右侧管控方案列表
  handleplanList = () => {
    getResponseDatas('get', this.planListUrl + this.planStatus).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ planList: result.data, controlPopup: false })
      }
    })
  }
  // 获取右侧事件详情
  handledetai = (item) => {
    getResponseDatas('get', this.detailUrl + item.eventId + '/' + item.eventType).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({
          detailsPopup: { ...result.data, controlStatusType: item.controlStatusType },
        })
      }
    })
  }
  // 字典查询
  handlelistDetail = (name, value) => {
    getResponseDatas('get', this.listDetailUrl + value).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  handleUrlAjax = (url, name) => {
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  // 可变情报板查询
  handleCondition = () => {
    getResponseDatas('get', this.conditionUrl, this.VIboardParameters).then((res) => {
      const result = res.data
      console.log(result.data)
      if (result.code === 200) {
        const plainOptionList = []
        result.data.map((item) => {
          if (!(this.deviceList.includes(item.deviceId))) {
            plainOptionList.push(item.deviceId)
          }
        })
        console.log(plainOptionList, '==========33');

        this.setState({ conditionList: result.data, plainOptionList })
      }
    })
  }
  getcheckedList = (checkedList) => {
    const { plainOptionList } = this.state
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < plainOptionList.length,
      checkAll: checkedList.length === plainOptionList.length,
    })
  }

  onCheckAllChange = (e) => {
    const { plainOptionList } = this.state
    this.setState({
      checkedList: e.target.checked ? plainOptionList : [],
      indeterminate: false,
      checkAll: e.target.checked,
    })
  }
  handledetailsPopupList = () => {
    const { checkedList, detailsPopup, conditionList } = this.state
    this.deviceList = [...this.deviceList, ...checkedList]
    console.log(this.deviceList, '============2222');

    const { deviceTypeId } = this.VIboardParameters
    conditionList.forEach((item) => {
      checkedList.forEach((items) => {
        if (item.deviceId === items) {
          detailsPopup.devices.forEach((itemss, index) => {
            if (itemss.dictCode === deviceTypeId) {
              detailsPopup.devices[index].device.push(item)
            }
          })
        }
      })
    })
    this.setState({ detailsPopup, conditionList: null, VIboardPopup: null })
  }
  handleSubDetailsPopupList = (ind, index) => {
    const { detailsPopup } = this.state
    detailsPopup.devices[ind].device.splice(index, 1)
    this.setState({ detailsPopup })
  }
  handleControl = () => {
    const { detailsPopup } = this.state
    const { eventId, eventType, pileNum, roadSecId, situation, devices } = detailsPopup
    const deviceAry = []
    devices.forEach((item) => {
      item.device.forEach((items) => {
        deviceAry.push({
          controlScope: items.controlScope ? items.controlScope : 0,
          deviceId: items.deviceId,
          deviceTypeId: items.deviceTypeId,
          pileNum: items.pileNum ? items.pileNum : 0,
        })
      })
    })
    const data = {
      createId: 1,
      devices: deviceAry,
      eventId,
      eventTypeId: eventType,
      pileNum,
      roadSecId,
      value: situation,
    }
    getResponseDatas('post', this.controlUrl, data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.handleEventList()
        this.handlegroupType()
        this.handleUrlAjax(this.groupStatusUrl, 'groupStatus')
        this.handleplanList()
        this.handledetai()
        this.handleEventPopup('Reserve', true)
      }
    })
  }
  handleViewControl = () => {
    this.handleEventPopup('Reserve', true)
  }
  render() {
    const {
      eventsPopup, groupType, planList, roadNumber, conditionList, hwayList, VIboardPopup, groupStatus, controlPopup, detailsPopup, whethePopup, reservePopup, startValue, endValue, endOpen, SidePopLeft
    } = this.state
    return (
      <div className={styles.MonitoringModule}>
        <SystemMenu />
        {!!reservePopup || <SidePop left="5px" groupType={groupType} SidePopLeft={SidePopLeft} handleEventPopup={this.handleEventPopup} />}
        {!!detailsPopup || <SidePop SidplanList={planList} groupStatus={groupStatus} right="5px" handleEventPopup={this.handleEventPopup} />}
        <GMap dataAll={SidePopLeft} />
        <div className={styles.searchBox}><Search id="tipinput" placeholder="请输入内容" enterButton /></div>
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
          <p>
            <em>收费站</em>
            <em>F屏情报板</em>
            <em>限速牌专用</em>
            <em>可变情报板</em>
          </p>
        </div>
        {/* 事件检测过滤设置弹窗 */}
        {eventsPopup && hwayList ?
          <div className={styles.MaskBox}>
            <div className={styles.EventPopup}>
              <div className={styles.Title}>{eventsPopup.name}事件过滤设置<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Event', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>高&nbsp;速&nbsp;名&nbsp;称&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'hWayId', 'eventsPopup') }}>
                      <Option value="">请选择</Option>
                      {
                        hwayList.map((item) => {
                          return <Option key={item.id} value={item.id}>{item.name}</Option>
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>道&nbsp;路&nbsp;名&nbsp;称&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Input onChange={(e) => { this.handleInput(e, 'roadName', 'eventsPopup') }} />
                  </div>
                </div>
                {/*  <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>事&nbsp;件&nbsp;类&nbsp;型&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'trafficCheck') }}>
                      <Checkbox value={1} >交通拥堵</Checkbox>
                    </Checkbox.Group>
                    <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'constructionCheck') }}>
                      <Checkbox value={1} >道路施工</Checkbox>
                    </Checkbox.Group>
                    <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'weatherCheck') }} >
                      <Checkbox value={1} >极端天气</Checkbox>
                    </Checkbox.Group>
                    <Checkbox.Group defaultValue={[1]} onChange={(e) => { this.handleCheckboxGroup(e, 'accidentCheck') }}>
                      <Checkbox value={1} >交通事故</Checkbox>
                    </Checkbox.Group>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>上&nbsp;报&nbsp;时&nbsp;间&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Radio.Group name="radiogroup" defaultValue={10} onChange={(e) => { this.handleradiog(e, 'reportMinRange') }}>
                      <Radio value={10}>十分钟以内</Radio>
                      <Radio value={30}>三十分钟以内</Radio>
                      <Radio value={0}>无限制</Radio>
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>事件严重程度:</span>
                  <div className={styles.ItemInput}>
                    <Checkbox.Group options={plainOptions} defaultValue={['1', '2', '3', '4']} onChange={(e) => { this.handleCheckboxGroup(e, 'eventLevel') }} />
                  </div>
                </div> */}
                <div className={styles.ItemFooter}>
                  <span onClick={this.handleEventList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('Event', false) }}>返&nbsp;&nbsp;回</span>
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
                  <span className={styles.ItemName}>方&nbsp;案&nbsp;状&nbsp;态&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Radio.Group name="radiogroup" defaultValue={0} onChange={(e) => { this.handleradiog(e) }}>
                      <Radio value={0}>全部</Radio>
                      {
                        controlPopup.map((item) => {
                          return <Radio key={item.id} value={item.id}>{item.name}</Radio>
                        })}
                      {/* 
                      <Radio value={1}>待发布</Radio>
                      <Radio value={2}>请求发布</Radio>
                      <Radio value={3}>发布中</Radio>
                      <Radio value={4}>撤销</Radio>
                      <Radio value={5}>延时</Radio>
                      <Radio value={6}>完成</Radio> */}
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span onClick={this.handleplanList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('Control', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div>
          </div> : null}
        {/* 事件详情 */}
        {/* {detailsPopup ?
          <div className={styles.MaskBox}>
            <div className={styles.DetailsBox}>
              <div className={styles.Title}>事件详情<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Details', false) }} type="close" /></div>
              <div className={styles.Content}>
                <div className={styles.Header}>
                  <span>事件编号&nbsp;:&nbsp;&nbsp;10001</span>
                  <span>事件类型&nbsp;:&nbsp;&nbsp;交通拥堵</span>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>基本信息</div>
                  <div className={styles.RowBox}>道路名称：G6告诉公路清河收费站</div>
                  <div className={styles.RowBox}>
                    <p>方向&nbsp;:&nbsp;&nbsp;北向南</p>
                    <p>车道&nbsp;:&nbsp;&nbsp;所有</p>
                  </div>
                  <div className={styles.RowBox}>
                    <p>起始公里桩号&nbsp;:&nbsp;&nbsp;K100+100 </p>
                    <p>结束公里桩号&nbsp;:&nbsp;&nbsp;K120+200</p>
                  </div>
                  <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;高德数据</div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>当前路况</div>
                  <div className={styles.RowBox}>
                    <p>拥堵级别&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>严重拥堵</span></p>
                    <p>平局车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>20kmh</span></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>天气情况</div>
                  <div className={styles.RowBox}>
                    <p>天气&nbsp;:&nbsp;&nbsp;<span style={{ color: '#ff7e00' }}>大雾</span></p>
                    <p>能见度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#ff7e00' }}>小于50米</span></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>道路施工</div>
                  <div className={styles.RowBox}>
                    <p>事件等级&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>重大</span></p>
                  </div>
                  <div className={styles.RowBox}>施工时间&nbsp;:&nbsp;&nbsp;2020-02-14  12:00:00   —  2020-02-15  12:00:00</div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>道路控制设备现状</div>
                  <div className={styles.RowBox}>
                    **地点断面可变情报板&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>小心驾驶/请勿超速</span>
                  </div>
                  <div className={styles.RowBox}>
                    **地点车道可变情报板&nbsp;:&nbsp;&nbsp;一车道限速&nbsp;:&nbsp;&nbsp; <span style={{ color: '#11e002' }}>100km/h</span>
                  </div>
                  <div className={styles.RowBox}>
                    <span style={{ width: '154px', display: 'inline-block' }} />
                    二车道限速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#11e002' }}>80km/h</span>
                  </div>
                  <div className={styles.RowBox}>
                    **地点断面可变情报板&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>应急车道禁止通行</span>
                  </div>
                  <div className={styles.RowBox}>
                    ****地点**收费站入口&nbsp;:&nbsp;&nbsp;<span style={{ color: '#11e002' }}>开放</span>
                  </div>
                  <div className={styles.RowBox}>
                    ****地点**收费站出口&nbsp;:&nbsp;&nbsp;<span style={{ color: '#11e002' }}>开放</span>
                  </div>
                </div>
                <div className={styles.ItemFooter}>
                  <span onClick={() => { this.handleEventPopup('Reserve', true) }}>查看管控预案</span>
                  <span onClick={() => { this.handleEventPopup('Details', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div>
          </div> : null} */}
        {/* 管控预案查询 */}
        {reservePopup ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.DetailsBox, styles.ReserveBox)}>
              <div className={styles.Title}>管控方案详情<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Reserve', false) }} type="close" /></div>
              <div className={styles.Content}>
                <div className={styles.Header}>
                  <span>事件编号&nbsp;:&nbsp;&nbsp;10001</span>
                  <span>事件类型&nbsp;:&nbsp;&nbsp;交通拥堵</span>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>基本信息</div>
                  <div className={styles.RowBox}>道路名称：G6告诉公路清河收费站</div>
                  <div className={styles.RowBox}>
                    <p>方向&nbsp;:&nbsp;&nbsp;北向南</p>
                    <p>车道&nbsp;:&nbsp;&nbsp;所有</p>
                  </div>
                  <div className={styles.RowBox}>
                    <p>起始公里桩号&nbsp;:&nbsp;&nbsp;K100+100 </p>
                    <p>结束公里桩号&nbsp;:&nbsp;&nbsp;K120+200</p>
                  </div>
                  <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;高德数据</div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>当前路况</div>
                  <div className={styles.RowBox}>
                    <p>拥堵级别&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>严重拥堵</span></p>
                    <p>平局车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>20kmh</span></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>天气情况</div>
                  <div className={styles.RowBox}>
                    <p>天气&nbsp;:&nbsp;&nbsp;<span style={{ color: '#ff7e00' }}>大雾</span></p>
                    <p>能见度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#ff7e00' }}>小于50米</span></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>道路施工</div>
                  <div className={styles.RowBox}>
                    <p>事件等级&nbsp;:&nbsp;&nbsp;<span style={{ color: '#b90303' }}>重大</span></p>
                  </div>
                  <div className={styles.RowBox}>施工时间&nbsp;:&nbsp;&nbsp;2020-02-14  12:00:00   —  2020-02-15  12:00:00</div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>可变情报板管控预案设置<span className={styles.AddItem} onClick={() => { this.handleEventPopup('Whethe', true) }}><Icon type="plus" />添加</span></div>
                  <div className={styles.RowBox}>
                    <Icon type="close-circle" className={styles.CloneItem} />**地点断面可变情报板&nbsp;:&nbsp;&nbsp;<p className={styles.ItemInput}><Input defaultValue="小心驾驶/请勿超速" /></p>
                  </div>
                  <div className={styles.RowBox}>
                    <Icon type="close-circle" className={styles.CloneItem} />**地点车道可变情报板&nbsp;:&nbsp;&nbsp;一车道限速&nbsp;:&nbsp;&nbsp; <p style={{ width: 105 }} className={styles.ItemInput}><Input defaultValue="100km/h" /></p>
                  </div>
                  <div className={styles.RowBox}>
                    <span style={{ width: '154px', display: 'inline-block' }} />
                    二车道限速&nbsp;:&nbsp;&nbsp;<p style={{ width: 105 }} className={styles.ItemInput}><Input defaultValue="80km/h" /></p>
                  </div>
                  <div className={styles.RowBox}>
                    <Icon type="close-circle" className={styles.CloneItem} />**地点断面可变情报板&nbsp;:&nbsp;&nbsp;<p className={styles.ItemInput}><Input defaultValue="应急车道禁止通行" /></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>收费站出入口管控设置<span className={styles.AddItem} onClick={() => { this.handleEventPopup('Whethe', true) }}><Icon type="plus" />添加</span></div>
                  <div className={styles.RowBox}>
                    <Icon type="close-circle" className={styles.CloneItem} />****地点**收费站入口&nbsp;:&nbsp;&nbsp;<p><Switch checkedChildren="开放" unCheckedChildren="关闭" /></p>
                  </div>
                  <div className={styles.RowBox}>
                    <Icon type="close-circle" className={styles.CloneItem} />****地点**收费站出口&nbsp;:&nbsp;&nbsp;<p><Switch checkedChildren="开放" unCheckedChildren="关闭" defaultChecked /></p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>管控时段<span className={styles.AddItem} onClick={() => { this.handleEventPopup('Whethe', true) }}><Icon type="plus" />添加</span></div>
                  <div className={styles.RowBox}>
                    起始时间&nbsp;:&nbsp;&nbsp;
                    <p className={styles.ItemInput}>
                      <DatePicker
                        disabledDate={this.disabledStartDate}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={startValue}
                        placeholder="开始时间"
                        onChange={this.onStartChange}
                        onOpenChange={this.handleStartOpenChange}
                      />
                    </p>
                  </div>
                  <div className={styles.RowBox}>
                    结束时间&nbsp;:&nbsp;&nbsp;
                    <p className={styles.ItemInput}>
                      <DatePicker
                        disabledDate={this.disabledEndDate}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={endValue}
                        placeholder="结束时间"
                        onChange={this.onEndChange}
                        open={endOpen}
                        onOpenChange={this.handleEndOpenChange}
                      />
                    </p>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>事件描述</div>
                  <div className={styles.RowBox}>
                    <div style={{ width: '100%' }} className={styles.ItemInput}><Input defaultValue="7:40京哈高速进京方向K100公里700米处，发生事故，占用左侧车道" /></div>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>发布渠道
                    <div style={{ marginLeft: '10px' }} className={styles.ItemInput}>
                      <Radio.Group defaultValue={1}>
                        <Radio value={1}>高德</Radio>
                        <Radio value={2}>可变情报表</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.ItemFooter}>
                <span onClick={() => { this.handleEventPopup('Reserve', false) }}>发&nbsp;&nbsp;布</span>
                <span onClick={() => { this.handleEventPopup('Reserve', false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
          </div> : null}
        {whethePopup ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.EventPopup, styles.WhethePopupr)}>
              <div className={styles.Title}>是否添加**地点**断面可变情报板至***管控预案?</div>
              <div className={styles.ItemFooter}>
                <span onClick={() => { this.handleEventPopup('Whethe', false) }}>确&nbsp;&nbsp;认</span>
                <span onClick={() => { this.handleEventPopup('Whethe', false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
          </div> : null}
        {/*  <div className={styles.MaskBox}>
          <div className={classNames(styles.EventPopup, styles.WhethePopupr)}>
            <div className={styles.Title} style={{ textIndent: 0, textAlign: 'center' }}>延时&nbsp;:<div className={classNames(styles.ItemInput, styles.WhetheInput)}><Input defaultValue="120" style={{ color: '#26ff6d' }} /></div>分钟</div>
            <div className={styles.ItemFooter}>
              <span onClick={() => { this.handleEventPopup('Whethe', false) }}>确&nbsp;&nbsp;认</span>
              <span onClick={() => { this.handleEventPopup('Whethe', false) }}>返&nbsp;&nbsp;回</span>
            </div>
          </div>
        </div> */}
        {detailsPopup ?
          <div className={styles.Eventdetails}>
            <Collapse
              defaultActiveKey={[0, 1, 2, 3]}
              expandIconPosition="right"
            >
              <Icon className={styles.Close} onClick={() => { this.handleEventPopup('Details', false) }} type="close" />
              <Panel header="事件详情" key={0}>
                <div className={styles.Content}>
                  <div className={styles.Header}>
                    <span>事件编号&nbsp;:&nbsp;&nbsp;{detailsPopup.eventId}</span>
                    <span>事件类型&nbsp;:&nbsp;&nbsp;{detailsPopup.eventTypeName}</span>
                  </div>
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>基本信息</div>
                    <div className={styles.RowBox}>道路名称&nbsp;:&nbsp;&nbsp;{detailsPopup.secName}</div>
                    <div className={styles.RowBox}>
                      <p>方向&nbsp;:&nbsp;&nbsp;{detailsPopup.directionName}</p>
                      <p>高速&nbsp;:&nbsp;&nbsp;{detailsPopup.roadName}</p>
                    </div>
                    <div className={styles.RowBox}>
                      <p>起始公里桩号&nbsp;:&nbsp;&nbsp;{detailsPopup.pileNum.split(' ')[0]}</p>
                      <p>结束公里桩号&nbsp;:&nbsp;&nbsp;{detailsPopup.pileNum.split(' ')[1]}</p>
                    </div>
                    <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;{detailsPopup.dataSourceName}</div>
                  </div>
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>当前路况</div>
                    <div className={styles.RowBox}>
                      {/*  <p>拥堵级别&nbsp;:&nbsp;&nbsp;<span style={{ color: '#e90202' }}>严重拥堵</span></p> */}
                      <p>平局车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#e90202' }}>{detailsPopup.situation}km/h</span></p>
                    </div>
                  </div>
                </div>
              </Panel>
              {
                detailsPopup.devices.map((item, ind) => {
                  return (
                    <Panel header={item.codeName} key={item.dictCode} extra={this.genExtraAdd(item)}>
                      <div className={styles.ScrollItem}> {/* 添加滚动条 */}
                        {
                          item.device && item.device.map((items, index) => {
                            return <div className={styles.PanelBox}><p className={styles.PanelItem} key={items}>{`${index + 1}. ${items.deviceName} ${items.directionName} ${item.codeName}`}</p><Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="minus" /></div>
                          })
                        }
                        {item.device && item.device.length === 0 && <p className={styles.PanelItemNone}>暂无数据</p>}
                      </div>
                    </Panel>
                  )
                })
              }
            </Collapse>
            <div className={styles.Panelbutton}>{detailsPopup.controlStatusType > 0 ? <span onClick={this.handleViewControl}>查看管控</span> : <span onClick={this.handleControl}>发起管控</span>}</div>
          </div> : null}
        {VIboardPopup ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.EventPopup, styles.VIboardPopup)}>
              <div className={styles.Title}>添加可变情报板<Icon className={styles.Close} onClick={() => { this.handleEventPopup('VIboard', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>道&nbsp;路&nbsp;编&nbsp;号&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadCode', 'VIboardPopup') }}>
                      <Option value="">请选择</Option>
                      {
                        hwayList && hwayList.map((item) => {
                          return <Option key={item.id} value={item.id}>{item.name}</Option>
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>道&nbsp;路&nbsp;名&nbsp;称&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Input onChange={(e) => { this.handleInput(e, 'roadName', 'VIboardPopup') }} />
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>道&nbsp;路&nbsp;方&nbsp;向&nbsp;:</span>
                  <div className={styles.ItemInput}>
                    <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadDirection', 'VIboardPopup') }} >
                      <Option value="">请选择</Option>
                      {
                        roadNumber && roadNumber.map((item) => {
                          return <Option key={item.id} value={item.id}>{item.name}</Option>
                        })
                      }
                    </Select>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>情报板编号:</span>
                  <div className={styles.ItemInput}>
                    <Input onChange={(e) => { this.handleInput(e, 'deviceCode', 'VIboardPopup') }} />
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>情报板名称:</span>
                  <div className={styles.ItemInput}>
                    <Input onChange={(e) => { this.handleInput(e, 'deviceName', 'VIboardPopup') }} />
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <span className={styles.ItemName}>情报板位置:</span>
                  <div className={styles.ItemInput}>
                    <Input onChange={(e) => { this.handleInput(e, 'deviceLocation', 'VIboardPopup') }} />
                  </div>
                </div>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span onClick={this.handleCondition}>查&nbsp;&nbsp;找</span>
                  <span onClick={() => { this.handleEventPopup('VIboard', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div>
          </div> : null}
        {conditionList ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.EventPopup, styles.VIboardPopup, styles.conditionPopup)}>
              <div className={styles.Title}>添加可变情报板<Icon className={styles.Close} onClick={() => { this.handleEventPopup('condition', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className="site-checkbox-all-wrapper">
                  <Checkbox
                    indeterminate={this.state.indeterminate}
                    onChange={this.onCheckAllChange}
                    checked={this.state.checkAll}
                  >
                    全选
                  </Checkbox>
                </div>
                <br />
                <Checkbox.Group
                  value={this.state.checkedList}
                  onChange={this.getcheckedList}
                >
                  {
                    conditionList.map((item) => {
                      return <Checkbox key={item.deviceId} disabled={this.deviceList.includes(item.deviceId)} value={item.deviceId}>{item.deviceName + '-' + item.directionName}</Checkbox>
                    })
                  }

                </Checkbox.Group>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span onClick={this.handledetailsPopupList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('condition', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div>
          </div> : null}
        {/* <div className={styles.EventTagging}>
          <div className={styles.Title}>事件标注<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Reserve', false) }} type="close" /></div>
          <div className={styles.Centent}>

          </div>
        </div> */}
      </div>
    )
  }
}

export default MonitoringModule
