/*
module.exports.getPoolData = function(page = 1) {
	const uri = `${config.api_url}/v2/users?filter[pool_month]=august&filter[pool_year]=2020&campus_id=${config.campus_id}&page[size]=100&page[number]=${page}`
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios.get(uri)

			console.log(page, result.data.length)
			for (const e of result.data) {
				await Student.create({
					id: e.id,
					login: e.login,
					last_update: new Date()
				}, (err, res) => {})
			}
			if (result.data.length === 100)
				queue.push(self.getPoolData, [page + 1], 0)
			resolve()

		} catch(e) {
			console.error(e)
			reject()
		}
	})
}
*/

module.exports.startpool = async function () {
	const _startTime = Date.now()
	const result = await Student.find({
		"data.cursus_users.begin_at": { $gte: "2020-08" },
	})
		.select("login data.cursus_users.level")
		.sort({ "data.cursus_users.level": -1 })

	const runtime = ("Runtime in MS: ", Date.now() - _startTime)

	let longest_name = 0
	let max_lv = 0
	let maxlvsize = 0

	for (const e of result) {
		if (e.login.length > longest_name) longest_name = e.login.length
		if (e.data.cursus_users[0].level > max_lv) max_lv = e.data.cursus_users[0].level
		if (e.data.cursus_users[0].level.toFixed(2).toString().length > maxlvsize)
			maxlvsize = e.data.cursus_users[0].level.toFixed(2).toString().length
		//console.log(e.login, "      \t\t", e.data.cursus_users[0].level)
		//console.log({category: e.login, "colmun-1": e.data.cursus_users[0].level}, ",")
	}

	for (const e of result) {
		const tsize = longest_name - e.login.length

		console.log(
			e.login,
			" ".repeat(longest_name - e.login.length),
			"|",
			e.data.cursus_users[0].level.toFixed(2),
			" ".repeat(Math.abs(maxlvsize - e.data.cursus_users[0].level.toFixed(2).toString().length)),
			"|",
			"|".repeat((e.data.cursus_users[0].level / max_lv) * 100)
		)
	}

	console.log(runtime)
	console.log(result.length)
}

module.exports.getStudPool = function (id) {
	const uri = `${config.api_url}/v2/users/${id}`
	console.log("Scrapping", id)
	return new Promise(async (resolve, reject) => {
		try {
			const result = await axios.get(uri)

			const pool = result.data.cursus_users.filter((e) => e.cursus.id === 9)[0]
			console.log("Scrapped", pool.user.login)
			dbb.db.stats.serialize(() => {
				const stmt = dbb.db.stats.prepare("UPDATE pool SET level = ? WHERE student_id = ?")
				stmt.run(pool.level, pool.user.id)
			})

			resolve()
		} catch (e) {
			console.error(e)
			reject()
		}
	})
}
