const mongoose = require('mongoose')

const Schema = mongoose.Schema

const loggedSchema = new Schema({
	login: {
		type: String,
		required: true
	},
	id: {
		type: Number,
		required: true
	},
	location: {
		type: String,
		default: ""
	},
	last_seen: {
		type: Date,
		default: null
	},
	begin_at: {
		type: Date,
		default: ""
	}
})

module.exports.Logged = mongoose.model('Logged', loggedSchema)