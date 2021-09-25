let selector = 0

const defaults = [
	{
		port: 3000,
	},
]

const links = [
	{
		home: `http://localhost:${defaults[0].port}`,
	},
]

const api = [
	{
		base: "http://localhost:5000/",
	},
]

const _links = links[selector]
const _defaults = {
	...defaults[selector],
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
