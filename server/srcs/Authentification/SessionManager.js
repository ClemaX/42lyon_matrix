const config = require("../exports/config")
const axios = require("axios").default
const queue = require("../queue")
const app = require("../exports/main")


const { get_details } = require("../Utility.Students")

const { Session } = require("../../schemas/sessions")
const { Student } = require("../../schemas/students")
const { serverLogs } = require("../../schemas/ServerLogs")

const dayjs = require("dayjs")

const self = this

module.exports.SessionManager = {
	init: (client_id) => {
        if (app.clients[client_id])
            return
		app.clients[client_id] = {
			state: "ANONYMOUS",
			jwt: null,
			last: Date.now(),
			login: null,
			sockets: [],
		}
	},

	add: (client_id, socket_id) => {
		self.SessionManager.init(client_id)

		if (!app.sockets[socket_id]) {
			app.sockets[socket_id] = client_id
			app.clients[client_id].sockets.push(socket_id)
		}
	},

	remove: (socket_id) => {
		if (socket_id && app.sockets[socket_id]) {
			const client_id         = app.sockets[socket_id]
			const client_sockets    = app.clients[client_id].sockets
            const id                = client_sockets.indexOf(socket_id)
            
			app.clients[client_id].last = Date.now()

            if (id !== -1) 
                client_sockets.splice(id, 1)
            if (!client_sockets.length) 
                delete app.clients[client_id]
			delete app.sockets[socket_id]
		}
	},

    set_client: (socket_id, data) => {
		const client_id = self.SessionManager.get_client(socket_id)
        if (!client_id)
            return null
        app.clients[client_id] = {
            ...app.clients[client_id],
            ...data,
            last: Date.now()
        }
    },

	get_client: (socket_id) => {
        if (app.sockets[socket_id])
            return app.sockets[socket_id]
		return null
	},

    get_infos: (socket_id) => {
		const client_id = self.SessionManager.get_client(socket_id)
        const client_infos = app.clients?.[client_id]
        return client_infos
    },

	get_sockets: (socket_id) => {
		const client_id = self.SessionManager.get_client(socket_id)

        if (!client_id)
            return null
		return app.clients[client_id].sockets
	},

	emit: (socket_id, event, data) => {
		const client_id = self.SessionManager.get_client(socket_id)
        if (!client_id || !app.clients[client_id].sockets.length)
            return
		app.clients[client_id].last = Date.now()
        for (const id of app.clients[client_id].sockets)
            app.io.to(id).emit(event, data)
	},
}
