import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'
import eqStyle from '../EquipmentModule/EquipmentModule.scss'
import classNames from 'classnames'
import 'animate.css'
import audioSrc from '../../imgs/ppxmu.mp3'
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import drags from '../../plugs/drags'
import SearchInput from '../../components/SearchInput/SearchInput'
import { Input, Checkbox, Radio, Icon, Popover, Switch, DatePicker, Collapse, Select, Modal, message, Button, notification } from 'antd'
import moment from 'moment'
const { Panel } = Collapse
const { Search } = Input
const { Option } = Select
const { confirm } = Modal
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
window.newPoint = new Array(4).fill(null) // 绘制地图记录的点
class MonitoringModule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      eventsPopup: null, // 事件检测过滤设置弹窗数据
      controlPopup: null, // 管控方案检测过滤设置
      controlPopupList: null,
      detailsPopup: null,
      controlBtnFlag: null, // 管控按钮是否显示
      controlBtnFlagText: '框选设备', // 显示的名字
      reservePopup: null,
      whethePopup: null,
      startValue: null,
      endValue: null,
      endValueTime: null,
      endOpen: false,
      groupType: null,
      SidePopLeft: null,
      groupStatus: null,
      planList: null,
      hwayList: null, // 高速下拉
      directionList: null, // 方向下拉
      directionId: '',
      VIboardPopup: null,
      roadNumber: null,
      conditionList: null,
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      plainOptionList: null,
      EventTagPopup: null,
      EventTagPopupTit: '标题',
      detailsLatlng: null, // 详情路段的经纬度
      boxSelect: null, // 框选
      boxFlag: true, // 记录一次框选
      flagClose: false, // 是否清除绘图
      checkedListBox: [],
      indeterminateBox: true,
      checkAllBox: false,
      oldDevicesList: null, // 框选前右侧详情原数据
      boxSelectList: null, // 框选中的数据
      MeasuresList: [], // 管控措施下拉
      eventTypes: null, // 事件类型
      controlTypes: null, // 管控类型
      deviceTypes: null, // 设备类型
      updatePoint: null, // 更新坐标点
      eventType: 7, // 事件类型
      deviceString: [], // 交通设施参数
      importantId: '',
      lineLatlngArr: null,
      TimeData: null,
      directionName: '',
      deviceCodeList: null, // 查询管控方案详情方案五对应下拉
      deviceDetailList: [],
      deviceTollGate: true, // map中收费站匝道灯图标显示的图层
      deviceFInfoBoard: true, // map中F情报版显示的图层
      deviceInfoBoard: true, // map中车道控制器情报版限速显示的图层
      deviceTurnBoard: true, // map中门架情报板显示的图层
      carRoadBoard: true, // map中车道控制器显示的图层
      hwayDirection: [],
      roadDirection: '',
      InfoWinPopup: false,
      contingencyData: null, // 控制管控条件弹窗
      showFrameData: null, // 控制待审核条件弹窗
      revokePlanData: null, // 撤销弹窗
      showFrameFourData: null, // 带撤销
      SearchInputCity: null,
      unitText: null,
      contentImg: null,
      showContent: {},
      reservePopupOne: null,
      operationData: null,
    }
    // 修改管控时的参数
    this.controlDatas = {
      planName: '', // 名称
      eventId: '', // 事件ID
      hwayId: '', // 高速ID
      directionId: '', // 方向ID
      startPileNum: '', // 桩号
      endPileNum: '', // 桩号
      hwayName: '', // 高速名称
      eventTypeId: 7, // 事件类型
      directionName: '',
      locationMode: '1',
      situation: 0,
    }
    // 主动管控所需要显示的数据
    this.reservePopup = {
      planSourceName: '平台数据',
      devices: [],
      directionName: '',
      eventId: '',
      eventTypeId: null,
      eventTypeName: '',
      latlng: [],
      pileNum: '',
      roadName: '',
      userLimit: [],
      situation: 0,
      startTime: this.getDate(),
      status: 1,
      statusName: '待发布',
      list: [],
    }
    this.eventQuery = {
      eventType: '',
      searchKey: '',
    }
    /*   this.detailsPopupData = '' */
    this.VIboardParameters = {
      deviceCode: '',
      deviceLocation: '',
      deviceName: '',
      deviceTypeId: '',
      roadCode: '',
      roadDirection: '',
      roadName: '',
      eventPileNum: '',
      eventTypeId: '',
      value: '',
      control: false,
      existsDevices: [],
    }
    this.publishPlanVO = {
      channel: '',
      controlDes: '',
      controllId: '',
      endTime: '',
      eventTypeId: '',
      list: [],
      startTime: '',
    }
    this.mapStyles = {
      position: 'absolute',
      top: '0',
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e375d',
      border: '1px #163959 solid',
    }
    this.deviceReserve = []
    this.planStatus = 0
    this.eventListUrl = '/control/event/list' // 根据条件查询所有事件
    this.groupTypeUrl = '/control/event/get/type/statistics' //  事件类型数量统计
    this.groupStatusUrl = '/control/control/plan/status/group/statistics' // 统计方案数量，根据方案状态分组
    this.planListUrl = '/control/control/plan/get/all/' // {planStatus}'根据方案状态，查询方案集合，页面初始加载，查询所有，传0
    // this.detailUrl = '/control/event/get/detail/' // {eventId}/{eventType}查看事件详情'
    this.detailUrl = '/control/event/get/info/' // {eventId}/{eventType}查看事件详情'
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.hwayUrl = '/control/static/hway/list/direction' //  获取高速编号，用于下拉框'
    this.directionUrl = '/control/road/list/hway/direction/' //获取高速和方向的级联下拉框，用于下拉框
    this.conditionUrl = '/control/device/list/condition' // {deviceTypeId} // 条件查询设备回显'
    this.controlUrl = '/control/control/plan/start/' // 发起管控'
    // this.getInfoUrl = '/control/plan/get/info/' // {eventType}/{eventId} 获取管控方案'
    this.getInfoUrl = '/control/control/plan/get/by/' // {planNum}获取管控方案详情
    this.getDeviceAllUrl = '/control/device/get/in/area' // 获取指定区域内的设备
    this.publishUrl = '/control/control/plan/publish' // 发布管控方案'
    this.examineUrl = '/control/control/plan/' // {operation}/{controllId} // 方案审核接口（通过，取消）'
    this.endTimeUrl = '/control/plan/update/end/time/' // {eventTypeId}/{eventId}/{controllId} 修改管控方案结束时间'
    // this.deviceUrl = '/control/event/get/control/type/by/device' // 根据管控类型，获取管控设备集合（去重）
    this.deviceUrl = '/control/control/plan/get/device/group/type'
    this.markPublishUrl = '/control/event/mark/publish' // 标注事件发起管控 和修改管控方案同一个接口
    this.secUrl = '/control/customize/road/get/lng/lat/by/pilenum' // 根据道路、方向、起止桩号，计算经纬度和最后一个点所在的道路id
    this.timeoutUrl = '/control/plan/list/soon/timeout' // 获取即将超时的管控方案'
    this.promptUrl = '/control/plan/add/no/prompt/' // {eventId} 添加不再提示案件'
    this.codeUrl = '/control/dict/code/list/device/function/code/0' // {codeType} 根据功能类型查询，下拉框字典'
    this.groupUrl = '/control/dict/code/list/device/control/type/group' // 根据设备类型区分出设备类型下的管控类型，下拉'
    this.planFastUrl = '/control/plan/fast/publish/control/' // {eventTypeId}/{contingencyId}/{eventId} 交警快速发布管控方案（1.从地图页面提示框点入 2.从预案库点入）'
    this.revokeUrl = '/control/plan/update/control/plan/revoke/' // {controlId}/{eventId}交警点击管控中的案件撤销，需要交通审核'
    this.confirmRevokeUrl = '/control/plan/update/confirm/revoke/' // {eventId}交警确认收到撤销成功'
    this.plansUrl = '/control/plan/list/wait/confirm/revoke/plans' // 查询等待交警确认撤销的案件集合'
    this.textUrl = '/control/event/get/define/unit/text'
    this.eventTypeUrl = '/control/event/get/manual/event/type' // 获取主动管控事件类型
    this.adeviceTypesUrl = '/control/dict/code/get/control/device/types' // 获取管控类型和事件类型的对应关系'
    this.byEventUrl = '/control/device/get/by/event/' // {eventNum}/{eventType}/{hwayId}/{roadId}/{roadDirection} 根据事件获取设备'
    this.byUserUrl = '/control/dict/code/get/plan/status/by/user'
    this.operationUrl = '/control/control/plan/get/operate/by/' // {planNum}根据管控方案编号获取管控方案操作步骤
    this.socketUrl = 'ws://192.168.1.124:20207/control/notify/traffic/'
  }
  componentWillMount = () => {
    // 获取用户权限
    this.handlelimitArr()
    this.handleOverallSituation()
  }

  componentDidMount = () => {
    this.handleSocket()
    // 高速下拉
    this.handleUrlAjax(this.hwayUrl, 'hwayList')
    // 获取所有事件类型定义显示文本（字典接口）
    this.handleUrlAjax(this.textUrl, 'unitText')
    // 查询事件类型
    this.handleUrlAjax(this.eventTypeUrl, 'eventTypes', (data) => {
      if (data.length) {
        this.controlDatas.eventType = data[0].eventType
        this.setState({ eventType: data[0].eventType })
      }
    })
    this.handleUrlAjax(this.groupUrl, 'MeasuresList')
    this.getDeviceEventList()
    // 管控类型
    this.handlelistDetail('controlTypes', 13)
    // 主动管控里的修改 高速、方向、桩号的起始和结束
    this.handlesetTimeOut(false) // 启动计时器
    this.handleUrlAjax(this.codeUrl, 'deviceCodeList') // 查询管控方案详情方案五对应下拉
    this.handlelistDetail('deviceDetailList', 29)
    this.handleUrlAjax(this.byUserUrl, 'controlPopupList')
    // 预案库一键发布调管控方案详情页面
    if (window.contingency) {
      const { controlType, planNum } = window.contingency
      const deviceReserve = controlType.split(',').map((item) => { return Number(item) })
      this.handleViewControl(planNum, null, deviceReserve)
      window.contingency = null
    }
  }
  componentWillUnmount = () => {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
      this.timeInterval = null
    }

    if (this.timeTimeout) {
      clearTimeout(this.timeTimeout)
      this.timeTimeout = null
    }
    if (this.wsocket) {
      this.wsocket.close()
    }
  }

  onStartChange = (value) => {
    this.onPickerChange('startValue', value)
    this.publishPlanVO.startTime = value ? this.getDate(value._d) : ''
  }
  onEndChange = (value) => {
    this.onPickerChange('endValue', value)
    this.publishPlanVO.endTime = value ? this.getDate(value._d) : ''
  }
  onEndChangeTime = (value) => {
    this.setState({
      endValueTime: value ? this.getDate(value._d) : '',
    })
  }
  onPickerChange = (field, value) => {
    this.setState({
      [field]: value ? this.getDate(value._d) : '',
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
  getLineCenterPoint = (latlng) => {
    const newCenter = []
    if (latlng.length > 1) {
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
    const nowZoom = window.map.getZoom()
    window.map.setZoomAndCenter(nowZoom, newCenter)
  }
  // 控制事件检测过滤设置弹窗
  handleEventPopup = (type, boolean) => {
    if (type === 'boxSelect') {
      this.setState({
        boxSelect: false,
      })
      if (!boolean) {
        this.setState({
          flagClose: null,
          boxFlag: null,
          checkAllBox: null,
          checkedListBox: null,
          controlBtnFlagText: '框选设备',
        })
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) // 关闭，并清除覆盖物
      }
    }
    if (type === 'Event') {
      if (boolean) {
        this.eventQuery = {
          eventType: boolean.type,
          searchKey: this['searchKey' + boolean.type] || '',
        }
      }
      this.setState({
        eventsPopup: boolean,
      })
    }
    if (type === 'Control') {
      if (boolean) {
        this.setState({ controlPopup: this.state.controlPopupList })
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
        boolean.eventType === 3 || boolean.markEventType === 3 ? window.lineFlag = false : window.lineFlag = true
        this.handledetai(boolean)
      } else {
        this.setState({
          detailsPopup: false,
          controlBtnFlag: null,
          SidePopLeft: '', // 刷新左侧事件
        }, () => {
          this.eventQuery = {
            eventType: '',
            searchKey: '',
          }
          if (window['lineLayers']) {
            window['lineLayers'].hide()
            window['lineLayers'].fx = []
            window['lineLayers'].show()
          }
          this.handleEventList() // 刷新左侧事件
          window.centerPoint = '103.882158, 30.436527' // 复位地图中心点
        })
      }
    }
    if (type === 'Reserve') {
      this.setState({
        reservePopup: boolean,
        endValue: null,
        startValue: null,
      })
    }
    if (type === 'Whethe') {
      this.setState({
        whethePopup: boolean,
      })
    }
    if (type === 'VIboard') {
      this.setState({ VIboardPopup: boolean, hwayDirection: null, roadDirection: '' })
    }
    if (type === 'condition') {
      this.setState({ conditionList: boolean })
    }
    if (type === 'controldet') {
      this.handleViewControl(boolean.planNum)
    }
    if (type === 'examine') {
      // console.log(this.state.controlPopupList);
      this.planStatus = boolean ? this.state.controlPopupList[1].id : 0
      this.handleplanList()
    }
    setTimeout(() => { this.handlesetTimeOut(boolean) }, 0)
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
  mapLayerShowHide = (flag, name) => {

    if (flag) {
      this.setState({
        [name]: flag,
      }, () => {
        window[name].show()
      })
    } else {
      this.setState({
        [name]: flag,
      }, () => {
        window[name].hide()
      })
    }
  }
  handlelimitArr = () => {
    const limitArr = JSON.parse(localStorage.getItem('userLimit')) || []
    const userLimit = []
    limitArr.forEach((item) => {
      userLimit.push(item.id)
    })
    // 有发布权限的用户才可以有延时操作
    // if (userLimit.includes(100)) {
    //   this.timeInterval = setInterval(() => {
    //     this.handleTimeData()
    //   }, 60000)
    // }
    this.setState({ userLimit })
  }
  genExtraAdd = (item, data) => (
    <Icon
      type="plus"
      onClick={(e) => {
        this.genExtraAddOnclick(e, item, data)
      }}
    />
  )
  genExtraAddOnclick = (e, item, data) => {
    e.stopPropagation()
    const existsDevices = []
    if (data && data.devices.length > 0) {
      for (let i = 0, devicesArr = data.devices; i < devicesArr.length; i++) {
        devicesArr[i].device && devicesArr[i].device.map((item) => {
          existsDevices.push(item.appendId)
        })
      }
    }
    this.VIboardParameters = {
      deviceCode: '',
      deviceLocation: '',
      deviceName: '',
      deviceTypeId: item.dictCode,
      roadCode: '',
      roadDirection: '',
      roadName: '',
      eventPileNum: data.pileNum.split(' ')[0],
      eventTypeId: data.eventType ? data.eventType : data.eventTypeId,
      value: data.situation,
      control: data.eventType ? false : true,
      existsDevices,
    }
    this.getdeviceList(item) // 获取到当前已有设备id
    this.handlelistDetail('roadNumber', 1) // 获取当前道路下拉
    this.handleEventPopup('VIboard', item.codeName)
  }
  getdeviceList = (data) => {
    this.deviceList = []
    data.device.map((item) => {
      this.deviceList.push(item.deviceId)
    })
  }
  handleInput = (e, name, type, data) => {
    // debugger
    if (type === 'publishPlanVO' && name === 'content') {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.publishPlanVO.list[index].content = e.target.value
          const { showContent } = this.state
          showContent[item.appendId] = e.target.value
          this.setState({ showContent })
          // this.setState({ reservePopup: JSON.parse(JSON.stringify(this.publishPlanVO)) })
        }
      })
    } else if (type === 'reservePopup' && name === 'content') {
      this.reservePopup.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.reservePopup.list[index].content = e.target.value
          const { showContent } = this.state
          showContent[item.appendId] = e.target.value
          this.setState({ showContent })
          // this.setState({ reservePopup: JSON.parse(JSON.stringify(this.reservePopup)) })
        }
      })
    } else if (name === 'endPileNum' || name === 'startPileNum') {
      this[type][name] = e.target.value
      // this.handSecUrl()
    } else if (type === 'eventQuery') {
      const { eventsPopup } = this.state
      this['searchKey' + eventsPopup.type] = e.target.value
      this[type][name] = e.target.value
    } else {
      this[type][name] = e.target.value
    }
  }
  handleSelect = (value, name, type, data) => {
    if (type === 'publishPlanVO' && (name === 'deviceControlType' || name === 'content')) {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.appendId === data.appendId) {
          this.publishPlanVO.list[index][name] = value
          if (name === 'content') {
            const { showContent } = this.state
            showContent[item.appendId] = value
            this.setState({ showContent })
          }
        }
      })
    } else if (type === 'reservePopup' && (name === 'deviceControlType' || name === 'content')) {
      this.reservePopup.list.forEach((item, index) => {
        if (item.appendId === data.appendId) {
          this.reservePopup.list[index][name] = value
          if (name === 'content') {
            const { showContent } = this.state
            showContent[item.appendId] = value
            this.setState({ showContent })
          }
        }
      })
    } else if (type === 'controlDatas' && name === 'hwayId') {
      /* this.state.directionList.forEach((item, index) => {
        if (item.roadId === value) {
          this.controlDatas.roadId = item.roadId
          this.controlDatas.roadName = item.roadName
          this.controlDatas.directionName = item.directions[0].directionName
          this.controlDatas.directionId = item.directions[0].directionId
          this.setState({
            roadNumber: item.directions,
            directionId: '',
            directionName: item.directions[0].directionName ? item.directions[0].directionName : '',
          }, () => {
            this.handSecUrl()
          })
        }
      }) */
      const { hwayList } = this.state
      hwayList.forEach((item) => {
        if (item.hwayId === value) {
          this.controlDatas.hwayId = item.hwayId
          this.controlDatas.hwayName = item.hwayName
          this.controlDatas.directionId = item.direction[0].directionId
          this.controlDatas.directionName = item.direction[0].directionName
          this.setState({ roadNumber: item.direction, directionName: item.direction[0].directionId }, () => {
            this.handSecUrl()
          })
        }
      })
    } else if (type === 'controlDatas' && name === 'directionId') {
      this.state.roadNumber.forEach((item, index) => {
        if (item.directionId === value) {
          this.controlDatas.directionId = item.directionId
          this.controlDatas.directionName = item.directionName
          this.setState({
            directionName: item.directionName,
          }, () => {
            this.handSecUrl()
          })
        }
      })

    } else if (name === 'roadCode' && type === 'VIboardParameters') {
      const { directionList } = this.state
      this[type][name] = value
      directionList.forEach((item) => {
        if (item.roadId == value) {
          this.VIboardParameters.roadDirection = item.directions[0] && item.directions[0].directionId
          this.setState({ hwayDirection: item.directions, roadDirection: item.directions[0] && item.directions[0].directionId })
        }
      })
      if (value == '') {
        this.VIboardParameters.roadDirection = ''
        this.setState({ hwayDirection: [], roadDirection: '' })
      }
    } else {
      if (type === 'Click' && !(value instanceof Array)) {
        this.handSecUrl()
        this.setState({
          eventType: value,
        }, () => {
          this.controlDatas.eventTypeId = value
          this.state.eventTypes.forEach((item) => {
            if (item.eventType === this.state.eventType) {
              this.controlDatas.eventTypeName = item.eventTypeName
            }
          })
        })
      } else if (value instanceof Array) {
        const nowZoom = window.map.getZoom()
        window.map.setZoomAndCenter(nowZoom, value)
        this.setState({
          updatePoint: {
            content: '',
            deviceId: '',
            deviceName: '',
            deviceTypeId: null,
            directionName: '',
            latlng: [],
            pileNum: '',
            roadName: '',
          },
        }, () => {
          this.setState({
            updatePoint: data,
          })
        })
      } else {
        if (name === 'roadDirection') {
          this.setState({ roadDirection: value })
        }
        this[type][name] = value
      }
    }
  }
  handleradiog = (e, name) => {
    if (name === 'reportMinRange') {
      this.eventQuery[name] = e.target.value
    } else {
      this.planStatus = e.target.value
    }
  }
  handleCheckboxGroup = (value, name, type) => {
    this[type][name] = value.join()
  }
  // 更新设备及交通管控类型
  updateControlTypes = (controlId) => {
    const { deviceString, EventTagPopup } = this.state
    const nowIndex = deviceString.indexOf(controlId) > -1 ? deviceString.indexOf(controlId) : -1
    if (nowIndex > -1 && deviceString.length > 0) {
      deviceString.splice(nowIndex, 1)
      if (deviceString.length == 0) {
        message.info('管控类型至少选中一个')
        deviceString.push(controlId)
        return
      }
    } else {
      deviceString.push(controlId)
    }
    this.setState({
      deviceString,
    }, () => {
      this.handleDeviceTypeAry(deviceString)
      this.getDeviceEventList(true)
    })
  }
  handleDeviceTypeAry = (deviceString) => {
    if (window.infoWindowClose) {
      window.infoWindowClose.close()
    }
    getResponseDatas('get', this.adeviceTypesUrl, { controlTypes: deviceString.join() }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const dataList = result.data
        this.mapLayerShowHide(dataList.includes(1), 'deviceTurnBoard')
        this.mapLayerShowHide(dataList.includes(2), 'deviceFInfoBoard')
        this.mapLayerShowHide(dataList.includes(3), 'deviceInfoBoard')
        this.mapLayerShowHide(dataList.includes(4), 'deviceTollGate')
        this.mapLayerShowHide(dataList.includes(5), 'carRoadBoard')
      }
    })
  }
  // 获取全部交通管控类型
  getDeviceEventList = (flag) => {
    // const params = {
    //   deviceString: this.state.deviceString.join(),
    // }
    getResponseDatas('get', this.deviceUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        /* if (flag) {
          this.setState({
            deviceTypes: result.data.deviceTypes,
          })
        } else {
          this.setState({
            controlTypes: result.data.controlTypes,
            deviceTypes: result.data.deviceTypes,
          }, () => {
            const arrId = []
            this.state.controlTypes.map((item) => {
              arrId.push(item.id)
            })
            this.setState({
              deviceString: arrId,
            })
          })
        } */
        this.setState({
          deviceTypes: result.data,
        })
      }
    })
  }
  // 获取左侧列表数据
  handleEventList = (value) => {
    getResponseDatas('get', this.eventListUrl, this.eventQuery).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const { eventType } = this.eventQuery
        const { userLimit } = this.state
        if (eventType) { // 查询时候
          // const { SidePopLeft } = this.state
          // window.dataAll = SidePopLeft
          // if (SidePopLeft) {
          //   SidePopLeft.forEach((item, index) => {
          //     if (item.eventType === eventType) {
          //       SidePopLeft[index].eventData = result.data
          //       SidePopLeft[index].eventLength = result.data.length
          //     }
          //   })
          // }
          // this.setState({ eventsPopup: null, SidePopLeft })
        } else { // 正常加载
          this.setState({ eventsPopup: null, SidePopLeft: result.data })
        }
        this.handleEventPopup('Event', false) // 重启计时器
      }
    })
  }
  // 获取饼图数据
  handlegroupType = () => {
    getResponseDatas('get', this.groupTypeUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ groupType: result.data })
      }
    })
  }
  // 获取右侧管控方案列表
  handleplanList = (value) => {
    getResponseDatas('get', this.planListUrl + this.planStatus).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const { userLimit } = this.state
        if (this.planStatus == 0 && userLimit.includes(101) && value && this.timeTimeout) {
          const showFrameData = []
          const showFrameFourData = []
          result.data && result.data.forEach((item) => {
            if (item.status === 2) {
              showFrameData.push(item)
            }
            if (item.status === 4) {
              showFrameFourData.push(item)
            }
          })
          this.setState({ showFrameFourData: showFrameFourData.length ? showFrameFourData : null, showFrameData: showFrameData.length ? showFrameData : null })
        }
        this.setState({ planList: result.data, controlPopup: false })
        this.handleEventPopup('Control', false)
      }
    })
  }
  // 框选按钮点击
  controlBtnClick = (event) => {
    const _this = this;
    const textFlag = $(event.target).text() === '框选设备'
    this.setState({
      controlBtnFlagText: textFlag ? '关闭框选' : '框选设备',
    }, () => {
      if (textFlag) {
        if (this.state.EventTagPopupTit !== '标题' || !this.state.detailsPopup) {
          if (this.controlDatas.startPileNum === '') {
            message.info('数据不能为空,请输入数据!')
            $('#startInt').focus()
            this.setState({
              controlBtnFlagText: '框选设备',
            })
            return
          } else if (this.controlDatas.endPileNum === '') {
            $('#endInt').focus()
            message.info('数据不能为空,请输入数据!')
            this.setState({
              controlBtnFlagText: '框选设备',
            })
            return
          }
        }
        $(".amap-maps").attr("style", "cursor:crosshair")
        window.drawRectangle()
        this.setState({
          flagClose: true,
          boxFlag: true,
        }, () => {
          window.map.on("mousedown", function (e) {
            window.newPoint = new Array(4).fill(null)
            const newArr = []
            newArr[0] = e.lnglat.lng
            newArr[1] = e.lnglat.lat
            newPoint[0] = newArr
            _this.setState({
              boxFlag: true,
            })
          })
          window.map.on("mouseup", function (e) {
            const newArr = []
            newArr[0] = e.lnglat.lng
            newArr[1] = e.lnglat.lat
            newPoint[2] = newArr
            newPoint[1] = [newPoint[2][0], newPoint[0][1]]
            newPoint[3] = [newPoint[0][0], newPoint[2][1]]
            if (_this.state.boxFlag && _this.state.flagClose) {
              if (_this.state.EventTagPopupTit === '主动管控') {
                const params = {
                  devices: _this.state.deviceTypes,
                  roadPileNum: _this.controlDatas.startPileNum + ' ' + _this.controlDatas.endPileNum,
                  eventType: _this.state.eventType,
                }
                _this.state.controlBtnFlagText === '关闭框选' ? _this.getDevice(params) : null
              } else if (_this.state.EventTagPopupTit === '修改管控方案' || _this.state.EventTagPopupTit === '标题') {
                // console.log("修改的框选")
                _this.getDevice(_this.state.detailsPopup);
              }
              _this.setState({
                boxFlag: false,
              })
            }
          })
        })
      } else {
        this.setState({
          flagClose: null,
          boxFlag: null,
        })
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) //关闭，并清除覆盖物
      }
    })
  }
  // 获取右侧事件详情
  handledetai = (item) => {
    getResponseDatas('get', this.detailUrl + item.eventNum).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const latlngArr = JSON.parse(JSON.stringify(result.data.latlng))
        this.getLineCenterPoint(result.data.latlng)
        window.drawLine(latlngArr, window.lineFlag)
        this.state.detailsPopup = result.data
        this.setState({
          detailsLatlng: result.data.latlng,
        }, () => {
          this.handledetaibyEvent(result.data)
          if (!this.state.detailsPopup.planSource) { // 为0时未管控 显示框选按钮否则不显示
            this.setState({
              controlBtnFlag: true,
              controlBtnFlagText: '框选设备',
            }, () => {
              $(".amap-maps").attr("style", "")
              window.mouseTool.close(true) //关闭，并清除覆盖物
            })
          } else {
            this.setState({
              controlBtnFlag: null,
              controlBtnFlagText: '框选设备',
            }, () => {
              $('.amap-maps').attr('style', '')
              window.mouseTool.close(true) //关闭，并清除覆盖物
            })
          }
          // console.log(this.state.detailsPopup, "look here details")
          // localStorage.setItem('detailsPopup', JSON.stringify(this.state.detailsPopup))
        })
      }
    })
  }
  handledetaibyEvent = (item) => {
    getResponseDatas('get', this.byEventUrl + `${item.eventNum}/${item.eventType}/${item.hwayId}/${item.roadId}/${item.roadDirection}`, { startEndPileNumValue: item.startEndPileNumValue }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // console.log(result.data);
        const { detailsPopup } = this.state
        detailsPopup.devices = result.data
        this.setState({ detailsPopup })
      }
    })
  }
  // 获取所有框选设备
  getDevice = (item) => {
    const existsDevices = []
    // const listDevices = []
    if (item && item.devices.length > 0) {
      for (let i = 0, devicesArr = item.devices; i < devicesArr.length; i++) {
        // console.log(devicesArr, "00001")
        devicesArr[i].device && devicesArr[i].device.map((item) => {
          existsDevices.push(item.appendId)
          // listDevices.push(item.deviceId)
        })
      }
    }
    const { deviceString } = this.state
    let params = {
      area: window.newPoint,
      control: false,
      eventPileNum: item.roadPileNum,
      eventTypeId: item.eventType,
      existsDevices: existsDevices,
      controlType: deviceString.join(),
    }
    getResponseDatas('post', this.getDeviceAllUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const noDevices = []
        result.data.map((item) => {
          if (!(existsDevices.includes(item.appendId))) {
            noDevices.push(item.appendId)
          }
        })
        if (result.data.length > 0) {
          this.setState({ boxSelect: true, boxSelectList: result.data, oldDevicesList: noDevices })
        } else {
          message.info('没有选中相应的硬件设备！')
          map.remove(window.overlays)
          window.overlays = []
        }
      }
    })
  }
  getcheckedListBox = (checkedListBox) => {
    const { oldDevicesList, boxSelectList } = this.state
    /* boxSelectList.map((item)=>{
      if (checkedListBox[checkedListBox.length -1] === item.appendId) {
        if (item.exists || item.controlling) {
          message.info('已管控')
        }else {
          this.setState({
            checkedListBox,
            indeterminateBox: !!checkedListBox.length && checkedListBox.length < oldDevicesList.length,
            checkAllBox: checkedListBox.length === oldDevicesList.length,
          })
        }
      }
    }) */
    this.setState({
      checkedListBox,
      indeterminateBox: !!checkedListBox.length && checkedListBox.length < oldDevicesList.length,
      checkAllBox: checkedListBox.length === oldDevicesList.length,
    })
  }
  onCheckBoxSelect = (e) => {
    const { oldDevicesList } = this.state
    this.setState({
      checkedListBox: e.target.checked ? oldDevicesList : [],
      indeterminateBox: false,
      checkAllBox: e.target.checked,
    })
  }
  handleBoxSelectList = () => {
    const { checkedListBox, detailsPopup, boxSelectList, oldDevicesList, EventTagPopupTit, deviceTypes } = this.state
    boxSelectList.forEach((item) => {
      checkedListBox && checkedListBox.forEach((items) => {
        if (item.appendId === items) {
          if (EventTagPopupTit !== '主动管控') {
            detailsPopup.devices.forEach((itemss, index) => {
              if (itemss.dictCode === item.deviceType) {
                detailsPopup.devices[index].device.push(item)
              }
            })
          } else {
            deviceTypes.forEach((itemss, index) => {
              if (itemss.dictCode === item.deviceType) {
                deviceTypes[index].device.push(item)
              }
            })
          }
        }
      })
    })
    if (EventTagPopupTit !== '主动管控') {
      this.setState({ detailsPopup, boxSelectList: null, checkAllBox: null, checkedListBox: null, controlBtnFlagText: '框选设备', boxSelect: null, flagClose: null, boxFlag: null }, () => {
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) //关闭，并清除覆盖物
      })
    } else {
      this.setState({ deviceTypes, boxSelectList: null, checkAllBox: null, checkedListBox: null, controlBtnFlagText: '框选设备', boxSelect: null, flagClose: null, boxFlag: null }, () => {
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) //关闭，并清除覆盖物
      })
    }
  }
  // 字典查询
  handlelistDetail = (name, value) => {
    getResponseDatas('get', this.listDetailUrl + value).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data }, () => {
          if (name === 'controlTypes') {
            const arrId = []
            this.state.controlTypes.map((item) => {
              arrId.push(item.id)
            })
            this.setState({
              deviceString: arrId,
            })
          }
        })
      }
    })
  }
  // 通用呆板式接口请求
  handleUrlAjax = (url, name, callback) => {
    getResponseDatas('get', url).then((res) => {
      if (res) {
        const result = res.data
        if (result.code === 200) {
          this.setState({ [name]: result.data }, () => { callback && callback(result.data) })
        }
      }
    })
  }
  getDate = (time, num = 0) => {
    let today = ''
    today = new Date()
    if (time) {
      today = new Date(time)
    }
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours() + num)).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return navtime + navmse
  }
  // 可变情报板查询
  handleCondition = () => {
    const data = JSON.parse(JSON.stringify(this.VIboardParameters))
    /*  delete data.existsDevices
     const paramStr = '?deviceTypeId=' + data.deviceTypeId + '&eventPileNum=' + data.eventPileNum + '&eventTypeId=' + data.eventTypeId
       + '&value=' + data.value + '&control=' + data.control */
    const paramStr = '?deviceCode=' + data.deviceCode + '&deviceLocation=' + encodeURIComponent(data.deviceLocation) + '&deviceName=' + data.deviceName + '&deviceTypeId=' + data.deviceTypeId
      + '&roadCode=' + data.roadCode + '&roadDirection=' + data.roadDirection + '&roadName=' + data.roadName + '&eventPileNum=' + encodeURIComponent(data.eventPileNum) + '&eventTypeId=' + data.eventTypeId
    '&value=' + data.value + '&control=' + data.control
    // debugger
    getResponseDatas('post', this.conditionUrl + paramStr, data.existsDevices).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const plainOptionList = []
        result.data.map((item) => {
          if (!(this.deviceList.includes(item.deviceId))) {
            plainOptionList.push(item.deviceId)
          }
        })
        this.setState({ conditionList: result.data, plainOptionList, checkedList: [], checkAll: false })
      } else {
        message.warning(result.message)
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
  openNotification = (text, click, data) => {
    const btn = (
      <Button type="primary" size="small" onClick={() => { click(data) }}>
        查看详情
      </Button>
    )
    const args = {
      message: '系统通知',
      description: text,
      duration: 30,
      btn,
    }
    notification.open(args)
  }
  handleSocket = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    console.log(userInfo.id, 'id')
    const ws = new WebSocket(this.socketUrl + userInfo.id);
    this.wsocket = ws
    ws.onopen = (evt) => {
      console.log('建立连接', evt)
      ws.send('Hello')
    }
    ws.onmessage = (evt) => {
      console.log(evt, '收到消息', typeof evt);
      if (evt.data !== '连接成功') {
        const data = JSON.parse(evt.data)
        console.log(data, data.plan);
        if (data.plan) {
          let x, click
          switch (data.plan.type) {
            case 4: x = '审核成功'
              click = this.handleViewControl
              break
            case 5: x = '已结束'
              click = this.handlehistory
              break
            case 6: x = '已取消'
              click = this.handlehistory
              break
            default:
              x = ''
          }
          const text = `管控方案 :${data.plan.planName},管控编号 :${data.plan.planNum},${x}!`
          this.openNotification(text, click, data.plan.planNum)
        } else if (data.event) {
          this.setState({ contingencyData: data.event })
        }
      }
      // ws.close(); 
    }
    ws.onclose = (evt) => {
      setTimeout(this.handleSocket, 2000)
      console.log('连接关闭', evt)
    }
    ws.onerror = (evt) => {
      console.log('通信错误', evt)
    }
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
    // conditionList查询到的设备  checkedList 选中的设备id
    const { checkedList, detailsPopup, conditionList } = this.state
    this.deviceList = [...this.deviceList, ...checkedList]
    const { deviceTypeId } = this.VIboardParameters
    // console.log(conditionList)
    conditionList.forEach((item) => {
      checkedList.forEach((items) => {
        if (item.deviceId === items) {
          detailsPopup.devices.forEach((itemss, index) => {
            if (itemss.dictCode === item.deviceTypeId) {
              detailsPopup.devices[index].device.push(item)
            }
          })
        }
      })
    })
    this.setState({ detailsPopup, conditionList: null, VIboardPopup: null })
  }
  handleSubDetailsPopupList = (ind, index) => {
    const { detailsPopup, deviceTypes, EventTagPopupTit } = this.state
    if (EventTagPopupTit === '主动管控') {
      deviceTypes[ind].device.splice(index, 1)
      this.setState({ deviceTypes })
    } else {
      detailsPopup.devices[ind].device.splice(index, 1)
      this.setState({ detailsPopup })
    }
  }
  handleMarkControlPop = () => {
    const { EventTagPopupTit, deviceString, deviceTypes, detailsPopup, eventType, importantId, lineLatlngArr } = this.state
    const deviceAry = []
    this.deviceReserve = JSON.parse(JSON.stringify(deviceString))
    const that = this
    if (EventTagPopupTit === '主动管控') {
      if (!this.controlDatas.planName) {
        message.info('请填写管控名称！')
        return
      }
      if (!this.controlDatas.hwayId) {
        message.info('请选择高速！')
        return
      }
      if (!this.controlDatas.directionId && this.controlDatas.directionId !== 0) {
        message.info('请选择方向！')
        return
      }
      if (!this.controlDatas.startPileNum) {
        message.info('请输入起始桩号！')
        $('#startInt').focus()
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.startPileNum))) {
        message.info('请输入正确起始桩号！')
        $('#startInt').focus()
        return
      }
      if (!this.controlDatas.endPileNum) {
        message.info('请输入结束桩号！')
        $('#endInt').focus()
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.endPileNum))) {
        message.info('请输入正确结束桩号！')
        $('#endInt').focus()
        return
      }
      if (this.controlDatas.situation === '' || this.controlDatas.situation < 0) {
        this.controlDatas.situation = 0
        if (eventType !== 3) {
          message.info('请输入正确的平均车速！')
        } else {
          message.info('请输入正确的能见度！')
        }
        return
      }
      this.state.showContent = {}
      deviceTypes.forEach((item) => {
        item.device.forEach((items) => {
          items.content = items.showContent || items.content
          // console.log(items.content, items.appendId);
          this.state.showContent[items.appendId] = items.content
          deviceAry.push({
            appendId: items.appendId,
            controlScope: items.controlScope ? items.controlScope : 0,
            deviceId: items.deviceId,
            deviceType: items.deviceType,
            pileNum: items.pileNum ? items.pileNum : 0,
            content: items.content,
            deviceControlType: items.deviceControlType,
          })
        })
      })
      if (deviceAry.length === 0) {
        message.warning('请添加设备')
        return
      }
      this.reservePopup = {
        planName: this.controlDatas.planName,
        planSourceName: '平台数据',
        startPileNum: this.controlDatas.startPileNum,
        endPileNum: this.controlDatas.endPileNum,
        locationMode: '1', // 里程桩 1  收费站不知道
        controlType: deviceString.join(),
        hwayId: this.controlDatas.hwayId,
        directionId: this.controlDatas.directionId,
        devices: deviceTypes,
        list: deviceAry,
        roadDirectionName: this.controlDatas.directionName,
        directionName: this.controlDatas.directionName,
        eventId: this.controlDatas.eventId,
        eventTypeId: this.controlDatas.eventTypeId,
        eventType: this.controlDatas.eventTypeId,
        eventTypeName: this.controlDatas.eventTypeName,
        pileNum: this.controlDatas.startPileNum + ' ' + this.controlDatas.endPileNum,
        hwayName: this.controlDatas.hwayName,
        update: false,
        latlngs: lineLatlngArr,
        roadSecId: importantId,
        situation: this.controlDatas.situation,
        eventLength: this.controlDatas.eventLength,
        status: 1,
        statusName: '待发布',
        startTime: this.getDate(),
        endTime: this.getDate(null, 2),
        controlDes: this.getDate() + ' ' + this.controlDatas.hwayName + this.controlDatas.directionName + this.controlDatas.startPileNum + '米处发生' + (this.controlDatas.eventTypeName + (',平均车速为' + this.controlDatas.situation + 'km/h,影响路段长度为' + this.controlDatas.eventLength + 'm')),
      }

      this.publishPlanVO = JSON.parse(JSON.stringify(this.reservePopup))
      // 关闭主动管控
      that.handleEventTag(false)
      // 关闭右侧详情
      that.handleEventPopup('Details', false)
      this.handleOverallSituation()
      // 获取方案详情
      // that.handleViewControl(that.controlDatas.planNum, null, deviceString)
      // console.log(this.reservePopup)

      this.setState({
        reservePopup: this.publishPlanVO,
        startValue: this.getDate(),
        endValue: this.getDate(null, 2),
      }, () => {
        // console.log('显示管控详情后', this.state.reservePopup, this.controlDatas)
      })
      this.handleUrlAjax(this.groupUrl, 'MeasuresList')
    } else {
      const { devices } = detailsPopup
      // console.log(detailsPopup, '111111')
      devices.forEach((item) => {
        item.device.forEach((items) => {
          deviceAry.push({
            controlScope: items.controlScope ? items.controlScope : 0,
            deviceId: items.deviceId,
            deviceTypeId: items.deviceTypeId,
            pileNum: items.pileNum ? items.pileNum : 0,
            content: items.content,
            deviceControlType: items.deviceControlType,
          })
        })
      })
      if (!this.controlDatas.roadName) {
        message.info('请选择高速！')
        return
      }
      if (!this.controlDatas.directionId) {
        message.info('请选择方向！')
        return
      }
      if (!this.controlDatas.startPileNum) {
        message.info('请输入起始桩号！')
        $('#startInt').focus()
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.startPileNum))) {
        message.info('请输入正确起始桩号！')
        $('#startInt').focus()
        return
      }
      if (!this.controlDatas.endPileNum) {
        message.info('请输入结束桩号！')
        $('#endInt').focus()
        return
      } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.endPileNum))) {
        message.info('请输入正确结束桩号！')
        $('#endInt').focus()
        return
      }
      if (deviceAry.length === 0) {
        message.warning('请添加设备')
        return
      }
      this.reservePopup = {
        planSourceName: "平台数据",
        startPileNum: this.controlDatas.startPileNum,
        endPileNum: this.controlDatas.endPileNum,
        locationMode: '1', // 里程桩 1  收费站不知道
        controlType: deviceString.join(),
        roadId: this.controlDatas.roadName,
        directionId: this.controlDatas.directionId,
        devices: devices,
        list: deviceAry,
        directionName: this.controlDatas.directionName,
        eventId: this.controlDatas.eventId,
        eventTypeId: this.state.eventType,
        eventTypeName: this.state.eventTypes[this.state.eventType - 1].eventTypeName,
        pileNum: this.controlDatas.startPileNum + ' ' + this.controlDatas.endPileNum,
        roadName: this.controlDatas.roadName,
        update: true,
        originalEventTypeId: this.state.detailsPopup.eventType,
        latlngs: lineLatlngArr ? lineLatlngArr : this.controlDatas.latlng,
        roadSecId: importantId ? importantId : this.controlDatas.roadSecId,
        situation: this.controlDatas.situation,
        eventLength: this.controlDatas.eventLength,
        status: 1,
        statusName: "待发布",
        startTime: this.getDate(),
        endTime: this.getDate(null, 2),
        controlDes: this.getDate() + ' ' + this.controlDatas.roadName.split(' ')[1] + this.controlDatas.directionName + this.controlDatas.startPileNum + '米处发生' + this.state.eventTypes[this.state.eventType - 1].eventTypeName + (this.controlDatas.eventType == 3 ? (',能见度为' + this.controlDatas.situation + 'm,影响道路长度为' + this.controlDatas.eventLength + 'm') : (',平均车速为' + this.controlDatas.situation + 'km/h,拥堵路段长度为' + this.controlDatas.eventLength + 'm')),
      }
      this.publishPlanVO = JSON.parse(JSON.stringify(this.reservePopup))
      // 关闭主动管控
      that.handleEventTag(false)
      // 关闭右侧详情
      that.handleEventPopup('Details', false)
      that.handleOverallSituation()
      // 获取方案详情
      // that.handleViewControl(that.controlDatas.eventType, that.controlDatas.eventId)
      this.setState({
        reservePopup: this.reservePopup,
        startValue: this.getDate(),
        endValue: this.getDate(null, 2),
      })
      this.handleUrlAjax(this.groupUrl, 'MeasuresList')
    }
  }
  handleMarkControl = () => {
    const { channel, controlDes, list } = this.reservePopup
    const { reservePopup, startValue, endValue, eventType } = this.state
    for (let i = 0; i < list.length; i++) {
      if (list[i].content === '' || list[i].content === null) {
        message.warning('请填全显示内容')
        return
      }
      if (!list[i].deviceControlType) {
        message.warning('请选择设备控制类型')
        return
      }
    }
    if (!endValue) {
      message.warning('请选择结束时间！')
      return
    }
    if (controlDes == '') {
      message.warning('请仔细填写事件详情')
      return
    }
    // if (channel == '' || channel == null) {
    //   message.warning('发布渠道至少勾选一个')
    //   return
    // }
    // console.log(this.reservePopup);

    const params = {
      channel: 3,
      controlDes,
      planName: this.reservePopup.planName,
      controlType: this.reservePopup.controlType,
      devices: list,
      directionId: this.reservePopup.directionId,
      directionName: this.reservePopup.directionName,
      endPileNum: this.reservePopup.endPileNum,
      endTime: endValue,
      eventId: this.reservePopup.eventId,
      eventTypeId: this.reservePopup.eventTypeId,
      latlngs: this.reservePopup.latlngs,
      locationMode: this.reservePopup.locationMode,
      hwayId: this.reservePopup.hwayId,
      hwayName: this.reservePopup.hwayName,
      startPileNum: this.reservePopup.startPileNum,
      startTime: startValue,
      update: this.reservePopup.update,
      value: this.reservePopup.situation,
      originalEventTypeId: this.reservePopup.originalEventTypeId,
    }
    /* params.controlDes = startValue + ' ' + reservePopup.roadName.split(' ')[1] + reservePopup.directionName + reservePopup.pileNum.split(' ')[0] + '米处,' + controlDes */
    getResponseDatas('post', this.markPublishUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        this.handleOverallSituation()
        if (this.ChildPage) {
          this.ChildPage.loadPoint() // 调用子组件的handleAMap方法
        }
        this.setState({ reservePopup: null })
      } else {
        message.warning(result.message)
      }
    })
  }
  handSecUrl = () => {
    const that = this
    if (!this.controlDatas.hwayId) {
      message.info('请选择高速！')
      return
    }
    if (this.controlDatas.directionId !== 0 && !this.controlDatas.directionId) {
      message.info('请选择方向！')
      return
    }
    if (!this.controlDatas.startPileNum) {
      message.info('请输入起始桩号！')
      return
    } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.startPileNum))) {
      message.info('请输入正确起始桩号！')
      return
    }
    if (!this.controlDatas.endPileNum) {
      message.info('请输入结束桩号！')
      return
    } else if (!(/^[kK](0|([1-9]\d*))(\+\d{1,3})?$/.test(this.controlDatas.endPileNum))) {
      message.info('请输入正确结束桩号！')
      return
    }
    const params = {
      directionId: this.controlDatas.directionId,
      hwayId: this.controlDatas.hwayId,
      startPileNum: this.controlDatas.startPileNum,
      endPileNum: this.controlDatas.endPileNum,
    }

    getResponseDatas('get', this.secUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        that.setState({
          importantId: result.data.roadSecId,
          lineLatlngArr: result.data.latlng,
        }, () => {
          this.controlDatas.eventLength = result.data.eventLength
          if (that.state.lineLatlngArr.length) {
            const latlngArr = JSON.parse(JSON.stringify(that.state.lineLatlngArr))
            const colorFlag = that.controlDatas.eventType !== 3
            this.getLineCenterPoint(result.data.latlng)
            window.drawLine(latlngArr, colorFlag)
          } else {
            message.warning('暂无定义')
          }
        })
      } else {
        message.info(result.message)
      }
    })
  }
  handleControl = () => {
    const that = this
    const { detailsPopup } = that.state
    const { devices, eventNum } = detailsPopup
    const deviceAry = []
    devices.forEach((item) => {
      item.device.forEach((items) => {
        deviceAry.push({
          appendId: items.appendId,
          deviceId: items.deviceId,
          deviceType: items.deviceType,
          showContent: items.showContent || items.content,
          deviceControlType: items.deviceControlType || null,
        })
      })
    })
    if (deviceAry.length === 0) {
      message.warning('请添加设备')
      return
    }
    getResponseDatas('post', that.controlUrl + eventNum, deviceAry).then((res) => {
      const result = res.data
      if (result.code === 200) {
        that.handledetai({ eventNum })
        that.handleOverallSituation()
        // 获取方案详情
        that.handleViewControl(result.data)
      } else {
        message.warning(result.message)
      }
    })
  }
  //  管控详情
  handlehistory = (data) => {
    getResponseDatas('get', this.getInfoUrl + data + '/1').then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ reservePopupOne: result.data })
      }
    })
    this.handleoperation(data)
  }
  // 查询操作记录
  handleoperation = (num) => {
    getResponseDatas('get', this.operationUrl + num).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ operationData: result.data })
      } else {
        message.warning(result.message)
      }
    })
  }
  handleViewControl = (planNum, index, deviceReserve, type) => {
    this.deviceReserve = deviceReserve ? deviceReserve : []
    getResponseDatas('get', this.getInfoUrl + planNum).then((res) => {
      const result = res.data
      if (result.code === 200) {
        $('#searchBox').attr('style', 'transition:all .5s;')
        $('#roadStateBox').attr('style', 'transition:all .5s;')
        const list = []
        this.state.showContent = {}
        result.data.devices.forEach((item) => {
          item.device.forEach((items) => {
            items.content = items.showContent || items.content
            this.state.showContent[items.appendId] = items.content
            list.push({
              allName: items.deviceName + '-' + items.roadDirectionName + (items.laneNum ? '-' + items.laneNum + '-' : '-') + item.codeName,
              appendId: items.appendId,
              pileNum: items.pileNum,
              content: items.content,
              deviceId: items.deviceId,
              deviceType: items.deviceType,
              deviceControlType: items.deviceControlType,
            })
          })
        })
        this.publishPlanVO = {
          planName: result.data.planName,
          planNum: result.data.planNum,
          channel: '3',
          controlDes: result.data.planDes || (result.data.startTime ? this.getDate(result.data.startTime) : this.getDate() + ' ' + result.data.hwayName + result.data.roadDirectionName + result.data.pileNum.split(' ')[0] + '米处,发生' + result.data.eventTypeName + (((result.data.planSource === 1 || result.data.planSource === 2) || this.state.unitText[result.data.eventType].tipsText + '为' + result.data.showValue + this.state.unitText[result.data.eventType].unit) + '影响道路长度为' + result.data.eventLength + 'm')),
          endTime: result.data.endTime ? this.getDate(result.data.endTime) : this.getDate(null, 2),
          list,
          startTime: result.data.startTime ? this.getDate(result.data.startTime) : this.getDate(),
        }
        result.data.controlDes = this.publishPlanVO.controlDes
        this.handleUrlAjax(this.groupUrl, 'MeasuresList')
        this.setState({
          reservePopup: result.data,
          startValue: this.publishPlanVO.startTime,
          endValue: this.publishPlanVO.endTime,
        }, () => {
          if (index != null) {
            if (type === 'showFrameData') {
              this.handleshowFrame(index)
            } else {
              this.handleshowFrameFour(index)
            }
          }
        })
      }
    })
  }
  handleEventTag = (boolean, e) => {
    this.handlelistDetail('controlTypes', 13)
    if (boolean && $(e.target).text() === '修改管控方案') {
      this.controlDatas = JSON.parse(JSON.stringify(this.state.detailsPopup))
      // console.log(this.controlDatas, '修改管控方案')
      this.controlDatas.startPileNum = this.controlDatas.pileNum.split(' ')[0]
      this.controlDatas.endPileNum = this.controlDatas.pileNum.split(' ')[1]
      this.controlDatas.directionId = this.controlDatas.driverDirection
      this.setState({
        deviceTypes: this.state.detailsPopup.devices,
        eventType: this.state.detailsPopup.eventType,
        directionName: this.state.detailsPopup.directionName,
        controlBtnFlagText: '框选设备',
        lineLatlngArr: this.controlDatas.latlng,
      })
      this.state.directionList.forEach((item, index) => {
        if (item.roadId === this.controlDatas.roadName) {
          this.setState({
            roadNumber: item.directions,
            directionId: this.controlDatas.driverDirection,
            directionName: this.controlDatas.directionName,
          })
        }
      })
      setTimeout(() => {
        window.drawLine(this.controlDatas.latlng, this.controlDatas.eventType != 3)
        this.getLineCenterPoint(this.controlDatas.latlng)
      }, 1000)
      // this.handlelistDetail('controlTypes', 13)
    } else if (boolean && $(e.target).text() === '主动管控') {
      this.getDeviceEventList() // 清空交通管控设施
      this.handleUrlAjax(this.groupUrl, 'MeasuresList')
      // this.handlelistDetail('controlTypes', 13)
      // this.controlDatas = {
      //   eventId: '', // 事件ID
      //   hwayId: '', // 高速ID
      //   directionId: '', // 方向ID
      //   startPileNum: '', //桩号
      //   endPileNum: '', //桩号
      //   hwayName: '', // 高速名称
      //   eventType: 7, // 事件类型
      //   directionName: '',
      //   locationMode: '1',
      //   situation: 0,
      // }
      // 修改管控时的参数
      const { eventTypes } = this.state
      this.controlDatas = {
        planName: '', // 名称
        eventId: '', // 事件ID
        hwayId: '', // 高速ID
        directionId: '', // 方向ID
        startPileNum: '', // 桩号
        endPileNum: '', // 桩号
        hwayName: '', // 高速名称
        eventTypeId: eventTypes ? eventTypes[0].eventType : 1, // 事件类型
        eventTypeName: '拥堵', // 事件类型名称
        directionName: '',
        locationMode: '1',
        situation: 0,
      }
      this.setState({
        eventType: 7,
        flagClose: null,
        boxFlag: null,
        controlBtnFlagText: '框选设备',
        directionName: '',
        // deviceString: [],
        // EventTagPopupTit: '标题',
      })
      $(".amap-maps").attr("style", "")
      window.mouseTool.close(true) //关闭，并清除覆盖物
    } else {
      // this.getDeviceEventList() // 清空交通管控设施
      this.controlDatas = {
        eventId: '', // 事件ID
        roadId: '', // 高速ID
        directionId: '', // 方向ID
        startPileNum: '', //桩号
        endPileNum: '', //桩号
        roadName: '', // 高速名称
        eventType: 1, // 事件类型
        directionName: '',
        locationMode: '1',
        situation: 0,
      }
      this.setState({
        eventType: 1,
        flagClose: null,
        boxFlag: null,
        controlBtnFlagText: '框选设备',
        directionName: '',
        // deviceString: [],
        // EventTagPopupTit: '标题',
      })
      $(".amap-maps").attr("style", "")
      window.mouseTool.close(true) //关闭，并清除覆盖物
    }
    this.setState({
      EventTagPopup: boolean,
      controlBtnFlag: boolean || this.state.detailsPopup && !this.state.detailsPopup.planSource ? true : false,
      EventTagPopupTit: e ? $(e.target).text() : '标题',
    }, () => {
      // console.log(this.state.EventTagPopupTit)
      if (this.controlDatas.latlng) {
        const latlngArr = JSON.parse(JSON.stringify(this.controlDatas.latlng))
        setTimeout(() => {
          window.drawLine(latlngArr, window.lineFlag)
        }, 3000)
      }
      // 加载ID、和经纬度
      /* if (boolean && this.state.EventTagPopupTit !== '主动管控') {
        this.handSecUrl()
      } */
      // 刷新首页数据
      if (boolean && this.state.EventTagPopupTit !== '标题') {
        this.handlesetTimeOut(boolean)
      } else {
        this.handlesetTimeOut()
      }
    })
    $('#searchBox').attr('style', 'transition:all .5s;')
    $('#roadStateBox').attr('style', 'transition:all .5s;')
  }
  // 管控发布
  handleRelease = () => {
    const { list, controlDes, planName } = this.publishPlanVO
    const { reservePopup, startValue, endValue, detailsPopup } = this.state
    if (!planName && planName !== 0) {
      message.warning('请填写方案名称')
      return
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].content === '' || list[i].content === null) { // 值为0 通过
        message.warning('请填全显示内容')
        return
      }
      if (list[i].deviceControlType == '') {
        message.warning('请选择设备控制类型')
        return
      }
    }
    if (!startValue) {
      message.warning('请选择开始时间')
      return
    }
    if (!endValue) {
      message.warning('请选择结束时间')
      return
    }
    if (controlDes == '') {
      message.warning('请仔细填写事件详情')
      return
    }
    // if (channel == '' || channel == null) {
    //   message.warning('发布渠道至少勾选一个')
    //   return
    // }
    getResponseDatas('post', this.publishUrl, this.publishPlanVO).then((res) => {
      const result = res.data
      if (result.code === 200) {
        // this.detailsPopupData = '' // 清空方案详情
        this.handleOverallSituation()
        if (detailsPopup) {
          this.handledetai({ planNum: this.publishPlanVO.planNum })
        }
        if (this.ChildPage) {
          this.ChildPage.loadPoint() //调用子组件的handleAMap方法
        }
        message.success(result.message)
        this.setState({ reservePopup: null })
      } else {
        if (result.code === 201) {
          const dom = []
          result.data.forEach((item) => {
            dom.push(<p style={{ color: 'red' }}>{item.allName}-已管控</p>)
          })
          confirm({
            title: '温馨提示 ' + result.message,
            content: dom,
            okText: '确认',
            cancelText: '取消',
          })
        } else {
          message.warning(result.message)
        }
      }
    })
  }
  // 管控方案详情删除
  handleCloseCircle = (indexs, index, data) => {
    const { reservePopup } = this.state
    const reserveData = JSON.parse(JSON.stringify(reservePopup))
    if (reservePopup.update == true || reservePopup.update == false) { // 主动管控 修改管控
      if (this.reservePopup.list.length === 1) {
        message.warning('至少存在一条数据')
        return
      }
      this.reservePopup.list.forEach((item, ind) => {
        if (item.deviceId === data.deviceId && item.deviceTypeId === data.deviceTypeId) {
          this.reservePopup.list.splice(ind, 1)
        }
      })
    } else {
      if (this.publishPlanVO.list.length === 1) {
        message.warning('至少存在一条数据')
        return
      }
      this.publishPlanVO.list.forEach((item, ind) => {
        if (item.deviceId === data.deviceId && item.deviceTypeId === data.deviceTypeId) {
          this.publishPlanVO.list.splice(ind, 1)
        }
      })
    }
    reserveData.devices[indexs].device.splice(index, 1)
    this.setState({ reservePopup: reserveData })
  }
  handlerevokePlans = () => {
    getResponseDatas('get', this.plansUrl).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ revokePlanData: result.data.length ? result.data : null })
      }
    })
  }

  handlecancelRel = (controllId, operation) => {
    // console.log(operation)
    const _this = this
    confirm({
      title: '确认要' + (operation == 'audit' ? '审核' : '撤销') + '管控方案',
      content: '请求有延时,请耐心等待',
      cancelText: '取消',
      okText: '确认',
      onOk() {
        return new Promise((resolve) => {
          const { reservePopup } = _this.state
          getResponseDatas('put', _this.examineUrl + operation + '/' + controllId).then((res) => {
            const result = res.data
            if (result.code === 200) {
              _this.handleOverallSituation()
              if (operation == 'cancel') {
                _this.setState({ detailsPopup: null })
              }
              _this.setState({ reservePopup: null, endValue: null })
              if (_this.ChildPage && operation == 'cancel') {
                if (window.listItemDom) {
                  window.listItemDom.style.background = '' // 清左侧选择的方案
                }
                _this.ChildPage.loadPoint() // 调用子组件的handleAMap方法
              }
              resolve()
              message.success(result.message)
            } else {
              resolve()
              message.warning(result.message)
            }
          })
        }).catch(() => message.error('网络错误!'))
      },
      onCancel() { },
    })
  }
  // 延时时间
  handleEndValueTime = (boolean) => {
    if (boolean) {
      const { endTime } = this.publishPlanVO
      this.setState({
        endValueTime: endTime,
      })
    } else {
      this.setState({
        endValueTime: null,
      })
    }
  }
  handleWhethe = () => {
    const { reservePopup, endValueTime } = this.state
    const { eventTypeId, eventId, controllId } = reservePopup
    getResponseDatas('put', this.endTimeUrl + eventTypeId + '/' + eventId + '/' + controllId + '?endTime=' + endValueTime).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        this.setState({ reservePopup: null, endValueTime: null })
      } else {
        message.warning(result.message)
      }
    })
  }
  handleTimeData = () => {
    getResponseDatas('get', this.timeoutUrl).then((res) => {
      const result = res.data
      if (result.code === 200 && result.data.length) {
        this.setState({ TimeData: result.data })
        setTimeout(() => {
          this.setState({ TimeData: null, endValueTime: null })
        }, 30000)
      } else {
        this.setState({ TimeData: null, endValueTime: null })
      }
    })
  }
  handleTimeDataState = (index) => {
    const { TimeData } = this.state
    TimeData.splice(index, 1)
    this.setState({ TimeData: TimeData.length ? TimeData : null })
  }
  // 延时时间
  handleEndValueTimeState = (item, index) => {
    if (item) {
      this.TimeState = item
      this.TimeIndex = index
      this.setState({
        endValueTime: this.getDate(),
      })
    } else {
      this.setState({
        endValueTime: null,
        TimeData: null,
      })
    }
  }
  handleWhetheState = () => {
    const { endValueTime } = this.state
    const { eventTypeId, eventId, controllId } = this.TimeState
    getResponseDatas('put', this.endTimeUrl + eventTypeId + '/' + eventId + '/' + controllId + '?endTime=' + endValueTime).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        const { TimeData } = this.state
        TimeData.splice(this.TimeIndex, 1)
        this.TimeState = null
        this.setState({ endValueTime: null, TimeData: TimeData.length ? TimeData : null })
      } else {
        message.warning(result.message)
      }
    })
  }
  handleNoneTimeState = (item, index) => {
    const { eventId } = item
    getResponseDatas('put', this.promptUrl + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        const { TimeData } = this.state
        TimeData.splice(index, 1)
        this.setState({ endValueTime: null, TimeData: TimeData.length ? TimeData : null })
      } else {
        message.warning(result.message)
      }
    })
  }

  // 一分钟计时器
  /*  handlesetTimeOut = (value) => {
     if (this.timeTimeout) {
       clearTimeout(this.timeTimeout)
       this.timeTimeout = null
     }
     if (!value) {
       this.timeTimeout = setTimeout(() => {
         this.handleOverallSituation(true) // 页面初始加载数据
         // 开始下一次执行
         this.handlesetTimeOut()
       }, 60000)
     }
   } */
  // 暂停计时器
  handlesetTimeOut = (value) => {
    if (this.timeTimeout) {
      clearTimeout(this.timeTimeout)
      this.timeTimeout = null
    }
    const { detailsPopup, reservePopup } = this.state
    // console.log(detailsPopup, reservePopup);
    if (detailsPopup || reservePopup) { return }
    this.TimingTime = this.TimingTime ? this.TimingTime : 60
    if (!value) {
      this.timeTimeout = setTimeout(() => {
        this.TimingTime -= 1
        // console.log(this.TimingTime);
        if (this.TimingTime === 0) {
          this.handleOverallSituation(true) // 页面初始加载数据
        }
        // 开始下一次执行
        this.handlesetTimeOut()
      }, 1000)
    }
  }

  handleOverallSituation = (value) => {
    // 查询查全部
    this.planStatus = 0
    this.eventQuery = {
      eventType: '',
      searchKey: '',
    }
    const { SidePopLeft, userLimit } = this.state
    SidePopLeft && SidePopLeft.forEach((item) => { this['searchKey' + item.eventType] = '' })
    // 查询左侧列表数据
    this.handleEventList(value)
    // 查询饼图数据
    this.handlegroupType()
    // 查询右侧柱状图
    this.handleUrlAjax(this.groupStatusUrl, 'groupStatus')
    // 查询管控方案
    this.handleplanList(value)
    // console.log(userLimit);

    if ((!(userLimit && userLimit.includes(101))) && value) {
      this.handlerevokePlans()
    }
  }
  equipmentInfoWinImg = (value) => {
    this.setState({ contentImg: value })
  }
  equipmentInfoWin = (value) => {
    if (value) {
      const { detailsPopup, EventTagPopupTit, deviceTypes, MeasuresList } = this.state
      let data = []
      if (EventTagPopupTit === '主动管控') {
        data = deviceTypes
      } else {
        data = detailsPopup.devices
      }
      // console.log(data, value);
      data.forEach((item) => {
        if (item.dictCode === value.deviceType) {
          item.device.forEach((items) => {
            if (items.deviceId === value.deviceId) {
              value.content = items.content || items.showContent
              value.deviceControlType = items.deviceControlType
            }
          })
        }
      })
      /* if (this.state.deviceString.length === 1) {
        value.deviceControlType = this.state.deviceString[0]
        console.log(MeasuresList, value);
        MeasuresList[value.deviceType].forEach((item) => {
          if (this.state.deviceString[0] === item.controlType) {
            value.content = item.showContent
          }
        })
      } */

      if (!(value.content && value.deviceControlType)) {
        const MeasData = []
        MeasuresList[value.deviceType].forEach((item) => {
          if (this.state.deviceString.includes(item.controlType)) {
            MeasData.push(item)
          }
        })
        if (MeasData.length === 1) {
          value.deviceControlType = MeasData[0].controlType
          value.content = MeasData[0].showContent
        }
      }
    }
    this.setState({
      InfoWinPopup: value,
    })
  }
  handleInfoWinChange = (e, name) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    const { InfoWinPopup } = this.state
    InfoWinPopup[name] = value
    this.setState({
      InfoWinPopup,
    })
  }
  handleInfoWinPopup = () => {
    const { InfoWinPopup, detailsPopup, deviceTypes, EventTagPopupTit } = this.state
    let data = []
    if (EventTagPopupTit === '主动管控') {
      data = deviceTypes
    } else {
      data = detailsPopup.devices
    }
    data.forEach((item, index) => {
      if (item.dictCode === InfoWinPopup.deviceType) {
        let bool = true
        item.device.forEach((items, indexs) => {
          if (items.deviceId === InfoWinPopup.deviceId) {
            data[index].device[indexs] = InfoWinPopup
            bool = false
          }
        })
        if (bool) {
          data[index].device.push(InfoWinPopup)
        }
      }
    })
    if (EventTagPopupTit === '主动管控') {
      this.setState({ InfoWinPopup: null, deviceTypes: data, })
    } else {
      detailsPopup.devices = data
      this.setState({ InfoWinPopup: null, detailsPopup, })
    }
  }
  openInfoWin = (items) => {
    if (this.ChildPage) {
      this.ChildPage.openInfoWin(window.map, items) //调用子组件的openInfoWin方法
    }
  }
  handlecontingency = (index) => {
    const { contingencyData } = this.state
    contingencyData && contingencyData.splice(index, 1)
    this.setState({ contingencyData: contingencyData.length ? contingencyData : null })
  }
  handleshowFrame = (index) => {
    const { showFrameData } = this.state
    showFrameData && showFrameData.splice(index, 1)
    this.setState({ showFrameData: showFrameData.length ? showFrameData : null })
  }
  handleconplanFast = (data) => {
    const { contingencyId, eventId, eventType, planNum } = data
    getResponseDatas('post', this.planFastUrl + `${eventType}/${contingencyId}/${eventId}`).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        this.handleOverallSituation()
        this.handleViewControl(planNum)
        this.setState({ contingencyData: null, })
      } else {
        message.warning(result.message)
      }
    })
  }
  handlerevokePlanindex = (index) => {
    const { revokePlanData } = this.state
    revokePlanData && revokePlanData.splice(index, 1)
    this.setState({ revokePlanData: revokePlanData.length ? revokePlanData : null })
  }
  handleshowFrameFour = (index) => {
    const { showFrameFourData } = this.state
    showFrameFourData && showFrameFourData.splice(index, 1)
    this.setState({ showFrameFourData: showFrameFourData.length ? showFrameFourData : null })
  }
  handlerevokePlanData = (data, index) => {
    const { eventId } = data
    getResponseDatas('put', this.confirmRevokeUrl + `${eventId}`).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(result.message)
        this.handlerevokePlanindex(index)
      } else {
        message.warning(result.message)
      }
    })
  }
  render() {
    const {
      unitText, SearchInputCity, showFrameFourData, revokePlanData, showFrameData, contingencyData, InfoWinPopup, roadDirection, hwayDirection, MeasuresList, eventsPopup, groupType, planList, EventTagPopup, EventTagPopupTit, roadNumber, endValueTime, conditionList, boxSelect, flagClose, oldDevicesList,
      boxSelectList, hwayList, directionList, VIboardPopup, groupStatus, controlPopup, controlBtnFlag, controlBtnFlagText, detailsPopup, whethePopup, reservePopup, startValue, endValue, endOpen, SidePopLeft, detailsLatlng
      , controlTypes, eventTypes, deviceTypes, updatePoint, reservePopupOne, userLimit, TimeData, deviceCodeList, deviceDetailList, checkedListBox } = this.state
    return (
      <div className={styles.MonitoringModule}>
        <SystemMenu />
        {<SidePop left="5px" groupType={groupType} SidePopLeft={SidePopLeft} handleEventPopup={this.handleEventPopup} />}
        {!!detailsPopup || <SidePop SidplanList={planList} groupStatus={groupStatus} right="5px" handleEventPopup={this.handleEventPopup} />}
        <GMap onRef={el => this.ChildPage = el} mapID={'container'} dataAll={SidePopLeft} roadLatlng={detailsLatlng} updatePoint={updatePoint} handledetai={this.handledetai} detailsPopup={detailsPopup} boxSelect={boxSelect} flagClose={flagClose} EventTagPopup={EventTagPopup} detailsPopup={detailsPopup} equipmentInfoWin={this.equipmentInfoWin} equipmentInfoWinImg={this.equipmentInfoWinImg} />
        <div id="searchBox" className={`${styles.searchBox} animated ${'bounceInDown'}`}><Search id="tipinput" placeholder="请输入内容" enterButton />
          {/* <s>框选设备</s> */}
        </div>
        <div id="deviceBox" className={`${styles.mapIconManage} animated ${'bounceInDown'}`}>
          {controlBtnFlag ? <span onClick={(e) => { this.controlBtnClick(e) }}>{controlBtnFlagText}</span> : null}
          {/* <span onClick={(e) => { this.handleEventTag(true, e) }}>道路封闭</span> */}
          <span>
            <Popover content={(<div>
              <p className={this.state.deviceTurnBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTurnBoard, 'deviceTurnBoard') }}>门架情报板</p>
              <p className={this.state.deviceFInfoBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceFInfoBoard, 'deviceFInfoBoard') }}>F屏情报板</p>
              <p className={this.state.deviceInfoBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceInfoBoard, 'deviceInfoBoard') }}>限速牌专用</p>
              <p className={this.state.deviceTollGate ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTollGate, 'deviceTollGate') }}>收费站匝道灯</p>
              <p className={this.state.carRoadBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.carRoadBoard, 'carRoadBoard') }}>车道控制器</p>
            </div>)} title="" trigger="hover">
              设备显示
          </Popover>
          </span>
          <span onClick={(e) => { this.handleEventTag(true, e) }}>主动管控</span>
        </div>
        <div id="roadStateBox" className={`${styles.roadState} animated ${'bounceInUp'}`}>
          <h5><p>路况</p></h5>
          <h5><span className={styles.redColor}>{'< 60km/h'}</span></h5>
          <h5><p>能见度</p></h5>
          <h5 className={styles.visibility}>
            <s>{'< 50'}</s>
            <s>{'50 - 100'}</s>
            <s>{'100 - 200'}</s>
            <s>{'200 - 500'}</s>
          </h5>
          {/* <p>
            <span>严重拥堵</span>
            <span>拥挤</span>
            <span>缓行</span>
            <span>畅通</span>
          </p> */}
          <h5>
            <em>门架情报板</em>
            <em>F屏情报板</em>
            <em>限速牌专用</em>
            <em>收费站匝道灯</em>
            <em>车道控制器</em>
          </h5>
        </div>
        {/* 设备显示弹窗 */}
        {/* <div className={styles.equipment}>
          <Checkbox.Group style={{ width: '100%' }}>
            <Checkbox value="A">A</Checkbox>
            <Checkbox value="B">B</Checkbox>
            <Checkbox value="C">C</Checkbox>
            <Checkbox value="D">D</Checkbox>
            <Checkbox value="E">E</Checkbox>
          </Checkbox.Group>,
        </div> */}
        {/* 事件检测过滤设置弹窗 */}
        {eventsPopup ?
          <div className={styles.MaskBox}>
            <div className={styles.EventPopup}>
              <div className={styles.Title}>{eventsPopup.name}事件过滤设置<Icon className={styles.Close} style={{ top: '37%' }} onClick={() => { this.handleEventPopup('Event', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <div className={styles.ItemInput} style={{ width: '100%', marginLeft: '25px' }}>
                    <Input maxLength={50} defaultValue={this['searchKey' + eventsPopup.type]} placeholder="如 S35,s2" onChange={(e) => { this.handleInput(e, 'searchKey', 'eventQuery') }} />
                  </div>
                </div>
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
                    <Radio.Group name="radiogroup" defaultValue={this.planStatus} onChange={(e) => { this.handleradiog(e) }}>
                      <Radio value={0}>全部</Radio>
                      {
                        controlPopup.map((item) => {
                          return <Radio key={item.id} value={item.id}>{item.name}</Radio>
                        })}
                    </Radio.Group>
                  </div>
                </div>
                <div className={styles.ItemFooter} style={{ bottom: '12px' }}>
                  <span onClick={this.handleplanList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('Control', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div>
          </div> : null}
        {TimeData ?
          <div className={styles.MaskBox}>
            <div className={styles.MaskCenterBox}>
              {
                TimeData.map((item, index) => {
                  return (
                    <div className={classNames(styles.TimeData)} key={item.eventId + item.eventTypeId}>
                      <div className={styles.Title}>{item.eventTypeName}-{item.eventId}P-管控方案超时提醒<Icon className={styles.Close} onClick={() => { this.handleTimeDataState(index) }} type="close" /></div>
                      <div className={styles.Content}>
                        <div className={styles.ItemBox}>
                          <div className={styles.RowBox}>
                            <div className={styles.left}>{item.eventId}P方案-{item.secName}-{item.eventTypeName}方案将要超时,请及时操作!</div>
                            <div className={styles.right}><Button onClick={() => { this.handleNoneTimeState(item, index) }} className={styles.Button}>不再提示</Button><Button className={styles.Button} onClick={() => { this.handleEndValueTimeState(item, index) }}>延时</Button></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div> : null
        }
        {
          showFrameData ?
            <div className={styles.MaskBox}>
              <audio autoPlay >
                <source src={audioSrc} type="audio/mpeg" />
              </audio>
              <div className={styles.MaskCenterBox}>
                {
                  showFrameData.map((item, index) => {
                    return (
                      <div className={classNames(styles.TimeData)} key={item.eventId + item.eventTypeId + item.contingencyId}>
                        <div className={styles.Title}>{item.eventTypeName}-{item.eventId}-待审核提醒<Icon className={styles.Close} onClick={() => { this.handleshowFrame(index) }} type="close" /></div>
                        <div className={styles.Content}>
                          <div className={styles.ItemBox}>
                            <div className={styles.RowBox}>
                              <div className={styles.left}>{item.secName}-{item.directionName}-{item.eventTypeName}-待审核,是否立即审核?</div>
                              <div className={styles.right}>
                                <Button className={styles.Button} onClick={() => { this.handleViewControl(item.planNum, index, null, 'showFrameData') }}>查看</Button>
                                <Button className={styles.Button} onClick={() => { this.handleshowFrame(index) }}>取消</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div> : null
        }
        {
          showFrameFourData ?
            <div className={styles.MaskBox}>
              <div className={styles.MaskCenterBox}>
                {
                  showFrameFourData.map((item, index) => {
                    return (
                      <div className={classNames(styles.TimeData)} key={item.eventId + item.eventTypeId + item.contingencyId}>
                        <div className={styles.Title}>{item.eventTypeName}-{item.eventId}-待撤销提醒<Icon className={styles.Close} onClick={() => { this.handleshowFrameFour(index) }} type="close" /></div>
                        <div className={styles.Content}>
                          <div className={styles.ItemBox}>
                            <div className={styles.RowBox}>
                              <div className={styles.left}>{item.secName}-{item.directionName}-{item.eventTypeName}-待撤销,是否立即撤销?</div>
                              <div className={styles.right}>
                                <Button className={styles.Button} onClick={() => { this.handleViewControl(item.planNum, index, null, 'showFrameFourData') }}>查看</Button>
                                <Button className={styles.Button} onClick={() => { this.handleshowFrameFour(index) }}>取消</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div> : null
        }
        {contingencyData ?
          <div className={styles.MaskBox}>
            <div className={styles.MaskCenterBox}>
              {
                contingencyData.map((item, index) => {
                  return (
                    <div className={classNames(styles.TimeData)} key={item.planName + item.eventNum + item.eventTypeId}>
                      <div className={styles.Title}>{item.eventTypeName}-{item.eventNum}-管控提醒<Icon className={styles.Close} onClick={() => { this.handlecontingency(index) }} type="close" /></div>
                      <div className={styles.Content}>
                        <div className={styles.ItemBox}>
                          <div className={styles.RowBox}>
                            <div className={styles.left}>{item.roadName}-{item.roadDirectionName}-{item.eventTypeName}-已达到{item.planName}预案的管控条件，是否立即管控?</div>
                            <div className={styles.right}>
                              <Button className={styles.Button} onClick={() => { this.handleconplanFast(item) }}>确认</Button>
                              <Button className={styles.Button} onClick={() => { this.handlecontingency(index) }}>取消</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div> : null
        }
        {revokePlanData ?
          <div className={styles.MaskBox}>
            <div className={styles.MaskCenterBox}>
              {
                revokePlanData.map((item, index) => {
                  return (
                    <div className={classNames(styles.TimeData)} key={item.eventId + item.eventTypeId + item.contingencyId}>
                      <div className={styles.Title}>{item.eventTypeName}-{item.eventId}-已撤销提醒<Icon className={styles.Close} onClick={() => { this.handlerevokePlanindex(index) }} type="close" /></div>
                      <div className={styles.Content}>
                        <div className={styles.ItemBox}>
                          <div className={styles.RowBox}>
                            <div className={styles.left}>{item.secName}-{item.directionName}-{item.eventTypeName}-已撤销</div>
                            <div className={styles.right}>
                              <Button className={styles.Button} onClick={() => { this.handlerevokePlanData(item, index) }}>确认</Button>
                              <Button className={styles.Button} onClick={() => { this.handlerevokePlanindex(index) }}>取消</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div> : null
        }
        {this.state.contentImg ?
          <div className={styles.MaskBoxImg} >
            <div className={styles.MaskBoxImgCenten}>
              <div className={styles.Title}>默认显示内容<Icon className={styles.Close} onClick={() => { this.equipmentInfoWinImg(false) }} type="close" /></div>
              <div className={styles.Content}>
                <img src={"http://222.175.148.125:50080/api/screenshot?timg=" + new Date().getTime()} />
              </div>
            </div>
          </div> : null}
        {/* 管控预案查询 */}
        {
          reservePopup ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.DetailsBox, styles.ReserveBox)}>
                <div className={styles.Title}>管控方案详情<Icon className={styles.Close} onClick={() => { this.handleEventPopup('Reserve', false) }} type="close" /></div>
                <div className={styles.Content}>
                  <div className={styles.Header} style={{ marginTop: '5px' }} >
                    {/* {
                      reservePopup.eventId ?
                        <span>方案编号&nbsp;:&nbsp;&nbsp;{reservePopup.eventId}P</span> : null
                    } */}
                    {/* <span>方案名称&nbsp;:&nbsp;&nbsp;{reservePopup.planName}</span> */}
                    <span>方案名称&nbsp;:&nbsp;&nbsp;{reservePopup.planStatus > 1 ? reservePopup.planName : <Input style={{ width: '200px', height: '25px', lineHeight: '25px' }} maxLength={50} defaultValue={reservePopup.planName} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleInput(e, 'planName', 'reservePopup') : this.handleInput(e, 'planName', 'publishPlanVO') }} />}</span>
                    <span style={{ width: '30%' }}>方案状态&nbsp;:&nbsp;&nbsp;{reservePopup.planStatusName || '待生成'}</span>
                    <span>事件类型&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventTypeName}</span></span>
                    <span style={{ width: '30%' }}>事件编号&nbsp;:&nbsp;&nbsp;<span>{reservePopup.eventNum || '待生成'}</span></span>
                  </div>
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>基本信息</div>
                    <div className={styles.RowBox}>
                      <p>高速编号&nbsp;:&nbsp;&nbsp;{reservePopup.hwayCode || '待生成'}</p>
                      <p>高速名称&nbsp;:&nbsp;&nbsp;{reservePopup.hwayName}</p>
                      <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopup.roadDirectionName}</p>
                    </div>
                    <div className={styles.RowBox}>
                      <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopup.pileNum && reservePopup.pileNum.split(' ')[0]}</span></p>
                      {/* {
                        (reservePopup.eventTypeId == 5 && reservePopup.markEventType == 3) || reservePopup.eventTypeId == 3 ?
                          [
                            <p key="situation1">能见度&nbsp;:&nbsp;&nbsp;<span>{reservePopup.situation}m</span></p>,
                            <p key="eventLength1">影响道路长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventLength}m</span></p>,
                          ] :
                          [
                            <p key="situation1">平均车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopup.situation}km/h</span></p>,
                            <p key="eventLength1">拥堵路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventLength}m</span></p>,
                          ]
                      } */}
                      {
                        (reservePopup.planSource === 1 || reservePopup.planSource === 2) || <p key="situation">{this.state.unitText[reservePopup.eventType].tipsText}&nbsp;:&nbsp;&nbsp;<span>{reservePopup.showValue ? (reservePopup.showValue + this.state.unitText[reservePopup.eventType].unit) : '待生成'}</span></p>
                      }
                      <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopup.eventLength}m</span></p>
                    </div>
                    <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{reservePopup.planSourceName}</span></div>
                  </div>
                  {
                    reservePopup.devices && reservePopup.devices.map((items, indexs) => {
                      return (
                        items.dictCode === 1 || items.dictCode === 2 ?
                          <div className={styles.ItemBox} key={items.dictCode}>
                            <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                            <div className={styles.RowBox}>
                              {
                                items.device && items.device.map((item, index) => {
                                  return (
                                    <div className={styles.InputBox} key={item.deviceId + item.deviceTypeId}>
                                      <div className={styles.ItemInput} style={{ width: '30%', height: '32px', lineHeight: '32px', overflow: 'hidden' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName}>
                                        {
                                          reservePopup.planStatus === 1 ?
                                            <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item) }} />
                                            : null
                                        }
                                        {index + 1}.{item.deviceName + '-' + item.roadDirectionName}&nbsp;:
                                      </div>
                                      <div className={styles.ItemInput} style={{ width: '16%' }}>
                                        <Select disabled={reservePopup.planStatus > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '100%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'deviceControlType', 'reservePopup', item) : this.handleSelect(e, 'deviceControlType', 'publishPlanVO', item) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                              if ((reservePopup.update == true || reservePopup.update == false) || this.deviceReserve.length) {
                                                if (this.deviceReserve.includes(itemss.controlType)) {
                                                  return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                }
                                              } else {
                                                return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                              }
                                            })
                                          }
                                        </Select>
                                      </div>
                                      <div className={styles.ItemInput} style={{ width: '50%' }}>
                                        <Input key={item.content} maxLength={50} value={this.state.showContent[item.appendId]} style={{ textAlign: 'center', color: 'red' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleInput(e, 'content', 'reservePopup', item) : this.handleInput(e, 'content', 'publishPlanVO', item) }} disabled={reservePopup.planStatus > 1} />
                                      </div>

                                    </div>
                                  )
                                })
                              }
                              {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                            </div>
                          </div> : items.dictCode === 3 ?
                            <div className={styles.ItemBox} key={items.dictCode}>
                              <div className={styles.HeadItem}>{items.codeName}</div>
                              <div className={styles.RowBox}>
                                {
                                  items.device && items.device.map((item, index) => {
                                    return (
                                      <div className={styles.InputBox} key={item.deviceId + item.deviceTypeId}>
                                        <div className={styles.ItemInput} style={{ width: '30%', height: '32px', lineHeight: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName}>
                                          {
                                            reservePopup.planStatus === 1 ?
                                              <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item) }} />
                                              : null
                                          }
                                          {index + 1}.{item.deviceName + '-' + item.roadDirectionName}&nbsp;:
                                        </div>
                                        <div className={styles.ItemInput} style={{ width: '36%' }}>
                                          <Select disabled={reservePopup.planStatus > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'deviceControlType', 'reservePopup', item) : this.handleSelect(e, 'deviceControlType', 'publishPlanVO', item) }}>
                                            <Option value={0}>请选择</Option>
                                            {
                                              MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                                if ((reservePopup.update == true || reservePopup.update == false) || this.deviceReserve.length) {
                                                  if (this.deviceReserve.includes(itemss.controlType)) {
                                                    return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                  }
                                                } else {
                                                  return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                }
                                              })
                                            }
                                          </Select>
                                        </div>
                                        <div className={styles.ItemInput} style={{ width: '30%' }}>
                                          <Select disabled={reservePopup.planStatus > 1} value={this.state.showContent[item.appendId]} style={{ width: '100%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'content', 'reservePopup', item) : this.handleSelect(e, 'content', 'publishPlanVO', item) }}>
                                            <Option value="">请选择</Option>
                                            {
                                              deviceCodeList && deviceCodeList[1].map((itemss) => {
                                                return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                              })
                                            }
                                          </Select>
                                        </div>
                                      </div>
                                    )
                                  })
                                }
                                {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                              </div>
                            </div> : items.dictCode === 4 ?
                              <div className={styles.ItemBox} key={items.dictCode}>
                                <div className={styles.HeadItem}>{items.codeName}</div>
                                <div className={styles.RowBox}>
                                  {
                                    items.device && items.device.map((item, index) => {
                                      return (
                                        <div className={styles.InputBox} key={item.deviceId + item.deviceTypeId}>
                                          <div className={styles.ItemInput} style={{ width: '30%', height: '32px', lineHeight: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + '-' + (item.laneNum || '')}>
                                            {
                                              reservePopup.planStatus === 1 ? <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item) }} />
                                                : null
                                            }
                                            {index + 1}.{item.deviceName + '-' + item.roadDirectionName + '-' + item.laneNum}&nbsp;:
                                          </div>
                                          <div className={styles.ItemInput} style={{ width: '36%' }}>
                                            <Select disabled={reservePopup.planStatus > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'deviceControlType', 'reservePopup', item) : this.handleSelect(e, 'deviceControlType', 'publishPlanVO', item) }}>
                                              <Option value={0}>请选择</Option>
                                              {
                                                MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                                  if ((reservePopup.update == true || reservePopup.update == false) || this.deviceReserve.length) {
                                                    if (this.deviceReserve.includes(itemss.controlType)) {
                                                      return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                    }
                                                  } else {
                                                    return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                  }
                                                })
                                              }
                                            </Select>
                                          </div>
                                          <div className={styles.ItemInput} style={{ width: '30%' }}>
                                            <Select disabled={reservePopup.planStatus > 1} value={this.state.showContent[item.appendId]} style={{ width: '100%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'content', 'reservePopup', item) : this.handleSelect(e, 'content', 'publishPlanVO', item) }}>
                                              <Option value="">请选择</Option>
                                              {
                                                deviceCodeList && deviceCodeList[0].map((itemss) => {
                                                  return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                                })
                                              }
                                            </Select>
                                          </div>
                                        </div>
                                      )
                                    })
                                  }
                                  {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                                </div>
                              </div> : items.dictCode === 5 ?
                                <div className={styles.ItemBox} key={items.dictCode}>
                                  <div className={styles.HeadItem}>{items.codeName}</div>
                                  <div className={styles.RowBox}>
                                    {
                                      items.device && items.device.map((item, index) => {
                                        return (
                                          <div className={styles.InputBox} key={item.deviceId + item.deviceTypeId}>
                                            <div className={styles.ItemInput} style={{ width: '30%', height: '32px', lineHeight: '32px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + '-' + item.laneNum}>
                                              {
                                                reservePopup.planStatus === 1 ?
                                                  <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item) }} />
                                                  : null
                                              }
                                              {index + 1}.{item.deviceName + '-' + item.roadDirectionName + '-' + item.laneNum}&nbsp;:
                                            </div>
                                            <div className={styles.ItemInput} style={{ width: '36%' }}>
                                              <Select disabled={reservePopup.planStatus > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'deviceControlType', 'reservePopup', item) : this.handleSelect(e, 'deviceControlType', 'publishPlanVO', item) }}>
                                                <Option value={0}>请选择</Option>
                                                {
                                                  MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                                    if ((reservePopup.update == true || reservePopup.update == false) || this.deviceReserve.length) {
                                                      if (this.deviceReserve.includes(itemss.controlType)) {
                                                        return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                      }
                                                    } else {
                                                      return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', reservePopup.update == true || reservePopup.update == false ? 'reservePopup' : 'publishPlanVO', item) }}>{itemss.controlTypeName}</Option>
                                                    }
                                                  })
                                                }
                                              </Select>
                                            </div>
                                            <div className={styles.ItemInput} style={{ width: '30%' }}>
                                              <Select disabled={reservePopup.planStatus > 1} value={this.state.showContent[item.appendId]} style={{ width: '100%' }} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleSelect(e, 'content', 'reservePopup', item) : this.handleSelect(e, 'content', 'publishPlanVO', item) }}>
                                                <Option value="">请选择</Option>
                                                {
                                                  deviceCodeList && deviceCodeList[2].map((itemss) => {
                                                    return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                                  })
                                                }
                                              </Select>
                                            </div>
                                          </div>
                                        )
                                      })
                                    }
                                    {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                                  </div>
                                </div> : null
                      )
                    })
                  }
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>管控时段</div>
                    <div className={styles.RowBox}>
                      <div className={styles.ItemInput}>
                        起始时间&nbsp;:&nbsp;&nbsp;
                        <DatePicker
                          disabledDate={this.disabledStartDate}
                          showTime
                          disabled={reservePopup.planStatus > 1}
                          format="YYYY-MM-DD HH:mm:ss"
                          value={startValue ? moment(startValue, 'YYYY-MM-DD HH:mm:ss') : startValue}
                          placeholder="开始时间"
                          onChange={this.onStartChange}
                          onOpenChange={this.handleStartOpenChange}
                        />
                      </div>
                    </div>
                    <div className={styles.RowBox}>
                      <div className={styles.ItemInput}>
                        结束时间&nbsp;:&nbsp;&nbsp;
                        <DatePicker
                          disabledDate={this.disabledEndDate}
                          showTime
                          disabled={reservePopup.planStatus > 1}
                          format="YYYY-MM-DD HH:mm:ss"
                          value={endValue ? moment(endValue, 'YYYY-MM-DD HH:mm:ss') : endValue}
                          placeholder="结束时间"
                          onChange={this.onEndChange}
                          open={endOpen}
                          onOpenChange={this.handleEndOpenChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>事件描述</div>
                    <div className={styles.RowBox}>
                      <div style={{ width: '100%' }} className={styles.ItemInput}><Input maxLength={80} defaultValue={reservePopup.controlDes} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleInput(e, 'controlDes', 'reservePopup') : this.handleInput(e, 'controlDes', 'publishPlanVO') }} disabled={reservePopup.planStatus > 1} placeholder="事件描述" /></div>
                    </div>
                  </div>
                  {/* <div className={styles.ItemBox}>
                    <div className={styles.HeadItem}>发布渠道
                      <div style={{ marginLeft: '10px' }} className={styles.ItemInput}>
                        <Checkbox.Group defaultValue={reservePopup.channel} onChange={(e) => { reservePopup.update == true || reservePopup.update == false ? this.handleCheckboxGroup(e, 'channel', 'reservePopup') : this.handleCheckboxGroup(e, 'channel', 'publishPlanVO') }}>
                          <Checkbox value="1" >高德</Checkbox>
                          <Checkbox value="2" >管控设备</Checkbox>
                        </Checkbox.Group>
                      </div>
                    </div>
                  </div> */}
                </div>
                <div className={styles.ItemFooter}>
                  {
                    (reservePopup.planStatus === 1) || (reservePopup.update === true || reservePopup.update === false) ? <span onClick={reservePopup.update === true || reservePopup.update === false ? this.handleMarkControl : this.handleRelease}>发&nbsp;&nbsp;布</span> : null
                  }
                  {
                    ((reservePopup.planStatus === 2 && reservePopup.organization === 1) || (reservePopup.planStatus === 3 && reservePopup.organization === 2)) ? <span onClick={() => { this.handlecancelRel(reservePopup.planNum, 'audit') }}>审&nbsp;&nbsp;核</span> : null
                  }
                  {/* {
                    (reservePopup.planStatus === 1 || (reservePopup.planStatus === 2 && reservePopup.organization === 1) || (reservePopup.planStatus === 3 && reservePopup.organization === 2) || reservePopup.planStatus === 4) ? <span onClick={() => { this.handlecancelRel(reservePopup.planNum, 'cancel') }}>{reservePopup.planStatus === 4 ? '取 消' : '撤 销'}</span> : null
                  } */}
                  <span onClick={() => { this.handlecancelRel(reservePopup.planNum, 'cancel') }}>{reservePopup.planStatus === 4 ? '取 消' : '撤 销'}</span>
                  {/* {
                    reservePopup.planStatus === 3 ? <span onClick={() => { this.handleEndValueTime(true) }}>延&nbsp;&nbsp;时</span> : null
                  } */}
                  <span onClick={() => { this.handleEventPopup('Reserve', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div> : null
        }
        {
          (endValueTime) ?
            <div className={classNames(styles.EventPopup, styles.WhethePopupr)} ref={(el) => { el ? el.onmousedown = drags : null }}>
              <div className={styles.Title}>是否修改管控时段结束时间?</div>
              <div className={styles.Centent}>
                <div className={styles.RowBox}>
                  结束时间&nbsp;:&nbsp;&nbsp;
                  <p className={styles.ItemInput}>
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      value={endValueTime ? moment(endValueTime, 'YYYY-MM-DD HH:mm:ss') : endValue}
                      placeholder="结束时间"
                      onChange={this.onEndChangeTime}
                    />
                  </p>
                </div>
              </div>
              <div className={styles.ItemFooter}>
                <span onClick={() => { reservePopup ? this.handleWhethe() : this.handleWhetheState() }}>确&nbsp;&nbsp;认</span>
                <span onClick={() => { this.handleEndValueTime(false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div> : null
        }
        {
          detailsPopup ?
            <div className={styles.Eventdetails}>
              <Icon className={styles.Close} style={{ zIndex: '99' }} onClick={() => { this.handleEventPopup('Details', false) }} type="close" />
              <Collapse
                defaultActiveKey={[0, 1, 2, 3, 4, 5]}
                expandIconPosition="right"
              >
                <Panel header="事件详情" key={0}>
                  <div className={styles.Content}>
                    <div className={styles.Header}>
                      <span>事件编号&nbsp;:&nbsp;&nbsp;{detailsPopup.eventNum}</span>
                    </div>
                    <div className={styles.Header}>
                      <span>事件类型&nbsp;:&nbsp;&nbsp;<em style={{ color: '#f31113', fontStyle: 'normal' }}>{detailsPopup.eventTypeName}</em></span>
                    </div>
                    <div className={styles.ItemBox}>
                      <div className={styles.HeadItem}>基本信息</div>
                      <div className={styles.RowBox}>高速编号&nbsp;:&nbsp;&nbsp;{detailsPopup.hwayCode}</div>
                      <div className={styles.RowBox}>高速名称&nbsp;:&nbsp;&nbsp;{detailsPopup.hwayName}</div>
                      <div className={styles.RowBox}>
                        <p>行驶方向&nbsp;:&nbsp;&nbsp;{detailsPopup.roadDirectionName}</p>
                        <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{detailsPopup.pileNum && detailsPopup.pileNum.split(' ')[0]}</span></p>
                      </div>
                      <div className={styles.RowBox}>
                        {/*  {
                          (detailsPopup.eventType == 5 && detailsPopup.markEventType == 3) || detailsPopup.eventType == 3 ?
                            [
                              <p key="situation">能见度&nbsp;:&nbsp;&nbsp;<span>{detailsPopup.showValue}m</span></p>,
                              <p key="eventLength">影响道路长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p>
                            ] :
                            [
                              <p key="situation">平均车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{detailsPopup.showValue}km/h</span></p>,
                              <p key="eventLength">拥堵路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p>
                            ]
                        } */}
                        {
                          (detailsPopup.planSource === 1 || detailsPopup.planSource === 2) || <p key="situation">{this.state.unitText[detailsPopup.eventType].tipsText}&nbsp;:&nbsp;&nbsp;<span>{detailsPopup.showValue + this.state.unitText[detailsPopup.eventType].unit}</span></p>
                        }
                        <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p>
                      </div>
                      <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{detailsPopup.eventSourceName}</span></div>
                    </div>
                  </div>
                </Panel>
                {
                  detailsPopup.devices && detailsPopup.devices.map((item, ind) => {
                    return (
                      <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode} extra={detailsPopup.planSource > -1000 ? null : this.genExtraAdd(item, detailsPopup)}>
                        <div>
                          {
                            item.device && item.device.map((items, index) => {
                              return <div className={styles.PanelBox} key={items.appendId}><p className={styles.PanelItem} onClick={() => { this.handleSelect(items.latlng, items.appendId, 'Click', items) }}>{`${index + 1}. ${items.deviceName} ${items.roadDirectionName} ${items.laneNum || ''} ${item.codeName} `}</p>{detailsPopup.planSource > 0 || <Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                            })
                          }
                          {(item.device && item.device.length === 0) ? <p className={styles.PanelItemNone}>暂无数据</p> : null}
                        </div>
                      </Panel>
                    )
                  })
                }
              </Collapse>
              <div className={styles.panelBtnBox}>
                {detailsPopup.planSource > 0 ?
                  <div className={styles.Panelbutton}>
                    <span onClick={() => { this.handleViewControl(detailsPopup.planNum) }}>查看管控方案</span>
                  </div> :
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.Panelbutton}><span onClick={this.handleControl}>发起管控</span></div>
                    {/* <div className={styles.Panelbutton}><span onClick={(e) => { this.handleEventTag(true, e) }}>修改管控方案</span></div> */}
                  </div>
                }
              </div>
            </div> : null
        }
        {
          VIboardPopup ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.VIboardPopup)} style={{ left: '27%' }}>
                <div className={styles.Title}>添加{VIboardPopup}<Icon className={styles.Close} onClick={() => { this.handleEventPopup('VIboard', false) }} type="close" /></div>
                <div className={styles.Centent}>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>道&nbsp;路&nbsp;编&nbsp;号&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadCode', 'VIboardParameters') }}>
                        <Option value="">请选择</Option>
                        {
                          directionList && directionList.map((item) => {
                            return <Option value={item.roadId} key={item.roadId}>{item.roadName}</Option>
                          })
                        }
                      </Select>
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>道&nbsp;路&nbsp;名&nbsp;称&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input maxLength={50} placeholder="如 泰州大桥主线" onChange={(e) => { this.handleInput(e, 'roadName', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>道&nbsp;路&nbsp;方&nbsp;向&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select value={roadDirection} style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadDirection', 'VIboardParameters') }} >
                        <Option value="">请选择</Option>
                        {
                          hwayDirection && hwayDirection.map((item) => {
                            return <Option value={item.directionId} key={item.directionId}>{item.directionName}</Option>
                          })
                        }
                      </Select>
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>设&nbsp;备&nbsp;编&nbsp;号&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input maxLength={50} placeholder="如 878bbced-a937-4159-8245-9dd4d3a20f2a" onChange={(e) => { this.handleInput(e, 'deviceCode', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>设&nbsp;备&nbsp;名&nbsp;称&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input maxLength={50} placeholder="如 CMS20" onChange={(e) => { this.handleInput(e, 'deviceName', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>设&nbsp;备&nbsp;位&nbsp;置&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input maxLength={50} placeholder="如 K14+680" onChange={(e) => { this.handleInput(e, 'deviceLocation', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                    <span onClick={this.handleCondition}>查&nbsp;&nbsp;找</span>
                    <span onClick={() => { this.handleEventPopup('VIboard', false) }}>返&nbsp;&nbsp;回</span>
                  </div>
                </div>
              </div>
            </div> : null
        }
        {
          boxSelect ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.VIboardPopup, styles.conditionPopup, styles.devicePos)}>
                <div className={styles.Title}>添加硬件设备<Icon className={styles.Close} type="close" onClick={() => { this.handleEventPopup('boxSelect', false) }} /></div>
                <div className={styles.Centent}>
                  <div className="site-checkbox-all-wrapper">
                    <Checkbox
                      indeterminate={this.state.indeterminateBox}
                      onChange={this.onCheckBoxSelect}
                      checked={this.state.checkAllBox}
                    >
                      全选
                    </Checkbox>
                  </div>
                  <br />
                  <Checkbox.Group
                    value={checkedListBox}
                    onChange={this.getcheckedListBox}
                  >
                    {
                      boxSelectList.map((item) => {
                        return <Checkbox key={item.appendId} disabled={item.exists === true || item.controlling === true} value={item.appendId}>{item.deviceName + '-' + item.roadDirectionName + (item.laneNum ? ('-' + item.laneNum) : '')}<b style={{ color: 'yellow' }}>{item.exists === true || item.controlling === true ? " ( 已管控 )" : " "}</b></Checkbox>
                      })
                    }

                  </Checkbox.Group>

                </div>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span onClick={this.handleBoxSelectList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('boxSelect', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div> : null
        }
        {
          conditionList ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.VIboardPopup, styles.conditionPopup)}>
                <div className={styles.Title}>添加{VIboardPopup}<Icon className={styles.Close} onClick={() => { this.handleEventPopup('condition', false) }} type="close" /></div>
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
                        return <Checkbox key={item.deviceId} disabled={(item.controlling === true || item.exists === true)} value={item.deviceId}>{item.deviceName + '-' + item.directionName + (item.laneNum ? ('-' + item.laneNum) : '')}<b style={{ color: 'yellow' }}>{item.exists === true || item.controlling === true ? " ( 已管控 )" : " "}</b></Checkbox>
                      })
                    }

                  </Checkbox.Group>

                </div>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span onClick={this.handledetailsPopupList}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('condition', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div> : null
        }
        {
          EventTagPopup ?
            <div className={styles.MaskBox} style={{ zIndex: '996' }}>
              <div className={styles.EventTagging}>
                <GMap equipmentInfoWinImg={this.equipmentInfoWinImg} deviceString={this.state.deviceString.join()} EventTagPopup={EventTagPopup} equipmentInfoWin={this.equipmentInfoWin} styles={this.mapStyles} mapID='popMap' dataAll={SidePopLeft} roadLatlng={detailsLatlng} handledetai={this.handledetai} detailsPopup={detailsPopup} boxSelect={boxSelect} flagClose={flagClose} />
                <div className={styles.EventTaggingLeft} style={{ zIndex: '999' }}>
                  <div className={styles.Title} style={{ background: '#132334', position: 'fixed', top: '61px', left: 'calc(5% + 6px)', zIndex: '999', width: 'calc(21.6% - 2px)' }}>{EventTagPopupTit}<Icon className={styles.Close} onClick={() => { this.handleEventTag(false) }} type="close" /></div>
                  {
                    EventTagPopupTit !== '道路封闭' ?
                      [
                        <div key="TagPopupTitone" className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', marginTop: '60px', fontSize: '12px' }}>管控名称</div>,
                        <div key="TagPopupTittwo" className={styles.Centent}>
                          <div className={styles.ItemBox}>
                            <div className={styles.ItemInput}>
                              <Input maxLength={50} onChange={(e) => { this.handleInput(e, 'planName', 'controlDatas') }} />
                            </div>
                          </div>
                        </div>,
                      ] :
                      <div className={styles.Centent}>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>事件编号:</span>
                          <div className={styles.ItemInput} style={{ display: 'inline' }}>{this.controlDatas.eventId}</div>
                        </div>
                      </div>
                  }
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>{EventTagPopupTit === '道路封闭' ? '选择封闭道路' : '选择道路'}</div>
                  {/*   {
                    EventTagPopupTit === '主动管控' ?
                      <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择道路</div>
                      :
                      <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', marginTop: '0px', fontSize: '12px' }}>选择道路</div>
                  } */}
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <div className={styles.ItemInput}>
                        <Select value={this.controlDatas.hwayId} style={{ width: '48%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'hwayId', 'controlDatas') }}>
                          <Option value="">请选择</Option>
                          {
                            hwayList && hwayList.map((item) => {
                              return <Option key={item.hwayId} value={item.hwayId}>{item.hwayName}</Option>
                            })
                          }
                        </Select>
                        <Select value={this.state.directionName} style={{ width: '48%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'directionId', 'controlDatas') }} >
                          <Option value="">请选择</Option>
                          {
                            roadNumber && roadNumber.map((item) => {
                              return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                            })
                          }
                        </Select>
                        <Select defaultValue="1" style={{ width: '26%', margin: '8px 1%' }} disabled onChange={(e) => { this.handleSelect(e, 'locationMode', 'controlDatas') }} >
                          <Option value="0">收费站</Option>
                          <Option value="1">里程桩</Option>
                        </Select>
                        <Input maxLength={50} id="startInt" style={{ width: '34%', height: '32px', margin: '8px 1%' }} placeholder="起始桩号如:k1" defaultValue={this.controlDatas.startPileNum} onBlur={(e) => { this.handleInput(e, 'startPileNum', 'controlDatas'); this.handSecUrl() }} />
                        <Input maxLength={50} id="endInt" style={{ width: '34%', height: '32px', margin: '8px 1%' }} placeholder="结束桩号如:k30" defaultValue={this.controlDatas.endPileNum} onBlur={(e) => { this.handleInput(e, 'endPileNum', 'controlDatas'); this.handSecUrl() }} />
                      </div>
                    </div>
                  </div>
                  {
                    EventTagPopupTit !== '道路封闭' ?
                      [
                        <div key="PopupTitOne" className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择事件类型</div>,
                        <div key="PopupTitTwo" className={styles.Centent}>
                          <div className={styles.ItemBox}>
                            <div className={styles.ItemInput}>
                              {
                                eventTypes && eventTypes.map((item, i) => {
                                  return <div className={classNames(styles.AddItem, (this.state.eventType === item.eventType ? styles.currentSel : null))} key={'eventTypes' + item.eventType} onClick={() => { this.handleSelect(item.eventType, 'eventTypeName', 'Click') }}>{item.eventTypeName}</div>
                                })
                              }
                            </div>
                          </div>
                        </div>,
                        <div key="PopupTitThree" className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控类型</div>,
                        <div key="PopupTitFoue" className={styles.Centent}>
                          <div className={styles.ItemBox}>
                            <div className={styles.ItemInput}>
                              {
                                controlTypes && controlTypes.map((item) => {
                                  return <div className={classNames(styles.AddItem, (this.state.deviceString.includes(item.id) ? styles.currentSel : null))} key={'controlTypes' + item.id} onClick={() => { this.updateControlTypes(item.id) }}>{item.name}</div>
                                })
                              }
                            </div>
                          </div>
                        </div>,
                      ] : [
                        <div key="PopupTitOne" className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>绕行方案&nbsp;&nbsp;(目的地) <Icon type="plus" className={styles.proposalPlus} onClick={() => { this.setState({ SearchInputCity: true }) }} /></div>,
                        <div key="PopupTitTwo" className={styles.Centent} style={{ maxHeight: '120px' }}>
                          <div className={styles.ItemBox} style={{ marginTop: '5px' }}>
                            <div className={styles.ItemInput}>
                              {
                                eventTypes && eventTypes.map((item, i) => {
                                  return <div className={classNames(styles.AddItem, styles.currentSel)} key={item.eventType} style={{ position: 'relative', width: '31%', paddingRight: '22px' }}>{item.eventTypeName}<Icon style={{ position: 'absolute', right: '5px', top: '8px' }} type="close" /></div>
                                })
                              }
                            </div>
                          </div>
                        </div>,
                        <div key="PopupTitThree" className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>绕行建议</div>,
                        <div key="PopupTitOFour" className={styles.Centent} style={{ maxHeight: '200px' }}>
                          <div className={styles.ItemBox} style={{ marginTop: '5px' }}>
                            <div className={styles.ItemInput}>
                              {
                                eventTypes && eventTypes.map((item, i) => {
                                  return <div className={styles.Proposal} key={i}>{i}</div>
                                })
                              }
                            </div>
                          </div>
                        </div>,
                      ]
                  }
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控设施</div>
                  <div className={styles.Centent} style={{ maxHeight: '250px' }}>
                    <Collapse
                      defaultActiveKey={[1]}
                      expandIconPosition="right"
                    >
                      {
                        EventTagPopupTit === '主动管控' || EventTagPopupTit === '道路封闭' ?
                          deviceTypes && deviceTypes.map((item, ind) => {
                            return (
                              <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode}>
                                <div>
                                  {
                                    item.device && item.device.map((items, index) => {
                                      return <div className={styles.PanelBox} key={items.appendId}><p className={styles.PanelItem} onClick={() => { this.openInfoWin(items) }}>{`${index + 1}. ${items.deviceName} ${items.roadDirectionName} ${item.codeName}`}</p>{<Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                                    })
                                  }
                                  {(item.device && item.device.length === 0) ? <p className={styles.PanelItemNone}>暂无数据</p> : null}
                                </div>
                              </Panel>
                            )
                          }) : detailsPopup.devices && detailsPopup.devices.map((item, ind) => {
                            return (
                              <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode}>
                                <div>
                                  {
                                    item.device && item.device.map((items, index) => {
                                      return <div className={styles.PanelBox} key={items.appendId}><p className={styles.PanelItem} onClick={() => { this.openInfoWin(items) }}>{`${index + 1}. ${items.deviceName} ${items.roadDirectionName} ${item.codeName}`}</p>{detailsPopup.planSource > 0 || <Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                                    })
                                  }
                                  {(item.device && item.device.length === 0) ? <p className={styles.PanelItemNone}>暂无数据</p> : null}
                                </div>
                              </Panel>
                            )
                          })
                      }
                    </Collapse>
                  </div>
                  <div className={styles.ItemFooter}>
                    <span onClick={() => { this.handleMarkControlPop() }}>发起管控</span>
                  </div>
                </div>
                <div id="searchBox" style={{ top: '5px' }} className={`${styles.searchBox} animated ${'bounceInDown'}`}>
                  <Search id="tipinputPop" placeholder="请输入内容" enterButton />
                  {/* <s>框选设备</s> */}
                </div>
                <div id="deviceBox" style={{ top: '5px', right: '0' }} className={`${styles.mapIconManage} animated ${'bounceInDown'}`}>
                  {controlBtnFlag ? <span onClick={(e) => { this.controlBtnClick(e) }}>{controlBtnFlagText}</span> : null}
                  <span>
                    <Popover content={(<div>
                      <p className={this.state.deviceTurnBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTurnBoard, 'deviceTurnBoard') }}>门架情报板</p>
                      <p className={this.state.deviceFInfoBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceFInfoBoard, 'deviceFInfoBoard') }}>F屏情报板</p>
                      <p className={this.state.deviceInfoBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceInfoBoard, 'deviceInfoBoard') }}>限速牌专用</p>
                      <p className={this.state.deviceTollGate ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTollGate, 'deviceTollGate') }}>收费站匝道灯</p>
                      <p className={this.state.carRoadBoard ? styles.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.carRoadBoard, 'carRoadBoard') }}>车道控制器</p>
                    </div>)} title="" trigger="hover">
                      设备显示
                  </Popover>
                  </span>
                </div>
                <div id="roadStateBox" className={`${styles.roadState} animated ${'bounceInUp'}`}>
                  <h5><p>路况</p></h5>
                  <h5><span className={styles.redColor}>{'< 60km/h'}</span></h5>
                  <h5><p>能见度</p></h5>
                  <h5 className={styles.visibility}>
                    <s>{'< 50'}</s>
                    <s>{'50 - 100'}</s>
                    <s>{'100 - 200'}</s>
                    <s>{'200 - 500'}</s>
                  </h5>
                  {/* <p>
                  <span>严重拥堵</span>
                  <span>拥挤</span>
                  <span>缓行</span>
                  <span>畅通</span>
                </p> */}
                  <h5>
                    <em>门架情报板</em>
                    <em>F屏情报板</em>
                    <em>限速牌专用</em>
                    <em>收费站匝道灯</em>
                    <em>车道控制器</em>
                  </h5>
                </div>
              </div>
            </div> : null
        }
        {
          SearchInputCity ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.VIboardPopup)}>
                <div className={styles.Title}>添加城市<Icon className={styles.Close} type="close" onClick={() => { this.setState({ SearchInputCity: null }) }} /></div>
                <div className={styles.Centent} style={{ height: '75px' }}>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>城&nbsp;市&nbsp;搜&nbsp;索&nbsp;:&nbsp;</span>
                    <div className={styles.ItemInput}>
                      <SearchInput OpenInforItem={(e) => { this.SearchInputValue = e }} />
                    </div>
                  </div>
                </div>
                <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                  <span>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.setState({ SearchInputCity: null }) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div> : null
        }
        {InfoWinPopup ?
          <div className={styles.MaskBox}>
            <div className={classNames(styles.EventPopup, styles.VIboardPopup)}>
              <div className={styles.Title}>{InfoWinPopup.deviceName}-{InfoWinPopup.directionName}-{InfoWinPopup.deviceTypeName}<Icon className={styles.Close} type="close" onClick={this.equipmentInfoWin.bind('', false)} /></div>
              {InfoWinPopup.deviceType === 1 || InfoWinPopup.deviceType === 2 ?
                <div className={styles.Centent}>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }}>
                        <Option value="">请选择</Option>
                        {
                          MeasuresList[InfoWinPopup.deviceType] && MeasuresList[InfoWinPopup.deviceType].map((itemss) => {
                            if (EventTagPopup && this.state.deviceString.length) {
                              if (this.state.deviceString.includes(itemss.controlType)) {
                                return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                              }
                            } else {
                              return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                            }
                          })
                        }
                      </Select>
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input maxLength={50} value={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }} />
                    </div>
                  </div>
                </div> : InfoWinPopup.deviceType === 3 ?
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                          <Option value="">请选择</Option>
                          {
                            MeasuresList[InfoWinPopup.deviceType] && MeasuresList[InfoWinPopup.deviceType].map((itemss) => {
                              if (EventTagPopup && this.state.deviceString.length) {
                                if (this.state.deviceString.includes(itemss.controlType)) {
                                  return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                }
                              } else {
                                return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                              }
                            })
                          }
                        </Select>
                      </div>
                    </div>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} value={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                          <Option value="">请选择</Option>
                          {
                            deviceCodeList && deviceCodeList[1].map((itemss) => {
                              return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                            })
                          }
                        </Select>
                      </div>
                    </div>

                  </div> : InfoWinPopup.deviceType === 4 ?
                    <div className={styles.Centent}>
                      <div className={styles.ItemBox}>
                        <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                        <div className={styles.ItemInput}>
                          <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                            <Option value="">请选择</Option>
                            {
                              MeasuresList[InfoWinPopup.deviceType] && MeasuresList[InfoWinPopup.deviceType].map((itemss) => {
                                if (EventTagPopup && this.state.deviceString.length) {
                                  if (this.state.deviceString.includes(itemss.controlType)) {
                                    return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                  }
                                } else {
                                  return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                }
                              })
                            }
                          </Select>
                        </div>
                      </div>
                      <div className={styles.ItemBox}>
                        <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                        <div className={styles.ItemInput}>
                          <Select style={{ width: '100%' }} value={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                            <Option value="">请选择</Option>
                            {
                              deviceCodeList && deviceCodeList[0].map((itemss) => {
                                return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                              })
                            }
                          </Select>
                        </div>
                      </div>

                    </div> : InfoWinPopup.deviceType === 5 ?
                      <div className={styles.Centent}>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                          <div className={styles.ItemInput}>
                            <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                              <Option value="">请选择</Option>
                              {
                                MeasuresList[InfoWinPopup.deviceType] && MeasuresList[InfoWinPopup.deviceType].map((itemss) => {
                                  if (EventTagPopup && this.state.deviceString.length) {
                                    if (this.state.deviceString.includes(itemss.controlType)) {
                                      return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                    }
                                  } else {
                                    return <Option key={itemss.controlType} onClick={() => { this.handleInfoWinChange(itemss.showContent, 'content') }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                  }
                                })
                              }
                            </Select>
                          </div>
                        </div>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                          <div className={styles.ItemInput}>
                            <Select style={{ width: '100%' }} value={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                              <Option value="">请选择</Option>
                              {
                                deviceCodeList && deviceCodeList[2].map((itemss) => {
                                  return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                })
                              }
                            </Select>
                          </div>
                        </div>

                      </div> : null}
              <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                <span onClick={this.handleInfoWinPopup}>确&nbsp;&nbsp;认</span>
                <span onClick={() => { this.equipmentInfoWin(false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
          </div> : null}
        {
          reservePopupOne ?
            <div className={styles.MaskBox} style={{ zIndex: '9999' }}>
              <div className={eqStyle.AddBox}>
                <div className={eqStyle.Title}>{reservePopupOne.devices ? '管控详情' : '事件详情'}<Icon onClick={() => { this.setState({ reservePopupOne: null }) }} className={styles.Close} type="close" /></div>
                <div className={eqStyle.Conten}>
                  <div className={eqStyle.Header}>
                    <span>事件编号&nbsp;:&nbsp;&nbsp;{reservePopupOne.eventNum}</span>
                    <span>事件类型&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopupOne.eventTypeName}</span></span>
                  </div>
                  <div className={eqStyle.ItemBox}>
                    <div className={eqStyle.HeadItem}>基本信息</div>
                    <div className={eqStyle.RowBox}>
                      <p>高速编号&nbsp;:&nbsp;&nbsp;{reservePopupOne.hwayCode}</p>
                      <p>高速名称&nbsp;:&nbsp;&nbsp;{reservePopupOne.hwayName}</p>
                      <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopupOne.roadDirectionName}</p>
                    </div>
                    <div className={eqStyle.RowBox}>
                      <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopupOne.pileNum && reservePopupOne.pileNum.split(' ')[0]}</span></p>
                      {
                        (reservePopupOne.planSource === 1 || reservePopupOne.planSource === 2) || <p key="situation">{this.state.unitText[reservePopupOne.eventType].tipsText}&nbsp;:&nbsp;&nbsp;<span>{reservePopupOne.showValue + this.state.unitText[reservePopupOne.eventType].unit}</span></p>
                      }
                      <p key="eventLength">影响路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{reservePopupOne.eventLength}m</span></p>
                    </div>
                    <div className={eqStyle.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{reservePopupOne.planSourceName}</span></div>
                  </div>
                </div>
              </div>
            </div> : null
        }
      </div>
    )
  }
}

export default MonitoringModule
