<script>
	import { socket, state } 		from "./store.js"
	import { onDestroy, onMount } from "svelte";
	import dayjs from "dayjs";
	import											'dayjs/locale/fr'

	function logout() {
		state.update(o => ({...o, logged: false}))
		document.cookies = ""
		window.localStorage.clear()
		window.location.reload(true)
	}

	function create_chart(canvas, data) {
		return new Chart(canvas, {
			type: "bar",
			data: {
				labels: data.labels,
				datasets: []
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					xAxes: [{
						stacked: true
					}],
				},
				onClick: (...args) => {
					console.log(...args)
				}
			}
		})
	}

	function update_chart(chart) {
		const datasets_options = {
			fill: 'origin',
			lineTension: 0.3,
			borderWidth: 1,
			pointRadius: 1,
			pointHoverRadius: 3,
			pointHitRadius: 6
		}


		let bgColorsMax = '#BB86FC'

		charts[chart].data.datasets = []
		charts[chart].data.labels = stats[chart].labels
		charts[chart].data.datasets.push({
				label: 'Logtime of the day (in minutes)',
				data: stats[chart].value,
				backgroundColor: bgColorsMax + "77",
				borderColor: bgColorsMax,
				...datasets_options
			})
		charts[chart].update()
	}
	
	let total_month = 0
	let last_update = 0
	let current = 0

	let stats = {
		days: {
			labels : [],
			value : [],
		},
	}
	let canvas = {
		days	: null,
	}
	let charts = {
		days	: null,
	}

	onMount(() => {
		charts.days = create_chart(canvas.days, stats.days)

		const ndays = new Date(2020, 11, 0).getDate()
		for (let i = 0; i < ndays; i++) {
			stats.days.labels.push(`${i + 1}`)
			stats.days.value.push(0)
		}

		socket.emit("get_logtime", {})
		socket.on("get_logtime", res => {
			last_update = res?.last_update
			for (const key of Object.keys(res.result)) {
				const day = dayjs(key).format("DD")
				stats.days.value[parseInt(day) - 1] = res.result[key]
				stats.days.labels[parseInt(day) - 1] = `${parseInt(day) } (${parseInt(res.result[key] / 60)}h ${res.result[key]% 60}m)`
				total_month += res.result[key]
			}
			current = res?.current
			if (current) {
				const today_day = parseInt(dayjs().format("DD"))
				stats.days.value[today_day - 1] += current
				stats.days.labels[today_day - 1] = `${parseInt(today_day) } (${parseInt(stats.days.value[today_day - 1] / 60)}h ${stats.days.value[today_day - 1]% 60}m)`

			}
			update_chart("days")
		})
	})

	onDestroy(() => {
		socket.off("get_logtime")	
	})

</script>

<div class="content">
	<!--<div class="header">My Profile</div>-->

	<div class="month-logtime">
		Current month logtime : <b>{`${parseInt((total_month + current) / 60)}h ${(total_month + current) % 60}m`}</b>
	</div>
	<div class="chart-container first-chart" style="transition: all .3s linear; position: relative; height:100%; width:100%">
		<canvas id="myChart" bind:this={canvas.days}></canvas>
	</div>


	<div class="last-update">
		last update : {last_update ? dayjs(last_update).format("DD/MM, HH[h]mm") : 'unknown'}
	</div>

	<button type="button" class="btn btn-full" style="margin-top: 42px" on:click="{logout}">logout</button>
</div>


<style type="text/sass">
	@import "./assets/Component";
	.content
		position: relative
		top: 78px
		padding: 16px
		margin-left: auto
		margin-right: auto
		height: 256px
		width: 80%

	.last-update
		font-size: 14px
	.month-logtime
		text-align: center
		font-family: 'Open Sans', sans-serif
		font-size: 32px
		margin-bottom: 46px
		b
			font-size: 36px

</style>