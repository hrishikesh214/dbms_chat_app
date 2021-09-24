/**
 * ? Trouble in API results
 * * Result class handles all functions related to make a result object
 * * Easily handles results
 */

class Result {
	constructor() {
		// default result object
		this.result = {
			ok: false,
			result: null,
			error: {
				code: 0,
				msg: "None",
				full: null,
			},
		}
	}
	set(result) {
		this.result.result = result
	}
	get() {
		return this.result
	}
	setResult(d = {}) {
		this.result.result = d
		this.result.ok = true
	}
	setError(e = 0, err = null) {
		this.result.ok = false
	}
	reset() {
		this.result = {
			ok: false,
			result: null,
			error: null,
		}
	}
}

export default Result
