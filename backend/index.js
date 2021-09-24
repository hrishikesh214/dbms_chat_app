import express, { json } from "express" // express js
import chalk from "chalk" // chalk for better output
import { defaults } from "./required/configs.js" // custom settings
import cors from "cors" // importing cors

/**
 * Import routes
 */

const PORT = process.env.PORT || defaults.port // default port is 5000
const app = express() // creating express app

app.use(cors())
app.use(json()) // for json api

app.get("/", async (req, res) => {
	res.send("ok")
})

/**
 * Finnally, here we go...
 */
app.listen(PORT, () => {
	console.log(`API live at: ${chalk.bgGreen(PORT)}`)
})
