import React from 'react'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'

class AnalysisCharts extends React.Component {
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
      legend: {
        data: ['当前', '对比'],
        // color: ['rgba(0,115,219,.5)', 'rgba(108,81,28,.5)', 'rgba(103,102,102,.5)'],
        textStyle: {
          color: '#fff',
        },
      },
      xAxis: {
        name: '时间',
        type: 'category',
        boundaryGap: false,
        data: chartsItems.dataX,
        // data: ['28日00点', '28日10点', '28日20点', '28日30点', '28日40点', '28日50点', '29日00点', '29日10点', '29日20点', '29日30点', '29日40点', '29日50点'],
        nameTextStyle: {
          fontSize: 16,
          padding: 18,
        },
        axisLine: { //  改变x轴颜色
          lineStyle: {
            color: 'rgba(250,250,250,0.6)',
          },
        },
        axisLabel: { //  改变x轴字体颜色和大小
          textStyle: {
            color: 'rgba(250,250,250,0.6)',
            fontSize: 16,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#20293a'],
            width: 1,
            type: 'solid',
          },
        },
      },
      yAxis: {
        name: '速度',
        type: 'value',
        nameTextStyle: {
          fontSize: 16,
          padding: 18,
        },
        axisLine: { //  改变y轴颜色
          show: false,
          lineStyle: {
            color: 'rgba(250,250,250,0.6)',
          },
        },
        axisLabel: { //  改变y轴字体颜色和大小
          // formatter: '{value} m³ ', //  给y轴添加单位
          textStyle: {
            color: 'rgba(250,250,250,0.6)',
            fontSize: 16,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: ['#315070'],
            width: 1,
            type: 'solid',
          },
        },
      },
      dataZoom: [
        {
          height: 10,
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          bottom: 1,
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
          type: 'line', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      series: [{
        name: '当前',
        type: 'line',
        smooth: true,
        symbol: 'none',
        symbolSize: 7,
        color: '#0073db',
        markPoint: {
          symbol: 'circle',
        },
        markLine: {
          symbol: 'none',
          label: {
            normal: {
              color: '#fff',
              fontSize: 16,
              padding: 4,
              borderRadius: 4,
              show: true,
              position: 'start',
              distance: 4,
            },
          },
          lineStyle: {
            type: 'solid',
            color: '#0073db',
            width: 2,
          },
          data: [
            {
              yAxis: 600,
              lineStyle: {
                normal: {
                  width: 2,
                  color: '#0073db',
                },
              },
              label: {
                backgroundColor: 'rgba(0,115,219,.5)',
              },
            },
          ],
        },
        data: chartsItems.dataYOne,
        // data: [220, 332, 601, 234, 490, 730, 590, 220, 332, 601, 234, 490],
        lineStyle: {
          normal: {
            width: 2,
            color: '#0073db',
            shadowColor: '#0073db',
            shadowBlur: 10,
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0.5,
              color: 'rgba(0,115,219,.5)', // 0% 处的颜色
            }, {
              offset: 1,
              color: 'rgba(0,115,219,0)', // 100% 处的颜色
            }],
            global: false, // 缺省为 false
          },
        },
      },
      {
        name: '对比',
        type: 'line',
        smooth: true,
        symbol: 'none',
        symbolSize: 7,
        color: '#0efcff',
        markPoint: {
          symbol: 'circle',
        },
        markLine: {
          symbol: 'none',
          label: {
            normal: {
              color: '#fff',
              fontSize: 16,
              padding: 4,
              borderRadius: 4,
              show: true,
              position: 'start',
              distance: 4,
            },
          },
          lineStyle: {
            type: 'solid',
            color: '#0efcff',
            width: 2,
          },
          data: [
            {
              yAxis: 800,
              lineStyle: {
                normal: {
                  width: 2,
                  color: '#0efcff',
                },
              },
              label: {
                backgroundColor: 'rgba(14,252,255,.5)',
              },
            },
          ],
        },
        data: chartsItems.dataYTwo,
        // data: [820, 132, 201, 434, 990, 230, 390, 820, 132, 201, 434, 990],
        lineStyle: {
          normal: {
            width: 2,
            color: '#0efcff',
            shadowColor: '#0efcff',
            shadowBlur: 10,
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0.5,
              color: 'rgba(14,252,255,.5)', // 0% 处的颜色
            }, {
              offset: 1,
              color: 'rgba(14,252,255,0)', // 100% 处的颜色
            }],
            global: false, // 缺省为 false
          },
        },
      },
      ],
    }
    return option
  }
  render() {
    return (
      <ReactEcharts option={this.getOptions()} style={{ height: this.props.height }} />
    )
  }
}

export default AnalysisCharts
