import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
class Traffic extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  componentDidMount = () => {

 }
  render() {
    return (
        <div>
          <SystemMenu />
          交通事件统计分析
        </div>
    )
  }
}

export default Traffic
