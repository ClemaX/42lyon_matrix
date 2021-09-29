const mongoose = require('mongoose')

const Schema = mongoose.Schema

const studentsSchema = new Schema({
	login: {
		type: String,
		unique: true,
		required: true
	},
	id: {
		type: Number,
		unique: true,
		required: true
	},
	last_update: Date,
	last_active: {
		type	: Date,
		default	: null
	},
	data: {
		type: Schema.Types.Mixed
	},
	status			: String,
	pool_year		: String,
	pool_month		: String,
	pool_level		: Number,
	to_blackhole	: Number,
	level			: Number,
	correction_point: Number,
	wallet			: Number
})

const StudentStatSchema = new Schema({
	id: {
		type: Number,
		unique: true,
		required: true
	},
	status			: String,
	pool_year		: String,
	pool_month		: String,
	pool_level		: Number,
	to_blackhole	: Number,
	level			: Number,
	correction_point: Number,
	wallet			: Number
})

module.exports.Student = mongoose.model('Student', studentsSchema)
module.exports.StudentStat = mongoose.model('StudentStat', StudentStatSchema)