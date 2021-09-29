const app = require("../srcs/exports/main")
const { OnlineStats } = require("../schemas/stats")
const dayjs = require("dayjs")

const { Coalitions } = require("../schemas/stats")

require("dayjs/locale/fr")
dayjs.locale("fr")

module.exports = async function (req) {
	try {
        const today = dayjs().format("YYYY-MM-DD")
        const result = await Coalitions.find({
            date: {
                $gte: today
            }
        })
        const test = []
        if (result) {
            for (const c of result) {
                test.push ({name: c?.coalition_name, points: c?.coalition_points})
            } 
        }
		return test
	} catch (e) {
		console.error(e)
		return {}
	}
}
