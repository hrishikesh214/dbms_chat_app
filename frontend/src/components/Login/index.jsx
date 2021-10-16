import "./style.css"
import { useState, useEffect } from "react"
import axios from "axios"
import { defaults, api } from "../config"
import * as validater from "validator"

const Login = ({ onLogin }) => {
	const [wantLogin, setWantLogin] = useState(true)
	const [err, setErr] = useState(null)

	/**
	 * simply calls api for login and get user_id if exists
	 */
	const makeLogin = async () => {
		setErr(null)
		let uname, pass
		uname = document.getElementById("u_u")
		pass = document.getElementById("u_p")
		if (uname.value == "" || pass.value == "")
			return alert("Please enter Info")
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
			if (r.data.result.id === 0) setErr("Username and password mismatch")
			else onLogin(r.data.result)
		} catch (err) {
			console.log(err)
		}
	}

	/**
	 * simply calls api for signup and get user_id and then login the user
	 */
	const makeSignup = async () => {
		setErr(null)
		let uname, pass
		uname = document.getElementById("u_u")
		pass = document.getElementById("u_p")
		if (uname.value == "" || pass.value == "")
			return alert("Please enter Info")
		if (uname.value.length < 3)
			return setErr("Length of username should be atleast 3")

		if (pass.value.length < 6)
			return setErr("Length of password should be atleast 6")

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
				<div className="header">Welcome to Chat App</div>
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
							<td colSpan="2">
								<span className="err-msg">
									{err !== null && err}
								</span>
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
