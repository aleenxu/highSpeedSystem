import React from 'react'
import { Icon, Checkbox, message } from 'antd'

import styles from './Login.scss'
import getResponseDatas from '../../plugs/HttpData/getResponseData'

class Login extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
		}

	}
	componentDidMount = () => {

	}




	render() {
		return (
			<div className={styles.loginWrapper}>
				<div className={styles.cententBox}></div>
			</div>
		)
	}
}

export default Login
