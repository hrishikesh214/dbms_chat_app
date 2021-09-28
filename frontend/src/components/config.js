/**
 ** Config file contains all required data for the application
 */

let selector = 1 // selector will select single profile from multiple profile

const defaults = [
	{
		port: 3000,
	},
	{
		port: 80,
	},
]

// links will have all links related to present frontend path
const links = [
	{
		home: `http://localhost${
			defaults[0].port == 80 ? "" : ":" + defaults[0].port
		}/`,
	},
	{
		home: `http://40.76.84.143${
			defaults[1].port == 80 ? "" : ":" + defaults[1].port
		}/`,
	},
]

// api will contain all api related to present path
const api = [
	{
		base: "http://localhost:5000/",
		chats: "chats",
		user: "user",
	},
	{
		base: "http://40.76.84.143:5000/",
		chats: "chats",
		user: "user",
	},
]

// finnally select profile according to selector
const _links = links[selector]
const _defaults = {
	...defaults[selector],
	network_error: {
		message: "Network error",
		code: 500,
		full: "Network error",
	},
}
const _api = api[selector]

export { _links as links }
export { _defaults as defaults }
export { _api as api }
export default {
	defaults: _defaults,
	links: _links,
	api: _api,
}
