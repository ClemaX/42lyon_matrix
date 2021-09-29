const app = require("../srcs/exports/main")
const { OnlineStats } = require("../schemas/stats")
const dayjs = require("dayjs")

const { Logged } = require("../schemas/logged")
const { Students } = require("../schemas/students")
const ScrapperLogtime = require("../srcs/Scrapper.Logtime")
const { Location } = require("../schemas/logtime")
const { SessionManager } = require("../srcs/Authentification/SessionManager")

require("dayjs/locale/fr")
dayjs.locale("fr")

module.exports = async function (socket) {
	try {
        let result = []
        let last_upd = []
        let current = []

        const login = SessionManager.get_infos(socket.id)?.login
        if (login) {
            last_upd = await Location.findOne({host: "MATRIX-DATA"})
            current = await Logged.findOne({ login: login })
            result = await ScrapperLogtime.get_logtime(login)

            if (current) {
                const uptime = dayjs().diff(current.begin_at, "minute")
                current = uptime
            }
        }
		return {
            result,
            last_update: last_upd?.end_at || null,
            current
        }
	} catch (e) {
		console.error(e)
		return {}
	}
}
