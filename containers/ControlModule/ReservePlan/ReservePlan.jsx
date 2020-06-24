
import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
import Navigation from '../../../components/Navigation/Navigation'
import styles from '../../EquipmentModule/EquipmentModule.scss'
import style from '../ReservePlan/ReservePlan.scss'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import GMap from '../../../components/GMap/GMap'
import classNames from 'classnames'
import { Pagination, Input, Button, Checkbox, Radio, Icon, Popover, Switch, DatePicker, Collapse, Select, Modal, message } from 'antd'
const { Panel } = Collapse
const { Search } = Input
const { Option } = Select
/*        预案库 */
class ReservePlan extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: null,
      current: 1,
      eventsPopup: null, // 事件检测过滤设置弹窗数据
      controlPopup: null, // 管控方案检测过滤设置
      detailsPopup: null,
      controlBtnFlag: null, // 管控按钮是否显示
      controlBtnFlagText: '框选设备', // 显示的名字
      reservePopup: null,
      whethePopup: null,
      startValue: null,
      endValue: null,
      endOpen: false,
      SidePopLeft: null,
      hwayList: null, // 高速下拉
      directionList: null, // 方向下拉
      directionId: '',
      VIboardPopup: null,
      roadNumber: null,
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      plainOptionList: null,
      EventTagPopup: false,
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
      eventTypes: null, // 事件类型
      controlTypes: null, // 管控类型
      deviceTypes: null, // 设备类型
      oldDeviceTypes: null, // 设备空类型
      updatePoint: null, // 更新坐标点
      eventType: 1, // 事件类型
      deviceString: [], // 交通设施参数
      importantId: '',
      lineLatlngArr: null,
      addFlag: null, // 是否是新增过来的
      directionName: '',
      deviceCodeList: [], // 查询管控方案详情方案五对应下拉
      deviceDetailList: [],
      deviceTollGate: true, // map中收费站匝道灯图标显示的图层
      deviceFInfoBoard: true, // map中F情报版显示的图层
      deviceInfoBoard: true, // map中车道控制器情报版限速显示的图层
      deviceTurnBoard: true, // map中门架情报板显示的图层
      carRoadBoard: true, // map中车道控制器显示的图层
      MeasuresList: [], // 管控措施下拉
      InfoWinPopup: null,
      showContent: {},
      officialNum: undefined,
      roadList: null,
      controlroadId: '',
    }
    // 修改管控时的参数
    // this.controlDatas = JSON.parse(localStorage.getItem('detailsPopup'))
    this.controlDatas = {
      eventId: '', // 事件ID
      hwayId: '', // 高速ID
      hwayName: '',
      directionId: '', // 方向ID
      startPileNum: '', //桩号
      endPileNum: '', //桩号
      eventTypeId: 7, // 事件类型
      directionName: '',
      locationMode: '1',
      situation: 0, // 
      planName: '',
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
    this.Parameters = {
      pageSize: '10',
      roadName: '',
      pageNo: 1,
    }
    this.hwayUrl = '/control/static/hway/list/direction' //  获取高速编号，用于下拉框'
    // this.directionUrl = '/control/road/list/hway/direction/' //获取高速和方向的级联下拉框，用于下拉框
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.deviceUrl = '/control/control/plan/get/device/group/type' // 根据管控类型，获取管控设备集合（去重）
    this.secUrl = '/control/customize/road/get/lng/lat/by/pilenum' // 根据道路、方向、起止桩号，计算经纬度和最后一个点所在的道路id
    this.getDeviceAllUrl = '/control/device/get/in/area' // 获取指定区域内的设备
    this.codeUrl = '/control/dict/code/list/device/function/code/0' // {codeType} 根据功能类型查询，下拉框字典'

    this.addPlanUrl = '/control/reserve/plan/add' // 新增预案
    this.updatePlanUrl = '/control/reserve/plan/update/by/'//    修改预案
    this.delPlanUrl = '/control/reserve/plan/disable/'//    删除预案
    this.detailPlanUrl = '/control/control/plan/get/device/group/type/'   //根据方案ID查询方案中设备
    this.getListPlanUrl = '/control/contingencyPlan/getDeviceNameList'//    根据设备ID和设备类型查询设备名称
    this.listByPageUrl = '/control/reserve/plan/list' // 分页查询设备
    this.groupUrl = '/control/dict/code/list/device/control/type/group' // 根据设备类型区分出设备类型下的管控类型，下拉'
    this.controlUrl = '/control/reserve/plan/publish/plan/' // {eventTypeId}/{contingencyId}  交警快速发布管控方案（1.从地图页面提示框点入 2.从预案库点入）'
    this.adeviceTypesUrl = '/control/dict/code/get/control/device/types' // 获取管控类型和事件类型的对应关系'
    this.eventTypeUrl = '/control/event/get/manual/event/type' // 获取主动管控事件类型
    this.getRoadByUrl = '/control/customize/road/get/road/by/' // {hwayId}/{directionId} // 根据高速id和上下行方向查询出当前登录用户所能看到的系统自定义路段'
  }
  componentDidMount = () => {
    // 获取设备显示隐藏
    // this.popoverContent = (
    //   <div>
    //     <p className={this.state.deviceTurnBoard ? styles.true : ''} onClick={()=>{this.mapLayerShowHide(!this.state.deviceTurnBoard, 'deviceTurnBoard')}}>门架情报板</p>
    //     <p className={this.state.deviceFInfoBoard ? styles.true : ''} onClick={()=>{this.mapLayerShowHide(!this.state.deviceFInfoBoard, 'deviceFInfoBoard')}}>F屏情报板</p>
    //     <p className={this.state.deviceInfoBoard ? styles.true : ''} onClick={()=>{this.mapLayerShowHide(!this.state.deviceInfoBoard, 'deviceInfoBoard')}}>限速牌专用</p>
    //     <p className={this.state.deviceTollGate ? styles.true : ''} onClick={()=>{this.mapLayerShowHide(!this.state.deviceTollGate, 'deviceTollGate')}}>收费站匝道灯</p>
    //     <p className={this.state.carRoadBoard ? styles.true : ''} onClick={()=>{this.mapLayerShowHide(!this.state.carRoadBoard, 'carRoadBoard')}}>车道控制器</p>
    //   </div>
    // )
    this.handleListByPage()
    // 高速下拉
    this.handleUrlAjax(this.hwayUrl, 'hwayList')
    // 方向下拉
    // this.handleUrlAjax(this.directionUrl, 'directionList')
    // 字典事件类型
    this.handleUrlAjax(this.eventTypeUrl, 'eventTypes', (data) => {
      if (data.length) {
        this.controlDatas.eventType = data[0].eventType
        this.setState({ eventType: data[0].eventType })
      }
    })
    // 获取全部交通设施
    this.getDeviceEventList()

    this.handleUrlAjax(this.codeUrl, 'deviceCodeList') // 查询管控方案详情方案五对应下拉
    this.handlelistDetail('deviceDetailList', 29)
    this.handleUrlAjax(this.groupUrl, 'MeasuresList')

    this.handlelistDetail('controlTypes', 13)
  }
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
  // 字典查询
  handlelistDetail = (name, value) => {
    getResponseDatas('get', this.listDetailUrl + value).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data }, () => {
          if (name === 'controlTypes') {
            const arrId = []
            result.data.map((item) => {
              arrId.push(item.id)
            })
            console.log(arrId);
            this.deviceString = JSON.parse(JSON.stringify(arrId))
            this.setState({
              deviceString: arrId,
            })
          }
        })
      }
    })
  }
  // 通用模板式接口请求
  handleUrlAjax = (url, name, callback) => {
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data }, () => { callback && callback(result.data) })
      }
    })
  }
  handleInput = (e, name, type, data) => {
    if (type === 'publishPlanVO' && name === 'content') {
      this.publishPlanVO.devices.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.publishPlanVO.devices[index].content = e.target.value
        }
      })
    } else if (type === 'controlDatas' && name === 'content') {
      this.controlDatas.devices.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.controlDatas.devices[index].content = e.target.value
          const { showContent } = this.state
          showContent[item.appendId] = e.target.value
          this.setState({ showContent })
          // this.setState({ deviceTypes: this.state.deviceTypes })
        }
      })
    } else if (name === 'endPileNum' || name === 'startPileNum') {
      this[type][name] = e.target.value
      // this.handSecUrl()
    } else {
      this[type][name] = e.target.value
    }
  }
  handSecUrl = () => {
    const that = this
    // console.log(this.controlDatas);

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
          if (that.state.lineLatlngArr.length) {
            this.controlDatas.eventLength = result.data.eventLength
            const latlngArr = JSON.parse(JSON.stringify(that.state.lineLatlngArr))
            console.log(that.controlDatas, 'reddddddddddd');

            const colorFlag = that.controlDatas.eventTypeId !== 9
            setTimeout(() => {
              this.getLineCenterPoint(result.data.latlng)
              window.drawLine(latlngArr, colorFlag)
            }, 1000)
          }
        })
      } else {
        message.info(result.message)
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
    // console.log(oldDevicesList);

    this.setState({
      checkedListBox: e.target.checked ? oldDevicesList : [],
      indeterminateBox: false,
      checkAllBox: e.target.checked,
    })
  }
  equipmentInfoWinImg = (value) => {
    this.setState({ contentImg: value })
  }
  handleSelect = (value, name, type, data) => {
    console.log(value, name, type, data)
    if (type === 'publishPlanVO' && name === 'deviceControlType') {
      this.publishPlanVO.devices.forEach((item, index) => {
        if (item.appendId === data.appendId) {
          this.publishPlanVO.devices[index][name] = value
        }
      })
    } else if (type === 'controlDatas' && (name === 'deviceControlType' || name === 'content')) {
      this.controlDatas.devices.forEach((item, index) => {
        console.log(this.controlDatas.devices, item.appendId === data.appendId);

        if (item.appendId === data.appendId) {
          this.controlDatas.devices[index][name] = value
          console.log(value);
          if (name === 'content') {
            const { showContent } = this.state
            showContent[item.appendId] = value
            this.setState({ showContent })
            // this.setState({ deviceTypes: this.state.deviceTypes })
          }
        }
      })
    } else if (type === 'controlDatas' && name === 'hwayId') {
      const { hwayList } = this.state
      hwayList.forEach((item) => {
        if (item.hwayId === value) {
          this.controlDatas.hwayId = item.hwayId
          this.controlDatas.hwayName = item.hwayName
          this.controlDatas.directionId = item.direction[0].directionId
          this.controlDatas.directionName = item.direction[0].directionName
          this.setState({ roadNumber: item.direction, directionName: item.direction[0].directionId }, () => {
            this.handleUrlAjax(this.getRoadByUrl + `${this.controlDatas.hwayId}/${this.controlDatas.directionId}`, 'roadList', (data) => {
              /* if (data.length) {
                this.controlDatas.roadId = data[0].roadId
                this.setState({ controlroadId: data[0].roadId })
              } */
            })
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
          })
        }
      })
      this.handleUrlAjax(this.getRoadByUrl + `${this.controlDatas.hwayId}/${this.controlDatas.directionId}`, 'roadList', (data) => {
        /*  if (data.length) {
           this.controlDatas.roadId = data[0].roadId
           this.setState({ controlroadId: data[0].roadId })
         } */
      })
      this.handSecUrl()
    } else if (name === 'officialNum') {
      this.controlDatas.roadId = ''
      console.log(value, 'officialNum');
      this.setState({ officialNum: Number(value), controlroadId: '' })
    } else if (type === 'controlDatas' && name === 'roadId') {
      this.controlDatas.roadId = value.roadId
      this.controlDatas.startPileNum = value.pileNum.split(' ')[0]
      this.controlDatas.endPileNum = value.pileNum.split(' ')[1]
      this.handSecUrl()
      this.setState({ controlroadId: value.roadId })
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
        window.map.setZoomAndCenter(13, value)
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
        this[type][name] = value
      }
    }
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
          listDevices.push(item.appendId)
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
          if (!listDevices.includes(item.appendId)) {
            noDevices.push(item.appendId)
          }
        })
        if (result.data.length > 0) {
          // console.log(result.data, '框选后的数据')
          this.setState({ boxSelect: true, boxSelectList: result.data, oldDevicesList: noDevices })
        } else {
          message.info('没有选中相应的硬件设备！')
          window.map.remove(window.overlays)
          window.overlays = []
        }
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
        if (this.state.EventTagPopup) {
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

              if (_this.state.EventTagPopup) {
                // console.log("标注的框选")
                const params = {
                  devices: _this.state.deviceTypes,
                  roadPileNum: _this.controlDatas.startPileNum + ' ' + _this.controlDatas.endPileNum,
                  eventType: _this.state.eventType,
                }
                _this.state.controlBtnFlagText === '关闭框选' ? _this.getDevice(params) : null
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
    setTimeout(() => {
      const nowZoom = window.map.getZoom()
      window.map.setZoomAndCenter(nowZoom, newCenter)
    }, 0)
  }
  // 更新设备及交通管控类型
  updateControlTypes = (controlId) => {
    const { deviceString } = this.state
    if (typeof (deviceString) == 'string') {
      this.setState({
        deviceString: deviceString.split(','),
      }, () => {
        const nowIndex = deviceString.indexOf(controlId) > -1 ? deviceString.indexOf(controlId) : -1
        if (nowIndex > -1 && deviceString.length > 0) {
          deviceString.splice(nowIndex, 1)
          if (deviceString.length == 0) {
            message.info('管控类型至少选中一个')
            deviceString.push(controlId)
          }
        } else {
          deviceString.push(controlId)
        }
        this.setState({
          deviceString,
        }, () => {
          this.getDeviceEventList(true)
          this.handleDeviceTypeAry(deviceString)
        })
      })
    } else {
      const nowIndex = this.state.deviceString.join().split(',').indexOf(controlId) > -1 ? this.state.deviceString.join().split(',').indexOf(controlId) : -1
      if (nowIndex > -1 && this.state.deviceString.length > 0) {
        this.state.deviceString.splice(nowIndex, 1)
        if (this.state.deviceString.length == 0) {
          message.info('管控类型至少选中一个')
          this.state.deviceString.push(Number(controlId))
        }
      } else {
        this.state.deviceString.push(Number(controlId))
      }
      this.setState({
        deviceString: this.state.deviceString,
      }, () => {
        this.getDeviceEventList(true)
        this.handleDeviceTypeAry(deviceString)
      })
    }
  }
  handleDeviceTypeAry = (deviceString) => {
    if (window.infoWindowClose) {
      window.infoWindowClose.close()
    }
    getResponseDatas('get', this.adeviceTypesUrl, { controlTypes: deviceString.join() }).then((res) => {
      console.log(res)
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
    /*  const params = {
       deviceString: this.state.deviceString.join(),
     } */
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
              arrId.push(Number(item.controlTypeId))
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
  handleBoxSelectList = () => {
    const { checkedListBox, detailsPopup, boxSelectList, oldDevicesList, EventTagPopupTit, deviceTypes } = this.state
    boxSelectList.forEach((item) => {
      checkedListBox && checkedListBox.forEach((items) => {
        if (item.appendId === items) {
          deviceTypes.forEach((itemss, index) => {
            if (itemss.dictCode === item.deviceType) {
              deviceTypes[index].device.push(item)
            }
          })
        }
      })
    })
    this.setState({ deviceTypes, boxSelectList: null, checkAllBox: null, checkedListBox: null, controlBtnFlagText: '框选设备', boxSelect: null, flagClose: null, boxFlag: null }, () => {
      $(".amap-maps").attr("style", "")
      window.mouseTool.close(true) //关闭，并清除覆盖物
    })
  }
  // 控制事件检测过滤设置弹窗
  handleEventPopup = (type, boolean) => {
    //  
    let _this = this;
    // console.log(type, boolean)
    if (type === 'boxSelect') {
      this.setState({
        boxSelect: false,
      })
      /* if (!boolean) {
        this.setState({
          checkedListBox: null,
        })
      } */
      if (!boolean) {
        this.setState({
          flagClose: null,
          boxFlag: null,
          checkAllBox: null,
          checkedListBox: null,
          controlBtnFlagText: '框选设备',
        })
        $(".amap-maps").attr("style", "")
        window.mouseTool.close(true) //关闭，并清除覆盖物
      }
    }
    if (type === 'Details') {
      // console.log(type, boolean.latlng, '详情的经纬度')
      // console.log(boolean, '单条数据')
      if (window.listItemDom && boolean === false) {
        window.listItemDom.style.background = ''
      }
      if (boolean) {
        this.handledetai(boolean)
        // 根据事件类型绘制不同颜色的线
        this.setState({
          detailsLatlng: boolean.latlng,
        })
        console.log(boolean);

        boolean.eventType === 9 ? window.lineFlag = false : window.lineFlag = true
        // let roadLatlngData = {
        //   "path": boolean.latlng
        // }
        // let lineDatas = []
        // lineDatas.push(roadLatlngData)
        //  
        // // window.pathSimplifierIns.setData(lineDatas)
        // // lineDatas.push(boolean.latlng)
        const latlngArr = JSON.parse(JSON.stringify(boolean.latlng))
        window.drawLine(latlngArr, window.lineFlag)
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
    /*     if (type === 'VIboard') {
          this.setState({ VIboardPopup: boolean })
        } */
    if (type === 'controldet') {
      this.handleViewControl(boolean.eventTypeId, boolean.eventId)
    }
    if (type === 'examine') {
      this.planStatus = 2
      this.handleplanList()
    }
  }
  handleSubDetailsPopupList = (ind, index) => {
    const { detailsPopup, deviceTypes, EventTagPopupTit } = this.state
    deviceTypes[ind].device.splice(index, 1)
    this.setState({ deviceTypes })
  }
  handleEventTag = (boolean, e) => {
    if (!boolean) {
      this.handleListByPage()
    }
    this.setState({
      EventTagPopup: boolean,
    })
  }

  handleAddPlan = (deviceList, plan) => {
    const { eventType, deviceString, controlTypes } = this.state
    const itemArr = []
    const newItemArr = []
    const controlTypeName = []
    deviceList.map((item, i) => {
      item.device.map((items, index) => {
        itemArr.push(items)
      })
    })
    controlTypes.forEach((item) => {
      if (deviceString.includes(item.id)) {
        controlTypeName.push(item.name)
      }
    })
    this.controlDatas.controlType = deviceString.join()
    this.controlDatas.eventTypeId = eventType
    this.controlDatas.controlTypeName = controlTypeName.join()
    console.log(deviceList, this.controlDatas, 'look at here')
    itemArr.map((items, i) => {
      newItemArr.push({
        deviceControlType: this.controlDatas.devices[i].deviceControlType,
        deviceId: items.deviceId,
        deviceType: items.deviceType ? items.deviceType : items.deviceTypeId,
        content: this.controlDatas.devices[i].content
      })
    })
    // console.log(newItemArr, '是不是呢？')
    for (let i = 0; i < this.controlDatas.devices.length; i++) {
      // if (this.controlDatas.devices[i].deviceTypeId === 1 || this.controlDatas.devices[i].deviceTypeId === 2 ||  this.controlDatas.devices[i].deviceTypeId === 4) {
      if (!this.controlDatas.devices[i].content) {
        message.warning('请填全显示内容')
        return
      }
      // }
      if (!this.controlDatas.devices[i].deviceControlType) {
        message.warning('请选择设备控制类型')
        return
      }
    }

    getResponseDatas('post', this.addPlanUrl, this.controlDatas).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(res.data.message)
        this.setState({
          EventTagPopup: null,
          reservePopup: null,
          addFlag: false,
        }, () => {
          this.handleListByPage()
        })
      } else {
        message.info(res.message)
      }
    })
  }
  handleUpdatePlan = (deviceList, plan) => {
    const { eventType, deviceString, controlTypes } = this.state
    const itemArr = []
    const newItemArr = []
    const controlTypeName = []
    // console.log(deviceList, this.controlDatas, 'look at here')
    deviceList.map((item, i) => {
      item.device.map((items, index) => {
        itemArr.push(items)
      })
    })
    controlTypes.forEach((item) => {
      if (deviceString.includes(item.id)) {
        controlTypeName.push(item.name)
      }
    })
    this.controlDatas.controlType = deviceString.join()
    this.controlDatas.eventTypeId = eventType
    this.controlDatas.controlTypeName = controlTypeName.join()
    itemArr.map((items, i) => {
      newItemArr.push({
        deviceControlType: this.controlDatas.devices[i].deviceControlType,
        deviceId: items.deviceId,
        deviceType: items.deviceType ? items.deviceType : items.deviceTypeId,
        content: this.controlDatas.devices[i].content
      })
    })
    for (let i = 0; i < this.controlDatas.devices.length; i++) {
      // if (this.controlDatas.devices[i].deviceTypeId === 1 || this.controlDatas.devices[i].deviceTypeId === 2 ||  this.controlDatas.devices[i].deviceTypeId === 4) {
      if (!this.controlDatas.devices[i].content) {
        message.warning('请填全显示内容')
        return
      }
      // }
      if (!this.controlDatas.devices[i].deviceControlType) {
        message.warning('请选择设备控制类型')
        return
      }
    }

    getResponseDatas('put', this.updatePlanUrl + this.controlDatas.rowId, this.controlDatas).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.success(res.data.message)
        this.setState({
          EventTagPopup: null,
          reservePopup: null,
        }, () => {
          this.handleListByPage()
        })
      } else {
        message.info(res.message)
      }
    })
  }
  handleDelPlan = (planId, nowIndex) => {
    Modal.confirm({
      title: '确定要删除当前预案吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        getResponseDatas('put', this.delPlanUrl + planId).then((res) => {
          const result = res.data
          // const arr = JSON.parse(JSON.stringify(this.state.listByPage))
          // arr.data.splice(nowIndex, 1)
          // this.setState({ listByPage: arr })
          if (result.code === 200) {
            this.handleListByPage()
            message.info(res.data.message)
          } else {
            message.info(res.message)
          }
        })
      }
    })
  }
  handleDetailPlan = (rowId) => {
    getResponseDatas('get', this.detailPlanUrl + rowId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({
          deviceTypes: result.data,
          EventTagPopup: true,
        }, () => {
          this.handSecUrl()
          setTimeout(() => { this.handleDeviceTypeAry(this.state.deviceString) }, 3000)
        })
      }
    })
  }

  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) }, () => {
          // console.log(this.state.listByPage, '看结构')
        })
      }
    })
  }
  handlePlanPublic = (name, nowIndex) => {
    const { listByPage, deviceTypes, eventTypes, eventType } = this.state
    console.log(eventTypes, eventType);

    const deviceAry = []
    if (name == 'add') {
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
        roadId: '',
      }
      this.setState({
        EventTagPopup: true,
        addFlag: true,
        directionName: '',
        officialNum: undefined,
        roadList: null,
        controlroadId: '',
        deviceString: JSON.parse(JSON.stringify(this.deviceString)),
      }, () => {
        this.getDeviceEventList()
      })
    } else if (name == 'update') {
      this.controlDatas = listByPage.data[nowIndex]
      this.controlDatas.eventTypeId = listByPage.data[nowIndex].eventType
      this.controlDatas.startPileNum = listByPage.data[nowIndex].pileNum.split(" ")[0]
      this.controlDatas.endPileNum = listByPage.data[nowIndex].pileNum.split(" ")[1]
      this.controlDatas.directionId = listByPage.data[nowIndex].roadDirection
      this.controlDatas.directionName = listByPage.data[nowIndex].roadDirectionName
      this.controlDatas.planName = listByPage.data[nowIndex].planName
      this.controlDatas.roadId = listByPage.data[nowIndex].roadId
      this.handleUrlAjax(this.getRoadByUrl + `${this.controlDatas.hwayId}/${this.controlDatas.directionId}`, 'roadList')
      console.log(this.controlDatas, 'this.controlDatas', listByPage.data[nowIndex].roadIdentification,)
      const { hwayList } = this.state
      hwayList.forEach((item) => {
        if (item.hwayId === this.controlDatas.hwayId) {
          this.setState({ roadNumber: item.direction })
        }
      })
      this.setState({
        controlroadId: this.controlDatas.roadId,
        officialNum: listByPage.data[nowIndex].roadIdentification === 1 ? 1 : 0,
        eventType: listByPage.data[nowIndex].eventType,
        deviceString: listByPage.data[nowIndex].controlTypeId.split(',').map((item) => { return Number(item) }),
        directionName: this.controlDatas.directionId,
      })
      console.log(this.state.directionList);
      this.handleDetailPlan(listByPage.data[nowIndex].rowId) // 根据rowId获取全部设备
    } else if (name == 'edit') {
      console.log('编辑', deviceTypes)
      this.state.showContent = {}
      deviceTypes.forEach((item) => {
        item.device.forEach((items) => {
          items.content = items.showContent || items.content
          console.log(items.content, items.appendId);
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
      if ((!this.controlDatas.roadId) && this.state.officialNum) {
        message.info('请选择路段！')
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
      if (!this.controlDatas.planName) {
        message.warning('请填全预案名称')
        return
      }
      if (deviceAry.length === 0) {
        message.warning('请添加设备')
        return
      }
      this.setState({
        reservePopup: true,
      }, () => {
        this.controlDatas.devices = deviceAry
        console.log(this.controlDatas);

        // console.log('编辑管控内容后：查看当前', this.controlDatas)
      })
    } else {
      this.handleDelPlan(listByPage.data[nowIndex].rowId, nowIndex)
      // console.log(listByPage.data[nowIndex].rowId)
    }
  }
  handlepage = (pageNumber) => {
    this.Parameters.pageNo = pageNumber
    this.handleListByPage()
  }
  openInfoWin = (items) => {
    if (this.ChildPage) {
      const nowZoom = window.map.getZoom()
      window.map.setZoomAndCenter(nowZoom, items.latlng)
      this.ChildPage.openInfoWin(window.map, items) //调用子组件的openInfoWin方法
    }
  }
  equipmentInfoWin = (value) => {
    if (value) {
      const { detailsPopup, EventTagPopupTit, deviceTypes, MeasuresList } = this.state
      if (value.deviceType) {
        value.deviceTypeId = value.deviceType
      }
      console.log(deviceTypes);

      deviceTypes.forEach((item, index) => {
        if (item.dictCode === value.deviceTypeId) {
          item.device.forEach((items, indexs) => {
            if (items.deviceId === value.deviceId) {
              value.content = items.showContent
              value.deviceControlType = items.deviceControlType
            }
          })
        }
      })
      if (!(value.content && value.deviceControlType)) {
        const MeasData = []
        MeasuresList[value.deviceTypeId].forEach((item) => {
          if (this.state.deviceString.includes(item.controlType)) {
            MeasData.push(item)
          }
        })
        if (MeasData.length === 1) {
          value.deviceControlType = MeasData[0].controlType
          value.content = MeasData[0].showContent
        }
      }
      this.setState({
        InfoWinPopup: value,
      })
    }
    this.setState({
      InfoWinPopup: value,
    })
  }
  handleInfoWinChange = (e, name) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    const { InfoWinPopup } = this.state
    InfoWinPopup[name] = value
    console.log(InfoWinPopup);
    this.setState({
      InfoWinPopup,
    })
  }
  handleInfoWinPopup = () => {
    const { InfoWinPopup, detailsPopup, deviceTypes, EventTagPopupTit } = this.state
    deviceTypes.forEach((item, index) => {
      if (item.dictCode === InfoWinPopup.deviceTypeId) {
        let bool = true
        item.device.forEach((items, indexs) => {
          if (items.deviceId === InfoWinPopup.deviceId) {
            deviceTypes[index].device[indexs] = InfoWinPopup
            bool = false
          }
        })
        if (bool) {
          deviceTypes[index].device.push(InfoWinPopup)
        }
      }
    })
    // console.log(deviceTypes, EventTagPopupTit);
    this.setState({ InfoWinPopup: null, deviceTypes, })
  }
  handlepublish = (item) => {
    const { controlEventType, rowId, controlTypeId } = item
    getResponseDatas('post', this.controlUrl + rowId).then((res) => {
      const result = res.data
      if (result.code === 200) {
        window.contingency = { planNum: result.data, controlType: controlTypeId, }
        message.success('操作成功! 将要开始跳转页面！')
        setTimeout(() => {
          this.props.history.push('/monitoringmodule')
        }, 1000)
      } else {
        message.warning(result.message)
      }
    })
  }
  render() {
    const {
      InfoWinPopup, MeasuresList, listByPage, current, EventTagPopup, EventTagPopupTit, roadNumber, boxSelect, flagClose, boxSelectList, hwayList, controlBtnFlagText, reservePopup, detailsLatlng,
      controlTypes, eventTypes, deviceTypes, addFlag, deviceCodeList, deviceDetailList, officialNum, roadList,
    } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字" onChange={(e) => { this.handleInput(e, 'roadName', 'Parameters') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                <span className={styles.Button} onClick={() => { this.handlePlanPublic('add') }}>新&nbsp;&nbsp;增</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >预案名称</div>
                <div className={styles.listTd} >高速名称</div>
                <div className={styles.listTd} >路段名称</div>
                <div className={styles.listTd} >方向</div>
                <div className={styles.listTd} >事件类型</div>
                <div className={styles.listTd} >管控类型</div>
                <div className={styles.listTd} >引用次数</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item.roadName + item.rowId}>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.planName}>{item.planName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.roadName}>{item.hwayName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.secName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.directionName}>{item.roadDirectionName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.controlEventTypeName}>{item.eventName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.controlDeviceTypeName}>{item.controlTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.quoteCount}</span></div>
                      <div className={styles.listTd} style={{ minWidth: '271px' }}>
                        <Button className={styles.Button} onClick={() => { this.handlepublish(item) }}>一键发布</Button>
                        <Button className={styles.Button} onClick={() => { this.handlePlanPublic('update', index) }}>修&nbsp;&nbsp;改</Button>
                        <Button className={styles.Button} onClick={() => { this.handlePlanPublic('del', index) }}>删&nbsp;&nbsp;除</Button>
                      </div>
                    </div>
                  )
                })
              }
              {
                !!listByPage && listByPage.data.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
              }
            </div>
            <div className={styles.Footer}>
              <div className={styles.page}><span className={styles.count}>当前共{listByPage && listByPage.total}条，每页显示10条</span><Pagination showQuickJumper current={current} total={listByPage && listByPage.total} onChange={this.handlepage} /></div>
            </div>
          </div>
        </div>
        {InfoWinPopup ?
          <div className={styles.MaskBox} style={{ zIndex: 1000 }}>
            <div className={styles.InfoWinPopup} >
              <div className={styles.Title}>{InfoWinPopup.deviceName}-{InfoWinPopup.directionName}-{InfoWinPopup.deviceTypeName}<Icon className={styles.Close} type="close" onClick={this.equipmentInfoWin.bind('', false)} /></div>
              {InfoWinPopup.deviceTypeId === 1 || InfoWinPopup.deviceTypeId === 2 ?
                <div className={styles.Centent}>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }}>
                        <Option value="">请选择</Option>
                        {
                          MeasuresList[InfoWinPopup.deviceTypeId] && MeasuresList[InfoWinPopup.deviceTypeId].map((itemss) => {
                            if (this.state.deviceString.length) {
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
                      <Input value={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }} />
                    </div>
                  </div>
                </div> : InfoWinPopup.deviceTypeId === 3 ?
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                          <Option value="">请选择</Option>
                          {
                            MeasuresList[InfoWinPopup.deviceTypeId] && MeasuresList[InfoWinPopup.deviceTypeId].map((itemss) => {
                              if (this.state.deviceString.length) {
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
                              return <Option key={itemss.dictCode} value={(itemss.dictCode).toString()}>{itemss.codeName}</Option>
                            })
                          }
                        </Select>
                      </div>
                    </div>
                  </div> : InfoWinPopup.deviceTypeId === 4 ?
                    <div className={styles.Centent}>
                      <div className={styles.ItemBox}>
                        <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                        <div className={styles.ItemInput}>
                          <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                            <Option value="">请选择</Option>
                            {
                              MeasuresList[InfoWinPopup.deviceTypeId] && MeasuresList[InfoWinPopup.deviceTypeId].map((itemss) => {
                                if (this.state.deviceString.length) {
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
                                return <Option key={itemss.dictCode} value={(itemss.dictCode).toString()}>{itemss.codeName}</Option>
                              })
                            }
                          </Select>
                        </div>
                      </div>

                    </div> : InfoWinPopup.deviceTypeId === 5 ?
                      <div className={styles.Centent}>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                          <div className={styles.ItemInput}>
                            <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || (this.state.deviceString.length === 1 && this.state.deviceString[0]) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                              <Option value="">请选择</Option>
                              {
                                MeasuresList[InfoWinPopup.deviceTypeId] && MeasuresList[InfoWinPopup.deviceTypeId].map((itemss) => {
                                  if (this.state.deviceString.length) {
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
                                  return <Option key={itemss.dictCode} value={(itemss.dictCode).toString()}>{itemss.codeName}</Option>
                                })
                              }
                            </Select>
                          </div>
                        </div>

                      </div> : null}
              <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                <span onClick={this.handleInfoWinPopup}>确&nbsp;&nbsp;认</span>
                <span onClick={() => { this.equipmentInfoWin() }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
          </div> : null}
        {
          EventTagPopup ?
            <div className={style.MaskBox} style={{ zIndex: '996' }}>
              <div className={style.EventTagging}>
                <GMap equipmentInfoWinImg={this.equipmentInfoWinImg} deviceString={this.state.deviceString.join()} equipmentInfoWin={this.equipmentInfoWin} onRef={el => this.ChildPage = el} styles={this.mapStyles} mapID={'RpopMap'} roadLatlng={detailsLatlng} handledetai={this.handledetai} detailsPopup={this.controlDatas} boxSelect={boxSelect} flagClose={flagClose} EventTagPopup={EventTagPopup} />
                <div className={style.EventTaggingLeft} style={{ zIndex: '999' }}>
                  <div className={style.Title} style={{ background: '#132334', position: 'fixed', top: '61px', left: 'calc(5% + 6px)', zIndex: '999', width: 'calc(21.6% - 2px)' }}>{'修改预案库'}<Icon className={style.Close} onClick={() => { this.handleEventTag(false) }} type="close" /></div>
                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', marginTop: '60px', fontSize: '12px' }}>预案名称</div>
                  <div className={style.Centent}>
                    <div className={style.ItemBox}>
                      <div className={style.ItemInput}>
                        <Input defaultValue={this.controlDatas.planName} onChange={(e) => { this.handleInput(e, 'planName', 'controlDatas') }} maxLength={50} />
                      </div>
                    </div>
                  </div>
                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择道路</div>
                  <div className={style.Centent}>
                    <div className={style.ItemBox}>
                      <div className={style.ItemInput}>
                        <Select defaultValue={this.controlDatas.hwayId} style={{ width: '29%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'hwayId', 'controlDatas') }}>
                          <Option value="">请选择</Option>
                          {
                            hwayList && hwayList.map((item) => {
                              return <Option key={item.hwayId} value={item.hwayId}>{item.hwayName}</Option>
                            })
                          }
                        </Select>
                        <Select value={this.state.directionName} style={{ width: '31%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'directionId', 'controlDatas') }} >
                          <Option value="">请选择</Option>
                          {
                            roadNumber && roadNumber.map((item) => {
                              return <Option key={item.directionId} value={item.directionId}>{item.directionName}</Option>
                            })
                          }
                        </Select>
                        <Select defaultValue={this.state.officialNum} placeholder="是否系统路段" style={{ width: '34%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'officialNum', 'controlDatas') }} >
                          <Option value={0}>否</Option>
                          <Option value={1}>是</Option>
                        </Select>
                        {
                          officialNum ?
                            <Select value={this.state.controlroadId} style={{ width: '98%', margin: '8px 1%' }}  >
                              <Option value="">请选择路段</Option>
                              {
                                roadList && roadList.map((item) => {
                                  return <Option key={item.roadId} value={item.roadId} onClick={(e) => { this.handleSelect(item, 'roadId', 'controlDatas') }}>{item.roadName}</Option>
                                })
                              }
                            </Select>
                            :
                            <div>
                              <Select defaultValue="1" style={{ width: '29%', margin: '8px 1%' }} disabled onChange={(e) => { this.handleSelect(e, 'locationMode', 'controlDatas') }} >
                                <Option value="0">收费站</Option>
                                <Option value="1">里程桩</Option>
                              </Select>
                              <Input id="startInt" style={{ width: '31%', height: '32px', margin: '8px 1%' }} placeholder="起始桩号如:k1" defaultValue={this.controlDatas.startPileNum} onBlur={(e) => { this.handleInput(e, 'startPileNum', 'controlDatas'); this.handSecUrl() }} />
                              <Input id="endInt" style={{ width: '34%', height: '32px', margin: '8px 1%' }} placeholder="结束桩号如:k30" defaultValue={this.controlDatas.endPileNum} onBlur={(e) => { this.handleInput(e, 'endPileNum', 'controlDatas'); this.handSecUrl() }} />
                            </div>
                        }
                      </div>
                    </div>
                  </div>
                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择事件类型</div>
                  <div className={style.Centent}>
                    <div className={style.ItemBox}>
                      <div className={style.ItemInput}>
                        {
                          eventTypes && eventTypes.map((item) => {
                            console.log(eventTypes, this.state.eventType, item.eventType)
                            return <div className={classNames(style.AddItem, (this.state.eventType === item.eventType ? style.currentSel : null))} key={'eventTypes' + item.eventType} onClick={() => { this.handleSelect(item.eventType, 'eventTypeName', 'Click') }}>{item.eventTypeName}</div>
                          })
                        }
                      </div>
                    </div>
                  </div>

                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控类型</div>
                  <div className={style.Centent}>
                    <div className={style.ItemBox}>
                      <div className={style.ItemInput}>
                        {
                          controlTypes && controlTypes.map((item) => {
                            console.log(this.state.deviceString, item.id)
                            return <div className={classNames(style.AddItem, (this.state.deviceString.indexOf(item.id) > -1 || this.state.deviceString.indexOf(String(item.id)) > -1 ? style.currentSel : null))} key={'controlTypes' + item.id} onClick={() => { this.updateControlTypes(String(item.id)) }}>{item.name}</div>
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择交通管控设施</div>
                  <div className={style.Centent} style={{ maxHeight: '245px' }}>
                    <Collapse
                      defaultActiveKey={[1]}
                      expandIconPosition="right"
                    >
                      {
                        deviceTypes && deviceTypes.map((item, ind) => {
                          return (
                            <Panel className={style.PanelChs} header={item.codeName} key={item.dictCode}>
                              <div>
                                {
                                  item.device && item.device.map((items, index) => {
                                    return <div className={style.PanelBox} key={items.appendId}><p className={style.PanelItem} onClick={() => { this.openInfoWin(items) }}>{`${index + 1}. ${items.deviceName} ${items.roadDirectionName} ${item.codeName}`}</p><Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={style.MinusItem} type="close" /></div>
                                  })
                                }
                                {item.device && item.device.length === 0 && <p className={style.PanelItemNone}>暂无数据</p>}
                              </div>
                            </Panel>
                          )
                        })
                      }
                    </Collapse>
                  </div>

                  <div className={style.ItemFooter}>
                    <span onClick={() => { this.handlePlanPublic('edit') }}>编辑管控内容</span>
                  </div>
                </div>
                <div id="searchBox" style={{ top: '5px' }} className={`${style.searchBox} animated ${'bounceInDown'}`}>
                  <Search id="tipinput" placeholder="请输入内容" enterButton />
                  {/* <s>框选设备</s> */}
                </div>
                <div id="deviceBox" style={{ top: '5px', right: '0' }} className={`${style.mapIconManage} animated ${'bounceInDown'}`}>
                  <span onClick={(e) => { this.controlBtnClick(e) }}>{controlBtnFlagText}</span>
                  <span>
                    <Popover content={(<div>
                      <p className={this.state.deviceTurnBoard ? style.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTurnBoard, 'deviceTurnBoard') }}>门架情报板</p>
                      <p className={this.state.deviceFInfoBoard ? style.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceFInfoBoard, 'deviceFInfoBoard') }}>F屏情报板</p>
                      <p className={this.state.deviceInfoBoard ? style.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceInfoBoard, 'deviceInfoBoard') }}>限速牌专用</p>
                      <p className={this.state.deviceTollGate ? style.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.deviceTollGate, 'deviceTollGate') }}>收费站匝道灯</p>
                      <p className={this.state.carRoadBoard ? style.true : ''} onClick={() => { this.mapLayerShowHide(!this.state.carRoadBoard, 'carRoadBoard') }}>车道控制器</p>
                    </div>)} title="" trigger="hover">
                      设备显示
                  </Popover>
                  </span>
                </div>
                <div id="roadStateBox" className={`${style.roadState} animated ${'bounceInUp'}`}>
                  <h5><p>路况</p></h5>
                  <h5><span className={style.redColor}>{'< 60km/h'}</span></h5>
                  <h5><p>能见度</p></h5>
                  <h5 className={style.visibility}>
                    <s>{'< 50'}</s>
                    <s>{'50 - 100'}</s>
                    <s>{'100 - 200'}</s>
                    <s>{'200 - 500'}</s>
                  </h5>
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
        {this.state.contentImg ?
          <div className={style.MaskBoxImg} >
            <div className={style.MaskBoxImgCenten}>
              <div className={style.Title}>默认显示内容<Icon className={style.Close} onClick={() => { this.equipmentInfoWinImg(false) }} type="close" /></div>
              <div className={style.Content}>
                <img src={"http://222.175.148.125:50080/api/screenshot?timg=" + new Date().getTime()} />
              </div>
            </div>
          </div> : null}
        {reservePopup ?
          <div className={styles.MaskBox} style={{ zIndex: '1000' }}>
            <div className={styles.AddBox} style={{ height: '88%', width: '47%', minWidth: '840px' }}>
              <div className={styles.Title}>预案详情<Icon onClick={() => { this.handleEventPopup('Reserve', false) }} className={styles.Close} type="close" /></div>
              <div className={styles.Conten} style={{ overflowY: 'auto', height: 'calc(100% - 140px)' }}>
                <div className={styles.Header}>
                  <span>管控措施：</span>
                </div>
                {
                  deviceTypes && deviceTypes.map((items, indexs) => {
                    return (
                      items.dictCode === 1 || items.dictCode === 2 ?
                        <div className={styles.ItemBox} key={items.dictCode}>
                          <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                          <div className={styles.RowBox}>
                            {
                              items.device && items.device.map((item, index) => {
                                console.log(MeasuresList, items.dictCode)
                                return (
                                  <div key={item.deviceId + item.deviceTypeId}>
                                    <div className={style.InputBox}>
                                      <div className={style.ItemInput} style={{ width: '30%', textAlign: 'left', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>
                                        {deviceTypes.status === 1 ?
                                          <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item.deviceId) }} />
                                          : null
                                        }
                                        {index + 1}.{item.deviceName + '-' + item.roadDirectionName + items.codeName}&nbsp;:
                                      </div>
                                      <div className={style.ItemInput} style={{ width: '16%' }}>
                                        <Select disabled={deviceTypes.status > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                              if (this.state.deviceString.length) {
                                                if (this.state.deviceString.includes(itemss.controlType)) {
                                                  return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }}>{itemss.controlTypeName}</Option>
                                                }
                                              } else {
                                                return <Option key={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                              }
                                            })
                                          }
                                        </Select>
                                      </div>
                                      <div className={style.ItemInput} style={{ width: '50%' }}><Input style={{ textAlign: 'center', color: 'red' }} placeholder='请输入描述' onChange={(e) => { this.handleInput(e, 'content', 'controlDatas', item) }} value={this.state.showContent[item.appendId]} /></div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                            {!!items.device.length || <div className={style.PanelItemNone}>暂无数据</div>}
                          </div>
                        </div> : items.dictCode === 3 ?
                          <div className={styles.ItemBox} key={items.dictCode}>
                            <div className={styles.HeadItem}>{items.codeName}</div>
                            <div className={styles.RowBox}>
                              {
                                items.device && items.device.map((item, index) => {
                                  return (
                                    <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                      <div className={style.ItemInput} style={{ width: '30%', textAlign: 'left', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>
                                        {index + 1}.{item.deviceName + '-' + item.roadDirectionName + items.codeName}&nbsp;:
                                      </div>
                                      <div className={style.ItemInput} style={{ width: '36%' }}>
                                        <Select disabled={deviceTypes.status > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                              if (this.state.deviceString.length) {
                                                if (this.state.deviceString.includes(itemss.controlType)) {
                                                  return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }}>{itemss.controlTypeName}</Option>
                                                }
                                              } else {
                                                return <Option key={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                              }
                                            })
                                          }
                                        </Select>
                                      </div>
                                      <div className={style.ItemInput} style={{ width: '30%' }}>
                                        <Select value={this.state.showContent[item.appendId] || ''} style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
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
                              {!!items.device.length || <div className={style.PanelItemNone}>暂无数据</div>}
                            </div>
                          </div> : items.dictCode === 4 ?
                            <div className={styles.ItemBox} key={items.dictCode}>
                              <div className={styles.HeadItem}>{items.codeName}</div>
                              <div className={styles.RowBox}>
                                {
                                  items.device && items.device.map((item, index) => {
                                    return (
                                      <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                        <div className={style.ItemInput} style={{ width: '30%', textAlign: 'left', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>
                                          {index + 1}.{item.deviceName + '-' + item.roadDirectionName + items.codeName}&nbsp;:
                                        </div>
                                        <div className={style.ItemInput} style={{ width: '36%' }}>
                                          <Select disabled={deviceTypes.status > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                            <Option value={0}>请选择</Option>
                                            {
                                              MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                                if (this.state.deviceString.length) {
                                                  if (this.state.deviceString.includes(itemss.controlType)) {
                                                    return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }}>{itemss.controlTypeName}</Option>
                                                  }
                                                } else {
                                                  return <Option key={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                                }
                                              })
                                            }
                                          </Select>
                                        </div>
                                        <div className={style.ItemInput} style={{ width: '30%' }}>
                                          <Select value={this.state.showContent[item.appendId] || ''} style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
                                            <Option value="">请选择</Option>
                                            {
                                              deviceCodeList && deviceCodeList[0].map((itemss) => {
                                                return <Option key={itemss.dictCode} value={(itemss.dictCode).toString()}>{itemss.codeName}</Option>
                                              })
                                            }
                                          </Select>
                                        </div>
                                      </div>
                                    )
                                  })
                                }
                                {!!items.device.length || <div className={style.PanelItemNone}>暂无数据</div>}
                              </div>
                            </div> : items.dictCode === 5 ?
                              <div className={styles.ItemBox} key={items.dictCode}>
                                <div className={styles.HeadItem}>{items.codeName}</div>
                                <div className={styles.RowBox}>
                                  {
                                    items.device && items.device.map((item, index) => {
                                      return (
                                        <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                          <div className={style.ItemInput} style={{ width: '30%', textAlign: 'left', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>
                                            {index + 1}.{item.deviceName + '-' + item.roadDirectionName + items.codeName}&nbsp;:
                                          </div>
                                          <div className={style.ItemInput} style={{ width: '36%' }}>
                                            <Select disabled={deviceTypes.status > 1} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                              <Option value={0}>请选择</Option>
                                              {
                                                MeasuresList[items.dictCode] && MeasuresList[items.dictCode].map((itemss) => {
                                                  if (this.state.deviceString.length) {
                                                    if (this.state.deviceString.includes(itemss.controlType)) {
                                                      return <Option key={itemss.controlType} value={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }}>{itemss.controlTypeName}</Option>
                                                    }
                                                  } else {
                                                    return <Option key={itemss.controlType} onClick={() => { this.handleSelect(itemss.showContent, 'content', 'controlDatas', item) }} value={itemss.controlType}>{itemss.controlTypeName}</Option>
                                                  }
                                                })
                                              }
                                            </Select>
                                          </div>
                                          <div className={style.ItemInput} style={{ width: '30%' }}>
                                            <Select value={this.state.showContent[item.appendId] || ''} style={{ width: '100%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
                                              <Option value="">请选择</Option>
                                              {
                                                deviceCodeList && deviceCodeList[2].map((itemss) => {
                                                  return <Option key={itemss.dictCode} value={(itemss.dictCode).toString()}>{itemss.codeName}</Option>
                                                })
                                              }
                                            </Select>
                                          </div>
                                        </div>
                                      )
                                    })
                                  }
                                  {!!items.device.length || <div className={style.PanelItemNone}>暂无数据</div>}
                                </div>
                              </div> : null

                    )
                  })
                }

              </div>
              <div className={style.ItemFooter}>
                <span onClick={() => { addFlag ? this.handleAddPlan(deviceTypes, this.controlDatas) : this.handleUpdatePlan(deviceTypes, this.controlDatas) }}>保&nbsp;&nbsp;存</span>
                <span onClick={() => { this.handleEventPopup('Reserve', false) }}>返&nbsp;&nbsp;回</span>
              </div>
            </div>

          </div> : null
        }
        {
          boxSelect ?
            <div className={style.MaskBox}>
              <div className={classNames(style.EventPopup, style.VIboardPopup, style.conditionPopup, style.devicePos)}>
                <div className={style.Title}>添加硬件设备<Icon className={style.Close} type="close" onClick={() => { this.handleEventPopup('boxSelect', false) }} /></div>
                <div className={style.Centent}>
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
                        return <Checkbox key={item.appendId} disabled={item.exists === true} value={item.appendId}>{item.deviceName + '-' + item.roadDirectionName + (item.laneNum ? ('-' + item.laneNum) : '')}<b style={{ color: 'yellow' }}>{item.exists === true ? " ( 已存在 )" : " "}</b></Checkbox>
                      })
                    }

                  </Checkbox.Group>
                  <div className={style.ItemFooter} style={{ bottom: '-15px' }}>
                    <span onClick={this.handleBoxSelectList}>确&nbsp;&nbsp;认</span>
                    <span onClick={() => { this.handleEventPopup('boxSelect', false) }}>返&nbsp;&nbsp;回</span>
                  </div>
                </div>
              </div>
            </div> : null
        }
      </div>
    )
  }
}

export default ReservePlan
