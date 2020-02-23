import React from 'react'
import SystemMenu from '../../../components/SystemMenu/SystemMenu'
class User extends React.Component {
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
          用户管理
        </div>
    )
  }
}

export default User
