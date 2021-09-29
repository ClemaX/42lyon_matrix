const config = require("./exports/config")
const axios = require("axios").default
const queue = require("./queue")
const app = require("./exports/main")

const getLoggedStats = require("../sockets/getLoggedStats")
const getOnline = require("../sockets/getOnline")
const getLogtime = require("../sockets/getLogtime")
const getRankings = require("../sockets/getRankings")
const getCoalitions = require("../sockets/getCoalitions")


const { Session } = require("../schemas/sessions")
const { Student } = require("../schemas/students")

const { serverLogs } = require("../schemas/ServerLogs")


const { SessionManager } = require("./Authentification/SessionManager")
const Login = require("./Authentification/Login")

const http = require("http").createServer()
const dayjs = require("dayjs")

http.listen(5666)
app.io = require("socket.io")(http)

const sock_ping = {}
/*
setInterval(() => {

	const date_now = Date.now()
	for (const socket of Object.keys(sock_ping)) {
		if (Math.abs(sock_ping[socket] - date_now) >= (60) * 1000) {
			SessionManager.remove(socket)
			delete sock_ping[socket]
		}
	}

	for (const client of Object.values(app?.clients)) {
		for (const socket of client.sockets) {
			if (!sock_ping?.[socket]) {
				app.io.to(socket).emit("its-a-ping")
				sock_ping[socket] = Date.now()
			}
		}
	}
}, (60) * 1000)
*/

app.io.on("connection", (socket) => {
	socket.on("online-stats", (req) => {
		getLoggedStats(req).then((r) => socket.emit("online-stats", r))
	})

	socket.on("getOnline", () => {
		getOnline(socket).then((r) => socket.emit("getOnline", r))
	})

	socket.on("get_logtime", () => {
		getLogtime(socket).then((r) => socket.emit("get_logtime", r))
	})

	socket.on("server-logs", async () => {
		const result = await serverLogs.find({}).limit(50).sort({ date: -1 })
		socket.emit("server-logs", { logs: result })
	})

	socket.on("get", async (req) => {
		getRankings(req).then(r => socket.emit("data", r))
	})

	socket.on("get-coalitions", (req) => {
		getCoalitions(req).then((r) => socket.emit("get-coalitions", r))
	})

	socket.on("handshake", (res) => {
		SessionManager.add(res, socket.id)
	})

	socket.on("disconnect", () => {
		SessionManager.remove(socket.id)
	})
/*
	socket.on("its-a-ping", () => {
		if (sock_ping[socket.id]) {
			delete sock_ping[socket.id]
		}
	})*/

	socket.on("authentication", async (req) => {
		if (req.type === "code" && req.code) {
			app.log("INFO", "authentification", "Authentification started.")
			SessionManager.emit(socket.id, "authentication", {
				type: "queued",
				step: 1,
			})
			queue.push(Login.auth_42_init, [req.code, socket], 50, "auth_42_init")
		}

		if (req.type === "jwt" && req.jwt) {
			try {
				app.log("INFO", "JWT", "Authentification via JWT started.")
				const result = await Session.findOne({ jwt: req.jwt })
				if (!result) {
					socket.emit("authentication", { type: "jwt_error" })
					return
				}
				if (dayjs().unix() - dayjs(result?.date).unix() >= 345600) {
					await Session.deleteOne({ jwt: req.jwt })
					socket.emit("authentication", { type: "jwt_error" })
					return
				}

				if (Login.check_fingerprint(socket, result?.fingerprint)) {
					const stud = await Student.findOne({ id: result.student_id }).select("login data.image_url")
					if (!stud) {
						socket.emit("authentication", {
							type: "jwt_error",
							msg: "STUDENT_DETAILS_MISSING_FROM_DATABASE",
						})
						app.log("ERROR", "JWT", `Database error.`)
						await Session.deleteOne({ jwt: req.jwt })
						return
					}
					socket.emit("authentication", { type: "jwt_success", data: stud })
					socket.emit("authentication", {
						type: "student_data",
						data: {
							login: stud.login,
							image_url: stud.data.image_url,
						},
					})
					app.log("INFO", "JWT", `${stud?.login} is back in the matrix.`)
					SessionManager.set_client(socket.id, { state: "LOGGED", jwt: req.jwt, login: stud?.login })
				} else {
					app.log("ERROR", "JWT", `JWT verificatiin failed. Access denied.`)
					socket.emit("authentication", {
						type: "jwt_error",
						msg: "FINGERPRINT_MISMATCH",
					})
				}
			} catch (e) {
				app.log("ERROR", "JWT", `An error occured during jwt authentification.`)
				socket.emit("authentication", { type: "jwt_error" })
			}
		}
	})
})
