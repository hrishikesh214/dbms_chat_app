import "./style.css"
import { useState, useEffect } from "react"
import ago from "s-ago"
import { AiOutlineStar, AiFillStar, AiFillDelete } from "react-icons/ai"
import { defaults, api } from "../../../config"
import axios from "axios"

const Message = ({ message, user_id, on_delete, showusername, nodelete }) => {
	showusername = showusername ?? false
	nodelete = nodelete ?? false
	const [isStarred, setIsStarred] = useState(message.starred)

	useEffect(() => {
		setIsStarred(message.starred)
	}, [message])

	const toggle_star = async () => {
		try {
			let r = await axios({
				method: "patch",
				url:
					api.base +
					api.chats +
					`/${message.chat_id}/messages/${
						isStarred ? "unstar" : "star"
					}`,
				data: { msg_id: message.id, user_id },
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
		} catch (err) {
			console.log(err)
		}
		setIsStarred(!isStarred)
	}

	const delete_message = async () => {
		on_delete(message.id)
	}

	return (
		<>
			<div
				className={`message-wrapper ${
					message.user_id === user_id ? "my-msg" : "sender-msg"
				}`}
			>
				<div className="message">
					{showusername && (
						<div className="username">{message?.username}</div>
					)}
					<div className="text">{message.message}</div>
					<div className="time">{ago(new Date(message.time))}</div>
					<div className="opts">
						<span onClick={(e) => toggle_star()}>
							{isStarred ? <AiFillStar /> : <AiOutlineStar />}
						</span>
						{nodelete ? (
							""
						) : (
							<span onClick={(e) => delete_message()}>
								<AiFillDelete />
							</span>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default Message
