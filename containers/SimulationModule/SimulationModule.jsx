import React from 'react'
import SystemMenu from '../../components/SystemMenu/SystemMenu'
class SimulationModule extends React.Component {
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
          仿真优化
        </div>
    )
  }
}

export default SimulationModule
