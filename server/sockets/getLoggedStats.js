const app = require("../srcs/exports/main")
const { OnlineStats } = require("../schemas/stats")
const dayjs = require("dayjs")

require("dayjs/locale/fr")
dayjs.locale("fr")

async function getLoggedStats(type, start, end) {
	let grp = {}

	if (type === "days") {
		grp = {
			year: {
				$year: "$full_date",
			},
			month: {
				$month: "$full_date",
			},
			dayOfMonth: {
				$dayOfMonth: "$full_date",
			},
		}
	}

	if (type === "month") {
		grp = {
			year: {
				$year: "$full_date",
			},
			month: {
				$month: "$full_date",
			},
		}
	}
	if (type === "hours") {
		grp = {
			year: {
				$year: "$full_date",
			},
			month: {
				$month: "$full_date",
			},
			dayOfMonth: {
				$dayOfMonth: "$full_date",
			},
			hour: {
				$hour: "$full_date",
			},
		}
	}

	return OnlineStats.aggregate([
		{
			$match: {
				$and: [
					{
						full_date: {
							$lte: end,
						},
					},
					{
						full_date: {
							$gte: start,
						},
					},
				],
			},
		},
		{
			$sort: {
				date: -1,
			},
		},
		{
			$group: {
				_id: {
					...grp,
				},
				max: { $max: "$max" },
				min: { $min: "$min" },
				avg_min: { $avg: "$min" },
				avg_max: { $avg: "$max" },
			},
		},
		{
			$sort: {
				"_id.year": 1,
				"_id.month": 1,
				"_id.dayOfMonth": 1,
				"_id.hour": 1,
			},
		},
	])
}

module.exports = async function (req) {
	try {
		const timeStart = new Date()

		const offset = dayjs().utcOffset()
		let start = dayjs().add(offset, "minute").toDate()
		let last24hours = dayjs().subtract(24, "hour").toDate()
		let last7days = dayjs().subtract(14, "day").toDate()
		let last12months = dayjs().subtract(12, "month").toDate()

		let start_months = start
		let start_days = start
		let start_hours = start

		let end_months = last12months
		let end_days = last7days
		let end_hours = last24hours
		/*
		if (req.year)
		{
			end_months  = dayjs(`${req.year}-01-01`).add(offset, "minute").toDate()
			start_months= dayjs(`${req.year}-12-31`).add(offset, "minute").toDate()
		}
		if (req.year && !req.month)
		{
			end_days  	= dayjs(`${req.year}-01-01`).add(offset, "minute").toDate()
			start_days	= dayjs(`${req.year}-01-31`).add(offset, "minute").toDate()
		}
		if (req.year && !req.day)
		{
			end_hours  	= dayjs(`${req.year}-01-01`).add(offset, "minute").toDate()
			start_hours	= dayjs(`${req.year}-01-02`).add(offset, "minute").toDate()
		}
		*/
		const lasthours = await getLoggedStats("hours", end_hours, start_hours)
		const lastdays = await getLoggedStats("days", end_days, start_days)
		const lastmonths = await getLoggedStats("month", end_months, start_months)

		console.log("Time taken :", (new Date() - timeStart) / 1000)

		return {
			hours: req.year ? lastmonths : lasthours,
			lastdays: lastdays,
			lastmonths: lastmonths,
		}
	} catch (e) {
		console.error(e)
		return {}
	}
}
