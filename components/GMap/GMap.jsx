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
    this.placeSearch = null;
  }
  componentDidMount = () => {
    this.loadingMap()
  }
  loadingMap = () => {
    const map = new AMap.Map('container', {
        resizeEnable: true, //是否监控地图容器尺寸变化
        center: [119.9072280000,32.4101830000], //初始化地图中心点
        mapStyle: "amap://styles/c3fa565f6171961e94b37c4cc2815ef8",
        zoom:13
      });
      //输入提示
    const autoOptions = {
      city:"泰州",
      input: "tipinput"
    };
    const auto = new AMap.Autocomplete(autoOptions);
    this.placeSearch = new AMap.PlaceSearch({
        map: map
    });  //构造地点查询类
    AMap.event.addListener(auto, "select", this.searchKeyWords);//注册监听，当选中某条记录时会触发
  }
  searchKeyWords =  e =>{
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
