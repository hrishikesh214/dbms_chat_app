import mysql from "mysql"
import { defaults } from "./configs.js"

let m_connection = mysql.createPool({
	connectionLimit: 10,
	...defaults.dbconfig,
})

export default m_connection
