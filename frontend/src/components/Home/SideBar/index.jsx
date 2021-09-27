import { useState, useEffect } from "react"
import "./style.css"
import { defaults, api } from "../../config"
import axios from "axios"
import SearchBar from "../SearchBar"
import notify_tone from "../Chat/n_tone2.wav"
import ago from "s-ago"

const SideBar = ({ user_id }) => {
	const [username, setUsername] = useState("")
	const [chats, setChats] = useState([])
	const [_refresh, setRefresh] = useState(0)
	const [sdb, setSdb] = useState(false)

	const nt = new Audio(notify_tone)

	const playNotify = () => {
		nt.volume = 0.2
		nt.play()
	}

	const refresh = () => {
		setRefresh(_refresh + 1)
	}

	useEffect(() => {
		setup()
		fetch_chats()
		setInterval(worker, 2000)
	}, [])

	const setup = () => {
		const user = JSON.parse(
			localStorage.getItem("_c_user") ?? `{username:"NULL"}`
		)
		if (user) {
			setUsername(user.username)
		}
	}

	const worker = async () => {
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.chats + `/${user_id}/chatlistcheck`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			if (r.data.result.refresh) {
				playNotify()
				await fetch_chats()
			}
		} catch (err) {
			console.log(err)
		}
	}

	const fetch_chats = async () => {
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.chats + `/${user_id}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			setChats(r.data.result)
		} catch (err) {
			console.log(err)
		}
	}

	const open_chat = (id) => {
		let nc = chats.filter((c) => c.id === id)[0]
		setChats([
			...chats.filter((c) => c.id !== id),
			{ ...nc, unread_count: 0 },
		])
		setTimeout(refresh, 2000)
		window.location.href = `/chat/${id}`
	}
	const make_logout = () => {
		window.location.href = `/logout`
	}

	return (
		<>
			{sdb && (
				<SearchBar
					user_id={user_id}
					close_search={() => setSdb(false)}
				/>
			)}
			<div className="side-bar">
				<div className="side-bar-header">
					<span>{username}</span>
				</div>
				<div className="panel-btn" onClick={(e) => make_logout()}>
					Logout
				</div>
				<div className="panel-btn" onClick={() => setSdb(true)}>
					New Chat
				</div>
				{chats.map((chat, index) => (
					<div key={index} className="list-chat">
						<div className="list-chat-ele">
							<div
								className={chat.status > 0 ? "is-online" : ""}
								onClick={(e) => open_chat(chat.id)}
							>
								{chat.username}
							</div>
							{chat.unread_count > 0 && (
								<div className="msg-count">
									{chat.unread_count}
								</div>
							)}
						</div>
						<div className="list-chat-footer">
							<span className="msg">
								{chat.last_msg.substring(0, 25) + "..."}
							</span>
							<span className="time">
								<marquee scrollamount="2" scrolldelay="10">
									{ago(new Date(chat.last_msg_time))}
								</marquee>
							</span>
						</div>
					</div>
				))}
			</div>
		</>
	)
}
export default SideBar
