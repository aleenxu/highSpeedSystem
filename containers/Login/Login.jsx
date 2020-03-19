import React from 'react'
import { Icon, Checkbox, message, Input } from 'antd'

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
				<div className={styles.cententBox}>
					<div className={styles.earthBox} />
					<div className={styles.loginBox}>
						<h1 className={styles.title}>智慧高速管控系统</h1>
						<div className={styles.login}>
							<div className={styles.loginTitle}>用户登陆</div>
							<div className={styles.loginInput}><Input placeholder="请输入用户名" prefix={<Icon className={styles.IconLogin} type="user" />} /></div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Login
