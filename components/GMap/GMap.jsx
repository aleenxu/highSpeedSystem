import React from 'react'
import tollStationIcon from '../../imgs/tollStation_s.png'
import fBoardIcon from '../../imgs/fBoard_s.png'
import speedLimitIcon from '../../imgs/speedLimit_s.png'
import turnBoardIcon from '../../imgs/turnBoard_s.png'
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
    }
    this.placeSearch = null;
  }
  componentDidMount = () => {
    this.loadingMap()
  }
  loadingMap = () => {
    const _this = this;
    const map = new AMap.Map('container', {
      resizeEnable: true, //是否监控地图容器尺寸变化
      center: [119.9072280000, 32.4101830000], //初始化地图中心点
      mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
      zoom: 13
    });
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
      // 图标一
      _this.createPoint(pointArr, tollStationIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标二
      _this.createPoint(pointArr1, fBoardIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标三
      _this.createPoint(pointArr2, speedLimitIcon, SimpleMarker, SimpleInfoWindow, map)
      // 图标四
      _this.createPoint(pointArr3, turnBoardIcon, SimpleMarker, SimpleInfoWindow, map)
    })
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
  createPoint = (pointArr, pointIcon, SimpleMarker, SimpleInfoWindow, map) => {
    const _this = this;
    pointArr.map((item) => {
      const marker = new SimpleMarker({
        //自定义图标地址
        iconStyle: pointIcon,
        //设置基点偏移
        offset: new AMap.Pixel(-10, -10),
        map: map,
        showPositionPoint: true,
        position: item,
        zIndex: 10
      });
      var infoWindow = new SimpleInfoWindow({
        myCustomHeader: '我的header',
        myCustomFooter: '我的footer',
        infoTitle: '<strong>这里是标题</strong>',
        infoBody: '<p class="my-desc"><strong>这里是内容。</strong></p>',

        //基点指向marker的头部位置
        offset: new AMap.Pixel(0, -40)
      });

      _this.openInfoWin(infoWindow,map,marker)

      //marker 点击时打开
      AMap.event.addListener(marker, 'click', function () {
        _this.openInfoWin(infoWindow,map,marker)
      });

      _this.openInfoWin(infoWindow,map,marker)
    })
  }
  openInfoWin = (infoWindow, map, marker) => {
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
