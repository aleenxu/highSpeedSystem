import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
class Basics extends React.Component {
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
          管控基础数据管理
        </div>
    )
  }
}

export default Basics
