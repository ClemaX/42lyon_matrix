const mongoose = require("mongoose")
const config = require("./config")

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
}

let uri = config.mongo_uri
mongoose.connect(uri, options).catch((e) => {
	console.error(e)
})

module.exports.db = mongoose.connection
console.log("Trying to connect to MongoDB server...")
this.db.on("error", (err) => {
	console.error(err)
})
