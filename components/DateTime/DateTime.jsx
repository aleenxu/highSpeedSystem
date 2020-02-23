import React from 'react'
import styles from './DateTime.scss'
class DateTime extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        navtime: '',
        navmse: '',
        navtoday: '',
    }
  }
  componentDidMount = () => {
    this.timer = setInterval(this.getDate, 1000)
  }
  componentWillUnmount = () => {
    clearInterval(this.timer)
  }
 getDate = () => {
    const today = new Date()
    const x = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const year = today.getFullYear()
    const month = ('0' + (today.getMonth() + 1)).slice(-2)
    const day = ('0' + (today.getDate())).slice(-2)
    const hour = ('0' + (today.getHours())).slice(-2)
    const minutes = ('0' + (today.getMinutes())).slice(-2)
    const seconds = ('0' + (today.getSeconds())).slice(-2)
    const navtime = year + '年' + month + '月' + day + '日'
    const navmse = hour + ':' + minutes + ':' + seconds
    const navtoday = (x[today.getDay()])
    this.setState({
      navtime,
      navmse,
      navtoday,
    })
  }
  render() {
    return (
        <div className={styles.navWrapper_left}>
          <span>{this.state.navtime}</span>
          <span>{this.state.navmse}</span>
          <span>{this.state.navtoday}</span>
        </div>
    )
  }
}

export default DateTime
