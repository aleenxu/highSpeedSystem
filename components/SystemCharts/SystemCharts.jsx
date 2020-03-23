import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

class SystemCharts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chartsItems: this.props.chartsItems,
    }
  }
  componentDidMount = () => {

  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.chartsItems !== nextProps.chartsItems) {
      this.setState({ chartsItems: nextProps.chartsItems })
    }
  }
  getOptions = () => {
    const { chartsItems } = this.state
    const option = {
      toolbox: {
        show: true,
        itemGap: 20,
        feature: {
          magicType: {
            type: ['line', 'bar'],
            icon: {
              line: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAOCAYAAADNGCeJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxREI4OTdCRURGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxREI4OTdCRkRGODExMUU5QjJBRUQ0NkJFNTFEQ0FCNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFEQjg5N0JDREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFEQjg5N0JEREY4MTExRTlCMkFFRDQ2QkU1MURDQUI3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+tLtOrQAAAPxJREFUeNqs0c9KAkEcwPHZXBYCQToL3X0AIQ/qniSJWLAXKME30afQm+BNVy91VrSnCAqCDv05dCnw0PYd+k2NsOOlWfio465ffzurVJYphx4eUJL1CaI91yvXiQ6eMccGbXzixhE8MrEENetEIqEqAlxji3OkmFnBY0yxtmP6dia4kpCJN/EiE61kAh1cYIA39FG0b/NQYl8YydqEYhQwxhKX+MATKnl7dir/ciHRR7xLyFyjg7e4w5lMmO7sIS8tvKJh/bCObs5G6ycbyudI9u8vKF/Eex+5mwkO9Tr4Kf7riFDGvY/Y7xH6SxELfMbk3cuABx4HU98CDAAxWWF32h/qdQAAAABJRU5ErkJggg==',
              bar: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAVklEQVQ4jWP8//8/AymAJWIHAwMDQwOacAMTSabgAVQziAWnBMQLlBsEBQ0E+HAwCMOI1LDAaRCUbkATR+cTBIMvjIaxQYzM4dupYhBVM20DNQyimosA/1sK9yldXCIAAAAASUVORK5CYII='
            },
            title: {
              line: '切换折线图',
              bar: '切换柱状图',
            },
          },
        },
        right: 120,
        top: 5,
        width: 81,
        height: 25,
      },
      xAxis: {
        boundaryGap: false,
        data: chartsItems && chartsItems.dataX,
        axisLine: {
          lineStyle: {
            color: '#67c6e6',
          },
        },
        axisLabel: {
          color: '#02fbff',
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#02fbff',
        },
        axisLine: {
          lineStyle: {
            color: '#17396b',
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#17396b'],
          },
        },
      },
      dataZoom: [
        {
          height: 10,
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 50,
          end: 100,
          bottom: 5,
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 50,
          end: 100,
        },
      ],
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'line' // 默认为直线，可选为：'line' | 'shadow'
        },

      },
      grid: {
        top: 45,
        bottom: 45,
        right: 30,
      },
      series: {
        type: 'line',
        data: chartsItems && chartsItems.dataY,
        smooth: false,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          normal: {
            color: function (params) {
              var colorList = [
                '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
              ]
              return colorList[params.dataIndex]
            },
          },
        },
      },
    }
    return option
  }
  render() {
    return (
      <ReactEcharts option={this.getOptions()} style={{ height: this.props.height }} />
    )
  }
}

export default SystemCharts
