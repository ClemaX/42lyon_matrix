
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

let socket = io(window.location.hostname === "localhost" ? "localhost:5666" : "/")
export { socket, authentication, state, socket_data, student }