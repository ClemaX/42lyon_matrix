const app = require("./exports/main")
const Scrapper = require("./scrapper")

module.exports.queue 	= []
module.exports.current 	= 0


module.exports.pending 	= [null, null]
module.exports.failed 	= []
module.exports.aborted 	= []


const self = this

module.exports.push = function (func, args = [], priority = 0, name = "") {
	this.queue.push({
		date: new Date(),
		state: "WAITING",
		args: args,
		priority: priority,
		fct: func,
		tries: 0,
		last_try: new Date(),
		uid: parseInt(new Date().getTime()) + "-" + parseInt(Math.random() * 1000),
		name,
	})
	self.queue.sort((a, b) => {
		return b.priority - a.priority
	})

}

async function fct() {
	return new Promise((resolve, reject) => {
		try {

			const rnd0 = parseInt(Math.random() * 2)
			const rnd2 = parseInt(Math.random() * 3000 + 1)
			setTimeout(() => {
				if (rnd0)
					resolve()
				else
					reject("nope rnd")
			}, rnd2)
		}
		catch (e) {
			reject(e)
		}
	})
}

function add_pending(data) {
	if (data?.state === "FAILED")
		data.state = "WAITING"
	//if (!data?.fct)
	//	return
	data.date = Date.now()
	if (self.pending[0] && !self.pending[1])
		self.pending[1] = {...data}
	if (!self.pending[0] && self.pending[1])
		self.pending[0] = {...data}
	if (!self.pending[0] && !self.pending[1])
		self.pending[0] = {...data}
}

function handle_error(data, error) {
	data.state = "FAILED"
	data.tries++
	self.failed.push({...data})
	self.failed.sort((a, b) => {
		return b.priority - a.priority
	})
	if (error?.error?.includes("Not authorized")) {
		app.log("ERROR", "QUEUE", "Access denied for API42.")
		self.push(Scrapper.get_token, [false, true], 1000, "refresh_token")
	}
	if (error?.error?.includes("invalid_grant")) {
		
	}
}

module.exports.handle = function() {
	/*
		console.log("Waiting: ", self.queue.length)
		console.log("Failed: ", self.failed.length)
		console.log("Aborted: ", self.aborted.length)
		console.log("")
		console.log(self.queue)
		console.log(self.pending)
	*/

	const _now = Date.now()

	const master_queue 			= this.queue.find((e) => e?.priority >= 1000 && e?.state !== "SUCCESS")

	if (master_queue) {
		app.log("INFO", "QUEUE", "HIGH PRIORITY FUNCTION DETECTED")
		if (this.pending[0] && self.pending[1]) {
			handle_error(this.pending[0], {})
			this.pending[0] = null
			handle_error(this.pending[1], {})
			this.pending[1] = null
		}
		if (this.pending[0] && !self.pending[1]) {
			handle_error(this.pending[0], {})
			this.pending[0] = null
		}
		if (!this.pending[0] && self.pending[1]) {
			handle_error(this.pending[1], {})
			this.pending[1] = null
		}
	}


	for (const p of self.pending) {
		if (p)
			continue
		const master_queue_pending 	= this.pending.find((e) => e?.priority >= 1000 && e?.state !== "SUCCESS")
		if (self.failed[0] && !master_queue_pending && !master_queue) {
			add_pending(self.failed[0])
			self.failed.shift()
		}
	}

	for (const p of self.pending) {
		if (p)
			continue
		const master_queue_pending 	= this.pending.find((e) => e?.priority >= 1000 && e?.state !== "SUCCESS")
		if (self.queue[0] && !master_queue_pending) {
			add_pending(self.queue[0])
			self.queue.shift()
		}
	}
	
	for (const i in self.pending) {
		const q = self.pending[i]
		if (q && q?.state === "WAITING") {
			q.state = "PENDING"
			q.fct.apply(q.ref || q.fct, q.args)
				.then(() => {
					self.pending[i] = null
				})
				.catch((error) => {
					if (q.tries < 3)
						handle_error({...q}, error)
					else
						self.aborted.push({...q})
					self.pending[i] = null
				})
		}
		if (q && q?.state === "PENDING" && Math.abs(_now - q.date) >= 15000) {
			self.pending[i] = null
		}
	}
}

module.exports.test = function () {
	
	for (let i = 0; i < 40; i++) {
		self.push(fct, [], parseInt(Math.random() * 20 + 1), `${i}`)
	}

	for (const q of self.queue) {
		console.log(q.state, q.priority, q.name)
	}
	
}

setInterval(() => {
	for (const q of self.queue) {
		//console.log(q.state, q.priority, q.name)
	}
}, 200);

setInterval(() => {
	self.handle()
}, 1000)

module.exports.add = function (config) {
	//console.log("Adding to queue", func, args, priority)

	if (typeof config.func !== "function") return
	this.queue.push({
		date: new Date(),
		state: "WAITING",
		args: config.args || [],
		priority: config.priority || 0,
		fct: config.func,
		ref: config.this || null,
		tries: 0,
		uid: parseInt(new Date().getTime()) + "-" + parseInt(Math.random() * 1000),
	})
}

module.exports.pop = function () {
	let count = 0
	let curr = 0

	/*
	app.io.emit("server", {
		type: "queue", 
		state: "pop",
		length: this.queue.length,
		queue: this.queue
	})
	*/

	return
	if (this.queue.length) console.log(this.queue.length)

	if (!this.queue.length) return

	const tmp = [
		{
			index: -1,
			priority: -1,
		},
		{
			index: -1,
			priority: -1,
		},
	]

	if (self.current >= 2) {
		console.error("Queue full")
		return
	}

	if (this.current == 0)
		for (let i = 0, len = this.queue.length; i < len; i++) {
			if (this?.queue[i]?.priority > tmp[1]?.priority && tmp[0].index != i) {
				tmp[1] = this.queue[i]
				tmp[1].index = i
				self.queue.splice(i, 1)
			}
		}
	if (tmp[1].index != -1) self.current++

	if (this.current == 0 || this.current == 1)
		for (let i = 0, len = this.queue.length; i < len; i++) {
			if ((this?.queue[i]?.priority > tmp[0]?.priority) & (tmp[1].index != i)) {
				tmp[0] = this.queue[i]
				tmp[0].index = i
				self.queue.splice(i, 1)
			}
		}
	if (tmp[0].index != -1) self.current++

	for (const e of tmp) {
		if (e.index != -1 && e.priority != -1) {
			e.fct(...e.args)
				.then(() => {
					try {
						self.current--
					} catch (e) {
						self.current--
						//console.error(e)
					}
				})
				.catch((e) => {
					self.current--
					//console.error(e)
					//this.queue.splice(e.index, 1)
				})
		}
	}
}

module.exports.lst = 0

async function getFromQ(queue, alq) {
	const tmp = {
		index: -1,
		priority: -1,
	}
	for (let i = 0, len = queue.length; i < len; i++) {
		const q = queue[i]
		const diff = Math.abs(q?.last_try.getTime() - new Date().getTime()) / 1000
		if (
			q?.priority > tmp?.priority &&
			q.state === "WAITING" &&
			i !== alq.index &&
			((q?.tries >= 1 && diff >= 5) || !q?.tries)
		) {
			tmp.index = i
			tmp.priority = q.priority
			//self.queue.splice(i, 1)
		}
	}
	if (tmp.index !== -1) {
		queue[tmp.index].state = "PENDING"
		queue[tmp.index].last_try = new Date()
	}

	if (tmp.index !== -1) {
		self.current++
		self.lst++

		try {
			await queue[tmp.index].fct.apply(queue[tmp.index].ref || queue[tmp.index].fct, queue[tmp.index].args)
			self.current--
			queue[tmp.index].state = "SUCCESS"
		} catch (error) {
			queue[tmp.index].state = "FAILURE"
			if (error?.error?.includes("Not authorized")) {
				app.log("ERROR", "QUEUE", "Access denied for API42.")
				self.push(Scrapper.get_token, [false, true], 1000, "refresh_token")
			}
			if (error?.error?.includes("invalid_grant")) {
				queue[tmp.index].state = "ABORTED"
			}
			self.current--
		}

		/*
		queue[tmp.index].fct(...queue[tmp.index].args).then(() => {
			self.current--
			queue[tmp.index].state = "SUCCESS"
		}).catch((e) => {
			queue[tmp.index].state = "FAILURE"
			self.current--
				//this.queue.splice(e.index, 1)
		})
		*/
		return tmp
	}
	//self.queue.splice(tmp.index, 1)
}

module.exports.timeStart = 0

module.exports.pop = function () {
	const tmp = [
		{
			index: -1,
			priority: -1,
		},
		{
			index: -1,
			priority: -1,
		},
	]

	const master_queue = this.queue.find((e) => e?.priority >= 1000 && e?.state !== "SUCCESS")

	if (master_queue) {
		app.log("INFO", "QUEUE", "HIGH PRIORITY FUNCTION DETECTED")
		getFromQ(this.queue, tmp[1])
		return
	}

	/*
	app.io.emit("server", {
		type: "queue", 
		state: "pop",
		length: this.queue.length,
		queue: "", //this.queue,
		current: this.current,
		elapsed: self.queue.length ? (new Date() - self.timeStart) / 1000 : 0
	})

	*/
	if (this.queue.length && this.timeStart === 0) this.timeStart = new Date()

	if (self.current === 1 || self.current === 0) tmp[0] = getFromQ(this.queue, tmp[1])
	if (self.current === 0) tmp[1] = getFromQ(this.queue, tmp[0])

	// tmp[0] = getFromQ(this.queue, tmp[1])
	// tmp[1] = getFromQ(this.queue, tmp[0])

	const waitings = self.queue.filter((e) => e.state === "WAITING")
	const success = self.queue.filter((e) => e.state === "SUCCESS")
	const failures = self.queue.filter((e) => e.state === "FAILURE")

	if (!waitings.length) {
		for (const e of failures) {
			const id = self.queue.indexOf(e)
			if (id !== -1 && e.tries < 3) {
				self.queue[id].state = "WAITING"
				self.queue[id].tries++
			} else if (id !== -1) {
				self.queue[id].state = "ABORTED"
			}
		}
	}
	if (success.length === self.queue.length && this.timeStart !== 0) {
		//self.queue = []
		//console.log((new Date() - self.timeStart) / 1000)
		self.timeStart = 0
	}

	const tmp_sckt = []
	for (const q of self.queue) {
		tmp_sckt.push({
			name: q?.name,
			date: q?.date,
			state: q?.state,
			tries: q?.tries,
			priority: q?.priority,
		})
	}
	if (tmp_sckt.length) app.io.emit("server-queue", tmp_sckt)

	this.lst = 0
}

module.exports.clean = function () {
	for (const e of this.queue) {
		//console.log(e?.date, e?.state, e?.uid, e?.name)
	}
	const clean = this.queue.filter((e) => e?.state !== "SUCCESS" && e?.state !== "ABORTED")
	this.queue = clean
}
