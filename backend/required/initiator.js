import db from "./db.js"
import fs from "fs"
import { fileURLToPath } from "url"
import path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function initiator() {
	const queries = fs
		.readFileSync(path.join(__dirname, "./database.sql"))
		.toString()
		.replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
		.replace(/\s+/g, " ") // excess white space
		.split(";") // split into all statements
		.map(Function.prototype.call, String.prototype.trim)
		.filter(function (el) {
			return el.length != 0
		})

	let q = ""
	queries.forEach(function (query) {
		if (query[0] !== "-") q = q + query + ";"
	})
	console.log(q)
	db.query(q, function (err, result) {
		if (err) {
			console.log(err)
		} else console.log(result)
	})
}
