const config = require("./exports/config")
const axios = require("axios").default
const dayjs = require("dayjs")
const app = require("./exports/main")
// Main shared variables
const queue = require("./queue")

const { Location } = require("../schemas/logtime")
const self = this

module.exports.get_logtime = async function (login) {
	try {
		const locations = []
		const logtimes = {}

		const _date = new Date()
		const today_date = new Date(_date.getFullYear(), _date.getMonth(), 0, 0, 0, 0, 0)
		const from_database = await Location.find({ "user.login": login, begin_at: { $gte: today_date } })

		for (const data of from_database) {
			let date_end = data.end_at ? dayjs(data.end_at) : null
			const date_begin = dayjs(data.begin_at)

			//if (!date_end)
			//	date_end = dayjs()
			const loc = {
				begin: dayjs(date_begin.format("YYYY-MM-DD HH:mm[:00]")).unix(),
				end: date_end ? dayjs(date_end.format("YYYY-MM-DD HH:mm[:00]")).unix() : null,
				std_begin: dayjs(date_begin.format("YYYY-MM-DD")).unix(),
				std_end: date_end ? dayjs(date_end.format("YYYY-MM-DD")).unix() : null,
				total: date_end ? Math.abs(date_begin.diff(date_end, "minute")) : null,
				host: data.host,
				id: data.user.id,
			}
			locations.push(loc)

			const d_begin = dayjs.unix(loc.begin).format("YYYY-MM-DD")
			const d_end = dayjs.unix(loc.end).format("YYYY-MM-DD")
			!logtimes.hasOwnProperty(d_begin) && (logtimes[d_begin] = 0)
			loc.end && !logtimes.hasOwnProperty(d_end) && (logtimes[d_end] = 0)
		}

		for (const date of Object.keys(logtimes)) {
			const dunix = dayjs(date).unix()
			for (const location of locations) {
				if (location.std_end && dunix >= location.std_begin && dunix <= location.std_end)
					logtimes[date] += location.total
			}
		}
		return logtimes
	} catch (e) {
		console.error(e)
	}
}

module.exports.getAllLocations = async (page) => {
	const uri = `${config.api_url}/v2/campus/${config.campus_id}/locations?sort=id&page[size]=100&page[number]=`
	// 2512
	return new Promise(async (resolve, reject) => {
		const result = await Location.findOne({ host: "MATRIX-DATA" })

		if (result?.last_page > page || (result?.last_page && page === 0)) {
			page = result?.last_page
		}

		if (page === 0) return
		app.log("INFO", "get_location", `Starting aggregation.`)
		await axios
			.get(uri + page)
			.then(async (r) => {
				const count = r?.data?.length
				for (const e of r.data) {
					try {
						await Location.updateOne({ id: e?.id }, { ...e }, { upsert: true })
					} catch (error) {
						console.error(e?.id, "does not need update")
					}
				}
				app.log("INFO", "get_location", `Got ${count} result(s) for page ${page}`)
				await Location.updateOne({ host: "MATRIX-DATA" }, { last_page: page }, { upsert: true })
				if (count >= 100) queue.push(self.getAllLocations, [page + 1], 1, "getAllLocations")
				else await Location.updateOne({ host: "MATRIX-DATA" }, { end_at: new Date() }, { upsert: true })
				resolve()
			})
			.catch((e) => {
				console.error(e)
				reject()
			})
	})
}
