import "./style.css"
import { useState, useEffect } from "react"
import Message from "../../Chat/Message"
import axios from "axios"
import { defaults, api } from "../../../config"

const StarredMessages = ({ user_id, close_sm }) => {
	const [starredMessages, setStarredMessages] = useState([])

	useEffect(() => {
		fetch_starred_messages()
	}, [])

	/**
	 * fetch starred messages from api
	 */
	const fetch_starred_messages = async () => {
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.user + `/${user_id}/starred_messages`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			setStarredMessages(r.data.result)
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<>
			<div className="sm-wrapper">
				<div className="sm-container">
					<div className="ele close-btn">
						<button onClick={(e) => close_sm()}>Close</button>
					</div>
					{starredMessages
						.filter((u) => u.id !== user_id)
						.map((message, index) => (
							<Message
								key={index}
								message={message}
								user_id={user_id}
								showusername
								nodelete
							/>
						))}
					{starredMessages.length === 0 && (
						<div className="ele">No Starred Messages</div>
					)}
				</div>
			</div>
		</>
	)
}

export default StarredMessages
