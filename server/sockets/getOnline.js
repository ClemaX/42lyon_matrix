const app = require("../srcs/exports/main")
const { OnlineStats } = require("../schemas/stats")
const dayjs = require("dayjs")

const { Logged } = require("../schemas/logged")
const { Students } = require("../schemas/students")

require("dayjs/locale/fr")
dayjs.locale("fr")

module.exports = async function () {
	try {
		const patate = await Logged.aggregate([
			{
				$lookup: {
					from: "students",
					localField: "id",
					foreignField: "id",
					as: "info",
				},
			},
			{
				$match: {
					$or: [
						{
							begin_at: {
								$ne: null,
							},
						},
					],
				},
			},
			{
				$project: {
					id: 1,
					login: 1,
					begin_at: 1,
					location: 1,
					"info.data.image_url": 1,
					"info.data.first_name": 1,
					"info.data.last_name": 1,
					"info.level": 1,
					"info.last_update": 1,
					"info.correction_point": 1,
				},
			},
		])

		const result = []
		const custom = {
			cpieri: "lpieri",
		}

		for (const e of patate) {
			const uptime = dayjs().diff(e.begin_at, "minute")
			result.push({
				login: custom.hasOwnProperty(e?.login) ? custom?.[e?.login] : e.login,
				image_url: e?.info[0]?.data?.image_url ?? null,
				uptime: uptime,
				location: e.location ?? null,
				last_name: e?.info?.[0]?.data?.last_name ?? "",
				first_name: e?.info?.[0]?.data?.first_name ?? "",
				level: e?.info[0]?.level ?? -1,
				correction_point: e?.info[0]?.correction_point ?? -1,
				last_update: e?.info[0]?.last_update ?? -1,
			})
		}

		//const result = await Logged.find({ begin_at: { $ne: null } });

		//result.push({
		//    login: e.login === "slopez" ? "DEBUG SLOPEZ" : e.login,
		//    image_url: e?.info[0]?.data?.image_url ?? null,
		//    uptime: uptime,
		//    location: e.location ?? null,
		//  });
		//
		//console.log(result.length)
		return result
	} catch (e) {
		console.error(e)
		return {}
	}
}
