import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
import GMap from '../../components/GMap/GMap'
import SidePop from '../../components/SidePop/SidePop'
import styles from './MonitoringModule.scss'
import classNames from 'classnames'
import 'animate.css'
import getResponseDatas from '../../plugs/HttpData/getResponseData'
import { Input, Checkbox, Radio, Icon, Switch, DatePicker, Collapse, Select, Modal, message } from 'antd'
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
      oldDeviceTypes: null, // 设备空类型
      updatePoint: null, // 更新坐标点
      eventType: 1, // 事件类型
      deviceString: [], // 交通设施参数
    }
    // 修改管控时的参数
    this.controlDatas = {
      eventId: '', // 事件ID
      roadId: '', // 高速ID
      directionId: '', // 方向ID
      startPileNum: '', //桩号
      endPileNum: '', //桩号
      roadName: '', // 高速名称
      eventType: 1, // 事件类型
      directionName: '',
      locationMode: '0',
      situation: 0, // 
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
    this.planStatus = 0
    this.eventListUrl = '/control/event/list/events' // 根据条件查询所有事件
    this.groupTypeUrl = '/control/event/total/number/group/type' //  统计事件数量，根据事件状态分组
    this.groupStatusUrl = '/control/plan/total/number/group/status' // 统计方案数量，根据方案状态分组
    this.planListUrl = '/control/plan/list/' // {planStatus}'根据方案状态，查询方案集合，页面初始加载，查询所有，传0
    this.detailUrl = '/control/event/get/detail/' // {eventId}/{eventType}查看事件详情'
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.hwayUrl = '/control/road/list/hway' //  获取高速编号，用于下拉框'
    this.directionUrl = '/control/road/list/hway/direction/' //获取高速和方向的级联下拉框，用于下拉框
    this.conditionUrl = '/control/device/list/condition' // {deviceTypeId} // 条件查询设备回显'
    this.controlUrl = '/control/plan/start/control' // 发起管控'
    this.getInfoUrl = '/control/plan/get/info/' // {eventType}/{eventId} 获取管控方案'
    this.getDeviceAllUrl = '/control/device/get/in/area' // 获取指定区域内的设备
    this.publishUrl = '/control/plan/publish/control' // 发布管控方案'
    this.examineUrl = '/control/plan/examine/control/' // {operation}/{controllId} // 方案审核接口（通过，取消）'
    this.endTimeUrl = '/control/plan/update/end/time/' // {eventTypeId}/{eventId}/{controllId} 修改管控方案结束时间'
    this.deviceUrl = '/control/event/get/control/type/by/device/' // 根据管控类型，获取管控设备集合（去重）
    this.markPublishUrl = '/control/event/mark/publish/' // 标注事件发起管控 和修改管控方案同一个接口
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
    // 方向下拉
    this.handleUrlAjax(this.directionUrl, 'directionList')
    // 字典事件类型
    this.handlelistDetail('eventTypes', 23)
    // // 字典交通管控类型
    // this.handlelistDetail('controlTypes', 22)
    // 字典交通管控设施
    // this.handlelistDetail('deviceTypes', 18)
    // 获取全部交通设施
    this.getDeviceEventList()
  }
  onStartChange = (value) => {
    this.onPickerChange('startValue', value)
    this.publishPlanVO.startTime = this.getDate(value._d)
  }
  onEndChange = (value) => {
    this.onPickerChange('endValue', value)
    this.publishPlanVO.endTime = this.getDate(value._d)
  }
  onEndChangeTime = (value) => {
    this.setState({
      endValueTime: this.getDate(value._d),
    })
  }
  onPickerChange = (field, value) => {
    this.setState({
      [field]: this.getDate(value._d),
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
    let _this = this;
    // console.log(type, boolean)
    if (type === 'boxSelect') {
      this.setState({
        boxSelect: false,
      })
    }
    if (type === 'Event') {
      if (boolean) {
        this.eventQuery = {
          eventType: boolean.type,
          searchKey: '',
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
      // console.log(type, boolean.latlng, '详情的经纬度')
      console.log(boolean, '单条数据')
      if (window.listItemDom && boolean === false) {
        window.listItemDom.style.background = ''
      }
      if (boolean) {
        this.handledetai(boolean)
        // 根据事件类型绘制不同颜色的线
        this.setState({
          detailsLatlng: boolean.latlng,
        })
        boolean.eventType === 3 ? window.lineFlag = false : window.lineFlag = true
        let roadLatlngData = {
          "path": boolean.latlng
        }
        let lineDatas = []
        lineDatas.push(roadLatlngData)
        window.pathSimplifierIns.setData(lineDatas)
      } else {
        this.setState({
          detailsPopup: false,
          controlBtnFlag: null,
        })
      }
    }
    if (type === 'Reserve') {
      this.setState({
        reservePopup: boolean,
        /* detailsPopup: this.detailsPopupData, */
        endValue: null,
        startValue: null,
      })
    }
    if (type === 'Whethe') {
      this.setState({
        whethePopup: boolean,
      })
      /* const popLayer = $(event.currentTarget).parents('#popLayer');
      popLayer.removeAttr('style')
      if (event && $(event.currentTarget).text() === '确  认') {
        popLayer.attr('style', 'width:24%')
      } */
    }
    if (type === 'VIboard') {
      this.setState({ VIboardPopup: boolean })
    }
    if (type === 'condition') {
      this.setState({ conditionList: boolean })
    }
    if (type === 'controldet') {
      this.handleViewControl(boolean.eventTypeId, boolean.eventId)
    }
    if (type === 'examine') {
      this.planStatus = 2
      this.handleplanList()
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
    this.VIboardParameters.deviceTypeId = item.dictCode
    this.VIboardParameters.eventPileNum = data.pileNum.split(' ')[0]
    this.VIboardParameters.eventTypeId = data.eventType ? data.eventType : data.eventTypeId
    this.VIboardParameters.value = data.situation
    this.VIboardParameters.control = data.eventType ? false : true
    this.getdeviceList(item)
    this.handlelistDetail('roadNumber', 1)
    this.handleEventPopup('VIboard', item.codeName)
  }
  getdeviceList = (data) => {
    this.deviceList = []
    data.device.map((item) => {
      this.deviceList.push(item.deviceId)
    })
  }
  handleInput = (e, name, type, data) => {
    if (type === 'publishPlanVO' && name === 'content') {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.deviceId === data) {
          this.publishPlanVO.list[index].content = e.target.value
        }
      })
    } else {
      if (this.controlDatas.locationMode === '0') {
        this[type][name] = 'k' + e.target.value
      } else {
        this[type][name] = e.target.value
      }
    }
  }
  handleSelect = (value, name, type, data) => {
    if (type === 'publishPlanVO' && name === 'deviceControlType') {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.deviceId === data) {
          this.publishPlanVO.list[index].deviceControlType = value
        }
      })
    } else if (type === 'hwayList' && name === 'roadId') {
      this.state.directionList.forEach((item, index) => {
        if (item.roadId === value) {
          this.setState({
            roadNumber: item.directions,
          })
          this.controlDatas.hwayDirectionIndex = ''
        }
      })
    } else {
      if (type === 'Click' && !(value instanceof Array)) {
        // debugger
        this.setState({
          eventType: value,
        })
      } else if (value instanceof Array) {
        window.map.setZoomAndCenter(13, value)
        debugger
        this.setState({
          updatePoint: {
            content: '',
            deviceId: '',
            deviceName: '',
            deviceTypeId: null,
            directionName: '',
            latlng: [],
            pileNum: '',
            roadName:'',
          },
        }, () => {
          this.setState({
            updatePoint: data,
          })
        })
      } else {
        debugger
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
    const nowIndex = this.state.deviceString.indexOf(controlId) > -1 ? this.state.deviceString.indexOf(controlId) : -1
    if (nowIndex > -1 && this.state.deviceString.length > 1) {
      this.state.deviceString.splice(nowIndex, 1)
    } else if (this.state.deviceString.length === 1) {
      message.info('管控类型至少选中一个')
    } else {
      this.state.deviceString.push(controlId)
    }
    this.setState({
      deviceString: this.state.deviceString,
    }, () => {
      this.getDeviceEventList(true)
    })
  }
  // 获取全部交通管控类型
  getDeviceEventList = (flag) => {
    const params ={
      controlTypes: this.state.deviceString.join()
    }
    debugger
    getResponseDatas('get', this.deviceUrl, params ).then((res) => {
      const result = res.data
      // console.log(result)
      debugger
      if (result.code === 200) {
        console.log(result.data, "这是啥？")
        if (flag) {
          this.setState({
            deviceTypes: result.data.deviceTypes,
          })
        } else {
          this.setState({
            controlTypes: result.data.controlTypes,
            deviceTypes: result.data.deviceTypes,
          }, () => {
            const arrId =[]
            this.state.controlTypes.map((item) => {
              arrId.push(item.controlTypeId)
            })
            this.setState({
              deviceString: arrId,
            })
          })
        }
        
      }
    })
    
  }
  // 获取左侧列表数据
  handleEventList = () => {
    getResponseDatas('get', this.eventListUrl, this.eventQuery).then((res) => {
      const result = res.data
      // console.log(result)
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
          // console.log(SidePopLeft);
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
      // console.log(result)
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
  // 框选按钮点击
  controlBtnClick = (event) => {
    const _this = this;
    const textFlag = $(event.target).text() === '框选设备'
    this.setState({
      controlBtnFlagText: textFlag ? '关闭框选' : '框选设备',
    }, () => {
      if (textFlag) {
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
        $(".amap-maps").attr("style", "cursor:crosshair")
        window.drawRectangle()
        this.setState({
          flagClose: true,
          boxFlag: true,
        }, () => {
          window.map.on("mousedown", function (e) {
            // console.log(e, "down..")
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
            // console.log(this.deviceList, "up..")
            const newArr = []
            newArr[0] = e.lnglat.lng
            newArr[1] = e.lnglat.lat
            newPoint[2] = newArr
            newPoint[1] = [newPoint[2][0], newPoint[0][1]]
            newPoint[3] = [newPoint[0][0], newPoint[2][1]]
            if (_this.state.boxFlag && _this.state.flagClose) {
              if (_this.state.EventTagPopupTit === '事件标注') {
                console.log("标注的框选")
                const params = {
                  devices: _this.state.deviceTypes,
                  roadPileNum: _this.controlDatas.startPileNum + ' ' + _this.controlDatas.endPileNum,
                  eventType: _this.state.eventType,
                }
                _this.getDevice(params);
              } else if (_this.state.EventTagPopupTit === '修改管控方案') {
                console.log("修改的框选")
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
    getResponseDatas('get', this.detailUrl + item.eventId + '/' + item.eventType).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({
          detailsPopup: result.data,
        }, () => {
          if (!this.state.detailsPopup.controlStatusType) { // 为0时未管控 显示框选按钮否则不显示
            this.setState({
              controlBtnFlag: true,
            })
          } else {
            this.setState({
              controlBtnFlag: null,
            })
          }
          console.log(this.state.detailsPopup, "look here")
        })
      }
    })
  }
  // 获取所有框选设备
  getDevice = (item) => {
    const existsDevices = []
    const listDevices = []
    if (item && item.devices.length > 0) {
      for (let i = 0, devicesArr = item.devices; i < devicesArr.length; i++) {
        // console.log(devicesArr, "00001")
        devicesArr[i].device && devicesArr[i].device.map((item) => {
          existsDevices.push(item.appendId)
          listDevices.push(item.deviceId)
        })
      }
    }
    let params = {
      "area": window.newPoint,
      "control": false,
      "eventPileNum": item.roadPileNum,
      "eventTypeId": item.eventType,
      "existsDevices": existsDevices
    }
    getResponseDatas('post', this.getDeviceAllUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        const noDevices = []
        result.data.map((item) => {
          if (!(listDevices.includes(item.deviceId))) {
            noDevices.push(item.deviceId)
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
    const { oldDevicesList } = this.state
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
    debugger
    const { checkedListBox, detailsPopup, boxSelectList, oldDevicesList, EventTagPopupTit, deviceTypes } = this.state
    boxSelectList.forEach((item) => {
      checkedListBox.forEach((items) => {
        if (item.deviceId === items) {
          if (EventTagPopupTit !== '事件标注') {
            detailsPopup.devices.forEach((itemss, index) => {
              if (itemss.dictCode === item.deviceTypeId) {
                detailsPopup.devices[index].device.push(item)
              }
            })
          } else {
            deviceTypes.forEach((itemss, index) => {
              if (itemss.dictCode === item.deviceTypeId) {
                deviceTypes[index].device.push(item)
              }
            })
          }

        }
      })
    })
    if (EventTagPopupTit !== '事件标注') {
      this.setState({ detailsPopup, boxSelectList: null, checkAllBox: null, controlBtnFlagText: '框选设备', boxSelect: null, flagClose: null, boxFlag: null }, () => {
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) //关闭，并清除覆盖物
      })
    } else {
      this.setState({ deviceTypes, boxSelectList: null, checkAllBox: null, controlBtnFlagText: '框选设备', boxSelect: null, flagClose: null, boxFlag: null }, () => {
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
        debugger
        this.setState({ [name]: result.data }, () => {
          if (name === 'deviceTypes') {
            // console.log(this.state.deviceTypes, 'What?')
            this.state.deviceTypes.map((item) => {
              item.device = []
            })
            this.setState({
              oldDeviceTypes: this.state.deviceTypes,
            })
            // console.log(this.state.deviceTypes, 'resoult!')
          }
        })
      }
    })
  }
  // 通用呆板式接口请求
  handleUrlAjax = (url, name) => {
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  getDate = (time) => {
    let today = ''
    today = new Date()
    if (time) {
      today = new Date(time)
    }
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '-' + month + '-' + day + ' '
    const navmse = hour + ':' + minutes + ':' + seconds
    return navtime + navmse
  }
  // 可变情报板查询
  handleCondition = () => {
    getResponseDatas('get', this.conditionUrl, this.VIboardParameters).then((res) => {
      const result = res.data
      // console.log(result.data)
      if (result.code === 200) {
        const plainOptionList = []
        result.data.map((item) => {
          if (!(this.deviceList.includes(item.deviceId))) {
            plainOptionList.push(item.deviceId)
          }
        })
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
    const { detailsPopup, deviceTypes, EventTagPopupTit } = this.state
    if (EventTagPopupTit === '事件标注') {
      deviceTypes[ind].device.splice(index, 1)
      this.setState({ deviceTypes })
    } else if (EventTagPopupTit === '修改管控方案') {
      detailsPopup.devices[ind].device.splice(index, 1)
      this.setState({ detailsPopup })
    }
    
  }
  handleMarkControl = (titFlag) => {
    debugger
    const { deviceString, deviceTypes, detailsPopup} = this.state
    const { eventId, eventType, pileNum, roadSecId, situation, devices } = detailsPopup
    let data = {}
    const that = this
    if (titFlag === '事件标注') {
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
        return
      }
      if (!this.controlDatas.endPileNum) {
        message.info('请输入结束桩号！')
        return
      }
      
      if (!this.controlDatas.situation) {
        message.info('请输入对应数据！')
        return
      }
      data = {
        "controlType": deviceString.join(),
        "devices": deviceTypes,
        "directionId": this.controlDatas.directionId,
        "endPileNum": this.controlDatas.endPileNum,
        "eventId": this.controlDatas.eventId,
        "eventTypeId": this.state.eventType,
        "locationMode": 1, // 里程桩 1  收费站不知道
        "roadId": this.controlDatas.roadName,
        "startPileNum": this.controlDatas.startPileNum,
        "update": false,
        "value": this.controlDatas.situation,
        "latlngs": this.controlDatas.latlng
      }
    } else {
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
      if (deviceAry.length === 0) {
        message.warning('请添加设备')
        return
      }
      data = {
        "controlType": deviceString.join(),
        "devices": deviceAry,
        "directionId": this.controlDatas.directionId,
        "endPileNum": this.controlDatas.endPileNum,
        "eventId": this.controlDatas.eventId,
        "eventTypeId": this.controlDatas.eventType,
        "locationMode": 1, // 里程桩 1  收费站不知道
        "roadId": this.controlDatas.roadName,
        "startPileNum": this.controlDatas.startPileNum,
        "update": true,
        "value": this.controlDatas.situation,
        "latlngs": this.controlDatas.latlng
      }
    }
    getResponseDatas('post', this.markPublishUrl, data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        that.handledetai({ eventType:that.controlDatas.eventType, eventId:that.controlDatas.eventId })
        message.success('发起管控方案成功！')
        that.handleEventList()
        that.handlegroupType()
        that.handleUrlAjax(that.groupStatusUrl, 'groupStatus')
        that.handleplanList()
        // 获取方案详情
        that.handleViewControl(that.controlDatas.eventType, that.controlDatas.eventId)
      }
    })
  }
  handleControl = () => {
    const that = this
    const { detailsPopup } = that.state
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
      if (deviceAry.length === 0) {
        message.warning('请添加设备')
        return
      }
      const data = {
        createId: 1,
        devices: deviceAry,
        eventId,
        eventTypeId: eventType,
        pileNum,
        roadSecId,
        value: situation,
      }
    getResponseDatas('post', that.controlUrl, data).then((res) => {
      const result = res.data
      if (result.code === 200) {
        that.handledetai({ eventType, eventId })
      /*   message.success('发起管控方案成功！') */
        that.handleEventList()
        that.handlegroupType()
        that.handleUrlAjax(that.groupStatusUrl, 'groupStatus')
        that.handleplanList()
        // 获取方案详情
        that.handleViewControl(eventType, eventId)
        /* that.handleEventPopup('Reserve', true) */
      }
    })
  }
  handleViewControl = (eventType, eventId) => {
    const { detailsPopup } = this.state
    getResponseDatas('get', this.getInfoUrl + eventType + '/' + eventId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        $('#searchBox').attr('style', 'transition:all .5s;')
        $('#roadStateBox').attr('style', 'transition:all .5s;')
        /* this.detailsPopupData = detailsPopup */
        const list = []
        result.data.devices.forEach((item) => {
          item.device.forEach((items) => {
            list.push({
              content: items.displayContent,
              deviceId: items.deviceId,
              deviceTypeId: items.deviceTypeId,
              deviceControlType: items.deviceControlType,
            })
          })
        })
        this.publishPlanVO = {
          channel: '',
          controlDes: '',
          controllId: result.data.controllId,
          endTime: result.data.endTime ? this.getDate(result.data.endTime) : '',
          eventTypeId: result.data.eventTypeId,
          list,
          startTime: result.data.startTime ? this.getDate(result.data.startTime) : this.getDate(),
        }
        this.handlelistDetail('MeasuresList', 22)
        this.setState({ reservePopup: result.data, /* detailsPopup: null, */ startValue: this.publishPlanVO.startTime, endValue: this.publishPlanVO.endTime })
      }
    })
  }
  handleEventTag = (boolean, e) => {
    if (boolean && $(e.target).text() === '修改管控方案' ) {
      this.controlDatas = this.state.detailsPopup
      this.controlDatas.startPileNum = this.controlDatas.pileNum.split(' ')[0]
      this.controlDatas.endPileNum = this.controlDatas.pileNum.split(' ')[1]

      debugger
      this.setState({
        deviceTypes: this.state.detailsPopup.devices,
        eventType: this.state.detailsPopup.eventType,
      })
    } else {
      this.controlDatas = {
        eventId: '', // 事件ID
        roadId: '', // 高速ID
        directionId: '', // 方向ID
        startPileNum: '', //桩号
        endPileNum: '', //桩号
        roadName: '', // 高速名称
        eventType: 1, // 事件类型
        directionName: '',
        locationMode: '0',
        situation: 0,
      }
      this.setState({
        eventType: 1,
      })
    }
    // console.log(, "当前")
    this.setState({
      EventTagPopup: boolean,
      controlBtnFlag: true,
      EventTagPopupTit: e ? $(e.target).text() : '事件标注',
    })
    $('#searchBox').attr('style', 'transition:all .5s;')
    $('#roadStateBox').attr('style', 'transition:all .5s;')
  }
  // 管控发布
  handleRelease = () => {
    const { channel, list, controlDes } = this.publishPlanVO
    const { reservePopup, startValue } = this.state
    if (channel == '') {
      message.warning('发布渠道至少勾选一个')
      return
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].content == '') {
        message.warning('请填全显示内容')
        return
      }
      console.log(list[i].deviceControlType);

      if (list[i].deviceControlType == '') {
        message.warning('请选择设备控制类型')
        return
      }
    }
    if (controlDes == '') {
      message.warning('请仔细填写事件详情')
      return
    }
    this.publishPlanVO.controlDes = startValue + ' ' + reservePopup.roadName.split(' ')[1] + reservePopup.directionName + reservePopup.pileNum.split(' ')[0] + '米处,' + controlDes
    getResponseDatas('put', this.publishUrl, this.publishPlanVO).then((res) => {
      const result = res.data
      if (result.code === 200) {
        /* this.detailsPopupData = '' // 清空方案详情 */
        // 查询左侧列表数据
        this.handleEventList()
        // 查询饼图数据
        this.handlegroupType()
        // 查询右侧柱状图
        this.handleUrlAjax(this.groupStatusUrl, 'groupStatus')
        // 查询管控方案
        this.handleplanList()
        message.success('发布成功')
        this.setState({ reservePopup: null })
      }
    })
  }
  // 管控方案详情删除
  handleCloseCircle = (indexs, index, device) => {
    const { reservePopup } = this.state
    reservePopup.devices[indexs].device.splice(index, 1)
    this.publishPlanVO.list.forEach((item, index) => {
      if (item.deviceId === device) {
        this.publishPlanVO.list.splice(index, 1)
      }
    })
    this.setState({ reservePopup })
  }
  handlecancelRel = (controllId, operation) => {
    const { reservePopup } = this.state
    const { eventTypeId, eventId } = reservePopup
    getResponseDatas('put', this.examineUrl + operation + '/' + controllId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        /*  this.detailsPopupData = '' // 清空方案详情 */
        // 查询左侧列表数据
        this.handleEventList()
        // 查询饼图数据
        this.handlegroupType()
        // 查询右侧柱状图
        this.handleUrlAjax(this.groupStatusUrl, 'groupStatus')
        // 查询管控方案is
        this.handleplanList()
        this.handledetai({ eventType: eventTypeId, eventId })
        this.setState({ reservePopup: null })
        message.success('取消发布成功')
      }
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
    getResponseDatas('put', this.endTimeUrl + eventTypeId + '/' + eventId + '/' + controllId, { endTime: endValueTime }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success('延时发布成功')
        this.setState({ reservePopup: null })
      }
    })
  }
  render() {
    const {
      MeasuresList, eventsPopup, groupType, planList, EventTagPopup, EventTagPopupTit, roadNumber, endValueTime, conditionList, boxSelect, flagClose, oldDevicesList,
      boxSelectList, hwayList, directionList, VIboardPopup, groupStatus, controlPopup, controlBtnFlag, controlBtnFlagText, detailsPopup, whethePopup, reservePopup, startValue, endValue, endOpen, SidePopLeft, detailsLatlng
    , controlTypes, eventTypes, deviceTypes, updatePoint } = this.state
    return (
      <div className={styles.MonitoringModule}>
        <SystemMenu />
        {<SidePop left="5px" groupType={groupType} SidePopLeft={SidePopLeft} handleEventPopup={this.handleEventPopup} />}
        {!!detailsPopup || <SidePop SidplanList={planList} groupStatus={groupStatus} right="5px" handleEventPopup={this.handleEventPopup} />}
        <GMap mapID={'container'} dataAll={SidePopLeft} roadLatlng={detailsLatlng} updatePoint={updatePoint} handledetai={this.handledetai} detailsPopup={detailsPopup} boxSelect={boxSelect} flagClose={flagClose} EventTagPopup={EventTagPopup} />
        <div id="searchBox" className={`${styles.searchBox} animated ${'bounceInDown'}`}><Search id="tipinput" placeholder="请输入内容" enterButton />
          {/* <s>框选设备</s> */}
        </div>
        <div id="deviceBox" className={`${styles.mapIconManage} animated ${'bounceInDown'}`}>
          {controlBtnFlag ? <span onClick={(e) => { this.controlBtnClick(e) }}>{controlBtnFlagText}</span> : null}<span>设备显示</span><span onClick={(e) => { this.handleEventTag(true, e) }}>事件标注</span>
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
            <em>收费站</em>
            <em>F屏情报板</em>
            <em>限速牌专用</em>
            <em>可变情报板</em>
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
        {eventsPopup && hwayList ?
          <div className={styles.MaskBox}>
            <div className={styles.EventPopup}>
              <div className={styles.Title} style={{ lineHeight: '32px' }}>{eventsPopup.name}事件过滤设置<Icon className={styles.Close} style={{ top: '37%' }} onClick={() => { this.handleEventPopup('Event', false) }} type="close" /></div>
              <div className={styles.Centent}>
                <div className={styles.ItemBox}>
                  <div className={styles.ItemInput} style={{ width: '100%', marginLeft: '25px' }}>
                    <Input onChange={(e) => { this.handleInput(e, 'searchKey', 'eventQuery') }} />
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
                    <Radio.Group name="radiogroup" defaultValue={0} onChange={(e) => { this.handleradiog(e) }}>
                      <Radio value={0}>全部</Radio>
                      {
                        controlPopup.map((item) => {
                          return <Radio key={item.id} value={item.id}>{item.name}</Radio>
                        })}
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
                  <span>方案编号&nbsp;:&nbsp;&nbsp;{reservePopup.eventId}P</span>
                  <span>事件类型&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#f31113' }}>{reservePopup.eventTypeName}</sapn></span>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>基本信息</div>
                  <div className={styles.RowBox}>
                    <p>道路编号&nbsp;:&nbsp;&nbsp;{reservePopup.roadName && reservePopup.roadName.split(' ')[0]}</p>
                    <p>道路名称&nbsp;:&nbsp;&nbsp;{reservePopup.roadName && reservePopup.roadName.split(' ')[1]}</p>
                    <p>行驶方向&nbsp;:&nbsp;&nbsp;{reservePopup.directionName}</p>
                  </div>
                  <div className={styles.RowBox}>
                    <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{reservePopup.pileNumr && eservePopup.pileNum.split(' ')[0]}</span></p>
                    {
                      reservePopup.eventTypeId === 1 ? [<p>平均车速&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#c67f03' }}>{reservePopup.situation}km/h</sapn> </p>,
                      <p>拥堵路段长度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#f31113' }}>{reservePopup.eventLength}m</sapn></p>] :
                        [<p>能见度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#c67f03' }}>{reservePopup.situation}km/h</sapn> </p>,
                        <p>影响道路长度&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#f31113' }}>{reservePopup.eventLength}m</sapn></p>]
                    }
                  </div>
                  <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<sapn style={{ color: '#03af01' }}>{reservePopup.dataSourceName}</sapn></div>
                </div>
                {
                  reservePopup.devices && reservePopup.devices.map((items, indexs) => {
                    return (
                      items.dictCode === 1 ?
                        <div className={styles.ItemBox}>
                          <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                          <div className={styles.RowBox}>
                            {
                              items.device && items.device.map((item, index) => {
                                return (
                                  <div key={item.deviceId + item.deviceTypeId}>
                                    {/* <div><Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item.deviceId) }} />{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div> */}
                                    <div className={styles.InputBox}>
                                      <div className={styles.ItemInput} style={{ width: '30%' }}><Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item.deviceId) }} />{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div>
                                      <div className={styles.ItemInput} style={{ width: '50%' }}><Input style={{ textAlign: 'center', color: 'red' }} onChange={(e) => { this.handleInput(e, 'content', 'publishPlanVO', item.deviceId) }} disabled={reservePopup.status > 1 ? true : ''} defaultValue={item.displayContent} /></div>
                                      <div className={styles.ItemInput} style={{ width: '20%' }}>
                                        <Select disabled={reservePopup.status > 1 ? true : ''} defaultValue={item.deviceControlType} style={{ width: '80%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'publishPlanVO', item.deviceId) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            MeasuresList && MeasuresList.map((itemss) => {
                                              return <Option key={itemss.id} value={itemss.id}>{itemss.name}</Option>
                                            })
                                          }
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                            {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                          </div>
                        </div> : items.dictCode === 2 ?
                          <div className={styles.ItemBox}>
                            <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                            {
                              items.device && items.device.map((item) => {
                                return (
                                  <div>
                                    <div className={styles.RowBox}>
                                      **地点车道可变情报板&nbsp;:&nbsp;&nbsp;一车道限速&nbsp;:&nbsp;&nbsp; <span style={{ color: '#11e002' }}>100km/h</span>
                                    </div>
                                    <div className={styles.RowBox}>
                                      <span style={{ width: '154px', display: 'inline-block' }} />
                                      二车道限速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#11e002' }}>80km/h</span>
                                    </div>
                                  </div>
                                )
                              })
                            }
                            {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                          </div> : items.dictCode === 3 ?
                            <div className={styles.ItemBox}>
                              <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                              {
                                items.device && items.device.map((item) => {
                                  return (
                                    <div className={styles.RowBox}>
                                      <Icon type="close-circle" className={styles.CloneItem} />****地点**收费站:&nbsp;:&nbsp;&nbsp;入口&nbsp;:&nbsp;&nbsp;<p><Switch checkedChildren="开放" unCheckedChildren="关闭" />&nbsp;:&nbsp;&nbsp;出口&nbsp;&nbsp;&nbsp;<Switch checkedChildren="开放" unCheckedChildren="关闭" /></p>
                                    </div>
                                  )
                                })
                              }
                              {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                            </div> : items.dictCode === 4 ?
                              <div className={styles.ItemBox}>
                                <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                                {
                                  items.device && items.device.map((item) => {
                                    return (
                                      <div className={styles.RowBox}>
                                        <Icon type="close-circle" className={styles.CloneItem} />****地点**收费站:&nbsp;:&nbsp;&nbsp;入口&nbsp;:&nbsp;&nbsp;<p><Switch checkedChildren="开放" unCheckedChildren="关闭" />&nbsp;:&nbsp;&nbsp;出口&nbsp;&nbsp;&nbsp;<Switch checkedChildren="开放" unCheckedChildren="关闭" /></p>
                                      </div>
                                    )
                                  })
                                }
                                {!!items.device.length || <div className={styles.PanelItemNone}>暂无数据</div>}
                              </div> : null

                    )
                  })
                }
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>管控时段</div>
                  <div className={styles.RowBox}>
                    起始时间&nbsp;:&nbsp;&nbsp;
                    <p className={styles.ItemInput}>
                      <DatePicker
                        disabledDate={this.disabledStartDate}
                        showTime
                        disabled={reservePopup.status > 1 ? true : ''}
                        format="YYYY-MM-DD HH:mm:ss"
                        value={startValue ? moment(startValue, 'YYYY-MM-DD HH:mm:ss') : startValue}
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
                        disabled={reservePopup.status > 1 ? true : ''}
                        format="YYYY-MM-DD HH:mm:ss"
                        value={endValue ? moment(endValue, 'YYYY-MM-DD HH:mm:ss') : endValue}
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
                    <div style={{ width: '100%' }} className={styles.ItemInput}><Input defaultValue={reservePopup.controlDes} onChange={(e) => { this.handleInput(e, 'controlDes', 'publishPlanVO') }} disabled={reservePopup.status > 1 ? true : ''} placeholder="事件描述" /></div>
                  </div>
                </div>
                <div className={styles.ItemBox}>
                  <div className={styles.HeadItem}>发布渠道
                    <div style={{ marginLeft: '10px' }} className={styles.ItemInput}>
                      <Checkbox.Group defaultValue={reservePopup.channel} onChange={(e) => { this.handleCheckboxGroup(e, 'channel', 'publishPlanVO') }}>
                        <Checkbox value="1" >发布渠道</Checkbox>
                        <Checkbox value="2" >可变情报表</Checkbox>
                      </Checkbox.Group>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.ItemFooter}>

                {
                  reservePopup.status === 3 ? <span onClick={() => { this.handlecancelRel(reservePopup.controllId, 'cancel') }}>撤&nbsp;&nbsp;销</span> : reservePopup.status === 1 ? <span onClick={this.handleRelease}>发&nbsp;&nbsp;布</span> : <span style={{ background: '#999' }}>发&nbsp;&nbsp;布</span>
                }
                {
                  reservePopup.status === 3 ? <span onClick={() => { this.handleEndValueTime(true) }}>延&nbsp;&nbsp;时</span> : null
                }
                <span onClick={() => { this.handleEventPopup('Reserve', false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
            {
              (reservePopup && endValueTime) ?
                <div className={classNames(styles.EventPopup, styles.WhethePopupr)}>
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
                    <span onClick={(e) => { this.handleWhethe() }}>确&nbsp;&nbsp;认</span>
                    <span onClick={() => { this.handleEndValueTime(false) }}>返&nbsp;&nbsp;回</span>
                  </div>
                </div> : null
            }
          </div> : null
        }
        {/* {
          whethePopup ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.WhethePopupr)}>
                <div className={styles.Title}>是否添加**地点**断面可变情报板至***管控预案?</div>
                <div className={styles.ItemFooter}>
                  <span onClick={(e) => { this.handleEventPopup('Whethe', false, e) }}>确&nbsp;&nbsp;认</span>
                  <span onClick={() => { this.handleEventPopup('Whethe', false) }}>返&nbsp;&nbsp;回</span>
                </div>
              </div>
            </div> : null
        } */}
        {/*  <div className={styles.MaskBox}>
          <div className={classNames(styles.EventPopup, styles.WhethePopupr)}>
            <div className={styles.Title} style={{ textIndent: 0, textAlign: 'center' }}>延时&nbsp;:<div className={classNames(styles.ItemInput, styles.WhetheInput)}><Input defaultValue="120" style={{ color: '#26ff6d' }} /></div>分钟</div>
            <div className={styles.ItemFooter}>
              <span onClick={() => { this.handleEventPopup('Whethe', false) }}>确&nbsp;&nbsp;认</span>
              <span onClick={() => { this.handleEventPopup('Whethe', false) }}>返&nbsp;&nbsp;回</span>
            </div>
          </div>
        </div> */}
        {
          detailsPopup ?
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
                    </div>
                    <div className={styles.Header}>
                      <span>事件类型&nbsp;:&nbsp;&nbsp;<em style={{ color: '#f31113', fontStyle: 'normal' }}>{detailsPopup.eventTypeName}</em></span>
                    </div>
                    <div className={styles.ItemBox}>
                      <div className={styles.HeadItem}>基本信息</div>
                      <div className={styles.RowBox}>道路编号&nbsp;:&nbsp;&nbsp;{detailsPopup.roadName.split(' ')[0]}</div>
                      <div className={styles.RowBox}>道路名称&nbsp;:&nbsp;&nbsp;{detailsPopup.roadName.split(' ')[1]}</div>
                      <div className={styles.RowBox}>
                        <p>行驶方向&nbsp;:&nbsp;&nbsp;{detailsPopup.directionName}</p>
                        <p>起始桩号&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{detailsPopup.pileNum.split(' ')[0]}</span></p>
                      </div>
                      <div className={styles.RowBox}>
                        {
                          detailsPopup.eventType == 3 ?
                            <p>能见度&nbsp;:&nbsp;&nbsp;<span>{detailsPopup.situation}m</span></p> :
                            <p>平均车速&nbsp;:&nbsp;&nbsp;<span style={{ color: '#c67f03' }}>{detailsPopup.situation}km/h</span></p>
                        }
                        {detailsPopup.eventType == 3 ?
                          <p>影响道路长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p> :
                          <p>拥堵路段长度&nbsp;:&nbsp;&nbsp;<span style={{ color: '#f31113' }}>{detailsPopup.eventLength}m</span></p>}
                      </div>
                      <div className={styles.RowBox}>数据来源&nbsp;:&nbsp;&nbsp;<span style={{ color: '#03af01' }}>{detailsPopup.dataSourceName}</span></div>
                    </div>
                  </div>
                </Panel>
                {
                  detailsPopup.devices.map((item, ind) => {
                    return (
                      <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode} extra={detailsPopup.controlStatusType > 0 ? null : this.genExtraAdd(item, detailsPopup)}>
                        <div>
                          {
                            item.device && item.device.map((items, index) => {
                              return <div className={styles.PanelBox}><p className={styles.PanelItem} key={items} onClick={() => {this.handleSelect(items.latlng, items.appendId, 'Click', items)}}>{`${index + 1}. ${items.deviceName} ${items.directionName} ${item.codeName}`}</p>{detailsPopup.controlStatusType > 0 || <Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                            })
                          }
                          {item.device && item.device.length === 0 && <p className={styles.PanelItemNone}>暂无数据</p>}
                        </div>
                      </Panel>
                    )
                  })
                }
              </Collapse>
              <div className={styles.panelBtnBox}>
                {detailsPopup.controlStatusType > 0 ? <div className={styles.Panelbutton}>
                  <span onClick={() => { this.handleViewControl(detailsPopup.eventType, detailsPopup.eventId) }}>查看管控方案</span> </div>
                  :
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.Panelbutton}><span onClick={this.handleControl}>发起管控</span></div>
                    <div className={styles.Panelbutton}><span onClick={(e) => { this.handleEventTag(true, e) }}>修改管控方案</span></div>
                  </div>
                }
              </div>
            </div> : null
        }
        {
          VIboardPopup ?
            <div className={styles.MaskBox}>
              <div className={classNames(styles.EventPopup, styles.VIboardPopup)}>
                <div className={styles.Title}>添加{VIboardPopup}<Icon className={styles.Close} onClick={() => { this.handleEventPopup('VIboard', false) }} type="close" /></div>
                <div className={styles.Centent}>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>道&nbsp;路&nbsp;编&nbsp;号&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadCode', 'VIboardParameters') }}>
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
                      <Input onChange={(e) => { this.handleInput(e, 'roadName', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>道&nbsp;路&nbsp;方&nbsp;向&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select defaultValue="" style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'roadDirection', 'VIboardParameters') }} >
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
                      <Input onChange={(e) => { this.handleInput(e, 'deviceCode', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>情报板名称:</span>
                    <div className={styles.ItemInput}>
                      <Input onChange={(e) => { this.handleInput(e, 'deviceName', 'VIboardParameters') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>情报板位置:</span>
                    <div className={styles.ItemInput}>
                      <Input onChange={(e) => { this.handleInput(e, 'deviceLocation', 'VIboardParameters') }} />
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
                    value={this.state.checkedListBox}
                    onChange={this.getcheckedListBox}
                  >
                    {
                      boxSelectList.map((item) => {
                        return <Checkbox key={item.deviceId} disabled={(item.controlling || item.exists) ? true : false} value={item.deviceId}>{item.deviceName + '-' + item.directionName}</Checkbox>
                      })
                    }

                  </Checkbox.Group>
                  <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                    <span onClick={this.handleBoxSelectList}>确&nbsp;&nbsp;认</span>
                    <span onClick={() => { this.handleEventPopup('boxSelect', false) }}>返&nbsp;&nbsp;回</span>
                  </div>
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
                        return <Checkbox key={item.deviceId} disabled={this.deviceList.includes(item.deviceId) || !item.available} value={item.deviceId}>{item.deviceName + '-' + item.directionName}</Checkbox>
                      })
                    }

                  </Checkbox.Group>
                  <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                    <span onClick={this.handledetailsPopupList}>确&nbsp;&nbsp;认</span>
                    <span onClick={() => { this.handleEventPopup('condition', false) }}>返&nbsp;&nbsp;回</span>
                  </div>
                </div>
              </div>
            </div> : null
        }
        {
          EventTagPopup ?
            <div className={styles.MaskBox} style={{ zIndex: '996' }}>
              <div className={styles.EventTagging}>
                <GMap styles={this.mapStyles} mapID={'popMap'} dataAll={SidePopLeft} roadLatlng={detailsLatlng} handledetai={this.handledetai} detailsPopup={detailsPopup} boxSelect={boxSelect} flagClose={flagClose} />
                <div className={styles.EventTaggingLeft}>
                  <div className={styles.Title} style={{ background: '#132334' }}>{EventTagPopupTit}<Icon className={styles.Close} onClick={() => { this.handleEventTag(false) }} type="close" /></div>
                  {
                    EventTagPopupTit !== '事件标注' ?
                    <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>事件编号:</span>
                      <div className={styles.ItemInput} style={{ display: 'inline' }}>{this.controlDatas.eventId}</div>
                    </div>
                  </div> : null
                  }

                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', marginTop: '10px', fontSize: '12px' }}>选择道路</div>
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <div className={styles.ItemInput}>
                        <Select defaultValue={this.controlDatas.roadName} style={{ width: '48%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'roadId', 'controlDatas') }}>
                          <Option value="">请选择</Option>
                          {
                            hwayList && hwayList.map((item) => {
                              return <Option key={item.id} value={item.name}>{item.name}</Option>
                            })
                          }
                        </Select>
                        <Select defaultValue={this.controlDatas.directionName} style={{ width: '48%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'directionId', 'controlDatas') }} >
                        <Option value="">请选择</Option>
                        {
                          roadNumber && roadNumber.map((item) => {
                            return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                          })
                        }
                        </Select>
                        <Select defaultValue={this.controlDatas.locationMode ? this.controlDatas.locationMode : "1"} style={{ width: '36%', margin: '8px 1%' }} onChange={(e) => { this.handleSelect(e, 'locationMode', 'controlDatas') }} >
                          <Option value="1">里程桩</Option>
                          <Option value="0">收费站</Option>
                        </Select>
                        <Input id="startInt" style={{width:'29%', height:'32px', margin:'8px 1%'}} defaultValue={this.controlDatas.startPileNum} onChange={(e) => { this.handleInput(e, 'startPileNum', 'controlDatas') }} />
                        <Input id='endInt' style={{width:'29%', height:'32px', margin:'8px 1%'}} defaultValue={this.controlDatas.endPileNum} onChange={(e) => { this.handleInput(e, 'endPileNum', 'controlDatas') }} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择事件类型</div>
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <div className={styles.ItemInput}>
                        {
                          eventTypes && eventTypes.map((item, i) => {
                            return <div className={classNames(styles.AddItem, (this.state.eventType === item.id ? styles.currentSel : null))} key={'eventTypes'+item.id} onClick={() => {this.handleSelect(item.id, 'eventTypeIndex', 'Click')}}>{item.name}</div>
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>当前车速</div>
                  {
                    this.state.eventType === 3 ? <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>能见度&nbsp;:</span>
                      <div className={classNames(styles.ItemInput, styles.ItemInputText)}>
                        <Input value={this.controlDatas.situation} onChange={(e) => { this.handleInput(e, 'situation', 'controlDatas') }} /> m
                      </div>
                    </div>
                  </div> :
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>平均车速&nbsp;:</span>
                      <div className={classNames(styles.ItemInput, styles.ItemInputText)}>
                        <Input value={this.controlDatas.situation} onChange={(e) => { this.handleInput(e, 'situation', 'controlDatas') }} /> km/h
                      </div>
                    </div>
                  </div>
                  }
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控类型</div>
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <div className={styles.ItemInput}>
                        {
                          controlTypes && controlTypes.map((item) => {
                            return <div className={classNames(styles.AddItem, (this.state.deviceString.indexOf(item.controlTypeId) > -1 ? styles.currentSel : null))} key={'controlTypes' + item.controlTypeId} onClick={() =>{this.updateControlTypes(item.controlTypeId)}}>{item.controlTypeName}</div>
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div className={styles.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控设施</div>
                  <div className={styles.Centent}>
                    <Collapse
                      defaultActiveKey={[1]}
                      expandIconPosition="right"
                    >
                      {
                        EventTagPopupTit === '事件标注' ?
                        deviceTypes && deviceTypes.map((item, ind) => {
                            return (
                              <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode}>
                                <div>
                                  {
                                    item.device && item.device.map((items, index) => {
                                      return <div className={styles.PanelBox}><p className={styles.PanelItem} key={items}>{`${index + 1}. ${items.deviceName} ${items.directionName} ${item.codeName}`}</p>{<Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                                    })
                                  }
                                  {item.device && item.device.length === 0 && <p className={styles.PanelItemNone}>暂无数据</p>}
                                </div>
                              </Panel>
                            )
                          }) : deviceTypes.map((item, ind) => {
                            return (
                              <Panel className={styles.PanelChs} header={item.codeName} key={item.dictCode}>
                                <div>
                                  {
                                    item.device && item.device.map((items, index) => {
                                      return <div className={styles.PanelBox}><p className={styles.PanelItem} key={items}>{`${index + 1}. ${items.deviceName} ${items.directionName} ${item.codeName}`}</p>{detailsPopup.controlStatusType > 0 || <Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={styles.MinusItem} type="close" />}</div>
                                    })
                                  }
                                  {item.device && item.device.length === 0 && <p className={styles.PanelItemNone}>暂无数据</p>}
                                </div>
                              </Panel>
                            )
                          })
                      }
                    </Collapse>
                  </div>

                  <div className={styles.ItemFooter}>
                    <span onClick={() => { this.handleMarkControl(EventTagPopupTit) }}>发起管控</span>
                  </div>
                </div>
                <div id="searchBox" style={{ top: '5px' }} className={`${styles.searchBox} animated ${'bounceInDown'}`}>
                  <Search id="tipinput" placeholder="请输入内容" enterButton />
                  {/* <s>框选设备</s> */}
                </div>
                <div id="deviceBox" style={{ top: '5px', right: '0' }} className={`${styles.mapIconManage} animated ${'bounceInDown'}`}>
                  {controlBtnFlag ? <span onClick={(e) => { this.controlBtnClick(e) }}>{controlBtnFlagText}</span> : null}<span>设备显示</span>
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
                    <em>收费站</em>
                    <em>F屏情报板</em>
                    <em>限速牌专用</em>
                    <em>可变情报板</em>
                  </h5>
                </div>
              </div>
            </div> : null
        }
      </div >
    )
  }
}

export default MonitoringModule
