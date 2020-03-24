import React from 'react'
import tollStationIcon from '../../imgs/tollStation_s.png'
import fBoardIcon from '../../imgs/fBoard_s.png'
import speedLimitIcon from '../../imgs/speedLimit_s.png'
import turnBoardIcon from '../../imgs/turnBoard_s.png'
// import { ReactComponent as turnBoardIcon } from '../../imgs/turnBoard_s.svg'
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
      updatePoint: this.props.updatePoint, // 更新的点
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
  }
  componentDidMount = () => {
    this.loadPoint()
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.linePoint !== nextProps.linePoint) {
      this.setState({ linePoint: nextProps.linePoint })
    }
    if (this.props.updatePoint !== nextProps.updatePoint) {
      this.setState({ updatePoint: nextProps.updatePoint }, () => {
        debugger
        this.openInfoWin(window.map, this.state.updatePoint)
      })
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
    window.deviceTurnBoard = new AMap.LayerGroup({ //可变情报版
      'autoRefresh': true,     //是否自动刷新，默认为false
      'interval': 180,         //刷新间隔，默认180s
    });
    window.lineLayers = new AMap.LayerGroup({ //绘制线的层
      'autoRefresh': true,     
      'interval': 180,        
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
    AMapUI.loadUI(['overlay/SimpleMarker', 'overlay/SimpleInfoWindow'], function (SimpleMarker, SimpleInfoWindow) {
      if (_this.state.dataAll) {
        // 左侧功能数据图标
        _this.createPoint(pointArr, tollStationIcon, SimpleMarker, SimpleInfoWindow, map, "1")
      }
      // 图标收费站
      _this.createPoint(_this.state.tollGateJson, tollStationIcon, SimpleMarker, SimpleInfoWindow, map, "2")
      // 图标F屏情报版
      _this.createPoint(_this.state.infoFBoardJson, fBoardIcon, SimpleMarker, SimpleInfoWindow, map, "3")
      // // 图标限速牌专用
      _this.createPoint(_this.state.speedLimitJson, speedLimitIcon, SimpleMarker, SimpleInfoWindow, map, "4")
      // // 图标可变情报版
      _this.createPoint(_this.state.infoBoardJson, turnBoardIcon, SimpleMarker, SimpleInfoWindow, map, "5")

    })
    // 线的绘制
    window.drawLine = this.drawLine
    // AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {

    //   if (!PathSimplifier.supportCanvas) {
    //     alert('当前环境不支持 Canvas！');
    //     return;
    //   }

    //   //just some colors
    //   var colors = ["red", "gray"];
    //   var pathSimplifierIns = new PathSimplifier({
    //     zIndex: 100,
    //     autoSetFitView: false,
    //     map: map, //所属的地图实例
    //     getPath: function (pathData, pathIndex) {
    //       return pathData.path;
    //     },
    //     // getHoverTitle: function (pathData, pathIndex, pointIndex) {
    //     //   if (pointIndex >= 0) {
    //     //     //point 
    //     //     // return  pointIndex + '/' + pathData.path.length;
    //     //   }

    //     //   returnpathData.path.length;
    //     // },
    //     renderOptions: {
    //       pathLineStyle: {
    //         dirArrowStyle: false
    //       },
    //       getPathStyle: function (pathItem, zoom) {
    //         var color = window.lineFlag ? colors[0] : colors[1],
    //           lineWidth = window.lineFlag ? 10 : 15;
    //         return {
    //           pathLineStyle: {
    //             strokeStyle: color,
    //             lineWidth: lineWidth
    //           },
    //           pathLineSelectedStyle: {
    //             lineWidth: lineWidth + 2
    //           },
    //           pathNavigatorStyle: {
    //             fillStyle: color
    //           }
    //         }
    //       }
    //     }
    //   });

    //   window.pathSimplifierIns = pathSimplifierIns;
    //   /*  // var d = lineData;
    //    var d = [
    //      {"path":[["119.851293", "32.233071"],["119.857044", "32.236665"]]}
    //    ]
    //    pathSimplifierIns.setData(d); */

    // });
    // 弹层的自定义
    //覆盖默认的dom结构
    AMapUI.defineTpl("ui/overlay/SimpleInfoWindow/tpl/container.html", [], function () {
      return document.getElementById('my-infowin-tpl').innerHTML;
    });
  }
  drawLine = (path, type) => {
    window.lineLayers.hide()
    window.lineLayers.bx = []
    window.lineLayers.show();
    const polyline = new AMap.Polyline({
      path: path,
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
    window.lineLayers.addLayer(polyline)
    window.lineLayers.setMap(map)
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
  createPoint = (pointArr, pointIcon, SimpleMarker, SimpleInfoWindow, map, flag) => {
    const _this = this;
    switch (flag) {
      case "1":
        _this.state.dataAll.map((leftItem, leftIndex) => {
          if (leftItem.eventData.length > 0) {
            leftItem.eventData.map((item, index) => {
              const marker = new SimpleMarker({
                //自定义图标地址
                iconStyle: _this.returnMapIcon(leftIndex),
                //设置基点偏移
                offset: new AMap.Pixel(-88, -19),
                showPositionPoint: false,
                position: item.latlng[index],
                zIndex: 10
              });
              let roadLatlngData = {
                "path": item.latlng
              }
              let lineDatas = []
              lineDatas.push(roadLatlngData)
              marker.on("click", () => {
                // console.log("绑定点击事件",lineDatas, item.latlng[index])
                map.setZoomAndCenter(12, item.latlng[index]); //同时设置地图层级与中心点
                _this.handledetai(item)
                window.pathSimplifierIns.setData(lineDatas)
              })
              switch (leftIndex) {
                case 0:
                  window.leftModuleOne.addLayer(marker) //把点添加到层组中
                  window.leftModuleOne.setMap(map) // 层组渲染到地图中
                  window.leftModuleOne.hide() // 隐藏当前的层组
                  break;
                case 1:
                  window.leftModuleTwo.addLayer(marker) //把点添加到层组中
                  window.leftModuleTwo.setMap(map) // 层组渲染到地图中
                  window.leftModuleTwo.hide() // 隐藏当前的层组
                  break;
                case 2:
                  window.leftModuleThree.addLayer(marker) //把点添加到层组中
                  window.leftModuleThree.setMap(map) // 层组渲染到地图中
                  window.leftModuleThree.hide() // 隐藏当前的层组
                  break;
                case 3:
                  window.leftModuleFour.addLayer(marker) //把点添加到层组中
                  window.leftModuleFour.setMap(map) // 层组渲染到地图中
                  window.leftModuleFour.hide() // 隐藏当前的层组
                  break;
              }
            })
          }
        })
        break;
      case "2":
        pointArr.length > 0 && pointArr.map((item) => {
          const marker2 = new SimpleMarker({
            //自定义图标地址
            iconStyle: tollStationIcon,
            //设置基点偏移
            offset: new AMap.Pixel(-10, -10),
            map: map,
            showPositionPoint: false,
            position: item.latlng,
            zIndex: 10
          });
          //marker 点击时打开
          marker2.on('click', function () {
            map.setZoomAndCenter(12, item.latlng); //同时设置地图层级与中心点
            _this.openInfoWin(map, item, SimpleInfoWindow, item)
          });
          window.deviceTollGate.addLayer(marker2) //把点添加到层组中
          window.deviceTollGate.setMap(map) // 层组渲染到地图中
          // window.deviceTollGate.hide() // 隐藏当前的层组
        })
        break;
      case "3":
        pointArr.length > 0 && pointArr.map((item) => {
          const marker3 = new SimpleMarker({
            //自定义图标地址
            iconStyle: fBoardIcon,
            //设置基点偏移
            offset: new AMap.Pixel(-10, -10),
            map: map,
            showPositionPoint: false,
            position: item.latlng,
            zIndex: 10
          });
          //marker 点击时打开
          marker3.on('click', function () {
            map.setZoomAndCenter(12, item.latlng); //同时设置地图层级与中心点
            _this.openInfoWin(map, item, SimpleInfoWindow, item)
          });
          window.deviceFInfoBoard.addLayer(marker3) //把点添加到层组中
          window.deviceFInfoBoard.setMap(map) // 层组渲染到地图中
          // window.deviceFInfoBoard.hide() // 隐藏当前的层组
        })
        break;
      case "4":
        pointArr.length > 0 && pointArr.map((item) => {
          const marker4 = new SimpleMarker({
            //自定义图标地址
            iconStyle: speedLimitIcon,
            //设置基点偏移
            offset: new AMap.Pixel(-10, -10),
            map: map,
            showPositionPoint: false,
            position: item.latlng,
            zIndex: 10
          });
          //marker 点击时打开
          marker4.on('click', function () {
            map.setZoomAndCenter(12, item.latlng); //同时设置地图层级与中心点
            _this.openInfoWin(map, item, SimpleInfoWindow, item)
          });
          window.deviceInfoBoard.addLayer(marker4) //把点添加到层组中
          window.deviceInfoBoard.setMap(map) // 层组渲染到地图中
          // window.deviceInfoBoard.hide() // 隐藏当前的层组
        })
        break;
      case "5":
        pointArr.length > 0 && pointArr.map((item) => {
          const marker5 = new SimpleMarker({
            //自定义图标地址
            iconStyle: turnBoardIcon,
            //设置基点偏移
            offset: new AMap.Pixel(-10, -10),
            map: map,
            showPositionPoint: false,
            position: item.latlng,
            zIndex: 10,
          });
          //marker 点击时打开
          marker5.on('click', function () {
            map.setZoomAndCenter(12, item.latlng); //同时设置地图层级与中心点
            _this.openInfoWin(map, item, SimpleInfoWindow, item)
          });
          window.deviceTurnBoard.addLayer(marker5) //把点添加到层组中
          window.deviceTurnBoard.setMap(map) // 层组渲染到地图中
          // window.deviceTurnBoard.hide() // 隐藏当前的层组
          //deviceTurnBoard
        })
        break;
    }
    /* if (flag === "1"){
      
    } else {
      
    } */
  }
/*   openInfoWin = (map, marker, SimpleInfoWindow, showData) => {
    var infoWindow = new SimpleInfoWindow({
      myCustomHeader: showData.deviceName + '信息：',
      myCustomFooter: '我的footer',
      infoTitle: '<div>这里是标题</div>',
      infoBody: '<p class="my-desc"><strong>桩号：' + showData.pileNum + '</strong><strong>走向：' + showData.directionName + '</strong><strong>所属高速：' + showData.roadName + '</strong></p>',
      //基点指向marker的头部位置
      offset: new AMap.Pixel(0, -10)
    });
    infoWindow.open(map, marker.getPosition());
  } */
    //在指定位置打开信息窗体
    openInfoWin = (map, dataItem) => {
      debugger
      var info = [];
      info.push(`<div class='content_box'>`);
      info.push(`<div class='content_box_title'><h4>设备信息</h4>`);
      info.push(`<p class='input-item'>设备名称：<span>`+dataItem.deviceName+`</span></p>`);
      info.push(`<p class='input-item'>桩号:<span>`+dataItem.pileNum+`</span></p>`);
      info.push(`<p class='input-item'>走向：<span>`+dataItem.directionName+`</span></p>`);
      info.push(`<p class='input-item'>所属高速：<span>`+dataItem.roadName+`</span></p></div></div>`);
      const infoWindow = new AMap.InfoWindow({
        content: info.join("")  //使用默认信息窗体框样式，显示信息内容
      });
      infoWindow.open(map, dataItem.latlng);
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
