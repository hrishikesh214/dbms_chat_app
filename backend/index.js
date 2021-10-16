/**
 * using
 * 	- express => for api routing
 *  - cors => for removing cors issues
 *  - chalk => for beutiful console
 */

import express, { json } from "express" // express js
import chalk from "chalk" // chalk for better output
import { defaults } from "./required/configs.js" // custom settings
import cors from "cors" // importing cors
import db, { dbquery } from "./required/db.js"
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
	try {
		let s = await dbquery(
			`select table_name as 'Tables'  from  information_schema.tables where table_schema = '${defaults.dbconfig.database}'`
		)
		s = s?.map((x) => x.Tables)
		r.setResult({ tables: s })
	} catch (e) {
		console.log(e)
		r.setError(e)
	}

	res.send(r)
})

/**
 * Finnally, here we go...
 */
// initiator()
app.listen(PORT, () => {
	console.log(`API live at: ${chalk.bgGreen(PORT)}`)
})
