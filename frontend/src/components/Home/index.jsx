import "./style.css"
import SideBar from "./SideBar"
import Chat from "./Chat"
import { useState } from "react"

const Home = ({ user_id }) => {
	const [refresher, setRefresher] = useState(0)
	const [selectedUname, setSUname] = useState("")

	return (
		<div className="home-container">
			<SideBar
				onOpenChat={setSUname}
				refresher={refresher}
				user_id={user_id}
			/>
			<Chat uname={selectedUname} user_id={user_id} />
		</div>
	)
}
export default Home
