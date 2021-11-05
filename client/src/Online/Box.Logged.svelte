<script>

import { onDestroy, onMount } from "svelte";

import Online from "../Online.ClusterMap.svelte";
import { socket } from "../store";


	export let data;


	let total_month = 0
	let last_update = 0
	let current = 0

	let stats	= {
		labels: ["", "", "", ""],
		values: [10, 36, 48, 98]
	}
	let canvas	= null
	let chart 	= null


	function create_chart(canvas, data) {
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
						stacked: false
					}],
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 0
					}
				},
				legend: {
					display: false
				},
				tooltips: {
					callbacks: {
						label: tooltipItem => `${tooltipItem.yLabel}: ${tooltipItem.xLabel}`, 
						title: () => null,
					}
				},
				scales: {
					yAxes: [{
						ticks: {
							display: false,
							padding: 0,
							beginAtZero: true
						},  
						gridLines: {
							display:false
						}
						
					}],

					xAxes: [{
						ticks: {
							display: false,
							padding: 0,
							beginAtZero: true
						},  
						gridLines: {
							display:false
						}
						
					}]
				}
			}
		})
	}

	function update_chart(chart) {

		//let bgColorsMax = '#008FFB'
		let bgColorsMax = '#ffffff'

		const gradientMax = canvas.createLinearGradient(0, 0, 0, 450)
		gradientMax.addColorStop(0, bgColorsMax + '99')
		gradientMax.addColorStop(0.4, bgColorsMax + '00')

		const datasets_options = {
			fill: 'origin',
			lineTension: 0.3,
			borderWidth: 1,
			pointRadius: 1,
			pointHoverRadius: 3,
			pointHitRadius: 6
		}

		chart.data.datasets = []
		chart.data.labels = stats.labels
		chart.data.datasets.push({
				label: '',
				data: stats.values,
				backgroundColor: gradientMax,
				borderColor: gradientMax,
				...datasets_options
			})
		chart.update()
	}
	

	onMount(() => {
		canvas	= document.getElementById('chart').getContext('2d')
		chart = create_chart(canvas, stats)

		socket.emit("online-stats", {})
		socket.on("online-stats", res => {
			console.log(res)
			stats.values = []
			stats.labels = []
			for (const s of res?.hours) {
				stats.values.push(s?.min) 
				stats.labels.push(s?.min) 
				update_chart(chart)
			}
			stats.values.push(data.length) 
			stats.labels.push(data.length) 
			update_chart(chart)

		})
	})

	$ : data, socket.emit("online-stats", {})
	$ : {

		const len = stats.values.length
		stats.values[len - 1] = data.length
		stats.labels[len - 1] = data.length
		if (chart) 
			update_chart(chart)

	}

	onDestroy(() => {
		socket.off("online-stats")
	})

</script>

<div class="online-stat">
	<div class="online-text">
		<b>{data.length}</b>
	</div>
	<div class="chart-container" >
		<canvas id="chart" bind:this={canvas}></canvas>
	</div>
</div> 

<style type="text/sass">
	.chart-container
		display: block
		height: 100%
		width: 218px
		border-radius: 5px

	#chart
		position: absolute
		top: 10px
		height: 100%
		margin-left: -9px
		border-radius: 5px

	.online-stat
		margin-top: 26px
		display: block
		position: relative
		border-radius: 5px
		background-color: #008FFB
		width: 100%
		height: 110px
		margin-left: auto
		margin-right: auto
		.online-text
			pointer-events: none
			position: absolute
			top: 4px
			right: 12px
			b
				font-size: 28px
</style>