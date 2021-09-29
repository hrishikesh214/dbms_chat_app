import { Router } from "express"
import Result from "./required/Result.js"
import db from "./required/db.js"

const router = Router()

/**
 * @api {get} /chats/:id Get chat
 */
router.get("/:user_id", async (req, res) => {
	let r = new Result()
	let user_id = req.params.user_id
	try {
		let chats = db.query(
			`select id, last_msg, last_msg_time, un1, un2, p1, get_username(p1) as p1_username, p2, get_username(p2) as p2_username, get_chat_reciever_status(id, ${user_id}) as user_status from chats where p1 = ${user_id} or p2 = ${user_id} order by last_msg_time desc`,
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
							status: chat["user_status"],
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

/**
 * @api {post} /chat/p1/p2 create new chat
 */
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

/**
 * @api {get} checks if there is need to update chatlist
 */
router.get("/:user_id/chatlistcheck", async (req, res) => {
	let r = new Result()
	let { user_id } = req.params
	try {
		let rstat = db.query(
			`select chatlist_refresh(${user_id}) as refresh`,
			(err, result) => {
				if (err) {
					r.setError(err)
				} else {
					r.setResult(result[0])
				}
				res.send(r.get())
			}
		)
	} catch (err) {
		r.setError(err)
		res.send(r.get())
	}
})

/**
 * @api {get} checks if there is need to update messages for new messages
 */
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

/**
 * @api {get} get chat messages
 * returns null if user has no permission to see chat
 */
router.get("/:chat_id/messages/:user_id", async (req, res) => {
	let r = new Result()
	let { chat_id, user_id } = req.params

	if (user_id == undefined || chat_id == 0) {
		r.setResult(null)
		res.send(r.get())
	} else
		try {
			let chats = db.query(
				`select messages.id, messages.msg, messages.sent_at, messages.sender_id, check_starred(messages.id,${user_id}) as 'starred',get_username(messages.sender_id) as sender_username from messages inner join chats on chats.id = messages.chat_id where chat_id = ${chat_id} and (chats.p1 = ${user_id} or chats.p2 = ${user_id}) order by messages.sent_at desc limit 70 `,
				(err, result) => {
					if (err) {
						console.log(err)
						r.setError(err)
						res.send(r.get())
						return
					} else {
						result = result.reverse().map((message) => {
							let nm = {
								id: message.id,
								message: message.msg,
								time: message.sent_at,
								user_id: message.sender_id,
								username: message.sender_username,
								starred: message.starred,
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

/**
 * @api {post} sends message to a chat by a user
 */
router.post("/:chat_id/messages/:user_id", async (req, res) => {
	let r = new Result()
	let { user_id, chat_id } = req.params
	let { msg } = req.body
	try {
		let chats = db.query(
			`select send_message(${chat_id}, ${user_id}, '${msg}') as 'msg_id'`,
			(err, result) => {
				if (err) {
					console.log(err)
					r.setError(err)
					res.send(r.get())
				} else {
					console.log(result[0].msg_id)
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

router.delete("/:chat_id/messages/:msg_id", async (req, res) => {
	let r = new Result()
	let { msg_id, chat_id } = req.params
	try {
		let chats = db.query(
			`call delete_message(${msg_id})`,
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

router.patch("/:chat_id/messages/star", async (req, res) => {
	let r = new Result()
	let { chat_id } = req.params
	let { msg_id, user_id } = req.body
	try {
		let chats = db.query(
			`call star_message(${msg_id}, ${user_id})`,
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

router.patch("/:chat_id/messages/unstar", async (req, res) => {
	let r = new Result()
	let { chat_id } = req.params
	let { msg_id, user_id } = req.body
	try {
		let chats = db.query(
			`call unstar_message(${msg_id}, ${user_id})`,
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
