module.exports.get_details = function (data) {
	let pool_level = -1
	let level = -1
	let blackhole_date = null
	let status = null

	for (const cursus of data?.cursus_users) {

		if (cursus?.cursus.name?.toLowerCase()?.includes("piscine")) {
			pool_level = cursus?.level
		}
		
		if (cursus?.cursus.name?.toLowerCase()?.includes("42") && level === -1) {
			t = cursus?.cursus.name
			level = cursus?.level
			blackhole_date = cursus?.blackholed_at
		}
		if (cursus?.cursus.name?.toLowerCase()?.includes("42cursus")) {
			t = cursus?.cursus.name
			level = cursus?.level
			blackhole_date = cursus?.blackholed_at
		}
	}
	if (blackhole_date !== null) blackhole_date = new Date(blackhole_date).getTime() - new Date().getTime()
	else blackhole_date = null

	const supl = {
		pool_level: pool_level,
		pool_month: data?.pool_month,
		pool_year: data?.pool_year,
		to_blackhole: blackhole_date,
		level: level,
		correction_point: data?.correction_point,
		wallet: data?.wallet,
		status: status,
	}
	return supl
}
