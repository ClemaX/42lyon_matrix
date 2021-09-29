const mongoose = require('mongoose')

const Schema = mongoose.Schema

const onlineSchema = new Schema({
	date: {
		type: String
	},
	full_date: {
		type: Date,
		unique: true
	},
	year: Number,
	month: Number,
	day: Number,
	hour: Number,
	min: {
		type: Number,
		required: true
	},
	max: {
		type: Number,
		required: true
	},
	avg: {
		type: Number,
		required: true
	},
})

const preScrap = new Schema({
	//id: { type: Number, unique: true },
	//login: {type: String },
	id:  { type: Number, unique: true },
	data: {
		type: Schema.Types.Mixed
	},
})

const CoalitionSchema = new Schema({
	date 			: {
		type	: Date
	},
	cursus_id		: Number,
	coalition_id	: Number,
	coalition_name	: String,
	coalition_points: Number
})

module.exports.Coalitions = mongoose.model('Coalitions', CoalitionSchema)


module.exports.preScrap = mongoose.model('preScrap', preScrap)
module.exports.OnlineStats = mongoose.model('OnlineStats', onlineSchema)