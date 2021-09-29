const config = require("./exports/config")
const axios = require("axios").default
const dayjs = require("dayjs")
const app = require("./exports/main")
// Main shared variables
const queue = require("./queue")

const { Location } = require("../schemas/logtime")
const { Student } = require("../schemas/students")
const { get_details } = require("../srcs/Utility.Students")
const { getDefaultSettings } = require("http2")


const self = this


module.exports.get_active_student_data = async () => {
    try {
        const last_six_months = dayjs().subtract(6, "months").toDate()
        let from_database = await Location.aggregate(
            [
                {
                    $match: {
                        begin_at: {
                            $gte: last_six_months
                        }
                    }
                },
                {
                    $group: {
                        _id: { id : "$user.id" }
                    }
                },
                {
                    $project: {
                        "user.id": 1
                    }
                }
            ]
        )
        from_database = from_database.map(v => v?._id?.id)
        const today = dayjs().unix()
        for (const stud_id of from_database) {
            const result    = await Student.findOne({ id: stud_id }, "last_update")
            const date      = result?.last_update ? dayjs(result?.last_update).unix() : 0
            if (today - date >= 90 * 1000) {
                queue.push(self.get_student_data, [stud_id], 1, `get_active_student_data ${stud_id}`)
            }
        }
     }
    catch(error) {
        console.error(error)
    }
}

module.exports.get_student_data = async (id) => {
	const uri = `${config.api_url}/v2/users/${id}`

	return new Promise(async (resolve, reject) => {
		app.log("INFO", "get_student_data", `Starting aggregation for student ${id}.`)
		await axios.get(uri)
			.then(async (r) => {
                Student.updateOne({ id: id }, 
                    {
                        id: id,
                        login: r?.data?.login,
                        data: r?.data,
                        ...get_details(r?.data),
                        last_update: new Date()
                    },
                    { upsert: 1 })
                    .then(() => {
		                app.log("INFO", "get_student_data", `Starting aggregation for student ${id}, ${r?.data?.login}.`)
                        resolve()
                    })
                    .catch(e => {
                        reject(e)
                    })
			})
			.catch((error) => {
				reject(error?.response?.data)
			})
	})
}

module.exports.get_students = async (page) => {
	const uri = `${config.api_url}/v2/campus/${config.campus_id}/locations?sort=id&page[size]=100&page[number]=`

	return new Promise(async (resolve, reject) => {
        
        
		app.log("INFO", "get_student", `Starting aggregation.`)
		await axios
			.get(uri + page)
			.then(async (r) => {
				const count = r?.data?.length
				for (const e of r.data) {
					try {
						await Location.updateOne({ ...e }, { ...e }, { upsert: true })
					} catch (error) {
						console.error(e?.id, "does not need update")
					}
				}
				app.log("INFO", "get_location", `Got ${count} result(s) for page ${page}`)
				await Location.updateOne({ host: "MATRIX-DATA" }, { last_page: page }, { upsert: true })
				if (count >= 100) queue.push(self.getAllLocations, [page + 1], 1, "getAllLocations")
				else await Location.updateOne({ host: "MATRIX-DATA" }, { end_at: new Date() }, { upsert: true })
				resolve()
			})
			.catch((e) => {
				console.error(e)
				reject()
			})
	})
}
