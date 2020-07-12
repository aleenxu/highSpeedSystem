import React from 'react'
import { Button } from 'antd'
import './GMap.scss'
import tollStationIcon from '../../imgs/tollStation_s.png'
import fBoardIcon from '../../imgs/fBoard_s.png'
import speedLimitIcon from '../../imgs/speedLimit_s.png'
import carLimitIcon from '../../imgs/carLimit_s.png'
import turnBoardIcon from '../../imgs/map_turnBoard_s.png'
// import { ReactComponent as turnBoardIcon } from '../../imgs/turnBoard_s.svg'
import mapTrafficJam from '../../imgs/map_traffic_jam.png'
import mapBuild from '../../imgs/map_build.png'
import mapWeather from '../../imgs/map_weather.png'
import mapAccidents from '../../imgs/map_accident.png'
import mapDisaster from '../../imgs/map_disaster.png'
import mapPavement from '../../imgs/map_pavement.png'
import mapControl from '../../imgs/map_control.png'
import mapWarning from '../../imgs/map_warning.png'

import getResponseDatas from '../../plugs/HttpData/getResponseData'
import $ from 'jquery'
const pointArr = []
window.centerPoint = null
window.lineFlag = true
window.linePoint = null
//监听drawRectangle事件可获取画好的覆盖物
class GMap extends React.Component {
  constructor(props) {
    super(props)
    console.log(props);

    this.state = {
      keyWords: '', // 查询的关键词
      infoBoardJson: [], //情报版
      infoFBoardJson: [], //F屏情报版
      tollGateJson: [], //收费站匝道灯
      speedLimitJson: [], //车道控制器限速版
      carRoadJson: [], //车道控制器
      roadLatlng: this.props.roadLatlng, // 路段的经纬度
      /*  detailsPopup: this.props.detailsPopup, // 右侧详情显示 */
      boxSelect: this.props.boxSelect, // 框选弹层
      flagClose: this.props.flagClose, // 框选是否清除绘制
      centerPoint: null, // 地图中心点
      mapID: this.props.mapID, // 地图ID
      styles: this.props.styles, // 地图样式
      EventTagPopup: this.props.EventTagPopup, // 弹层地图后更新下原来地图
      linePoint: null,
      updatePoint: this.props.updatePoint, // 更新的点
      detailsPopup: this.props.detailsPopup, // 事件详情
      EventTagPopup: this.props.EventTagPopup, // 主动管控
      deviceString: this.props.deviceString, // 地图管控事件类型
      appendIds: this.props.appendIds,
    }
    this.styles = {
      position: 'fixed',
      top: '52px',
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e375d',
      dataAll: this.props.dataAll,
    }
    this.placeSearch = null;
    this.map = null
    this.markers = []
    this.publicLayers = []
    // this.mapPointUrl = '/control/device/list/device/to/map' // 查询设备集合（用于回显到地图）
    this.mapPointUrl = '/control/device/list/to/map'
    if (props.onRef) {//如果父组件传来该方法 则调用方法将子组件this指针传过去
      props.onRef(this)
    }
  }

  componentDidMount = () => {
    if (this.props.mapID === 'HistorcalMap') {
      this.loadingMap()
    } else {
      this.handleAMap()
    }
  }
  componentWillReceiveProps = (nextProps) => {
    /* if (this.props.deviceString !== nextProps.deviceString) {
      this.setState({ deviceString: nextProps.deviceString }, () => {
        this.loadPoint(true)
      })
    } */
    if (this.props.linePoint !== nextProps.linePoint) {
      this.setState({ linePoint: nextProps.linePoint })
    }
    if (this.props.updatePoint !== nextProps.updatePoint) {
      this.setState({ updatePoint: nextProps.updatePoint }, () => {
        this.openInfoWin(window.map, this.state.updatePoint)
      })
    }
    if (this.props.dataAll !== nextProps.dataAll) {
      this.setState({ dataAll: nextProps.dataAll })
    }
    if (this.props.EventTagPopup !== nextProps.EventTagPopup) {
      this.setState({ EventTagPopup: nextProps.EventTagPopup })
      this.loadingMap()
      console.log(nextProps.EventTagPopup, this.props.mapID);

    }
    if (this.props.styles !== nextProps.styles) {
      this.setState({ styles: nextProps.styles })
    }
    if (this.props.roadLatlng !== nextProps.roadLatlng) {
      this.setState({ roadLatlng: nextProps.roadLatlng })
    }
    if (this.props.appendIds !== nextProps.appendIds) {
      this.setState({ appendIds: nextProps.appendIds })
    }
    if (this.props.EventTagPopup !== nextProps.EventTagPopup) {
      this.setState({ EventTagPopup: nextProps.EventTagPopup })
    }
    if (this.props.boxSelect !== nextProps.boxSelect) {
      this.setState({ boxSelect: nextProps.boxSelect }, () => {
        if (!this.state.boxSelect) {
          //this.loadingMap()
          this.map.remove(window.overlays)
          window.overlays = []
        }
      })
    }
    if (this.props.detailsPopup !== nextProps.detailsPopup) {
      this.setState({ detailsPopup: nextProps.detailsPopup }, () => {
        if (this.state.detailsPopup) {
          if (!this.state.detailsPopup.controlStatusType) {
            // window.drawRectangle()
          } else {
            window.mouseTool.close(true) //关闭，并清除覆盖物
            $(".amap-maps").attr("style", "")

          }
        } else {
          // console.log("为false 时重载地图")
          this.loadPoint(true)
          this.map.remove(window.overlays)
          window.overlays = []
        }
      })
    }
    if (window.centerPoint && window.centerPoint != this.state.centerPoint) {
      this.setState({
        centerPoint: window.centerPoint,
      }, () => {
        const nowZoom = window.map.getZoom()
        window.map.setZoomAndCenter(nowZoom, [this.state.centerPoint.split(",")[0], this.state.centerPoint.split(",")[1]])
      })
    }
  }
  handledetai = (dataItem) => {
    const { handledetai } = this.props
    if (handledetai) {
      handledetai(dataItem)
    }
  }
  handleAMap = () => {
    this.loadPoint()
  }
  loadPoint = (value) => { // 预案库通过不同类型来筛选地图点位
    const { deviceString, keyWords } = this.state
    getResponseDatas('get', this.mapPointUrl + '?searchKey=' + keyWords + (deviceString ? `&controlTypes=${deviceString}` : '')).then((res) => {
      const jsonData = res.data
      if (jsonData.code == 200 && jsonData.data) {
        window.mapPointArr = jsonData.data
        const infoBoardJson = [], infoFBoardJson = [], carRoadJson = [], speedLimitJson = [], tollGateJson = []
        jsonData.data.map((item) => {
          // 根据类型划分图标类型 1、可变情报板;2、F屏情报版;3、可变限速板;4、收费站; 5、车道控制器;
          switch (item.deviceType) {
            case 1:
              infoBoardJson.push(item)
              break;
            case 2:
              infoFBoardJson.push(item)
              break;
            case 3:
              speedLimitJson.push(item)
              break;
            case 4:
              tollGateJson.push(item)
              break;
            case 5:
              carRoadJson.push(item)
              break;
          }
        })
        this.setState({
          infoBoardJson, infoFBoardJson, speedLimitJson, tollGateJson, carRoadJson,
        })
        this.loadingMap(value)
      } else {
        this.loadingMap(value)
      }
    })
  }
  loadingMap = (value) => {
    const _this = this;
    if (!value) {
      const map = new AMap.Map(_this.state.mapID, {
        resizeEnable: true, //是否监控地图容器尺寸变化
        center: [103.882158, 30.436527], //初始化地图中心点
        mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
        zoom: this.props.mapID === 'HistorcalMap' ? 12 : 14,
      })
      if (this.props.mapID !== 'ReserveMap') {
        window.map = map
        window.map.on('mousemove')
        window.mouseTool = new AMap.MouseTool(map)
        //监听draw事件可获取画好的覆盖物
        window.overlays = []
        mouseTool.on('draw', function (e) {
          overlays.push(e.obj);
        })
        function draw() {
          mouseTool.rectangle({
            fillColor: '#00b0ff',
            strokeColor: '#80d8ff'
            // 同Polygon的Option设置
          })
        }
        window.drawRectangle = draw
      }
      this.map = map
      // 实时路况图层
      const trafficLayer = new AMap.TileLayer.Traffic({
        zIndex: 10,
      });
      trafficLayer.setMap(window.map)
      this.createLayerGroup('leftModule0') // 交通拥堵选中复选框显示的图层
      this.createLayerGroup('leftModule1') // 道路施工选中复选框显示的图层
      this.createLayerGroup('leftModule2') // 极端天气选中复选框显示的图层
      this.createLayerGroup('leftModule3') // 交通事故选中复选框显示的图层
      this.createLayerGroup('leftModule4') // 主动管控选中复选框显示的图层
      this.createLayerGroup('deviceTollGate') // map中收费站匝道灯图标显示的图层
      this.createLayerGroup('deviceFInfoBoard') // map中F情报版显示的图层
      this.createLayerGroup('deviceInfoBoard') // map中车道控制器情报版限速显示的图层
      this.createLayerGroup('deviceTurnBoard') // map中门架情报板显示的图层
      this.createLayerGroup('carRoadBoard') // map中车道控制器显示的图层
      if (this.props.mapID !== 'ReserveMap') {
        this.createLayerGroup('lineLayers') // map中绘制线显示的图层
      }

      // 输入提示
      const autoOptions = {
        city: '成都',
        input: 'tipinput',
      }
      const autoOptionsPop = {
        city: '成都',
        input: 'tipinputPop',
      }
      const auto = new AMap.Autocomplete(autoOptions)
      const autoPop = new AMap.Autocomplete(autoOptionsPop)
      this.placeSearch = new AMap.PlaceSearch({
        map: map,
      })  //构造地点查询类
      AMap.event.addListener(auto, 'select', this.searchKeyWords) // 注册监听，当选中某条记录时会触发
      AMap.event.addListener(autoPop, 'select', this.searchKeyWords) // 注册监听，当选中某条记录时会触发
    }


    // 点的新建
    // 图标收费站匝道灯
    this.drawMarkers(this.state.tollGateJson, tollStationIcon, 'deviceTollGate')
    // 图标F屏情报版
    this.drawMarkers(this.state.infoFBoardJson, fBoardIcon, 'deviceFInfoBoard')
    // 图标限速牌专用
    this.drawMarkers(this.state.speedLimitJson, speedLimitIcon, 'deviceInfoBoard')
    // 图标门架情报板
    this.drawMarkers(this.state.infoBoardJson, turnBoardIcon, 'deviceTurnBoard')
    // 图标车道控制器
    this.drawMarkers(this.state.carRoadJson, carLimitIcon, 'carRoadBoard')
    // 左侧功能数据图标


    if (this.props.mapID !== 'ReserveMap') {
      setTimeout(() => {
        this.loadLeftModulePoint()
      }, 500)
      // 线的绘制
      window.drawLine = this.handledrawLineCircle
    }
    // 弹层的自定义
    //覆盖默认的dom结构
    AMapUI.defineTpl("ui/overlay/SimpleInfoWindow/tpl/container.html", [], function () {
      return document.getElementById('my-infowin-tpl').innerHTML;
    });
  }
  createLayerGroup = (name) => {
    window[name] = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    name.indexOf('leftModule') > -1 ? this.publicLayers.push(name) : null;
  }
  loadLeftModulePoint = () => {
    const _this = this
    this.state.dataAll && this.state.dataAll.map((leftItem, leftIndex) => {
      if (leftItem.eventData && leftItem.eventData.length > 0) {
        // markEventType
        leftItem.eventData.map((item, index) => {
          const itemData = JSON.parse(JSON.stringify(item))
          const marker = new AMap.Marker({
            position: new AMap.LngLat(item.latlng[0][0], item.latlng[0][1]),
            offset: new AMap.Pixel(-88, -19),
            icon: _this.returnMapIcon(leftIndex, item),
          })
          marker.on("click", () => {
            const nowZoom = map.getZoom()
            // console.log("绑定点击事件",lineDatas, item.latlng[index])
            map.setZoomAndCenter(nowZoom, [item.latlng[0][0], item.latlng[0][1]]); //同时设置地图层级与中心点
            this.handledetai(item)
            // console.log(item, '看下全部数据')
            // const lineFlag = (item.markEventType !== 3 ? true : false)
            window.drawLine(itemData.latlng, window.lineFlag)
          })
          window['leftModule' + leftIndex].addLayer(marker) //把点添加到层组中
          window['leftModule' + leftIndex].setMap(map) // 层组渲染到地图中
          window['leftModule' + leftIndex].hide() // 隐藏当前的层组
        })
      }
    })
  }
  //高德批量添加点
  drawMarkers = (positions, imgIcon, layer) => {
    const map = this.map
    if (window[layer]) {
      window[layer].removeLayers(this[layer])
    }

    this[layer] = []
    if (this.infoWindow) {
      this.infoWindow.close()
    }
    if (map) {
      for (let i = 0; i < positions.length; i++) {
        console.log(positions[i], this.state.appendIds && this.state.appendIds.includes(positions[i].appendId), positions[i].appendId);

        if (this.props.mapID === 'ReserveMap' && !(this.state.appendIds && this.state.appendIds.includes(positions[i].appendId))) { continue }
        const latlng = positions[i].latlng
        const marker = new AMap.Marker({
          position: new AMap.LngLat(latlng[0], latlng[1]),
          offset: new AMap.Pixel(-22.5, -22.5),
          icon: imgIcon,
        })
        if (!(this.props.mapID === 'ReserveMap')) {
          marker.on('click', (event) => {
            const nowZoom = map.getZoom()
            map.setZoomAndCenter(nowZoom, positions[i].latlng) // 同时设置地图层级与中心点
            this.openInfoWin(map, positions[i])
          })
        }
        this[layer].push(marker)
      }
      // this.map.setFitView(this[layer])
      window[layer].addLayers(this[layer]) // 把点添加到层组中
      window[layer].setMap(map) // 层组渲染到地图中
    }
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
  handledrawLineCircle = (path, type) => {
    console.log(path);
    if (typeof (path[0]) === 'string') {
      // const nowZoom = window.map.getZoom()
      // window.map.setZoomAndCenter(nowZoom, path)
      this.circle(path, type)
    } else {
      // this.getLineCenterPoint(path)
      this.drawLine(path, type)
    }
  }
  circle = (path, type) => {
    window['lineLayers'].hide()
    // window['lineLayers'].clearLayer()
    window['lineLayers'].fx = []
    window['lineLayers'].show()
    const circle = new AMap.Circle({
      center: path,
      radius: 250, // 半径
      borderWeight: 3,
      // strokeColor: "#98989a",
      strokeOpacity: 1,
      strokeWeight: 6,
      strokeOpacity: 0.2,
      fillOpacity: 0.4,
      strokeStyle: 'dashed',
      strokeDasharray: [10, 10],
      // 线样式还支持 'dashed'
      fillColor: '#98989a',
      zIndex: 50,
    })
    this.map.setFitView([circle])
    window['lineLayers'].addLayer(circle)
    window['lineLayers'].setMap(this.map)
  }
  drawLine = (path, type) => {
    window['lineLayers'].hide()
    // window['lineLayers'].clearLayer()
    window['lineLayers'].fx = []
    window['lineLayers'].show()
    const polyline = new AMap.Polyline({
      path,
      isOutline: true,
      outlineColor: !type ? '#98989a' : 'red',
      borderWeight: !type ? 15 : 8,
      strokeColor: !type ? '#98989a' : 'red',
      strokeOpacity: !type ? .6 : .9,
      strokeWeight: 0,
      // 折线样式还支持 'dashed
      strokeStyle: "solid",
      // strokeStyle是dashed时有效
      strokeDasharray: [10, 5],
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 50,
    })
    this.map.setFitView([polyline])
    window['lineLayers'].addLayer(polyline)
    window['lineLayers'].setMap(this.map)
  }
  returnMapIcon = (index, item) => {
    switch (index) {
      case 0:
        return mapTrafficJam
      case 1:
        return mapBuild
      case 2:
        return mapWeather
      case 3:
        return mapAccidents
      case 4:
        switch (item.markEventType) {
          case 1:
            return mapTrafficJam
          case 2:
            return mapBuild
          case 3:
            return mapWeather
          case 4:
            return mapAccidents
          case 5:
            return mapDisaster
          case 6:
            return mapPavement
          case 7:
            return mapControl
          case 8:
            return mapWarning
        }
    }
  }
  equipmentInfoWin = () => {
    this.props.equipmentInfoWin(this.dataItem)
  }
  equipmentInfoWinImg=()=>{
    this.props.equipmentInfoWinImg(this.dataItem)
  }
  // 在指定位置打开信息窗体
  openInfoWin = (map, dataItem) => {
    console.log(dataItem);
    window.equipmentInfoWin = this.equipmentInfoWin
    window.equipmentInfoWinImg = this.equipmentInfoWinImg
    const { detailsPopup, EventTagPopup } = this.state
    const info = []
    this.dataItem = JSON.parse(JSON.stringify(dataItem))
    info.push(`<div class='content_box'>`);
    info.push(`<div class='content_box_title'><h4>设备信息</h4>`);
    info.push(`<p class='input-item'>设备名称：<span>` + (dataItem.deviceType === 4 ? '新津花源收费站' : dataItem.deviceName) + `</span></p>`);
    info.push(`<p class='input-item'>设备类型：<span>` + dataItem.deviceTypeName + `</span></p>`);
    info.push(`<p class='input-item'>桩号：<span>` + dataItem.pileNum + `</span></p>`);
    info.push(`<p class='input-item'>方向：<span>` + dataItem.roadDirectionName + `</span></p>`);
    info.push(`<p class='input-item'>管控状态：<span>` + (dataItem.controlling ? '已管控' : '未管控') + `</span></p>`);
    info.push(`<p class='input-item'>所属高速：<span>` + dataItem.hwayName + `</span></p>`);
    info.push(`<p class='input-item input_button'><Button onclick='window.equipmentInfoWinImg()' type="primary" class='input-item-button'>查看管控内容</Button></p>`)
    if ((detailsPopup) || EventTagPopup) {
      info.push(dataItem.controlling && this.props.mapID !== 'RpopMap' ? `<p class='input-item input_button'><Button disabled type="primary" class='input-item-button' style="background:#969495">已管控</Button></p>` :
        `<p class='input-item input_button'><Button onclick='window.equipmentInfoWin()' type="primary" class='input-item-button'>编辑管控内容</Button></p>`
      )
    }
    const infoWindow = new AMap.InfoWindow({
      content: info.join("")  //使用默认信息窗体框样式，显示信息内容
    });

    infoWindow.open(map, dataItem.latlng);
    this.infoWindow = infoWindow
    window.infoWindowClose = infoWindow
    map.on('click', (e) => {
      infoWindow.close()
    })
  }
  searchKeyWords = e => {
    this.placeSearch.setCity(e.poi.adcode);
    this.placeSearch.search(e.poi.name);  //关键字查询查询
  }
  render() {
    const { mapID, styles } = this.state
    return (
      <div id={mapID} style={styles ? styles : this.styles}></div>
    )
  }
}
export default GMap
