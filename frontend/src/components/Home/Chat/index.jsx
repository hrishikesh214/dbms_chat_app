import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { defaults, api } from "../../config"
import notify_tone from "./n_tone2.wav"
import axios from "axios"
import ago from "s-ago" // for converting datetime to hum readable time
import "./style.css"

const Chat = ({ user_id, uname }) => {
	const [messages, setMessages] = useState([])
	const [receiver, setReceiver] = useState(uname)
	const { cid } = useParams()
	const [to_load, set_to_load] = useState(cid !== undefined)
	const [waitState, setWaitState] = useState(false)
	const nt = new Audio(notify_tone)

	/**
	 * plays the notification tone
	 */
	const playNotify = () => {
		nt.volume = 0.2
		nt.play()
	}

	const bottomRef = useRef(null)

	/**
	 * scrolls to the bottom of the chat
	 */
	const scroll_bottom = () => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" })
		}
	}

	useEffect(() => {
		load_messages()
		setInterval(worker, 2000)
	}, [uname])

	/**
	 * constantly checks for new messages
	 * as we cnt use websockets, we have to do this
	 */
	const worker = async () => {
		if (cid === null) return

		try {
			let r = await axios({
				method: "get",
				url:
					api.base +
					api.chats +
					`/${cid ?? 0}/${user_id}/refreshcheck`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error

			if (r.data.result.refresh) {
				// setTimeout(playNotify, 500)
				await load_messages()
			}
		} catch (err) {
			// console.log(err)
		}
	}

	/**
	 * loads the messages from the server
	 */
	const load_messages = async () => {
		if (cid === null) return
		// fetch from api
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.chats + `/${cid ?? 0}/messages/${user_id}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			console.log(r.data.result)
			if (r.data.result === null) {
				// window.location.href = `/`
			}
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

	/**
	 * sends a message to the server and also adds it to local store
	 */
	const send_msg = async () => {
		if (waitState) return
		let msg = document.getElementById("msg")
		if (msg.value == "") return
		setWaitState(true)

		// add to present
		setMessages([
			...messages,
			{ message: msg.value, user_id: user_id, time: Date.now() },
		])

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

	/**
	 * trigger send_message on enter key
	 */
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
											<div className="text">
												{message.message}
											</div>
											<div className="time">
												{ago(new Date(message.time))}
											</div>
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
