import { Router } from "express"
import Result from "./required/Result.js"
import db from "./required/db.js"

const router = Router()

/**
 * @api {post} login
 * @return id if exists, else 0
 */
router.post("/login", async (req, res) => {
	const { username, password } = req.body
	let r = new Result()
	try {
		let login = db.query(
			`select make_login('${username}', '${password}') as user_id`,
			(err, result) => {
				if (err) {
					console.error(err)
					r.setError(err)
				} else {
					r.setResult({ id: result[0]["user_id"], username })
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
 * @api {get} logout
 * @return {bool} success message
 */
router.get("/logout/:user_id", async (req, res) => {
	const { user_id } = req.params
	let r = new Result()
	try {
		let logout = db.query(
			`call make_offline(${user_id})`,
			(err, result) => {
				if (err) {
					console.error(err)
					r.setError(err)
				} else {
					r.setResult(true)
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
 * @api {post} signups
 * @return id if exists, else create a new and return
 */
router.post("/signup", async (req, res) => {
	const { username, password } = req.body
	let r = new Result()
	try {
		let login = db.query(
			`select make_signup('${username}', '${password}') as user_id`,
			(err, result) => {
				if (err) {
					console.error(err)
					r.setError(err)
				} else {
					r.setResult({ id: result[0]["user_id"], username })
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
 * @api {get} searches LIKE st
 * @return list of searches
 */
router.get("/search/:st", async (req, res) => {
	const { st } = req.params
	let r = new Result()
	try {
		let search = db.query(
			`select id, username from people where username like '%${st}%'`,
			(err, result) => {
				if (err) {
					console.error(err)
					r.setError(err)
				} else {
					r.setResult(result)
				}
				res.send(r.get())
			}
		)
	} catch (err) {
		console.error(err)
		r.setError(err)
		res.send(r.get())
	}
})

router.get("/:user_id/starred_messages", async (req, res) => {
	let r = new Result()
	let { user_id } = req.params

	if (user_id == undefined) {
		r.setResult(null)
		res.send(r.get())
	} else
		try {
			let chats = db.query(
				`select messages.id, messages.msg, messages.sender_id, messages.sent_at, people.username as 'sender_username' from starred_messages inner join messages inner join people on people.id = messages.sender_id on messages.id = starred_messages.msg_id where starred_messages.user_id = ${user_id}`,
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
								starred: 1,
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

export default router
