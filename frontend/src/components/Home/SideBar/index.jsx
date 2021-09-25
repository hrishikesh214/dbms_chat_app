import { useState, useEffect } from "react"
import "./style.css"

const SideBar = ({ user_id }) => {
	const [username, setUsername] = useState("hrishi7")
	const [chats, setChats] = useState([
		{
			id: 2731,
			username: "movi",
		},
		{
			id: 2732,
			username: "moi",
		},
	])

	const open_chat = (id) => {
		window.location.href = `/chat/${id}`
	}

	return (
		<div className="side-bar">
			<div className="side-bar-header">
				<span>{username}</span>
			</div>

			{chats.map((chat, index) => (
				<div key={index} className="list-chat">
					<div onClick={(e) => open_chat(chat.id)}>
						{chat.username}
					</div>
				</div>
			))}
		</div>
	)
}
export default SideBar
