let selector = 0

const defaults = [
	{
		port: 3000,
	},
	{
		port: 80,
	},
]

const links = [
	{
		home: `http://localhost:${defaults[0].port}/`,
	},
	{
		home: `http://40.76.84.143:${defaults[1].port}/`,
	},
]

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
