import React from 'react'
import tollStationIcon from '../../imgs/tollStation_s.png'
import fBoardIcon from '../../imgs/fBoard_s.png'
import speedLimitIcon from '../../imgs/speedLimit_s.png'
import turnBoardIcon from '../../imgs/turnBoard_s.png'
import otherIcon from '../../imgs/boat.png'
const pointArr = [
  [119.9296300000, 32.4319550000],
  [119.9471390000, 32.4151070000]
]
const pointArr1 = [
  [119.9101460000, 32.4055810000]
]
const pointArr2 = [
  [119.9234500000, 32.4029910000],
  [119.9493710000, 32.3908160000]
]
const pointArr3 = [
  [119.9041380000, 32.4097840000]
]
const lineData = [
  { "name": "起点 -> 终点", "path": [[119.9334060000, 32.4345900000], [119.9339210000, 32.4328910000], [119.9335780000, 32.4313020000], [119.9347800000, 32.4301430000], [119.9346080000, 32.4288390000]] },
  { "name": "起点 -> 终点", "path": [[119.9346080000, 32.4288390000], [119.9342650000, 32.4271000000], [119.9342650000, 32.4257960000], [119.9342650000, 32.4242020000], [119.9337500000, 32.4226080000], [119.9327200000, 32.4200000000]] },
  { "name": "起点 -> 终点", "path": [[119.9327200000, 32.4200000000], [119.9330630000, 32.4171020000], [119.9344360000, 32.4147830000], [119.9349510000, 32.4131890000], [119.9361530000, 32.4113050000], [119.9358100000, 32.4085520000]] }
];
class GMap extends React.Component {
  constructor(props) {
    super(props)
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
  }
  componentDidMount = () => {
    this.loadingMap()
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.dataAll !== nextProps.dataAll) {
      this.setState({ dataAll: nextProps.dataAll })
    }
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
        console.log(_this.state.dataAll,"所有的数据...")
        // 左侧功能数据图标
        _this.createPoint(pointArr, tollStationIcon, SimpleMarker, SimpleInfoWindow, map, true)
      }
      // 图标一
      _this.createPoint(pointArr, tollStationIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标二
      _this.createPoint(pointArr1, fBoardIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标三
      _this.createPoint(pointArr2, speedLimitIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标四
      _this.createPoint(pointArr3, turnBoardIcon, SimpleMarker, SimpleInfoWindow, map)

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
            return pathData.name + '，点:' + pointIndex + '/' + pathData.path.length;
          }

          return pathData.name + '，坐标点数量' + pathData.path.length;
        },
        renderOptions: {
          pathLineStyle: {
            dirArrowStyle: false
          },
          getPathStyle: function (pathItem, zoom) {
            var color = colors[pathItem.pathIndex],
              lineWidth = 3;
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
      var d = lineData;
      pathSimplifierIns.setData(d);

    });
    // 弹层的自定义
    //覆盖默认的dom结构
    AMapUI.defineTpl("ui/overlay/SimpleInfoWindow/tpl/container.html", [], function () {
      return document.getElementById('my-infowin-tpl').innerHTML;
    });
  }
  // 创建多个点
  /* 
    pointArr : 点的数组 [[],[],[],[]]
    pointIcon: 图标路径
  */
  createPoint = (pointArr, pointIcon, SimpleMarker, SimpleInfoWindow, map, flag) => {
    const _this = this;
    if (flag){
      _this.state.dataAll.map((leftItem, leftIndex)=>{
        if (leftItem.eventData.length > 0){
          leftItem.eventData.map((item, index) => {
            const marker = new SimpleMarker({
              //自定义图标地址
              iconStyle: otherIcon,
              //设置基点偏移
              offset: new AMap.Pixel(-10, -10),
              showPositionPoint: false,
              position: [item.latlng.split(",")[1],item.latlng.split(",")[0]],
              zIndex: 10
            });
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
            console.log(marker,"当前点信息")
          }) 
        }
      })
    } else {
      pointArr.map((item) => {
        const marker = new SimpleMarker({
          //自定义图标地址
          iconStyle: pointIcon,
          //设置基点偏移
          offset: new AMap.Pixel(-10, -10),
          map: map,
          showPositionPoint: false,
          position: item,
          zIndex: 10
        });
        //marker 点击时打开
        marker.on('click', function () {
          _this.openInfoWin(map, marker, SimpleInfoWindow)
        });
      })
    }
  }
  openInfoWin = (map, marker, SimpleInfoWindow) => {
    var infoWindow = new SimpleInfoWindow({
      myCustomHeader: '我的header',
      myCustomFooter: '我的footer',
      infoTitle: '<strong>这里是标题</strong>',
      infoBody: '<p class="my-desc"><strong>这里是内容。</strong></p>',

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
