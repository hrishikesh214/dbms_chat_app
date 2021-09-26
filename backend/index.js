import express, { json } from "express" // express js
import chalk from "chalk" // chalk for better output
import { defaults } from "./required/configs.js" // custom settings
import cors from "cors" // importing cors
import db from "./required/db.js"
import Result from "./required/Result.js"
import initiator from "./required/initiator.js"

/**
 * Import routes
 */
import chats from "./chats.js"
import user from "./user.js"

const PORT = process.env.PORT || defaults.port // default port is 5000
const app = express() // creating express app

app.use(cors())
app.use(json()) // for json api

app.use("/chats", chats) // chat routes
app.use("/user", user) // user routes

app.get("/", async (req, res) => {
	let r = new Result()
	let s = db.query(`show tables`, (err, result, fields) => {
		r.setResult(result)
		res.send(r)
	})
})

/**
 * Finnally, here we go...
 */
// initiator()
app.listen(PORT, () => {
	console.log(`API live at: ${chalk.bgGreen(PORT)}`)
})
