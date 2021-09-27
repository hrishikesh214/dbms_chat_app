import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { defaults, api } from "../../config"
import useSound from "use-sound"
import notify_tone from "./n_tone2.wav"
import axios from "axios"
import "./style.css"

const Chat = ({ user_id }) => {
	const [messages, setMessages] = useState([])
	const [receiver, setReceiver] = useState("")
	const { cid } = useParams()
	const [to_load, set_to_load] = useState(cid !== undefined)
	const [waitState, setWaitState] = useState(false)
	// const [playNotify] = useSound(notify_tone)
	const nt = new Audio(notify_tone)

	const playNotify = () => {
		nt.volume = 0.2
		nt.play()
	}

	const bottomRef = useRef(null)

	const scroll_bottom = () => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" })
		}
	}

	useEffect(() => {
		load_messages()
		setInterval(worker, 2000)
	}, [])

	const worker = async () => {
		if (cid === null) return

		try {
			let r = await axios({
				method: "get",
				url: api.base + api.chats + `/${cid}/${user_id}/refreshcheck`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error

			if (r.data.result.refresh) {
				setTimeout(playNotify, 500)
				await load_messages()
			}
		} catch (err) {
			console.log(err)
		}
	}

	const load_messages = async () => {
		if (cid === null) return
		// fetch from api
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.chats + `/${cid}/messages/${user_id}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			// console.log(r.data)
			setMessages(r.data.result)
			let done = r.data.result.length - 1
			while (done >= 0) {
				if (r.data.result[done].user_id !== user_id) {
					setReceiver(r.data.result[done].username)
					break
				}
				done--
			}

			set_to_load(false)
			setTimeout(scroll_bottom, 800)
		} catch (err) {
			console.log(err)
		}
	}

	const send_msg = async () => {
		if (waitState) return
		let msg = document.getElementById("msg")
		if (msg.value == "") return
		setWaitState(true)

		// add to present
		setMessages([
			...messages,
			{ message: msg.value, user_id: user_id, time: "12:00" },
		])
		// console.log(msg.value)
		//send to api
		try {
			let r = await axios({
				method: "post",
				url: api.base + api.chats + `/${cid}/messages/${user_id}`,
				data: { msg: msg.value },
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
		} catch (err) {
			console.log(err)
		}
		setWaitState(false)
		setTimeout(scroll_bottom, 200)
		msg.value = ""
	}

	const check_send = async (e) => {
		if (e.key === "Enter") send_msg()
	}

	return (
		<>
			{cid === undefined ? (
				<div className="main-content">
					<div className="no-chat">
						<h1>No Chat Selected</h1>
					</div>
				</div>
			) : (
				<div className="main-content">
					<div className="main-content-header">
						<div className="back-btn">
							<Link to="/">Back</Link>
						</div>
						<div>{receiver}</div>
					</div>
					<div className="main-content-body">
						{to_load ? (
							<div className="main-content">
								<div className="no-chat">
									<h1>Loading...</h1>
								</div>
							</div>
						) : (
							<div className="message-container">
								{messages.map((message, index) => (
									<div
										key={index}
										className={`message-wrapper ${
											message.user_id === user_id
												? "my-msg"
												: "sender-msg"
										}`}
									>
										<div className="message">
											{message.message}
										</div>
									</div>
								))}
								<div ref={bottomRef} />
							</div>
						)}

						<div className="input-container">
							<input
								id="msg"
								type="text"
								placeholder="type here"
								className="input-field"
								onKeyPress={(e) => check_send(e)}
							/>
							<button
								onClick={(e) => send_msg()}
								className="send-btn"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
export default Chat
