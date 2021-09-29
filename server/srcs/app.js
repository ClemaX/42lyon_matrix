// Dependencies
const config = require("./exports/config")
const axios = require("axios").default
const dayjs = require("dayjs")
//const gtfs = require('gtfs');

// Main shared variables
const evt = require("./exports/events").evt
const db = require("./exports/databases.js").db
const { io } = require("./sockets")
const app = require("./exports/main")

// Modules
const scrapper = require("./scrapper")
const queue = require("./queue")
const ScrapperOnline = require("./Scrapper.Online")
const ScrapperLogtime = require("./Scrapper.Logtime")
const ScrapperStudents = require("./Scrapper.Students")

// Database
const { Logged } = require("../schemas/logged")
const { Student, StudentStat } = require("../schemas/students")
const { OnlineStats } = require("../schemas/stats")

// Sockets response routes
const getLoggedStats = require("../sockets/getLoggedStats")
const getOnline = require("../sockets/getOnline")

async function updateOld() {
	const everyDay = []
	const database = await OnlineStats.find({}).sort({ full_date: 1 })

	const curr_year = dayjs().format("YYYY")
	const curr_month = dayjs().format("MM")
	const curr_day = dayjs().format("DD")

	for (let y = 2017; y <= 2020; y++) {
		for (let m = 1; m <= 12; m++) {
			const max_d = new Date(y, m, 0).getDate()
			for (let d = 1; d <= max_d; d++) {
				for (let h = 1; h <= 24; h++) {
					const date = `${y}-${m}-${d} ${h}`
					if (y <= curr_year && m <= curr_month && d < curr_day)
						everyDay.push(dayjs(date).format("YYYY-MM-DD HH"))
					//console.log(
				}
			}
		}
	}

	console.log(everyDay)
	const fromDatabase = []
	const difference = []
	for (const e of database) {
		const date = dayjs(e.full_date).format("YYYY-MM-DD HH")
		fromDatabase.push(date)
	}

	for (const e of everyDay) {
		if (!fromDatabase.includes(e)) difference.push(e)
	}

	for (const n of difference) {
		const offset = dayjs().utcOffset()
		const date = dayjs(n).add(offset, "minute").toDate()

		try {
			await OnlineStats.create({
				full_date: date,
				min: 0,
				max: 0,
				avg: 0,
			})
		} catch (e) {
			console.error(e)
		}
	}
	console.log(everyDay.length)
	console.log(database.length)
	console.log(difference.length)
}

db.on("open", async () => {
	console.log("Connected to database")
	scrapper.get_token(true, true)

/*	const config = {
		"sqlitePath": "/home/slopez/Downloads/patate.sqlite",
		"agencies": [
			{
			  "agency_key": "TCL SYTRAL",
			  "path": "/home/slopez/Downloads/GTFS_TCL/"
			}
		  ],
	}
	/*gtfs.import(config)
		.then(() => {
			console.log('Import Successful');
		})
		.catch(err => {
			console.error(err);
		});
		
	const db = await gtfs.openDb(config);
		const routes = await gtfs.getRoutes(
		  {
			route_short_name: '86'
		  },
		  [
			'route_id',
			'route_short_name',
			'route_color'
		  ],
		  [
			['route_short_name', 'ASC']
		  ]
		);
		const trips = await gtfs.getTrips(
			{
			  route_id: '86Ar16'
			},
			[
			]
		  );
		
		  const stops = await gtfs.getStops({
			  route_id: '86Ar16',
			  stop_name: 'Campus Région numérique'
		  });

		  const stopTime = await gtfs.getStoptimes({
				stop_id: '2010',
		  });

		console.log(routes, trips, stops, stopTime)
		*/
})

// Event fired at online student update
evt.on("logged_students", (res) => {
	console.log("Logged students :", res.length)
	ScrapperOnline.update_stats(res.length)
	getOnline().then((r) => app.io.emit("getOnline", r))
})

let timeout_token 		= null
let interval_student 	= null
let interval_locations 	= null
let interval_rankings 	= null
let interval_coalitions = null
let task_running 		= false

const clearTimers = () => {
	app.log("INFO", "global", "Clearing intervals.")
	if (timeout_token) {
		clearTimeout(timeout_token)
		timeout_token = null
	}
	if (interval_student) {
		clearInterval(interval_student)
		interval_student = null
	}
	if (interval_locations) {
		clearInterval(interval_locations)
		interval_locations = null
	}
	if (interval_rankings) {
		clearInterval(interval_rankings)
		interval_rankings = null
	}
	if (interval_coalitions) {
		clearInterval(interval_coalitions)
		interval_coalitions = null
	}
}

evt.on("token_ready", (res) => {
	app.log("INFO", "global", "Main token event issued, initialising timers.")

	clearTimers()

	interval_coalitions = setInterval(() => {
		queue.push(scrapper.get_coalitions, [], 1, "get_coalitions")
	}, 60 * 120 * 1000)

	queue.push(scrapper.get_coalitions, [], 1, "get_coalitions")
	queue.push(ScrapperOnline.get_online, [1], 1, "get_online")
	queue.push(ScrapperLogtime.getAllLocations, [2512], 1, "getAllLocations")

	ScrapperStudents.get_active_student_data()
	interval_rankings = setInterval(() => {
		const date = new Date()
		if (date.getHours() === 3 && date.getMinutes() === 0 && !task_running) {
			ScrapperStudents.get_active_student_data()
			task_running = true
		}
		if (task_running && (date.getHours() >= 4 || date.getMinutes() >= 1)) {
			task_running = false
		}
	}, 30 * 1000)

	interval_student = setInterval(() => {
		queue.push(ScrapperOnline.get_online, [], 10, "get_online")
	}, 30000)

	interval_locations = setInterval(() => {
		if (!queue.queue.find((f) => f.name === "getAllLocations"))
			queue.push(ScrapperLogtime.getAllLocations, [0], 1, "getAllLocations")
	}, 60 * 30 * 1000)
})

setInterval(() => {
	//queue.pop()
	//queue.clean()
}, 1000)
