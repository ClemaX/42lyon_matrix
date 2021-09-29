const evt = require("./exports/events").evt
const config = require("./exports/config")
const axios = require("axios").default
const queue = require("./queue")
const dayjs = require("dayjs")
const app = require("./exports/main")

const { Logged } = require("../schemas/logged")
const { OnlineStats } = require("../schemas/stats")
const { Student } = require("../schemas/students")
const { get_details } = require("./Utility.Students")

let tmp_logged = []
let self = this

async function updateOfflineStudents(current) {
	const logins = []
	const conditions = {
		begin_at: {
			$ne: null,
		},
	}
	Logged.find(conditions, async (err, res) => {
		if (err);
		else {
			res.forEach((e) => logins.push(e.login))
			for (const e of current) {
				if (logins.includes(e.user.login)) logins.splice(logins.indexOf(e.user.login), 1)
			}
			evt.emit("loggedout_student", logins)
			for (const e of logins) {
				console.log(e, "is not online anymore")
				await Logged.updateOne({ login: e }, { begin_at: null }, (err, res) => {
					if (err) console.log(err)
				})
			}
		}
	})
}

// a retirer soon
async function generate_first_time(id) {
	const uri = `${config.api_url}/v2/users/${id}`
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios.get(uri)
			await Student.updateOne(
				{ id: id },
				{
					last_update: new Date(),
					data: result.data,
					...get_details(result?.data),
					login: result?.data?.login,
				},
				{
					upsert: true,
				}
			)
			//console.log(result?.data?.login)
			resolve()
		} catch (e) {
			console.error(e)
			reject()
		}
	})
}

module.exports.get_online = async function (page = 1) {
	const uri = `${config.api_url}/v2/campus/${config.campus_id}/locations?filter[active]=true&page[size]=100&page[number]=${page}`
	app.log("INFO", "get_online", `Starting aggregation for page ${page}.`)
	return new Promise(async (resolved, rejected) => {
		axios
			.get(uri)
			.then(async (r) => {
				for (const e of r.data) {
					const data = {
						id: e.user.id,
						login: e.user.login,
						location: e.host,
						begin_at: e.begin_at,
						last_seen: new Date(),
					}
					await Logged.updateOne({ login: e?.user?.login, id: e.user.id }, data, { upsert: true })
						.then(async () => {
							await Student.findOne({ id: e?.user?.id })
								.then((r) => {
									if (!r) queue.push(generate_first_time, [e?.user?.id], 1, "generate_first_time")
								})
								.catch((e) => {})
							//await Student.updateOne({ id: e.user.id }, { last_update: new Date() })
						})
						.catch((e) => {
							console.error(e)
						})
				}
				tmp_logged = [...tmp_logged, ...r.data]
				if (r.data.length === 100) queue.push(self.get_online, [page + 1], 1)
				else {
					updateOfflineStudents(tmp_logged)
					evt.emit("logged_students", tmp_logged)
					tmp_logged = []
				}
				resolved()
			})
			.catch((error) => {
				//console.error(error, error?.response?.data)
				rejected(error?.response?.data)
			})
	})
}

module.exports.update_stats = async function (count) {
	try {
		const curr_date = dayjs().format("DD-MM-YY-HH")

		const splited_date = curr_date.split("-")
		const day = splited_date[0]
		const month = splited_date[1]
		const year = splited_date[2]
		const hour = splited_date[3]
		const offset = dayjs().utcOffset()
		const date = dayjs(`20${year}-${month}-${day} ${hour}`).add(offset, "minute")

		await OnlineStats.updateOne(
			{ date: `${curr_date}` },
			{
				$max: {
					max: count,
				},
				$min: {
					min: count,
				},
				full_date: date,
			},
			{ upsert: true }
		)
	} catch (e) {
		console.error(e)
	}
}
