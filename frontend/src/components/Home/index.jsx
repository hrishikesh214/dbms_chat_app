import "./style.css"
import SideBar from "./SideBar"
import Chat from "./Chat"
import { useState, useEffect } from "react"

const Home = ({ user_id }) => {
	const [selected_chat, setSelectedChat] = useState(null)

	return (
		<div className="home-container">
			<SideBar user_id={user_id} />
			<Chat user_id={user_id} />
		</div>
	)
}

export default Home
