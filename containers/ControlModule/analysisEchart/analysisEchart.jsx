
import React from 'react'

import styles from '../../EquipmentModule/EquipmentModule.scss'
import style from '../../StatisticsModule/Analysis/Analysis.scss'
import classNames from 'classnames'
import AnalysisCharts from '../../../components/SystemCharts/AnalysisCharts'
import getResponseDatas from '../../../plugs/HttpData/getResponseData'
import { Select, DatePicker, Button, Form } from 'antd'
import moment from 'moment'
const { Option } = Select
const { RangePicker } = DatePicker
/*        路况分析 */
class analysisEchart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listByPage: [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      startValue: null,
      endValue: null,
      endOpen: false,
    }
  }
  componentDidMount = () => {

  }
  disabledStartDate = startValue => {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onChange('startValue', value);
  };

  onEndChange = value => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };
  render() {
    const { startValue, endValue, endOpen, listByPage } = this.state
    return (
      <div>
        <div className={styles.EqMain} style={{ height: '100vh' }}>
          <div className={styles.EqCentent} style={{ width: 'calc(100% - 40px )', right: '20px' }}>
            <div className={styles.Operation}>
              <div className={style.analysis}>
                泰州大桥&nbsp;&nbsp;&nbsp;&nbsp;南向北&nbsp;&nbsp;&nbsp;&nbsp;长度6000米
              </div>
            </div>
            <div className={styles.ContetList} style={{ paddingLeft: '20px', height: 'calc(100% - 100px)' }}>
              <div className={styles.Operation}>
                <span className={style.Listlable}>日期范围&nbsp;&nbsp;:&nbsp;&nbsp;</span>
                <div className={styles.OperationItem}>
                  <Select
                    style={{ width: '100%' }}
                    defaultValue={1}
                  >
                    <Option value={1}>按天比较</Option>
                    <Option value={2}>完成状态</Option>
                  </Select>
                </div>
                <div className={styles.OperationItem}>
                  <DatePicker
                    disabledDate={this.disabledStartDate}
                    showTime
                    format="YYYY-MM-DD"
                    value={startValue}
                    placeholder="开始时间"
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                  />
                </div>
                <div className={style.Listlable}>
                  到&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <DatePicker
                    disabledDate={this.disabledEndDate}
                    showTime
                    format="YYYY-MM-DD"
                    value={endValue}
                    placeholder="结束时间"
                    onChange={this.onEndChange}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                  />
                </div>
                <div className={style.Listlable} style={{ marginLeft: '40px' }}>
                  对比曲线图&nbsp;&nbsp;:&nbsp;&nbsp;
                </div>
                <div className={styles.OperationItem}>
                  <DatePicker />
                </div>
                <div className={styles.OperationItem}>
                  <Select
                    style={{ width: '100%' }}
                    defaultValue={1}
                  >
                    <Option value={1}>小时</Option>
                    <Option value={2}>完成状态</Option>
                  </Select>
                </div>
                <div className={styles.OperationItem} style={{ minWidth: 'auto' }}>
                  <Button className={styles.Button}>下&nbsp;&nbsp;载</Button>
                </div>
              </div>
              <div className={style.listLift} style={{ height: 'calc(100% - 78px)' }} >
                <div className={style.listCont}>
                  <div className={style.listButtons}>
                    <Button className={style.listButton}>当前</Button>
                    <Button className={style.listButton}>对比</Button>
                    <Button className={style.listButton}>涨跌</Button>
                  </div>
                  <div className={classNames(style.listItems, style.firstlistItems)}>
                    <div className={style.listTd} >日期</div>
                    <div className={style.listTd} >速度</div>
                    <div className={style.listTd} >日期</div>
                    <div className={style.listTd} >速度</div>
                    <div className={style.listTd} >%</div>
                  </div>
                  <div className={style.listItemsBox}>
                    {
                      !!listByPage && listByPage.map((item, index) => {
                        return (
                          <div className={style.listItems}>
                            <div className={style.listTd} ><span className={style.roadName}>28日06点</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>28日06点</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>28日06点</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>28日06点</span></div>
                            <div className={style.listTd} ><span className={style.roadName}>{index + 10.6}</span></div>

                          </div>
                        )
                      })
                    }
                  </div>
                  {/* {
                  !!listByPage && listByPage.data.length === 0 ? <div className={styles.noData}>当前查询无数据</div> : null
                } */}
                </div>
              </div>
              <div className={style.listRight} style={{ height: 'calc(100% - 60px)' }}>
                <div className={style.ChartsBox}>
                  <AnalysisCharts height="100%" />
                </div>
              </div>
            </div>
            <div style={{ height: '40px', background: '#0a1a29' }}>

            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default analysisEchart
