const mongoose = require('mongoose')

const Schema = mongoose.Schema

const locationSchema = new Schema({
	id:  { 
		type: Number, 
		unique: true 
	},
	data: {
		type: Schema.Types.Mixed
	},
	end_at: {
		type: Date
	},
	begin_at: {
		type: Date
	},
	primary: {
		type: Boolean
	},
	host: {
		type: String
	},
	campus_id: {
		type: Number
	},
	user: {
		id: Number,
		login: String,
		url: String
	},

	last_page: {
		type: Number
	}
})

module.exports.Location = mongoose.model('Location', locationSchema)