const config = require("../exports/config")
const axios = require("axios").default
const queue = require("../queue")
const app = require("../exports/main")

const { SessionManager } = require("./SessionManager")

const { Session } = require("../../schemas/sessions")
const { Student } = require("../../schemas/students")

const { get_details } = require("../Utility.Students")

const self = this

module.exports.check_fingerprint = function (socket, fingerprint) {
	const user_agent = socket?.request?.headers["user-agent"]
	const ip_address = socket?.request?.connection?.remoteAddress

	const current_fingerprint = {
		ua: user_agent,
		ip: ip_address,
	}
    return (JSON.stringify(current_fingerprint) === JSON.stringify(fingerprint))
}


async function generate_uuid(socket, id) {
	const user_agent = socket.request.headers["user-agent"]
    const ip_address = socket.request.connection.remoteAddress
    
	const fingerprint = {
		ua: user_agent,
		ip: ip_address,
	}

	const jwt = {
		created_at: new Date(),
		id: id,
	}

	const uuid =
		Buffer.from(JSON.stringify(jwt)).toString("base64") +
		"." +
		Buffer.from(Math.random().toString(36).substr(2, 9)).toString("base64") +
		Buffer.from(Date.now().toString()).toString("base64")

	return new Promise((resolve, reject) => {
        Session.create({ jwt: uuid, fingerprint: fingerprint, student_id: id })
            .then(() => resolve(uuid))
            .catch(e => reject(e))
	})
}

module.exports.auth_42_end = async function(token, socket) {
    const uri = `${config.api_url}/v2/me/`
	const conf = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
    }
    return new Promise(async (resolve, reject) => {
		try {
			const api_result    = await axios.get(uri, conf)
			const jwt           = await generate_uuid(socket, api_result.data.id)

			SessionManager.set_client(socket.id, { state: "LOGGED", jwt: jwt, login: api_result?.data?.login })
            const supl = get_details(api_result?.data)
            
			await Student.updateOne( { id: api_result?.data?.id },
				{
					data: api_result?.data,
					login: api_result?.data?.login,
					...supl,
				},
				{ upsert: true }
			)
				.then(async () => {
					SessionManager.emit(socket.id, "authentication", {
						type: "auth_success",
						data: api_result.data.id,
						jwt: jwt,
					})
					SessionManager.emit(socket.id, "authentication", {
						type: "student_data",
						data: {
							login: api_result.data.login,
							image_url: api_result.data.image_url,
						},
					})
                    app.log("INFO", "authentification", `Authentification successfull for ${api_result?.data?.login}`)
                    resolve()
                    return 
				})
				.catch((err) => {
					SessionManager.emit(socket.id, "authentication", { type: "error" })
					app.log("ERROR", "authentification", `Authentification failed for ${api_result?.data?.login}`)
					reject(err)
                })
            reject()
            return
		} catch (e) {
            SessionManager.emit(socket.id, "authentication", { type: "error" })
			reject()
		}
	})
}

module.exports.auth_42_init = async function (query_code, socket) {
	const uri = `${config.api_url}${config.token_endpoint}`
	const data = {
		grant_type: "authorization_code",
		client_id: config.uid,
		client_secret: config.secret,
		redirect_uri: config.redirect_uri,
		code: query_code,
    }
    return new Promise(async (resolve, reject) => {
        try {
            const result = await axios.post(uri, data)
            app.log("INFO", "authentification", "Got response from API42.")
            SessionManager.emit(socket.id, "authentication", {
                type: "queued",
                step: 2,
            })
            queue.push(self.auth_42_end, [result.data.access_token, socket], 40, "auth_42_end")
            resolve()
        } catch(error) {
            console.error(error?.response?.data)
            reject(error?.response?.data)
        }
    })
}

