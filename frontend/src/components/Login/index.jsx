import "./style.css"
import { useState, useEffect } from "react"
import axios from "axios"
import { defaults, api } from "../config"

const Login = ({ onLogin }) => {
	const [wantLogin, setWantLogin] = useState(true)

	const makeLogin = async () => {
		let uname, pass
		uname = document.getElementById("u_u")
		pass = document.getElementById("u_p")
		try {
			let r = await axios({
				method: "post",
				url: api.base + api.user + `/login`,
				data: {
					username: uname.value,
					password: pass.value,
				},
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			if (r.data.result.id === 0) alert("No User found!")
			else onLogin(r.data.result)
		} catch (err) {
			console.log(err)
		}
	}
	const makeSignup = async () => {
		let uname, pass
		uname = document.getElementById("u_u")
		pass = document.getElementById("u_p")
		try {
			let r = await axios({
				method: "post",
				url: api.base + api.user + `/signup`,
				data: {
					username: uname.value,
					password: pass.value,
				},
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			if (r.data.result.id === 0) alert("Can't Signup")
			else onLogin(r.data.result)
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<>
			<div className="login-container">
				<div className="header">Login</div>
				<div className="login-form">
					<table>
						<tr>
							<td>Username</td>
							<td>
								<input id="u_u" type="text" />
							</td>
						</tr>
						<tr>
							<td>Password</td>
							<td>
								<input id="u_p" type="password" />
							</td>
						</tr>
						<tr>
							<td></td>
							<td>
								<button onClick={() => makeLogin()}>
									Login
								</button>
								<button onClick={() => makeSignup()}>
									Signup
								</button>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</>
	)
}

export default Login
