import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
} from "react-router-dom"
import { defaults, links } from "./components/config"
import Home from "./components/Home"
import Login from "./components/Login"
import Loader from "./components/Loader"
import { useState, useEffect } from "react"
import "./universal.css"

const App = () => {
	const [user_id, setUser_id] = useState(null)
	const [user_name, setUser_name] = useState(null)
	const [toLoad, setToLoad] = useState(true)
	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("_c_user"))
		if (user) {
			setUser_id(parseInt(user.id))
			setUser_name(user.username)
			setToLoad(false)
		} else if (window.location.href !== links.home + "login")
			window.location.href = "/login"
		setToLoad(false)
	}, [])

	const make_login = ({ id, username }) => {
		console.log("login", id, username)
		setUser_id(id)
		setUser_name(username)
		localStorage.setItem("_c_user", JSON.stringify({ id, username }))
		window.location.href = "/"
	}

	return (
		<>
			{toLoad ? (
				<Loader />
			) : (
				<Router>
					<Switch>
						<Route exact path="/logout">
							<Logout />
						</Route>
						<Route exact path="/login">
							<Login onLogin={make_login} />
						</Route>
						<Route exact path="/">
							<Home user_id={user_id} />
						</Route>
						<Route path="/chat/:cid">
							<Home user_id={user_id} />
						</Route>
						<Route exact path="/chat">
							<Redirect to="/" />
						</Route>
					</Switch>
				</Router>
			)}
		</>
	)
}

const Logout = () => {
	localStorage.removeItem("_c_user")
	window.location.href = "/"
	return <Loader />
}

export default App
