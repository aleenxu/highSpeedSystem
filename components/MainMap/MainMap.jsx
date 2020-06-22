import React from 'react'
import styles from './MainMap.scss'
import fnDown from '../../plugs/drags'

class MainMap extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      inmainMap: null,
    }
  }

  componentDidMount = () => {
    this.getInmainMap()
  }
  getInmainMap = () => {
    const boardLatlng = this.props.boardLatlng
    this.map = new AMap.Map('InmainMap', {
      resizeEnable: true,
      center: boardLatlng ? [boardLatlng.split(',')[0], boardLatlng.split(',')[1]] : [103.882158, 30.436527],
      zoom: 13,
      mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
      showIndoorMap: false,
    })
    const marker = new AMap.Marker({
      icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
      position: boardLatlng ? [boardLatlng.split(',')[0], boardLatlng.split(',')[1]] : [103.882158, 30.436527],
      offset: new AMap.Pixel(-13, -30)
    })
    marker.setMap(this.map)
    this.map.on('click', (e) => {
      document.getElementById('mapcenter').innerText = '您所点击的位置 : ' + e.lnglat.getLng() + ',' + e.lnglat.getLat()
      marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
      this.setState({ inmainMap: e.lnglat.getLng() + ',' + e.lnglat.getLat() })
    })
  }
  handleconfirm = () => {
    const { inmainMap } = this.state
    if (this.props.handlemainMap) {
      this.props.handlemainMap(inmainMap)
    }
  }
  handlecancel = () => {
    if (this.props.handleIntelatlng) {
      this.props.handleIntelatlng(false)
    }
  }
  render() {
    const { } = this.state
    return (
      <div className={styles.mainMapBox} ref={(e) => { e ? e.onmousedown = fnDown : null }}>
        <div id="mapcenter" className={styles.mapcenter}>{this.props.boardLatlng ? '您所点击的位置 :' + this.props.boardLatlng : '请点击屏幕'}</div>
        <div id="InmainMap" className={styles.mainMap} />
        <div className={styles.affirm}>
          <span onClick={this.handleconfirm}>确定</span><span onClick={() => { this.handlecancel() }}>关闭</span>
        </div>
      </div>
    )
  }
}

export default MainMap
