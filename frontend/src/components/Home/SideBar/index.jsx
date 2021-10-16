import { useState, useEffect } from "react"
import "./style.css"
import { defaults, api } from "../../config"
import axios from "axios"
import SearchBar from "../SearchBar"
import notify_tone from "../Chat/n_tone2.wav"
import ago from "s-ago"
import StarredMessages from "./StarredMessages"

const SideBar = ({ user_id, refresher, onOpenChat }) => {
	const [username, setUsername] = useState("")
	const [chats, setChats] = useState([])
	const [_refresh, setRefresh] = useState(0)
	const [sdb, setSdb] = useState(false)
	const [ssm, setSsm] = useState(false)

	const nt = new Audio(notify_tone)

	/**
	 * play notification sound
	 */
	const playNotify = () => {
		nt.volume = 0.2
		nt.play()
	}

	/**
	 * dummy refresher for shit reactjs!
	 */
	const refresh = () => {
		setRefresh(_refresh + 1)
	}

	useEffect(() => {
		setup()
		fetch_chats()
		setInterval(worker, 2000)
	}, [refresher])

	/**
	 * Load username from cache
	 */
	const setup = () => {
		const user = JSON.parse(
			localStorage.getItem("_c_user") ?? `{username:"NULL"}`
		)
		if (user) {
			setUsername(user.username)
		}
	}

	/**
	 * constantly check api for new chats
	 * because we can't use websockets or we dont have time
	 */
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
			// console.log(err)
		}
	}

	/**
	 * fetch chats from api
	 */
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

	/**
	 * does set the application for a chat
	 */
	const open_chat = (id) => {
		let nc = chats.filter((c) => c.id === id)[0]
		setChats([
			...chats.filter((c) => c.id !== id),
			{ ...nc, unread_count: 0 },
		])
		setTimeout(refresh, 2000)
		onOpenChat(nc.username)
		window.location.href = `/chat/${id}`
	}

	/**
	 * redirects to logout
	 */
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
			{ssm && (
				<StarredMessages
					user_id={user_id}
					close_sm={() => setSsm(false)}
				/>
			)}
			<div className="side-bar">
				<div className="side-bar-header">
					<span>{username}</span>
				</div>
				<div className="btn-section">
					<button
						className="panel-btn"
						onClick={(e) => make_logout()}
					>
						Logout
					</button>
					<button className="panel-btn" onClick={() => setSdb(true)}>
						New Chat
					</button>
					<button className="panel-btn" onClick={() => setSsm(true)}>
						Starred Messages
					</button>
				</div>

				{chats.map((chat, index) => (
					<div
						onClick={(e) => open_chat(chat.id)}
						key={index}
						className="list-chat"
					>
						<div className="list-chat-ele">
							<div className={chat.status > 0 ? "is-online" : ""}>
								{chat.username}
							</div>
							<div className="desc">
								{chat.unread_count > 0 && (
									<div className="msg-count">
										{chat.unread_count}
									</div>
								)}
								<span className="time">
									<marquee scrollamount="2" scrolldelay="10">
										{ago(new Date(chat.last_msg_time))}
									</marquee>
								</span>
							</div>
						</div>
						<div className="list-chat-footer">
							<span className="msg">
								{chat.last_msg?.substring(0, 65) + "..."}
							</span>
						</div>
					</div>
				))}
			</div>
		</>
	)
}
export default SideBar
