import { Router } from "express"
import Result from "./required/Result.js"
import db from "./required/db.js"

const router = Router()

router.get("/:user_id", async (req, res) => {
	let r = new Result()
	let user_id = req.params.user_id
	try {
		let chats = db.query(
			`select id, last_msg, last_msg_time, un1, un2, p1, get_username(p1) as p1_username, p2, get_username(p2) as p2_username from chats where p1 = ${user_id} or p2 = ${user_id} order by last_msg_time desc`,
			(err, result) => {
				if (err) {
					r.setError(err)
				} else {
					result = result.map((chat) => {
						let nc = {
							id: chat.id,
							last_msg: chat.last_msg,
							last_msg_time: chat.last_msg_time,
							unread_count:
								chat[
									parseInt(chat["p1"]) == user_id
										? "un1"
										: "un2"
								],
							user_id:
								chat[
									parseInt(chat["p1"]) == user_id
										? "p2"
										: "p1"
								],
							username:
								chat[
									parseInt(chat["p1"]) == user_id
										? "p2_username"
										: "p1_username"
								],
						}
						return nc
					})
					r.setResult(result)
				}
				res.send(r.get())
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

router.post("/:p1/:p2", async (req, res) => {
	let r = new Result()
	let { p1, p2 } = req.params
	try {
		let create_chat = db.query(
			`select make_chat('${p1}','${p2}') as chat_id`,
			(err, result) => {
				if (err) {
					r.setError(err)
				} else {
					r.setResult(result[0]["chat_id"])
				}
				res.send(r.get())
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

router.get("/:user_id/chatlistcheck", async (req, res) => {
	let r = new Result()
	let { user_id } = req.params
	try {
		let rstat = db.query(
			`select chatlist_refresh(${user_id}) as refresh`,
			(err, result) => {
				r.setResult(result[0])
				res.send(r.get())
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

router.get("/:chat_id/:user_id/refreshcheck", async (req, res) => {
	let r = new Result()
	let { user_id, chat_id } = req.params
	try {
		let rstat = db.query(
			`select chat_refresh(${chat_id},${user_id}) as refresh`,
			(err, result) => {
				if (err) {
					r.setError(err)
					res.send(r.get())
					return
				}

				r.setResult(result[0])
				res.send(r.get())
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

router.get("/:chat_id/messages/:user_id", async (req, res) => {
	let r = new Result()
	let chat_id = req.params.chat_id
	try {
		let chats = db.query(
			`select id, msg, sent_at, sender_id, get_username(sender_id) as sender_username from messages where chat_id = ${chat_id}`,
			(err, result) => {
				if (err) {
					r.setError(err)
					res.send(r.get())
					return
				} else {
					result = result.map((message) => {
						let nm = {
							id: message.id,
							message: message.msg,
							time: message.sent_at,
							user_id: message.sender_id,
							username: message.sender_username,
						}
						return nm
					})
					r.setResult(result)
					res.send(r.get())
				}
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

router.post("/:chat_id/messages/:user_id", async (req, res) => {
	let r = new Result()
	let { user_id, chat_id } = req.params
	let { msg } = req.body
	try {
		let chats = db.query(
			`call send_message(${chat_id}, ${user_id}, '${msg}')`,
			(err, result) => {
				if (err) {
					console.log(err)
					r.setError(err)
					res.send(r.get())
				} else {
					r.setResult(result)
					res.send(r.get())
				}
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

export default router
