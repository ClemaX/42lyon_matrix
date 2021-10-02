
import { writable } from "svelte/store"

let authentication = writable({
	type: null
})

let socket_data = writable({
	type: null,
})

let evt = writable({
	authentication: {
		type: null
	},
	data:  {
		type: null,
		data: []
	}
})

let state = writable({
	logged: false,
	state: false
})

let student = writable({
	login 	: null,
	image	: null
})

let socket = io("/api/")
export { socket, authentication, state, socket_data, student }
