import React from 'react'
import { Select, Icon } from 'antd'
import styles from './TypeWinPopup.scss'
const { Option } = Select
class TypeWinPop extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      TypeWinPopup: this.props.TypeWinPopup,
      MeasuresList: this.props.MeasuresList,
      TypeWinContent: {},
    }
  }
  componentDidMount = () => {
    console.log(this.state.TypeWinPopup);
    const { TypeWinPopup } = this.state
    TypeWinPopup.innerDevices.forEach((item) => {
      console.log(item.content, '888888');
      this.state.TypeWinContent[item.appendId] = item.content
    })
    this.setState({
      TypeWinPopup,
    })
  }
  componentWillReceiveProps = (nextProps) => {
    if (this.props.TypeWinPopup !== nextProps.TypeWinPopup) {
      alert(0)
      this.setState({ TypeWinPopup: nextProps.TypeWinPopup })
    }
  }
  componentWillUnmount = () => {

  }

  handleTypeWinChange = (e, name, Id) => {
    const value = typeof (e) === 'object' ? e.target.value : e
    const { TypeWinPopup, TypeWinContent } = this.state
    TypeWinPopup[name] = value
    TypeWinPopup.innerDevices.forEach((item) => {
      if (item.appendId === Id) {
        item[name] = value
        if (name === 'content') {
          TypeWinContent[Id] = value
        }
      }
    })
    this.setState({
      TypeWinPopup,
      TypeWinContent,
    })
  }
  render() {
    const { TypeWinPopup, TypeWinContent, MeasuresList } = this.state
    console.log(TypeWinPopup);
    const { EventTagPopup, deviceString, deviceCodeList, handleTypeWinPopup, handleClose } = this.props
    return (
      <div className={styles.TypeMaskBox}>
        <div className={styles.TypePopup}>
          <div className={styles.Title}>{TypeWinPopup.deviceName}-{TypeWinPopup.directionName}-{TypeWinPopup.deviceTypeName}<Icon className={styles.Close} type="close" onClick={() => { this.props.handleClose() }} /></div>
          <div className={styles.Main}>
            {
              TypeWinPopup.innerDevices.map((it) => {
                console.log(TypeWinPopup.deviceControlType)
                return (
                  <div className={styles.Centent} key={it.appendId}>
                    <div className={styles.Subhead}>{it.deviceName} :</div>
                    <div className={styles.ItemBox}>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} defaultValue={it.deviceControlType || undefined} placeholder="管控类型" onChange={(e) => { this.handleTypeWinChange(e, 'deviceControlType', it.appendId) }}>
                          <Option value="">请选择</Option>
                          {
                            MeasuresList[it.deviceType] && MeasuresList[it.deviceType].map((itemss) => {
                              if (EventTagPopup && deviceString.length) {
                                if (deviceString.includes(itemss.controlType)) {
                                  return <Option value={itemss.controlType} key={itemss.controlType} onClick={() => { this.handleTypeWinChange(itemss.showContent, 'content', it.appendId) }}>{itemss.controlTypeName}</Option>
                                }
                              } else {
                                return <Option value={itemss.controlType} key={itemss.controlType} onClick={() => { this.handleTypeWinChange(itemss.showContent, 'content', it.appendId) }}>{itemss.controlTypeName}</Option>
                              }
                            })
                          }
                        </Select>
                      </div>
                      <div className={styles.ItemInput}>
                        <Select style={{ width: '100%' }} value={(TypeWinContent[it.appendId])} placeholder="显示内容" onChange={(e) => { this.handleTypeWinChange(e, 'content', it.appendId) }}>
                          <Option value="">请选择</Option>
                          {
                            deviceCodeList && deviceCodeList[it.deviceType === 4 ? 0 : 2].map((itemss) => {
                              return <Option key={itemss.dictCode}>{itemss.codeName}</Option>
                            })
                          }
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className={styles.Footer}>
            <span onClick={handleTypeWinPopup}>确&nbsp;&nbsp;认</span>
            <span onClick={() => { handleClose() }}>返&nbsp;&nbsp;回</span>
          </div>
        </div>
      </div>
    )
  }
}

export default TypeWinPop
