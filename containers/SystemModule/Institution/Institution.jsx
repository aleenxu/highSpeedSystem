import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
class Institution extends React.Component {
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
          组织机构管理
        </div>
    )
  }
}

export default Institution
