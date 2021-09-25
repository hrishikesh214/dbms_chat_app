import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import "./style.css"

const Chat = ({ user_id }) => {
	const [messages, setMessages] = useState([])
	const [receiver, setReceiver] = useState("gghrishi")
	const [chat_id, set_chat_id] = useState(null)
	const { cid } = useParams()
	const [to_load, set_to_load] = useState(true)

	const bottomRef = useRef(null)

	const scroll_bottom = () => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" })
		}
	}

	useEffect(() => {
		set_chat_id(cid ?? null)
		load_messages()
	}, [])

	const load_messages = async () => {
		// fetch from api
		setTimeout(() => {
			setMessages([
				{
					message: "hello",
					user_id: 777,
					time: "12:00",
				},
				{
					message: "hi",
					user_id: 56,
					time: "12:02",
				},
				{
					message: "hello",
					user_id: 777,
					time: "12:03",
				},
				{
					message:
						"Conditional execution in assembly language is accomplished by several looping and branching instructions. These instructions can change the flow of control in a program. Conditional execution is observed in two scenarios −",
					user_id: 56,
					time: "12:02",
				},
				{
					message:
						"Conditional execution in assembly language is accomplished by several looping and branching instructions. These instructions can change the flow of control in a program. Conditional execution is observed in two scenarios −",
					user_id: 56,
					time: "12:02",
				},
				{
					message:
						"Conditional execution in assembly language is accomplished by several looping and branching instructions. These instructions can change the flow of control in a program. Conditional execution is observed in two scenarios −",
					user_id: 777,
					time: "12:02",
				},
			])
		}, 2000)
		set_to_load(false)
		setTimeout(scroll_bottom, 2000)
	}

	const send_msg = async () => {
		let msg = document.getElementById("msg")
		// add to present
		setMessages([
			...messages,
			{ message: msg.value, user_id: user_id, time: "12:00" },
		])
		// console.log(msg.value)
		//send to api
		setTimeout(scroll_bottom, 200)
		msg.value = ""
	}
	return (
		<>
			{chat_id === null ? (
				<div className="main-content">
					<div className="no-chat">
						<h1>No Chat Selected</h1>
					</div>
				</div>
			) : (
				<div className="main-content">
					<div className="main-content-header">
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
