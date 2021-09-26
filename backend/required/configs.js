/**
 * Selector will select diffrent environments
 * 0        -> Development
 * Others   -> Production
 */
let selector = 0

/**
 * Defaults will contain array for default values for variables based on environment
 */
const defaults = [
	{
		port: 5000,
		dbconfig: {
			user: "root",
			host: "localhost",
			database: "dbms_chat",
			password: "",
		},
	},
	{
		port: 5000,
		dbconfig: {
			user: "root",
			host: "13.68.149.35",
			database: "dbms_chat",
			password: "",
		},
	},
]

/**
 * Defaults will contain array for link values for variables based on environment
 */
const links = [
	{
		home: `http://localhost:3000/`,
	},
	{
		home: `http://13.68.149.35:3000/`,
	},
]

/**
 * Defaults will contain array for api values for variables based on environment
 */
const api = [
	{
		base: `http://localhost:${defaults[0].port}/`,
	},
	{
		base: `http://13.68.149.35:${defaults[0].port}/`,
	},
]

const _links = links[selector]
export { _links as links }

const _defaults = {
	...defaults[selector],
}
export { _defaults as defaults }

const _api = api[selector]
export { _api as api }

export default {
	defaults: _defaults,
	links: _links,
	api: _api,
} // by default export all
