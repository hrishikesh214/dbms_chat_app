import "./style.css"
import axios from "axios"
import { defaults, api } from "../../config"
import { useState } from "react"

const SearchBar = ({ user_id, close_search }) => {
	const [users, setUsers] = useState([])

	/**
	 * makes api call to search LIKE st
	 * @param {string} st
	 */
	const make_search = async (st) => {
		try {
			let r = await axios({
				method: "get",
				url: api.base + api.user + `/search/${st}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			setUsers(r.data.result)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * makes api call to open chat for user
	 */
	const create_chat = async (rid) => {
		try {
			let r = await axios({
				method: "post",
				url: api.base + api.chats + `/${user_id}/${rid}`,
			})
			if (r.status !== 200) throw defaults.network_error
			if (!r.data.ok) throw r.data.error
			console.log(r.data.result)
			window.location.href = `/chat/${r.data.result}`
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<>
			<div className="search-wrapper">
				<div className="search-container">
					<div className="ele close-btn">
						<button onClick={(e) => close_search()}>Close</button>
					</div>
					<div className="ele">
						<input
							type="text"
							placeholder="Search"
							onChange={(e) => make_search(e.target.value)}
						/>
					</div>
					{users
						.filter((u) => u.id !== user_id)
						.map((user, index) => (
							<div
								key={index}
								onClick={(e) => create_chat(user.id)}
								className="ele"
							>
								{user.username}
							</div>
						))}
					{users.length === 0 && (
						<div className="ele">No User Found</div>
					)}
				</div>
			</div>
		</>
	)
}

export default SearchBar
