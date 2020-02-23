import React from 'react'

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
  }
  componentDidMount = () => {
    this.loadingMap()
  }
  loadingMap = () => {
    var map = new AMap.Map('container', {
        resizeEnable: true, //是否监控地图容器尺寸变化
        center: [121.4205600000,28.6561100000], //初始化地图中心点
        mapStyle: "amap://styles/darkblue",
        // mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
        zoom:13
      });
  }
  render() {
    return (
      <div id="container" style={this.styles}></div>
    )
  }
}

export default GMap
