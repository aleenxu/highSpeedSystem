import React from 'react'
import tollStationIcon from '../../imgs/tollStation_s.png'
import fBoardIcon from '../../imgs/fBoard_s.png'
import speedLimitIcon from '../../imgs/speedLimit_s.png'
import turnBoardIcon from '../../imgs/turnBoard_s.png'
import mapTrafficJam from '../../imgs/map_traffic_jam.png'
import mapBuild from '../../imgs/map_build.png'
import mapWeather from '../../imgs/map_weather.png'
import mapAccidents from '../../imgs/map_accident.png'
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
    this.state = {
      keyWords: '', // 查询的关键词
      infoBoardJson: [], //情报版
      infoFBoardJson: [], //F屏情报版
      tollGateJson: [], //收费站
      speedLimitJson: [], //限速版
      roadLatlng: this.props.roadLatlng, // 路段的经纬度
      detailsPopup: this.props.detailsPopup, // 右侧详情显示
      boxSelect: this.props.boxSelect, // 框选弹层
      flagClose: this.props.flagClose, // 框选是否清除绘制
      centerPoint: null, // 地图中心点
      mapID: this.props.mapID, // 地图ID
      styles: this.props.styles, // 地图样式
      EventTagPopup: this.props.EventTagPopup, // 弹层地图后更新下原来地图
      linePoint: null,
    }
    this.styles = {
      position: 'fixed',
      top: '50px',
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
    this.mapPointUrl = '/control/device/list/device/to/map' // 查询设备集合（用于回显到地图）
    this.markers = [] // 点集合
  }
  componentDidMount = () => {
    this.loadPoint()
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.linePoint !== nextProps.linePoint) {
      this.setState({ linePoint: nextProps.linePoint })
    }
    if (this.props.dataAll !== nextProps.dataAll) {
      this.setState({ dataAll: nextProps.dataAll })
    }
    if (this.props.EventTagPopup !== nextProps.EventTagPopup) {
      this.setState({ EventTagPopup: nextProps.EventTagPopup })
      this.loadingMap()
    }
    if (this.props.styles !== nextProps.styles) {
      this.props.styles = nextProps.styles
    }
    if (this.props.roadLatlng !== nextProps.roadLatlng) {
      this.setState({ roadLatlng: nextProps.roadLatlng })
    }
    if (this.props.boxSelect !== nextProps.boxSelect) {
      this.setState({ boxSelect: nextProps.boxSelect }, () => {
        if (!this.state.boxSelect) {
          //this.loadingMap()
          map.remove(window.overlays)
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
          this.loadPoint()
          map.remove(window.overlays)
          window.overlays = []
        }
      })
    }
    if (window.centerPoint && window.centerPoint != this.state.centerPoint) {
      this.setState({
        centerPoint: window.centerPoint
      }, () => {
        window.map.setZoomAndCenter(12, [this.state.centerPoint.split(",")[0], this.state.centerPoint.split(",")[1]])
      })
    }
  }
  handledetai = (dataItem) => {
    const { handledetai } = this.props
    if (handledetai) {
      handledetai(dataItem)
    }
  }
  loadPoint = () => {
    getResponseDatas('get', this.mapPointUrl + '?searchKey=' + this.state.keyWords).then((res) => {
      const jsonData = res.data
      if (jsonData.code == 200 && jsonData.data.length > 0) {
        window.mapPointArr = jsonData.data
        jsonData.data.map((item) => {
          // 根据类型划分图标类型 1、可变情报板;2、可变限速板;3、收费站;4、F屏情报版;
          switch (item.deviceTypeId) {
            case 1:
              this.state.infoBoardJson.push(item)
              break;
            case 2:
              this.state.speedLimitJson.push(item)
              break;
            case 3:
              this.state.tollGateJson.push(item)
              break;
            case 4:
              this.state.infoFBoardJson.push(item)
              break;
          }
        })
        this.loadingMap()
      }
    })
  }
  loadingMap = () => {
    const _this = this;
    window.map = new AMap.Map(_this.state.mapID, {
      resizeEnable: true, //是否监控地图容器尺寸变化
      center: [120.0105285600, 32.3521228100], //初始化地图中心点
      mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
      zoom: 11
    });
    /* window.mouseToolLayer = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.mouseToolLayer.setMap(map) // 层组渲染到地图中 */
    window.map.on('mousemove')
    window.mouseTool = new AMap.MouseTool(map);
    //监听draw事件可获取画好的覆盖物
    window.overlays = []
    mouseTool.on('draw', function (e) {
      overlays.push(e.obj);
    })
    function draw() {
      mouseTool.rectangle({
        fillColor: '#00b0ff',
        strokeColor: '#80d8ff'
        //同Polygon的Option设置
      });
    }
    window.drawRectangle = draw
    //实时路况图层
    var trafficLayer = new AMap.TileLayer.Traffic({
      zIndex: 10
    });
    window.leftModuleOne = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.leftModuleTwo = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.leftModuleThree = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.leftModuleFour = new AMap.LayerGroup({
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    // 设备地图层
    window.deviceTollGate = new AMap.LayerGroup({ //收费站
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.deviceFInfoBoard = new AMap.LayerGroup({ //F情报版
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.deviceInfoBoard = new AMap.LayerGroup({ //情报版
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.deviceTurnBoard = new AMap.LayerGroup({ //可变情报版
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    trafficLayer.setMap(window.map)
    //输入提示
    const autoOptions = {
      city: "泰州",
      input: "tipinput"
    };
    const auto = new AMap.Autocomplete(autoOptions);
    this.placeSearch = new AMap.PlaceSearch({
      map: map
    });  //构造地点查询类
    AMap.event.addListener(auto, "select", this.searchKeyWords);//注册监听，当选中某条记录时会触发
    // 点的新建
    if (this.state.dataAll) {
      // 左侧功能数据图标
      this.toggleAmapMarkers(pointArr, tollStationIcon, "1")
    }
      // 图标收费站
      this.toggleAmapMarkers(this.state.tollGateJson, tollStationIcon, "2")
      // 图标F屏情报版
      this.toggleAmapMarkers(this.state.infoFBoardJson, fBoardIcon, "3")
      // // 图标限速牌专用
      this.toggleAmapMarkers(this.state.speedLimitJson, speedLimitIcon, "4")
      // // 图标可变情报版
      this.toggleAmapMarkers(this.state.infoBoardJson, turnBoardIcon, "5")
    // 线的绘制
    AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {

      if (!PathSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！');
        return;
      }

      //just some colors
      var colors = ["red", "gray"];
      var pathSimplifierIns = new PathSimplifier({
        zIndex: 100,
        autoSetFitView: false,
        map: map, //所属的地图实例
        getPath: function (pathData, pathIndex) {
          return pathData.path;
        },
        renderOptions: {
          pathLineStyle: {
            dirArrowStyle: false
          },
          getPathStyle: function (pathItem, zoom) {
            var color = window.lineFlag ? colors[0] : colors[1],
              lineWidth = window.lineFlag ? 10 : 15;
            return {
              pathLineStyle: {
                strokeStyle: color,
                lineWidth: lineWidth
              },
              pathLineSelectedStyle: {
                lineWidth: lineWidth + 2
              },
              pathNavigatorStyle: {
                fillStyle: color
              }
            }
          }
        }
      });
      window.pathSimplifierIns = pathSimplifierIns;
    });
    // 弹层的自定义
    //覆盖默认的dom结构
    AMapUI.defineTpl("ui/overlay/SimpleInfoWindow/tpl/container.html", [], function () {
      return document.getElementById('my-infowin-tpl').innerHTML;
    });
  }
  returnMapIcon = (index) => {
    switch (index) {
      case 0:
        return mapTrafficJam
      case 1:
        return mapBuild
      case 2:
        return mapWeather
      case 3:
        return mapAccidents

    }
  }
  // 创建多个点
  /* 
    pointArr : 点的数组 [[],[],[],[]]
    pointIcon: 图标路径
  */
  //高德批量添加点
  toggleAmapMarkers = (positions, imgIcon, flag) => {
    debugger
    const map = window.map
    if (map) {
      let marker;
      for (let i = 0; i < positions.length; i++) {
        marker = new AMap.Marker({
          position: new AMap.LngLat(positions[i].latlng[0], positions[i].latlng[1]),
          offset: new AMap.Pixel(-10, -10),
          icon: imgIcon,
        });
        // this.markers.push(marker)
        /* if (flag === '1') {

        } */
        switch (flag) {
          case "1":
            let roadLatlngData = {
              "path": positions[i].latlng,
            }
            let lineDatas = []
            lineDatas.push(roadLatlngData)
            this.markers.push(marker)
            marker.on('click', (event) => {
              this.openInfo(positions[i])
              map.setZoomAndCenter(12, positions[i].latlng); //同时设置地图层级与中心点
              _this.handledetai(positions[i])
              window.pathSimplifierIns.setData(lineDatas)
            })
            
                  // switch (leftIndex) {
                  //   case 0:
                  //     window.leftModuleOne.addLayer(marker) //把点添加到层组中
                  //     window.leftModuleOne.setMap(map) // 层组渲染到地图中
                  //     window.leftModuleOne.hide() // 隐藏当前的层组
                  //     break;
                  //   case 1:
                  //     window.leftModuleTwo.addLayer(marker) //把点添加到层组中
                  //     window.leftModuleTwo.setMap(map) // 层组渲染到地图中
                  //     window.leftModuleTwo.hide() // 隐藏当前的层组
                  //     break;
                  //   case 2:
                  //     window.leftModuleThree.addLayer(marker) //把点添加到层组中
                  //     window.leftModuleThree.setMap(map) // 层组渲染到地图中
                  //     window.leftModuleThree.hide() // 隐藏当前的层组
                  //     break;
                  //   case 3:
                  //     window.leftModuleFour.addLayer(marker) //把点添加到层组中
                  //     window.leftModuleFour.setMap(map) // 层组渲染到地图中
                  //     window.leftModuleFour.hide() // 隐藏当前的层组
                  //     break;
                  // }
            break;
          case "2": case "3": case "4": case "5":
              //marker 点击时打开
              this.markers.push(marker)
              marker.on('click', (event) => {
                map.setZoomAndCenter(12, positions[i].latlng); //同时设置地图层级与中心点
                this.openInfo(positions[i])
              })
              // window.deviceTollGate.addLayer(marker) //把点添加到层组中
              // window.deviceTollGate.setMap(map) // 层组渲染到地图中
              // window.deviceTollGate.hide() // 隐藏当前的层组
            break;
        }
      }
      map.add(this.markers)
    }
  }
  //在指定位置打开信息窗体
  openInfo = (marker) => {
    debugger
    var info = [];
    info.push(`<div class='content_box' style="position:absolute;z-index:999999999;left:50%;top:50%">`);
    info.push(`<div class='content_box_title'><h4>故障点位信息</h4>`);
    info.push(`<p class='input-item'>路口名称：<span>1</span></p>`);
    info.push(`<p class='input-item'>主箱状态：<span>2</span></p>`);
    info.push(`<p class='input-item'>供电状态：<span>3</span></p>`);
    info.push(`<p class='input-item'>门禁状态：<span>4</span></p>`);
    info.push(`<p class='input-item'>通讯状态：<span>5</span></p>`);
    info.push(`<p class='input-item'><span>设备管理</span></p></div></div>`);
    const infoWindow = new AMap.InfoWindow({
      content: info.join("")  //使用默认信息窗体框样式，显示信息内容
    });

    infoWindow.open(this.map, ["119.960645", "32.357108"]);
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
