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
    this.map = null
    this.markers = []
  }
  componentDidMount = () => {
    this.renderGDMap()
  }
  //高德地图
  renderGDMap = () => {
    const map = new AMap.Map('container', {
      resizeEnable: true,
      center: [119.9101460000, 32.4055810000],
      zoom: 11,
      mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
      showIndoorMap: false
    });
    //实时路况图层
    var trafficLayer = new AMap.TileLayer.Traffic({
      zIndex: 10
    });
    map.add(trafficLayer);//添加图层到地图
    this.map = map
    this.toggleAmapMarkers(pointArr)
  }
  //高德批量添加点
  toggleAmapMarkers = (positions = []) => {
    const map = this.map
    if (map) {
      let marker, greens = 0, reds = 0, imgIcon;
      for (let i = 0; i < positions.length; i++) {
        imgIcon = tollStationIcon
        marker = new AMap.Marker({
          position: new AMap.LngLat(positions[i][0], positions[i][1]),
          offset: new AMap.Pixel(-10, -10),
          icon: imgIcon,
        });

        this.markers.push(marker)
        marker.on('click', (event) => {
          this.openInfo(positions[i])
        })
      }

      map.add(this.markers)
    }
  }
  //在指定位置打开信息窗体
  openInfo = (marker) => {
    var info = [];
    info.push(`<div class='content_box'>`);
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

    infoWindow.open(this.map, marker);
  }
  render() {
    return (
      <div id="container" style={this.styles}></div>
    )
  }
}

export default GMap
