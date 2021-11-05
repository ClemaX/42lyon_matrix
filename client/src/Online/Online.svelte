<script>
	import { socket } 				from "../store.js"
	import { onMount, onDestroy } 	from "svelte";
	import dayjs 					from "dayjs"

	import Map										from "./Map.svelte"
	import Card										from "./Card.svelte"
	import BoxLogged								from "./Box.Logged.svelte"
	import Info										from "./Info.svelte"
	
	import Generate									from "../ClusterMap/Generate"
	import { initialize }							from "../ClusterMap/Init"

	let cluster_z1 		= []
	let cluster_z2 		= []
	let cluster_z3 		= []
	let cluster_z4		= []
	let online 			= []

	let selected_floor 	= 1
	let selected_view	= "MAP"

	let bus_hour		= [
		"6:02", "6:36", "6:54",
		"7:02", "7:17", "7:27", "7:37", "7:58",
		"8:16", "8:35", "8:54", 
		"9:36", 
		"10:07", "10:34",
		"11:06", "11:40",
		"12:11", "12:42",
		"13:14", "13:46",
		"14:23", "14:50",
		"15:22", "15:56",
		"16:26", "16:43",
		"17:01", "17:18", "17:33", "17:48",
		"18:03", "18:18", "18:32", "18:47",
		"19:01", "19:19", "19:43",
		"20:10", "20:39",
		"21:07",
	]

	const dnow 	= new Date(0, 0, 0, 7, 50).getTime()
	const data 	= { diff: Infinity, id: -1}
	for (const i in bus_hour) {
		const time 	= bus_hour[i].split(":")
		const date 	= new Date(0, 0, 0, time[0], time[1]).getTime()
		const cmp 	= date - dnow
		if (cmp < data.diff && cmp >= 0) {
			data.diff = Math.abs(cmp)
			data.id = +i
		}
	}

	console.log("Il est 7:50")
	if (data.id - 1 >= 0) {
		console.log("Précédent: ", bus_hour[data.id - 1])
	}
	if (data.id - 1 < 0) {
		console.log("Précédent: ", bus_hour[0])
	}

	console.log("Prochain bus : ", bus_hour[data.id])
	if (data.id + 1 <= bus_hour.length) {
		console.log("Prochain bus + 1 : ", bus_hour[data.id + 1])

	}

	onMount(() => {
		cluster_z1 = Generate.clusterfakfak(1, 
			5, 12, 
			["z1r1p3", "z1r5p3", "z1r9p3"], 
			0)

		cluster_z2 = Generate.clusterfakfak(2, 
			8, 12, 
			["z2r1p4", "z2r5p4", "z2r9p4"], 
			0)

		cluster_z3 = Generate.clusterfakfak(3, 
			6, 13, 
			["z3r1p3", "z3r5p3", "z3r9p3", "z3r13p4", "z3r13p5", "z3r13p6"], 
			0)

		cluster_z4 = Generate.clusterfakfak(4, 
			7, 13, 
			["z4r1p3", "z4r5p3", "z4r9p3", "z4r13p2", "z4r13p1", "z4r13p3", "z4r13p4", , "z4r13p5", , "z4r13p6", "z4r13p7"],
			1)
		
		
		
		socket.on("getOnline", res => {
			online = res
			online.sort((a, b) => {
				if (a.uptime > b.uptime)
					return -1	
				else
					return 1
			})
			online = online.map(e => {
				e.location = e?.location.split(".")[0]
				return e
			})
		})
		socket.emit("getOnline", {})
	})

	onDestroy(() => {
		socket.off("getOnline")
	})

	/*
	** SEARCH FOR A STUDENT
	*/
	let student_search_result 	= []
	let student_search_string 	= ""
	let student_selected		= ""

	const student_jump = (stud) => {
		//student_search_string = ""
		student_search_result = []
		if (["1", "2"].includes(stud?.location[1]))
			selected_floor = 1
		else
			selected_floor = 2
		student_selected = stud?.login
		student_search_string = stud?.login
	}

	const student_search = (e) => {
		const value = e?.target?.value
		if (value)
			student_search_result = online.filter(f => f?.login.includes(value.toLowerCase()))
		else {
			student_search_result 	= []
			student_selected		= ""
		}
	}

</script>
	
	
		<div class="sidebar" >
			<div class="sidebar-menu"> 
				<div class="sidebar-content">
					
					<input 
						type="text" 
						class="form-control" 
						placeholder="Search student"
						bind:value={student_search_string}
						on:input={student_search}
						/>
						<div 
							class="autocomplete" 
							class:show={student_search_result.length}>
							{ #each student_search_result as stud}
								<div 
									class="item" 
									on:click={() => student_jump(stud)}>
									<div 
										class="avatar" 
										style="background-image: url({stud.image_url ?? `https://cdn.intra.42.fr/users/large_${stud?.login}.jpg`})">
									</div>
									<div class="login">
										{stud.login}
									</div>
								</div>
							{ /each }
						</div>

					<div class="mt-10 font-size-12"></div>

					<div class="btn-group btn-block" role="group" aria-label="Basic example">
						<button
							on:click={() => selected_view = "MAP"}
							class:btn-primary={selected_view === "MAP"}
							class="btn" type="button">
							map
						</button>
						<button
							on:click={() => selected_view = "CARD"}
							class:btn-primary={selected_view === "CARD"}
							class="btn" type="button">
							card
						</button>
					</div>
					<BoxLogged data={online} />
				</div>
			</div>
		</div>
	
		<div class="content-wrapper">
			<div class="container-fluid"style="height: 100%">
				<div class="row" style="height: 100%">
					<div class=" col-xl-9 col-lg-9 col-md-12 col-sm-12 d-flex align-items-center justify-content-center">
					{ #if selected_view === "MAP" }
						<Map
							clusters={selected_floor === 1 ? [cluster_z1, cluster_z2] : [cluster_z3, cluster_z4]}
							bind:selected_floor={selected_floor} 
							bind:student_selected={student_selected}
							data={online}
						/>
					{ /if}
					{ #if selected_view === "CARD" }
						<Card online={online} />
					{ /if}

					</div>
					<div class="col-md-3 d-none d-lg-block ">
						<Info
							online={online}
							student_selected={student_selected}
						/>
					</div>
				</div>
			</div>
	  </div>


<style type="text/sass">
	.online-stat
		margin-top: 14px
		display: block
		position: relative
		border-radius: 5px
		background-color: #25282c
		width: 100%
		height: 100px
		margin-left: auto
		margin-right: auto
		.online-text
			pointer-events: none
			position: absolute
			top: 4px
			right: 12px
			b
				font-size: 24px


	.autocomplete
		position: absolute
		opacity: 1
		width: 80%
		margin-top: 10px
		border-radius: 5px
		transition: all .1s ease-in-out
		z-index: 100
		max-height: 300px
		overflow-y: auto
		background-color: #25282c
		&.show
			opacity: 1
		.item
			display: flex
			justify-content: start
			align-items: center
			height: 32px
			padding-left: 16px
			padding-top: 6px
			padding-bottom: 6px
			margin-top: 6px
			&:hover
				cursor: pointer
				background-color: #008FFB
			.avatar
				width: 24px
				height: 24px
				background-size: cover
				background-position: center center
				border-radius: 50%
			.login
				margin-left: 6px

</style>