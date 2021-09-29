

function clusterfuck(z, data, exception_str, yignore, reversed) {
	const result = []
	let index = 0
	const count = data.length
	const to_ignore = (y) => {
		if (!yignore)
			return false
		if (yignore === 1)
			return (y % 2 === 0)
		if (yignore === 2)
			return (y % 2 !== 0)
		return false
	}
	for (let x = 0; x < count; x++) {
		result[x] = []
		for (let y = 0; y < data[x]; y++) {
			if (exception_str.includes(`z${z}r${x + 1}p${y + 1}`)) {
				result[x][y] = { active: 0 }
			}
			else if (to_ignore(y)) {
				result[x][y] = { reversed: reversed, active: -1 }
			}
			else
				result[x][y] = {
					active: 1,
					reversed: reversed,
					location: `z${z}r${x + 1}p${y + 1}`,
				}
			index++
		}
	}
	return result
}

function clusterfakfak(z, ymax, xmax, exception, reverse) {
	const result = []

	for (let x = 0; x < xmax; x++) {
		result[x] = []
		for (let y = 0; y < ymax; y++) {
			const loc = `z${z}r${x + 1}p${ymax - (y )}`

			if (exception.includes(loc))
				result[x][y] = { active: false, reverse }
			else
				result[x][y] = {
					active: true,
					location: loc,
					reverse
				}
		}
	}
	return result
}

function bottomcluster(z, coln, percoln, exclude) {
	const col = []
	let i = 0
	for (let x = 0; x < coln; x++) {
		col[x] = []

		for (let y = 0; y < percoln; y++) {
			col[x][y] = {
				active: 1,
				location: `z${z}r${x + 1}p${y + 1}`,
			}
			if (exclude.includes(i)) col[x][y] = { active: 0 }
			i++
		}
	}
	return col
}

function randomTest(debugLogin, random) {
	//const randomIDLogin = Math.floor(Math.random() * debugLogin.length) + 1

	for (const e of debugLogin) {
		const randomZ = 3
		const randomR = Math.floor(Math.random() * 13) + 1
		const randomP = Math.floor(Math.random() * 4) + 1
		random[`z${randomZ}r${randomR}p${randomP}`] = e
	}
}

export default { clusterfuck, bottomcluster, randomTest, clusterfakfak }
