const mongoose = require("mongoose")

const Schema = mongoose.Schema

const serverLogs = new Schema({
	date: {
		type: Date,
		default: new Date(),
		index: true,
	},
	type: {
		type: String,
	},
	component: {
		type: String,
	},
	message: {
		type: String,
	},
})

module.exports.serverLogs = mongoose.model("ServerLogs", serverLogs)
