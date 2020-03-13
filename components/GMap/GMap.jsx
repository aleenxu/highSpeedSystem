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
const pointArr = []
const lineData = [
  { "name": "起点 -> 终点", "path": [[119.9334060000, 32.4345900000], [119.9339210000, 32.4328910000], [119.9335780000, 32.4313020000], [119.9347800000, 32.4301430000], [119.9346080000, 32.4288390000]] },
  { "name": "起点 -> 终点", "path": [[119.9346080000, 32.4288390000], [119.9342650000, 32.4271000000], [119.9342650000, 32.4257960000], [119.9342650000, 32.4242020000], [119.9337500000, 32.4226080000], [119.9327200000, 32.4200000000]] },
  { "name": "起点 -> 终点", "path": [[119.9327200000, 32.4200000000], [119.9330630000, 32.4171020000], [119.9344360000, 32.4147830000], [119.9349510000, 32.4131890000], [119.9361530000, 32.4113050000], [119.9358100000, 32.4085520000]] }
];
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
    if (this.props.dataAll !== nextProps.dataAll) {
      this.setState({ dataAll: nextProps.dataAll })
    }
    if (this.props.roadLatlng !== nextProps.roadLatlng) {
      this.setState({ roadLatlng: nextProps.roadLatlng })
    }
  }
  handledetai = (dataItem) => {
    const { handledetai } = this.props
    if (handledetai) {
      handledetai(dataItem)
    }
  }
  loadPoint = () => {
    getResponseDatas('get', this.mapPointUrl+'?searchKey=' + this.state.keyWords).then((res) => {
      const jsonData = res.data
      if (jsonData.code == 200 && jsonData.data.length > 0){
        jsonData.data.map((item) => {
          // 根据类型划分图标类型 1、可变情报板;2、可变限速板;3、收费站;4、F屏情报版;
          switch(item.deviceTypeId){
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
    window.map = new AMap.Map('container', {
      resizeEnable: true, //是否监控地图容器尺寸变化
      center: [120.0105285600, 32.3521228100], //初始化地图中心点
      mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
      zoom: 11
    });
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
    AMapUI.loadUI(['overlay/SimpleMarker', 'overlay/SimpleInfoWindow'], function (SimpleMarker, SimpleInfoWindow) {
      if (_this.state.dataAll){
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
    AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {

      if (!PathSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！');
        return;
      }

      //just some colors
      var colors = ["red", "yellow", "green"];
      var pathSimplifierIns = new PathSimplifier({
        zIndex: 100,
        autoSetFitView: false,
        map: map, //所属的地图实例
        getPath: function (pathData, pathIndex) {
          return pathData.path;
        },
        getHoverTitle: function (pathData, pathIndex, pointIndex) {
          if (pointIndex >= 0) {
            //point 
            // return  pointIndex + '/' + pathData.path.length;
          }

          returnpathData.path.length;
        },
        renderOptions: {
          pathLineStyle: {
            dirArrowStyle: false
          },
          getPathStyle: function (pathItem, zoom) {
            var color = colors[pathItem.pathIndex],
              lineWidth = 10;
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
     /*  // var d = lineData;
      var d = [
        {"path":[["119.851293", "32.233071"],["119.857044", "32.236665"]]}
      ]
      pathSimplifierIns.setData(d); */

    });
    // 弹层的自定义
    //覆盖默认的dom结构
    AMapUI.defineTpl("ui/overlay/SimpleInfoWindow/tpl/container.html", [], function () {
      return document.getElementById('my-infowin-tpl').innerHTML;
    });
  }
  returnMapIcon = (index)=>{
    switch(index){
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
    switch(flag) {
      case "1":
        _this.state.dataAll.map((leftItem, leftIndex)=>{
          if (leftItem.eventData.length > 0){
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
              switch(leftIndex){
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
            _this.openInfoWin(map, marker2, SimpleInfoWindow, item)
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
            _this.openInfoWin(map, marker3, SimpleInfoWindow, item)
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
            _this.openInfoWin(map, marker4, SimpleInfoWindow, item)
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
            zIndex: 10
          });
          //marker 点击时打开
          marker5.on('click', function () {
            map.setZoomAndCenter(12, item.latlng); //同时设置地图层级与中心点
            _this.openInfoWin(map, marker5, SimpleInfoWindow, item)
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
  openInfoWin = (map, marker, SimpleInfoWindow,showData) => {
    var infoWindow = new SimpleInfoWindow({
      myCustomHeader: showData.deviceName+'信息：',
      myCustomFooter: '我的footer',
      infoTitle: '<div>这里是标题</div>',
      infoBody: '<p class="my-desc"><strong>桩号：'+showData.pileNum+'</strong><strong>走向：'+showData.directionName+'</strong><strong>所属高速：'+showData.roadName+'</strong></p>',
      //基点指向marker的头部位置
      offset: new AMap.Pixel(0, -10)
    });
    infoWindow.open(map, marker.getPosition());
  }
  searchKeyWords = e => {
    this.placeSearch.setCity(e.poi.adcode);
    this.placeSearch.search(e.poi.name);  //关键字查询查询
  }
  render() {
    return (
      <div id="container" style={this.styles}></div>
    )
  }
}

export default GMap
