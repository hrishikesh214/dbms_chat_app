import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
} from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login"
import Loader from "./components/Loader"
import { useState, useEffect } from "react"
import "./universal.css"

const App = () => {
	const [user_id, setUser_id] = useState(777)
	const [toLoad, setToLoad] = useState(0)
	useEffect(() => {
		const user = localStorage.getItem("_c_user")
		if (user) {
			setUser_id(parseInt(user))
			setToLoad(false)
		}
	}, [])
	return (
		<>
			{toLoad ? (
				<Loader />
			) : (
				<Router>
					<Switch>
						<Route exact path="/login">
							<Login setUser={setUser_id} />
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

export default App
