const mongoose = require('mongoose')

const Schema = mongoose.Schema

const sessionSchema = new Schema({
	date: {
		type: String,
		default: new Date()
	},
	student_id : {
		type: Number
	},
	jwt: {
		type: String
	},
	fingerprint: {
		type: Schema.Types.Mixed
	}
})

module.exports.Session = mongoose.model('Session', sessionSchema)