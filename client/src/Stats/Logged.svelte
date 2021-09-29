<script>
	import { socket, student, socket_data } 		from "../store.js"
	import { each, onMount, onDestroy }				from "svelte/internal"
	import {push, location}									from 'svelte-spa-router'
	import dayjs									from "dayjs"
	import											'dayjs/locale/fr'

	dayjs.locale('fr')

	let bgColorsMax = 'rgba(54, 162, 235, .8)'
	let bgColorsMin = 'rgba(24, 80, 150, .8)'

	let bgColorsAvgMin = 'rgba(54, 162, 235, .8)'
	let bgColorsAvgMax = 'rgba(24, 80, 150, .8)'

	bgColorsMax = '#008FFB'
	bgColorsMin = '#00E396'


	bgColorsMax = '#BB86FC'
	bgColorsMin = '#FCD59F'

	let stats = {
		hours: {
			labels : [],
			min : [],
			max : [],
			avg_min : [],
			avg_max : []
		},
		days: {
			labels : [],
			min : [],
			max : [],
			avg_min : [],
			avg_max : []
		},
		months: {
			labels : [],
			min : [],
			max : [],
			avg_min : [],
			avg_max : []
		}
	}
	let canvas = {
		hours	: null,
		days 	: null,
		months 	: null
	}
	let charts = {
		hours	: null,
		days 	: null,
		months 	: null
	}

	function createChart(canvas, data) {
		return new Chart(canvas, {
			type: "line",
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

	onMount(() => {

		canvas.hours 	= document.getElementById('myChart').getContext('2d')
		canvas.days	 	= document.getElementById('chart-days').getContext('2d')
		canvas.months	= document.getElementById('chart-months').getContext('2d')

		socket.emit("online-stats", {})
		charts.hours 	= createChart(canvas.hours, stats.hours)
		charts.days 	= createChart(canvas.days, stats.days)
		charts.months 	= createChart(canvas.months, stats.months)

		socket.on("online-stats", res => {

			stats = {
				hours: {
					labels : [],
					min : [],
					max : [],
					avg_min : [],
					avg_max : []
				},
				days: {
					labels : [],
					min : [],
					max : [],
					avg_min : [],
					avg_max : []
				},
				months: {
					labels : [],
					min : [],
					max : [],
					avg_min : [],
					avg_max : []
				}
			}
			console.warn(res)
			if (res) {
				//fakeData(24 - res.hours.length, stats.hours)
				for (const e of res.hours)
				{
					stats.hours.min = [...stats.hours.min, e.min]
					stats.hours.max = [...stats.hours.max, e.max]

					//stats.hours.avg_min = [...stats.hours.avg_min, e.avg_min]
					//stats.hours.avg_max = [...stats.hours.avg_max, e.avg_max]

					const dateOfStat = dayjs(new Date(e._id.year, e._id.month - 1, e._id.dayOfMonth, e._id.hour, 0, 0))
					const ladate = dayjs(new Date(e._id.year, e._id.month - 1, e._id.dayOfMonth, 0, 0, 0, 0)).format("DD MMM HH[h]")
					const curr = dateOfStat.format("DD MMM").toString() === dayjs().format("DD MMM").toString()
					stats.hours.labels = [...stats.hours.labels, curr ? dateOfStat.format("HH[h]") : ladate]
				}

				//fakeData(7 - res.lastdays.length, stats.days)
				for (const e of res.lastdays) {
					stats.days.min = [...stats.days.min, e.min]
					stats.days.max = [...stats.days.max, e.max]
					stats.days.avg_min = [...stats.days.avg_min, e.avg_min]
					stats.days.avg_max = [...stats.days.avg_max, e.avg_max]
					const ladate = dayjs(new Date(e._id.year, e._id.month - 1, e._id.dayOfMonth, 0, 0, 0, 0)).format("DD MMM")
					stats.days.labels = [...stats.days.labels, ladate]
				}
				//fakeData(12 - res.lastmonths.length, stats.months)
				for (const e of res.lastmonths) {
					stats.months.min = [...stats.months.min, e.min]
					stats.months.max = [...stats.months.max, e.max]
					stats.months.avg_min = [...stats.months.avg_min, e.avg_min]
					stats.months.avg_max = [...stats.months.avg_max, e.avg_max]
					const ladate = dayjs(new Date(e._id.year, e._id.month, 0, 0, 0, 0, 0)).format("MMM YYYY")
					stats.months.labels = [...stats.months.labels, ladate]
				}
				
				updateData("hours")
				updateData("days")
				updateData("months")
			}
		})
	})


	
	function updateData(chart) {
		let bgColorsMax = 'rgba(54, 162, 235, .8)'
		let bgColorsMin = 'rgba(24, 80, 150, .8)'

		let bgColorsAvgMin = 'rgba(54, 162, 235, .8)'
		let bgColorsAvgMax = 'rgba(24, 80, 150, .8)'

		bgColorsMax = '#008FFB'
		bgColorsMin = '#00E396'

		bgColorsMax = '#BB86FC'
		bgColorsMin = '#FCD59F'

		const gradientMin = canvas[chart].createLinearGradient(0, 0, 0, 450)
		const gradientMax = canvas[chart].createLinearGradient(0, 0, 0, 450)

		gradientMin.addColorStop(0, bgColorsMin + '77')
		gradientMin.addColorStop(0.5, bgColorsMin + '44')
		gradientMin.addColorStop(1, bgColorsMin + '00')
		gradientMax.addColorStop(0, bgColorsMax + '77')
		gradientMax.addColorStop(0.5, bgColorsMax + '44')
		gradientMax.addColorStop(1, bgColorsMax + '00')
		
		const datasets_options = {

			fill: 'origin',
			lineTension: 0.3,
			borderWidth: 1,
			pointRadius: 1,
			pointHoverRadius: 3,
			pointHitRadius: 6
		}
		charts[chart].data.datasets = []
		if (chart === "months" || chart === "days")
			charts[chart].options.legend.display = false


		if (stats[chart].avg_max)
		{
			charts[chart].data.datasets.push({
				label: 'Average max logged students',
				data: stats[chart].avg_max,
				backgroundColor: gradientMax,
				borderColor: bgColorsAvgMax + "cc",
				...datasets_options
			})
		}
		if (stats[chart].avg_min)
		{
			charts[chart].data.datasets.push({
				label: 'Average min logged students',
				data: stats[chart].avg_min,
				backgroundColor: gradientMin,
				borderColor: bgColorsAvgMin + "cc",
				...datasets_options
			})
		}

		charts[chart].data.labels 	= stats[chart].labels
		charts[chart].data.datasets = [...charts[chart].data.datasets,
			{
				label	: 'Min logged students',
				data	: stats[chart].min,
				backgroundColor	: gradientMin,
				borderColor		: bgColorsMin + "cc",
				...datasets_options
			},
			{
				label	: 'Max logged students',
				data	: stats[chart].max,
				backgroundColor	: gradientMax,
				borderColor		: bgColorsMax + "cc",
				...datasets_options
			}
		]

		charts[chart].update()
	}

	onDestroy(() => {
		socket.off("online-stats")
	})

	let selectedYear = null
	$: {
		/*
		console.log(selectedYear)
		
		socket.emit("online-stats", {
			year : selectedYear,
		})
		try {
			document.querySelector(".third-chart").style.opacity = "0"
			document.querySelector(".second-chart").style.opacity = "0"			
		} catch(e) {}
		*/
	}

</script>

<div class="content">
	<!-- <select on:change={(e) => selectedYear = e.target.value}>
		<option value="realtime">---</option>
		<option value="2017">2017</option>
		<option value="2018">2018</option>
		<option value="2019">2019</option>
		<option value="2020">2020</option>
	</select> -->
	<div class="alert info">
		Server migration is still in progress, stats before <i>24 november 2020</i> are coming back. Soon™.
	</div>
	<div class="chart-container first-chart" style="transition: all .3s linear; position: relative; height:100%; width:100%">
		<canvas id="myChart"></canvas>
	</div>
	<div class="chart-container second-chart" style="transition: all .3s linear;position: relative; margin-top: 64px;height:100%; width:100%">
		<canvas id="chart-days"></canvas>
	</div>
	<div class="chart-container third-chart" style="transition: all .3s linear;position: relative; margin-top: 64px;height:100%; width:100%">
		<canvas id="chart-months"></canvas>
	</div>
</div>


<style type="text/sass">
	@import "../assets/Component";

	.content
		position: relative
		top: 78px
		padding: 16px
		margin-left: auto
		margin-right: auto
		height: 256px
		width: 80%
		max-width: 1280px
		min-width: 405px
</style>