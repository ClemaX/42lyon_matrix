const dayjs = require("dayjs")
const { serverLogs } = require("../../schemas/ServerLogs")

const self = this
/*
 ** SOCKETS
 */

module.exports.io = null
module.exports.sockets = {}
module.exports.clients = {}

/*
 ** EVENT EMITTER
 */
// => merge events.js

/*
 ** DATABASE
 */
// => merge databases.js

/*
 ** CONFIG
 */
// => merge config.js

/*
 ** GENERAL
 */
module.exports.bearer_token = null
module.exports.refresh_timeout = null

module.exports.log = function (type, component, message) {
	try {
		console.log(`[${dayjs().format("YY-MM-DD HH:mm")}]`, `[${type}]`, `[${component}]`, message)
		serverLogs.create({
			date: new Date(),
			type,
			component,
			message,
		})
	} catch (e) {
		console.error(e)
	}
}
