const app = require("../srcs/exports/main")
const { OnlineStats } = require("../schemas/stats")
const dayjs = require("dayjs")

const { Logged } = require("../schemas/logged")
const { Student } = require("../schemas/students")

require("dayjs/locale/fr")
dayjs.locale("fr")

module.exports = async function (req) {
	try {
		
        if (["wallet", "correction_point", "level"].includes(req.data)) {
			const _startTime = Date.now()
			const result = []
			const supl = {}
			
			if (req?.year) {
				supl.pool_year = req?.year
			}
			const r = await Student.find(
                { 
                    "data.staff?": false, 
					status: null,
					...supl
                },
				{ 
                    login: 1, 
                    "data.image_url": 1, 
                    [req.data]: 1,
                    "pool_month": 1,
                    "pool_year": 1,
                    "last_update": 1
                },
				{ 
                    limit: 20, 
                    skip: req.page * 20
                }
			).sort({ [req.data]: -1 })

			const re = await Student.findOne({...supl, "data.staff?": false, status: null}, { [req.data]: 1 }, { limit: 1 }).sort({ [req.data]: -1 })

			const runtime = Date.now() - _startTime
			for (const e of r) {
				result.push({
					login: e.login,
					image_url: e.data.image_url,
                    value: e[req.data],
                    pool_year: e?.pool_year,
                    pool_month: e?.pool_month,
                    last_update: e?.last_update
				})
			}

			return {
				type: "ranking-" + req.data,
				data: result,
				max: re[req.data],
				time: runtime,
			}
		}

		return {}
	} catch (e) {
		console.error(e)
		return {}
	}
}
