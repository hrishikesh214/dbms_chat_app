import mysql from "mysql"
import { defaults } from "./configs.js"
import util from "util"

let m_connection = mysql.createPool({
	connectionLimit: 10,
	...defaults.dbconfig,
})
export const dbquery = util.promisify(m_connection.query).bind(m_connection)

export default m_connection
