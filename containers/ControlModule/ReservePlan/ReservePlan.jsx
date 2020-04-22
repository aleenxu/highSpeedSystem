
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
    }
    // 修改管控时的参数
    // this.controlDatas = JSON.parse(localStorage.getItem('detailsPopup'))
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
      keyword: '',
      pageNo: 1,
    }
    this.hwayUrl = '/control/road/list/hway' //  获取高速编号，用于下拉框'
    this.directionUrl = '/control/road/list/hway/direction/' //获取高速和方向的级联下拉框，用于下拉框
    this.listDetailUrl = '/control/dict/code/list/detail/' // {codeType} 根据字典类型，获取字典详情相关信息'
    this.deviceUrl = '/control/event/get/control/type/by/device' // 根据管控类型，获取管控设备集合（去重）
    this.secUrl = 'control/road/get/latlngs/sec/' // 根据道路、方向、起止桩号，计算经纬度和最后一个点所在的道路id
    this.getDeviceAllUrl = '/control/device/get/in/area' // 获取指定区域内的设备
    this.codeUrl = '/control/dict/code/list/device/function/code/0' // {codeType} 根据功能类型查询，下拉框字典'

    this.addPlanUrl = '/control/contingencyPlan/addPlan' // 新增预案
    this.updatePlanUrl = '/control/contingencyPlan/updatePlan'//    修改预案
    this.delPlanUrl = '/control/contingencyPlan/deletePlan'//    删除预案
    this.detailPlanUrl = '/control/contingencyPlan/getDeviceDetail'   //根据方案ID查询方案中设备
    this.getListPlanUrl = '/control/contingencyPlan/getDeviceNameList'//    根据设备ID和设备类型查询设备名称
    this.listByPageUrl = '/control/contingencyPlan/listByPage' // 分页查询设备
    this.groupUrl = '/control/dict/code/list/device/control/type/group' // 根据设备类型区分出设备类型下的管控类型，下拉'
    this.controlUrl = '/control/plan/fast/publish/control/' // {eventTypeId}/{contingencyId}  交警快速发布管控方案（1.从地图页面提示框点入 2.从预案库点入）'
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
    this.handleUrlAjax(this.directionUrl, 'directionList')
    // 字典事件类型
    this.handlelistDetail('eventTypes', 23)
    // 获取全部交通设施
    this.getDeviceEventList()

    this.handleUrlAjax(this.codeUrl, 'deviceCodeList') // 查询管控方案详情方案五对应下拉
    this.handlelistDetail('deviceDetailList', 29)
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
  // 通用模板式接口请求
  handleUrlAjax = (url, name) => {
    getResponseDatas('get', url).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ [name]: result.data })
      }
    })
  }
  handleInput = (e, name, type, data) => {
    if (type === 'publishPlanVO' && name === 'content') {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.publishPlanVO.list[index].content = e.target.value
        }
      })
    } else if (type === 'controlDatas' && name === 'content') {
      this.controlDatas.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.controlDatas.list[index].content = e.target.value
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
      // $('#startInt').focus()
      return
    }
    if (!this.controlDatas.endPileNum) {
      message.info('请输入结束桩号！')
      // $('#endInt').focus()
      return
    }
    const params = {
      direction: this.controlDatas.directionId,
      roadId: this.controlDatas.roadName,
      startPileNum: this.controlDatas.startPileNum,
      endPileNum: this.controlDatas.endPileNum
    }
    getResponseDatas('get', this.secUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        that.setState({
          importantId: result.data.roadSecId,
          lineLatlngArr: result.data.latlng,
        }, () => {
          if (that.state.lineLatlngArr) {
            const latlngArr = JSON.parse(JSON.stringify(that.state.lineLatlngArr))
            const colorFlag = that.state.eventType === 3 ? false : true
            window.drawLine(latlngArr, colorFlag)
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
    this.setState({
      checkedListBox: e.target.checked ? oldDevicesList : [],
      indeterminateBox: false,
      checkAllBox: e.target.checked,
    })
  }
  handleSelect = (value, name, type, data) => {

    if (type === 'publishPlanVO' && name === 'deviceControlType') {
      this.publishPlanVO.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.publishPlanVO.list[index][name] = value
        }
      })
    } else if (type === 'controlDatas' && (name === 'deviceControlType' || name === 'content')) {
      this.controlDatas.list.forEach((item, index) => {
        if (item.deviceId === data.deviceId && data.deviceTypeId === item.deviceTypeId) {
          this.controlDatas.list[index][name] = value
        }
      })
    } else if (type === 'controlDatas' && name === 'roadId') {
      this.state.directionList.forEach((item, index) => {
        if (item.roadId === value) {
          this.setState({
            roadNumber: item.directions,
            directionId: '',
            directionName: item.directions[0].directionName ? item.directions[0].directionName : '',
          }, () => {
            this.controlDatas.roadId = item.roadId
            this.controlDatas.roadName = item.roadName

            this.controlDatas.directionName = this.state.roadNumber[0].directionName
            this.controlDatas.directionId = this.state.roadNumber[0].directionId
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
      this.handSecUrl()
    } else {
      if (type === 'Click' && !(value instanceof Array)) {
        this.handSecUrl()
        this.setState({
          eventType: value,
        }, () => {
          this.controlDatas.eventType = value
          const typeNum = this.state.eventType - 1
          this.controlDatas.eventTypeName = this.state.eventTypes[typeNum].name
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
          console.log(result.data, '框选后的数据')
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
  // 更新设备及交通管控类型
  updateControlTypes = (controlId) => {
    console.log(controlId, '============', this.state.deviceString);

    if (typeof (this.state.deviceString) == 'string') {
      this.setState({
        deviceString: this.state.deviceString.split(','),
      }, () => {
        const nowIndex = this.state.deviceString.indexOf(controlId) > -1 ? this.state.deviceString.indexOf(controlId) : -1
        if (nowIndex > -1 && this.state.deviceString.length > 0) {
          this.state.deviceString.splice(nowIndex, 1)
          if (this.state.deviceString.length == 0) {
            message.info('管控类型至少选中一个')
            this.state.deviceString.push(controlId)
          }
        } else {
          this.state.deviceString.push(controlId)
        }
        this.setState({
          deviceString: this.state.deviceString,
        }, () => {
          this.getDeviceEventList(true)
          if (this.ChildPage) {
            if (this.state.controlTypes.length === this.state.deviceString.length) {
              this.ChildPage.loadPoint()
            } else {
              this.ChildPage.loadPoint(this.state.deviceString.join())
            }
          }
        })
      })
    } else {
      const nowIndex = this.state.deviceString.join().split(',').indexOf(controlId) > -1 ? this.state.deviceString.join().split(',').indexOf(controlId) : -1
      if (nowIndex > -1 && this.state.deviceString.length > 0) {
        this.state.deviceString.splice(nowIndex, 1)
        if (this.state.deviceString.length == 0) {
          message.info('管控类型至少选中一个')
          this.state.deviceString.push(controlId)
        }
      } else {
        this.state.deviceString.push(controlId)
      }
      this.setState({
        deviceString: this.state.deviceString,
      }, () => {
        this.getDeviceEventList(true)
        if (this.ChildPage) {
          if (this.ChildPage) {
            if (this.state.controlTypes.length === this.state.deviceString.length) {
              this.ChildPage.loadPoint()
            } else {
              this.ChildPage.loadPoint(this.state.deviceString.join())
            }
          }
        }
      })
    }
  }
  // 获取全部交通管控类型
  getDeviceEventList = (flag) => {
    const params = {
      deviceString: this.state.deviceString.join(),
    }
    getResponseDatas('get', this.deviceUrl, params).then((res) => {
      const result = res.data
      if (result.code === 200) {
        if (!flag) {
          this.setState({
            controlTypes: result.data.controlTypes,
            deviceTypes: result.data.deviceTypes,
          }, () => {
            const arrId = []
            this.state.controlTypes.map((item) => {
              arrId.push(item.controlTypeId)
            })
            this.setState({
              deviceString: arrId,
            }, () => {
              console.log('新增时全选', this.state.controlTypes, this.state.deviceString)
            })
          })
        }
      }
    })
  }
  handleBoxSelectList = () => {
    const { checkedListBox, detailsPopup, boxSelectList, oldDevicesList, EventTagPopupTit, deviceTypes } = this.state
    boxSelectList.forEach((item) => {
      checkedListBox.forEach((items) => {
        if (item.appendId === items) {
          deviceTypes.forEach((itemss, index) => {
            if (itemss.dictCode === item.deviceTypeId) {
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
      if (!boolean) {
        this.setState({
          checkedListBox: null,
        })
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
        boolean.eventType === 3 ? window.lineFlag = false : window.lineFlag = true
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
    const { eventType, deviceString } = this.state
    const itemArr = []
    const newItemArr = []
    console.log(deviceList, this.controlDatas, 'look at here')
    deviceList.map((item, i) => {
      item.device.map((items, index) => {
        itemArr.push(items)
      })
    })
    itemArr.map((items, i) => {
      newItemArr.push({
        deviceControlType: this.controlDatas.list[i].deviceControlType,
        deviceId: items.deviceId,
        deviceType: items.deviceType ? items.deviceType : items.deviceTypeId,
        content: this.controlDatas.list[i].content
      })
    })
    console.log(newItemArr, '是不是呢？')
    for (let i = 0; i < this.controlDatas.list.length; i++) {
      // if (this.controlDatas.list[i].deviceTypeId === 1 || this.controlDatas.list[i].deviceTypeId === 2 ||  this.controlDatas.list[i].deviceTypeId === 4) {
      if (!this.controlDatas.list[i].content) {
        message.warning('请填全显示内容')
        return
      }
      // }
      if (!this.controlDatas.list[i].deviceControlType) {
        message.warning('请选择设备控制类型')
        return
      }
    }
    const paramStr = '?deviceControlType=' + deviceString.join() + '&controlEventType=' + eventType + '&planName=' + this.controlDatas.planName
      + '&roadName=' + plan.roadName + '&direction=' + plan.directionId + '&locationMode=' + plan.locationMode
      + '&startEndPileNum=' + this.controlDatas.startPileNum + ' ' + this.controlDatas.endPileNum
    getResponseDatas('post', this.addPlanUrl + paramStr, newItemArr).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.info(res.data.message)
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
    const { eventType, deviceString } = this.state
    const itemArr = []
    const newItemArr = []
    console.log(deviceList, this.controlDatas, 'look at here')
    deviceList.map((item, i) => {
      item.device.map((items, index) => {
        itemArr.push(items)
      })
    })
    itemArr.map((items, i) => {
      newItemArr.push({
        deviceControlType: this.controlDatas.list[i].deviceControlType,
        deviceId: items.deviceId,
        deviceType: items.deviceType ? items.deviceType : items.deviceTypeId,
        content: this.controlDatas.list[i].content
      })
    })
    for (let i = 0; i < this.controlDatas.list.length; i++) {
      // if (this.controlDatas.list[i].deviceTypeId === 1 || this.controlDatas.list[i].deviceTypeId === 2 ||  this.controlDatas.list[i].deviceTypeId === 4) {
      if (!this.controlDatas.list[i].content) {
        message.warning('请填全显示内容')
        return
      }
      // }
      if (!this.controlDatas.list[i].deviceControlType) {
        message.warning('请选择设备控制类型')
        return
      }
    }
    const paramStr = '?deviceControlType=' + deviceString + '&controlEventType=' + eventType + '&planName=' + this.controlDatas.planName
      + '&roadName=' + plan.roadName + '&rowId=' + plan.rowId + '&direction=' + plan.directionId + '&locationMode=' + plan.locationMode
      + '&startEndPileNum=' + this.controlDatas.startPileNum + ' ' + this.controlDatas.endPileNum
    getResponseDatas('post', this.updatePlanUrl + paramStr, newItemArr).then((res) => {
      const result = res.data
      if (result.code === 200) {
        message.info(res.data.message)
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
        getResponseDatas('get', this.delPlanUrl, { planId: planId }).then((res) => {
          const result = res.data
          const arr = JSON.parse(JSON.stringify(this.state.listByPage))
          arr.data.splice(nowIndex, 1)
          this.setState({ listByPage: arr })
          if (result.code === 200) {
            message.info(res.data.message)
          } else {
            message.info(res.message)
          }
        })
      }
    })
  }
  handleDetailPlan = (rowId) => {
    getResponseDatas('get', this.detailPlanUrl, { planId: rowId }).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({
          deviceTypes: result.data,
          EventTagPopup: true,
        }, () => {
          console.log(this.state.deviceTypes, this.controlDatas, '修改时查看全部设备')
        })
        // this.handleUpdatePlan(result.data, plan)
      }
    })
  }
  handleGetListPlan = () => {
    getResponseDatas('post', this.getListPlanUrl, this.getListPlanUrlParams).then((res) => {
      const result = res.data
      if (result.code === 200) {

      }
    })
  }
  handleListByPage = () => {
    getResponseDatas('get', this.listByPageUrl, this.Parameters).then((res) => {
      const result = res.data
      if (result.code === 200) {
        this.setState({ listByPage: result.data, current: Number(this.Parameters.pageNo) }, () => {
          console.log(this.state.listByPage, '看结构')
        })
      }
    })
  }
  handlePlanPublic = (name, nowIndex) => {
    const { listByPage, deviceTypes } = this.state
    const deviceAry = []
    if (name == 'add') {
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
        situation: 0, // 
        planName: '',
      }
      this.setState({
        EventTagPopup: true,
        addFlag: true,
        directionName: '',
        deviceString: [],
      }, () => {
        this.getDeviceEventList()
      })
    } else if (name == 'update') {
      this.controlDatas = listByPage.data[nowIndex]
      this.controlDatas.startPileNum = listByPage.data[nowIndex].startEndPileNum.split(" ")[0]
      this.controlDatas.endPileNum = listByPage.data[nowIndex].startEndPileNum.split(" ")[1]
      this.controlDatas.directionId = listByPage.data[nowIndex].direction
      this.controlDatas.directionName = listByPage.data[nowIndex].directionName
      this.controlDatas.planName = listByPage.data[nowIndex].planName
      console.log(this.controlDatas, 'this.controlDatas')
      this.setState({
        eventType: listByPage.data[nowIndex].controlEventType,
        deviceString: listByPage.data[nowIndex].deviceControlType,
        directionName: listByPage.data[nowIndex].directionName,
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
      this.handleDetailPlan(listByPage.data[nowIndex].rowId) // 根据rowId获取全部设备
    } else if (name == 'edit') {
      console.log('编辑')

      deviceTypes.forEach((item) => {
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
        this.controlDatas.list = deviceAry
        console.log('编辑管控内容后：查看当前', this.controlDatas)
      })
    } else {
      this.handleDelPlan(listByPage.data[nowIndex].rowId, nowIndex)
      console.log(listByPage.data[nowIndex].rowId)
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
    console.log(value, value.latlng);
    if (value) {
      if (value.controlling) { // 已管控
        message.warning('当前设备已管控')
        return
      } else { // 未管控
        const { detailsPopup, EventTagPopupTit, deviceTypes } = this.state
        if (value.deviceType) {
          value.deviceTypeId = value.deviceType
        }
        deviceTypes.forEach((item, index) => {
          if (item.dictCode === value.deviceTypeId) {
            item.device.forEach((items, indexs) => {
              if (items.deviceId === value.deviceId) {
                value.content = items.content
                value.deviceControlType = items.deviceControlType
              }
            })
          }
        })
        this.handleUrlAjax(this.groupUrl, 'MeasuresList')
      }
    }
    this.setState({
      InfoWinPopup: value
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
    console.log(deviceTypes, EventTagPopupTit);
    this.setState({ InfoWinPopup: null, deviceTypes, })
  }
  handlepublish = (item) => {
    const { controlEventType, rowId } = item
    getResponseDatas('post', this.controlUrl + `${controlEventType}/${rowId}`).then((res) => {
      const result = res.data
      if (result.code === 200) {
        window.contingency = { eventType: 5, eventId: result.data }
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
      controlTypes, eventTypes, deviceTypes, addFlag, deviceCodeList, deviceDetailList } = this.state
    return (
      <div>
        <SystemMenu />
        <div className={styles.EqMain}>
          <Navigation />
          <div className={styles.EqCentent}>
            <div className={styles.Operation}>
              <div className={styles.leftItem}>
                <div><Input placeholder="请输入关键字" onChange={(e) => { this.handleInput(e, 'keyword', 'Parameters') }} /></div>
                <span className={styles.Button} onClick={() => { this.handlepage(1) }}>搜&nbsp;&nbsp;索</span>
              </div>
              <div className={styles.rightItem}>
                <span className={styles.Button} onClick={() => { this.handlePlanPublic('add') }}>新&nbsp;&nbsp;增</span>
              </div>
            </div>
            <div className={styles.ContetList}>
              <div className={styles.listItems}>
                <div className={styles.listTd} >预案名称</div>
                <div className={styles.listTd} >道路名称</div>
                <div className={styles.listTd} >路段名称</div>
                <div className={styles.listTd} >管控事件类型</div>
                <div className={styles.listTd} >管控类型</div>
                <div className={styles.listTd} >引用次数</div>
                <div className={styles.listTd} >操作</div>
              </div>
              {
                !!listByPage && listByPage.data.map((item, index) => {
                  return (
                    <div className={styles.listItems} key={item.roadName + item.rowId}>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.planName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.roadName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.secName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.controlEventTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName} title={item.controlDeviceTypeName}>{item.controlDeviceTypeName}</span></div>
                      <div className={styles.listTd} ><span className={styles.roadName}>{item.quoteNum}</span></div>
                      <div className={styles.listTd} >
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
                    <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Input defaultValue={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }} />
                    </div>
                  </div>
                  <div className={styles.ItemBox}>
                    <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                    <div className={styles.ItemInput}>
                      <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }}>
                        <Option value="">请选择</Option>
                        {
                          MeasuresList[InfoWinPopup.deviceTypeId - 1] && MeasuresList[InfoWinPopup.deviceTypeId - 1].map((itemss) => {
                            return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
                          })
                        }
                      </Select>
                    </div>
                  </div>
                </div> : InfoWinPopup.deviceTypeId === 3 ?
                  <div className={styles.Centent}>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                          <Option value="">请选择</Option>
                          {
                            deviceDetailList && deviceDetailList.map((itemss) => {
                              return <Option key={itemss.id} value={itemss.id}>{itemss.name}</Option>
                            })
                          }
                        </Select>
                      </div>
                    </div>
                    <div className={styles.ItemBox}>
                      <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                          <Option value="">请选择</Option>
                          {
                            MeasuresList[InfoWinPopup.deviceTypeId - 1] && MeasuresList[InfoWinPopup.deviceTypeId - 1].map((itemss) => {
                              return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
                            })
                          }
                        </Select>
                      </div>
                    </div>
                  </div> : InfoWinPopup.deviceTypeId === 4 ?
                    <div className={styles.Centent}>
                      <div className={styles.ItemBox}>
                        <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                        <div className={styles.ItemInput}>
                          <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                            <Option value="">请选择</Option>
                            {
                              deviceCodeList && deviceCodeList[0].map((itemss) => {
                                return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                              })
                            }
                          </Select>
                        </div>
                      </div>
                      <div className={styles.ItemBox}>
                        <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                        <div className={styles.ItemInput}>
                          <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                            <Option value="">请选择</Option>
                            {
                              MeasuresList[InfoWinPopup.deviceTypeId - 1] && MeasuresList[InfoWinPopup.deviceTypeId - 1].map((itemss) => {
                                return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
                              })
                            }
                          </Select>
                        </div>
                      </div>
                    </div> : InfoWinPopup.deviceTypeId === 5 ?
                      <div className={styles.Centent}>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>显&nbsp;示&nbsp;内&nbsp;容&nbsp;:</span>
                          <div className={styles.ItemInput}>
                            <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.content && InfoWinPopup.content) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'content') }}>
                              <Option value=''>请选择</Option>
                              {
                                deviceCodeList && deviceCodeList[(InfoWinPopup['function'] || 1) - 1].map((itemss) => {
                                  return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                })
                              }
                            </Select>
                          </div>
                        </div>
                        <div className={styles.ItemBox}>
                          <span className={styles.ItemName}>管&nbsp;控&nbsp;类&nbsp;型&nbsp;:</span>
                          <div className={styles.ItemInput}>
                            <Select style={{ width: '100%' }} defaultValue={(InfoWinPopup.deviceControlType && InfoWinPopup.deviceControlType) || ''} onChange={(e) => { this.handleInfoWinChange(e, 'deviceControlType') }} >
                              <Option value="">请选择</Option>
                              {
                                MeasuresList[InfoWinPopup.deviceTypeId - 1] && MeasuresList[InfoWinPopup.deviceTypeId - 1].map((itemss) => {
                                  return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
                                })
                              }
                            </Select>
                          </div>
                        </div>
                      </div> : null}
              <div className={styles.ItemFooter} style={{ bottom: '-15px' }}>
                <span onClick={this.handleInfoWinPopup}>确&nbsp;&nbsp;认</span>
                <span onClick={this.equipmentInfoWin.bind('', false)}>返&nbsp;&nbsp;回</span>
              </div>
            </div>
          </div> : null}
        {
          EventTagPopup ?
            <div className={style.MaskBox} style={{ zIndex: '996' }}>
              <div className={style.EventTagging}>
                <GMap equipmentInfoWin={this.equipmentInfoWin} onRef={el => this.ChildPage = el} styles={this.mapStyles} mapID={'popMap'} roadLatlng={detailsLatlng} handledetai={this.handledetai} detailsPopup={this.controlDatas} boxSelect={boxSelect} flagClose={flagClose} EventTagPopup={EventTagPopup} />
                <div className={style.EventTaggingLeft}>
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
                        <Select defaultValue={this.controlDatas.roadName} style={{ width: '48%', margin: '0 1%' }} onChange={(e) => { this.handleSelect(e, 'roadId', 'controlDatas') }}>
                          <Option value="">请选择</Option>
                          {
                            hwayList && hwayList.map((item) => {
                              return <Option key={item.id} value={item.name}>{item.name}</Option>
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
                        <Select defaultValue={"1"} style={{ width: '26%', margin: '8px 1%' }} disabled={true} onChange={(e) => { this.handleSelect(e, 'locationMode', 'controlDatas') }} >
                          <Option value="0">收费站</Option>
                          <Option value="1">里程桩</Option>
                        </Select>
                        <Input id="startInt" style={{ width: '34%', height: '32px', margin: '8px 1%' }} placeholder='起始桩号如:k1' defaultValue={this.controlDatas.startPileNum} onBlur={(e) => { this.handleInput(e, 'startPileNum', 'controlDatas'); this.handSecUrl() }} />
                        <Input id='endInt' style={{ width: '34%', height: '32px', margin: '8px 1%' }} placeholder='结束桩号如:k30' defaultValue={this.controlDatas.endPileNum} onBlur={(e) => { this.handleInput(e, 'endPileNum', 'controlDatas'); this.handSecUrl() }} />
                      </div>
                    </div>
                  </div>
                  <div className={style.Title} style={{ background: '#132334', lineHeight: '20px', height: '20px', fontSize: '12px' }}>选择事件类型</div>
                  <div className={style.Centent}>
                    <div className={style.ItemBox}>
                      <div className={style.ItemInput}>
                        {
                          eventTypes && eventTypes.map((item, i) => {
                            return <div className={classNames(style.AddItem, (this.state.eventType === item.id ? style.currentSel : null))} key={'eventTypes' + item.id} onClick={() => { this.handleSelect(item.id, 'eventTypeName', 'Click') }}>{item.name}</div>
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
                            return <div className={classNames(style.AddItem, (this.state.deviceString.indexOf(item.controlTypeId) > -1 || this.state.deviceString.indexOf(String(item.controlTypeId)) > -1 ? style.currentSel : null))} key={'controlTypes' + item.controlTypeId} onClick={() => { this.updateControlTypes(String(item.controlTypeId)) }}>{item.controlTypeName}</div>
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
                                    return <div className={style.PanelBox}><p className={style.PanelItem} key={items} onClick={() => { this.openInfoWin(items) }}>{`${index + 1}. ${items.deviceName} ${items.directionName} ${item.codeName}`}</p><Icon onClick={() => { this.handleSubDetailsPopupList(ind, index) }} className={style.MinusItem} type="close" /></div>
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
        {reservePopup ?
          <div className={styles.MaskBox} style={{ zIndex: '1000' }}>
            <div className={styles.AddBox}>
              <div className={styles.Title}>{'预案详情'}<Icon onClick={() => { this.handleEventPopup('Reserve', false) }} className={styles.Close} type="close" /></div>
              <div className={styles.Conten}>
                <div className={styles.Header}>
                  <span>管控措施：</span>
                </div>
                {
                  deviceTypes && deviceTypes.map((items, indexs) => {
                    return (
                      items.dictCode === 1 || items.dictCode === 2 ?
                        <div className={styles.ItemBox}>
                          <div className={styles.HeadItem}>{items.codeName}{/* <span className={styles.AddItem} onClick={(e) => { this.genExtraAddOnclick(e, items, reservePopup) }}><Icon type="plus" /></span> */}</div>
                          <div className={styles.RowBox}>
                            {
                              items.device && items.device.map((item, index) => {
                                return (
                                  <div key={item.deviceId + item.deviceTypeId}>
                                    <div className={style.InputBox}>
                                      <div className={style.ItemInput} style={{ width: '30%', textAlign: 'right', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>{deviceTypes.status === 1 ? <Icon type="close-circle" className={styles.CloneItem} onClick={() => { this.handleCloseCircle(indexs, index, item.deviceId) }} /> : null}{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div>
                                      <div className={style.ItemInput} style={{ width: '50%' }}><Input style={{ textAlign: 'center', color: 'red' }} placeholder='请输入描述' onChange={(e) => { this.handleInput(e, 'content', 'controlDatas', item) }} defaultValue={item.content} /></div>
                                      <div className={style.ItemInput} style={{ width: '20%' }}>
                                        <Select disabled={deviceTypes.status > 1 ? true : ''} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '80%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            controlTypes && controlTypes.map((itemss) => {
                                              return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
                                            })
                                          }
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                            {!!items.device.length || <div className={style.PanelItemNone}>暂无数据</div>}
                          </div>
                        </div> : items.dictCode === 3 ?
                          <div className={styles.ItemBox}>
                            <div className={styles.HeadItem}>{items.codeName}</div>
                            <div className={styles.RowBox}>
                              {
                                items.device && items.device.map((item, index) => {
                                  return (

                                    <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                      <div className={style.ItemInput} style={{ width: '30%', textAlign: 'right', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div>
                                      <div className={style.ItemInput} style={{ width: '30%' }}>
                                        <Select defaultValue={item.content ? item.content : ''} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
                                          <Option value={''}>请选择</Option>
                                          {
                                            deviceDetailList && deviceDetailList.map((itemss) => {
                                              return <Option key={itemss.id} value={itemss.id}>{itemss.name}</Option>
                                            })
                                          }
                                        </Select>
                                      </div>
                                      <div className={style.ItemInput} style={{ width: '30%' }}>
                                        <Select disabled={deviceTypes.status > 1 ? true : ''} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '80%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                          <Option value={0}>请选择</Option>
                                          {
                                            controlTypes && controlTypes.map((itemss) => {
                                              return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
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
                            <div className={styles.ItemBox}>
                              <div className={styles.HeadItem}>{items.codeName}</div>
                              <div className={styles.RowBox}>
                                {
                                  items.device && items.device.map((item, index) => {
                                    return (
                                      <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                        <div className={style.ItemInput} style={{ width: '30%', textAlign: 'right', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div>
                                        <div className={style.ItemInput} style={{ width: '30%' }}>
                                          <Select defaultValue={item.content ? item.content : ''} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
                                            <Option value={''}>请选择</Option>
                                            {
                                              deviceCodeList && deviceCodeList[0].map((itemss) => {
                                                return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                              })
                                            }
                                          </Select>
                                        </div>
                                        <div className={style.ItemInput} style={{ width: '30%' }}>
                                          <Select disabled={deviceTypes.status > 1 ? true : ''} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '80%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                            <Option value={0}>请选择</Option>
                                            {
                                              controlTypes && controlTypes.map((itemss) => {
                                                return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
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
                              <div className={styles.ItemBox}>
                                <div className={styles.HeadItem}>{items.codeName}</div>
                                <div className={styles.RowBox}>
                                  {
                                    items.device && items.device.map((item, index) => {
                                      return (
                                        <div className={style.InputBox} key={item.deviceId + item.deviceTypeId}>
                                          <div className={style.ItemInput} style={{ width: '30%', textAlign: 'right', lineHeight: '30px', paddingRight: '8px' }} title={index + 1 + '.' + item.deviceName + '-' + item.directionName + items.codeName}>{index + 1}.{item.deviceName + '-' + item.directionName + items.codeName}&nbsp;:</div>
                                          <div className={style.ItemInput} style={{ width: '30%' }}>
                                            <Select defaultValue={item.content ? item.content : ''} style={{ width: '85%' }} onChange={(e) => { this.handleSelect(e, 'content', 'controlDatas', item) }}>
                                              <Option value={''}>请选择</Option>
                                              {
                                                deviceCodeList && deviceCodeList[(item['function'] || 1) - 1].map((itemss) => {
                                                  return <Option key={itemss.dictCode} value={'' + itemss.dictCode}>{itemss.codeName}</Option>
                                                })
                                              }
                                            </Select>
                                          </div>
                                          <div className={style.ItemInput} style={{ width: '30%' }}>
                                            <Select disabled={deviceTypes.status > 1 ? true : ''} defaultValue={item.deviceControlType ? item.deviceControlType : 0} style={{ width: '80%' }} onChange={(e) => { this.handleSelect(e, 'deviceControlType', 'controlDatas', item) }}>
                                              <Option value={0}>请选择</Option>
                                              {
                                                controlTypes && controlTypes.map((itemss) => {
                                                  return <Option key={itemss.controlTypeId} value={itemss.controlTypeId}>{itemss.controlTypeName}</Option>
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
                <div className={style.ItemFooter}>
                  <span onClick={() => { addFlag ? this.handleAddPlan(deviceTypes, this.controlDatas) : this.handleUpdatePlan(deviceTypes, this.controlDatas) }}>保&nbsp;&nbsp;存</span>
                  <span onClick={() => { this.handleEventPopup('Reserve', false) }}>返&nbsp;&nbsp;回</span>
                </div>
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
                        return <Checkbox key={item.appendId} disabled={item.exists === true || item.controlling === true ? true : false} value={item.appendId}>{item.deviceName + '-' + item.directionName}<b style={{ color: 'yellow' }}>{item.exists === true ? " ( 已存在 )" : " "}</b></Checkbox>
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
