const app = require("./exports/main")
const config = require("./exports/config")
const axios = require("axios").default
const queue = require("./queue")

const dayjs = require("dayjs")
const isBetween = require("dayjs/plugin/isBetween")
const customParseFormat = require("dayjs/plugin/customParseFormat")
require("dayjs/locale/en")

const evt = require("./exports/events").evt
const { Coalitions } = require("../schemas/stats")
const { Student } = require("../schemas/students")
const { get_details } = require("./Utility.Students")

const self = this

dayjs.extend(isBetween)
dayjs.extend(customParseFormat)
async function sleep(time) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}

module.exports.get_token = async function (send_evt = false, enable_refresh = false) {
	const uri = `${config.api_url}${config.token_endpoint}`
	const data = {
		grant_type: "client_credentials",
		client_id: config.uid,
		client_secret: config.secret,
	}
	app.log("INFO", "TOKEN", "Getting access token...")

	return new Promise(async (resolve, reject) => {
		await axios
			.post(uri, data)
			.then((res) => {
				axios.defaults.headers.common = {
					Authorization: `Bearer ${res.data.access_token}`,
				}
				app.bearer_token = res.data.access_token
				app.log("INFO", "TOKEN", "Token successfully created.")

				if (send_evt) evt.emit("token_ready", res.data)
				if (enable_refresh) {
					if (app.refresh_timeout) {
						clearInterval(app.refresh_timeout)
						app.refresh_timeout = null
						app.log("INFO", "TOKEN", "Clearing existing refresh job.")
					}
					let timeout = Math.abs(res?.data?.expires_in) * 1000
					app.log("INFO", "TOKEN", `Auto-refreshing in ${timeout} seconds.`)
					app.refresh_timeout = setTimeout(() => {
						app.log("INFO", "TOKEN", `Refresh timeout executed.`)
						self.get_token(false, false)
					}, timeout)
				}
				resolve()
			})
			.catch((e) => {
				try {
					app.log("INFO", "TOKEN", `${JSON.stringify(e?.response?.data)}`)
				} catch (err) {}
				reject(e)
			})
	})
}

module.exports.get_coalitions = async function () {
	return new Promise(async (resolve, reject) => {
		try {
			const uri = `${config.api_url}/v2/blocs?filter[campus_id]=${config.campus_id}`
			const result = await axios.get(uri)
			const cursus_id = result?.data[0]?.cursus_id
			for (const coa of result?.data[0]?.coalitions) {
				await Coalitions.updateOne(
					{ 
						date: dayjs().format("YYYY-MM-DD"),
						coalition_id: coa.id, 
					},
					{
						cursus_id: cursus_id,
						coalition_id: coa.id,
						coalition_name: coa.name,
						coalition_points: coa.score,
					},
					{ upsert: true }
				).then(() => {
					resolve()
				}).catch((e) => {
					reject(e)
				})
			}
			resolve(result.data)
		} catch (e) {
			reject(e)
			console.error(e)
		}
	})
}

module.exports.getSingleStudentData = async function (id) {
	const uri = `${config.api_url}/v2/users/${id}`

	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios.get(uri)
			await Student.updateOne({ id: id }, { last_update: new Date(), data: result.data }, async (err, res) => {
				if (err) console.log(err)
				else {
					console.log("Scrapped", result.data.login)
					await Student.updateOne(
						{ id: data.id },
						{
							data: result?.data,
							...get_details(result?.data),
						}
					)
				}
			})
			resolve()
		} catch (e) {
			console.error(e)
			reject()
		}
	})
}

module.exports.scrapAllStudentsData = async function () {
	const curr_year = dayjs().locale("en").format("YYYY")
	const curr_month = dayjs().locale("en").format("MMMM").toLowerCase()
	//const lessThan24Hours 	= dayjs().subtract(24, "hour")
	//const lessThanAYear 	= dayjs().subtract(1, "year")

	try {
		const result = await Student.find({
			$and: [
				{
					login: {
						$not: /3b3-.*/,
					},
					$or: [
						{
							$and: [
								{
									pool_year: curr_year,
									pool_month: curr_month,
								},
							],
						},
					],
				},
			],
		}).sort({ id: -1 })
		result.forEach((e) => {
			//console.log(e.login, "  \t\t", e.id)
			queue.push(self.getSingleStudentData, [e.id], 0)
		})
		console.log(result.length)
	} catch (e) {
		console.error(e)
	}
}

module.exports.getAllCampusStudents = async function () {
	let p_count = await Student.countDocuments()
	p_count = parseInt(p_count / 100) + 1
	const uri = `${config.api_url}/v2/users?filter[primary_campus_id]=${config.campus_id}&filter[staff?]=false&page[size]=100&sort=-id&page[number]=${p_count}`

	console.log("getAllCampusStudents", p_count)
	return new Promise((resolve, reject) => {
		axios
			.get(uri)
			.then(async (r) => {
				for (const e of r.data) {
					console.log(e.login)
					try {
						await Student.create({
							id: e.id,
							login: e.login,
							last_update: new Date(),
						})
					} catch (a) {}
				}
				if (r.data.length === 100) queue.push(self.getAllCampusStudents, [], 0)
				resolve()
			})
			.catch((e) => {
				reject()
			})
	})
}
