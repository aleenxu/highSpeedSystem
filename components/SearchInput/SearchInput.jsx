import React from 'react'
import { Select } from 'antd'
import styles from './SearchInput.scss'
import $ from 'jquery'

const { Option } = Select
let timeout
let currentValue
class SearchInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      value: undefined,
    }
    this.mapData = {
      keywords: '',
      subdistrict: 2,
      key: '',
    }
  }
  componentDidMount = () => {
    this.handleSearch()
  }
  componentWillUnmount = () => {

  }

  handleFake = (value) => {
    /* $.getJSON('//restapi.amap.com/v3/direction/driving?key=931cce038c6e2e206f941225fbb9c0fd&origin=116.481028,39.989643&destination=116.434446,39.90816&originid=&destinationid=&extensions=base&strategy=0&waypoints=116.357483,39.907234&avoidpolygons=&avoidroad=', function (data) {
      console.log(data);
    }); */
    window.AMap.plugin('AMap.DistrictSearch', () => { // 回调函数
      const opts = {
        subdistrict: 2, // 返回下一级行政区
        level: 'city', // 查询的范围
        showbiz: false, // 查询行政级别为 市
      }
      // 实例化DistrictSearch
      const districtSearch = new window.AMap.DistrictSearch(opts)
      // TODO: 使用districtSearch对象调用行政区查询的功能
      districtSearch.search(value, (status, result) => {
        // TODO : 按照自己需求处理查询结果
        console.log(value || '成都', result)
        this.cityData = []
        if (result.info === 'OK') {
          this.handlecityData(result.districtList)
        }
        // console.log( this.cityData) 
        this.setState({ data: this.cityData })
      })
    })
  }
  handlecityData = (data) => {
    console.log(data);
    data.forEach((item) => {
      if (item.level === 'city' || item.level === 'province' || item.level === 'district') {
        this.cityData.push(item)
        this.handlecityData(item.districtList)
      } else {
        if (item.districtList) {
          this.handlecityData(item.districtList)
        }
      }
    })
  }
  handleonFocus = () => {
    const { value } = this.state
    if (value == null || value == '') {
      this.handleSearch()
    }
    this.setState({ value })
  }
  handleSearch = (value = '成都') => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    currentValue = value
    this.mapData.keywords = value
    timeout = setTimeout(this.handleFake.bind(null, value), 300)
  }
  handleChange = (value) => {
    console.log(value);
    this.setState({ value })
  }
  OpenInforItem = (item) => {
    console.log(item, { adcode: item.adcode, citycode: item.citycode, lnglat: [item.center.getLng(), item.center.getLat()] })
    this.props.OpenInforItem({ adcode: item.adcode, citycode: item.citycode, lnglat: [item.center.getLng(), item.center.getLat()], name: item.name })
  }

  render() {
    return (
      <Select
        showSearch
        className={styles.SelectOne}
        value={this.state.value}
        defaultActiveFirstOption={false}
        showArrow={false}
        style={{ width: '100%', heght: '100%' }}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent="无当前路口"
        onFocus={this.handleonFocus}
      >
        {this.state.data.map((item) => {
          return <Option key={item.adcode} onClick={(e) => { this.OpenInforItem(item) }}>{item.name}</Option>
        })}
      </Select>
    )
  }
}

export default SearchInput
