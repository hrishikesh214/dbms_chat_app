import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { defaults, api } from "../../config"
import notify_tone from "./n_tone2.wav"
import axios from "axios"
import ago from "s-ago" // for converting datetime to hum readable time
import "./style.css"
import Message from "./Message"

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
			bottomRef.current.scrollIntoView()
		}
	}

	useEffect(() => {
		if (cid === undefined && window.innerWidth < 550) {
			document.getElementsByClassName("main-content")[0].style.display =
				"none"
		}
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

		//send to api
		try {
			let r = await axios({
				method: "post",
				url: api.base + api.chats + `/${cid}/messages/${user_id}`,
				data: { msg: msg.value },
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			console.log(r.data.result)
			setMessages([
				...messages,
				{
					id: r.data.result,
					message: msg.value,
					user_id: user_id,
					time: Date.now(),
				},
			])
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

	const on_delete = async (id) => {
		// api call
		try {
			let r = await axios({
				method: "delete",
				url: api.base + api.chats + `/${cid}/messages/${id}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
		} catch (err) {
			console.log(err)
		}
		// update local store
		setMessages(messages.filter((m) => m.id !== id))
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
							<a href="/">Back</a>
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
									<Message
										message={message}
										user_id={user_id}
										index={index}
										on_delete={on_delete}
									/>
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
