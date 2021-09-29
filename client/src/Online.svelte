<script>
	import { socket, student, socket_data } 		from "./store.js"
	import { each, onMount, onDestroy, debug }		from "svelte/internal"
	import dayjs									from "dayjs"
	import											'dayjs/locale/fr'
	import Generate									from "./ClusterMap/Generate"
	import OnlineClusterMap							from "./Online.ClusterMap.svelte"

	import { initialize }							from "./ClusterMap/Init"

	// Generated Cluster
	let cluster_z1 = []
	let cluster_z2 = []
	let cluster_z3 = []
	let cluster_z4 = []

	// Count online
	let online = []
	let online_floor0 = 0
	let online_floor1 = 0

	//
	let active_floor = 2
	let view = "FIXED-MAP"

	//
	let coalitions = []
	function handle_result(online) {
		online_floor0 = 0
		online_floor1 = 0
		for (const stud of online) {
			if (stud?.location?.includes("z1") ||stud?.location?.includes("z2"))
				online_floor0++
			if (stud?.location?.includes("z3") ||stud?.location?.includes("z4"))
				online_floor1++
		}
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

		const eyo = initialize()
		cluster_z1 = eyo.cluster_z1
		cluster_z2 = eyo.cluster_z2
		cluster_z3 = eyo.cluster_z3
		cluster_z4 = eyo.cluster_z4
		socket.on("get-coalitions", res => {
			coalitions = res
		})
		socket.emit("get-coalitions")
		socket.emit("getOnline", {})
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
	})

	$: active_floor, view, handle_result(online)

	onDestroy(() => {
		socket.off("get-coalitions")
		socket.off("getOnline")
	})

	let show_popbox = false

	/*
	**
	*/

	// Pourquoi devoir faire ça sur les serveurs de l'école :shrug:
	$: onlineCount = (function() {
		let count = 0
		for (const _e of online) {
			count++
		}
		return count
	})()
	/*
	**
	*/

	//let student_search = ""
	let student_search_result 	= []
	let student_search_string 	= ""
	let student_selected		= ""

	const student_jump = (stud) => {
		//student_search_string = ""
		student_search_result = []
		if (["1", "2"].includes(stud?.location[1]))
			active_floor = 2
		else
			active_floor = 1
		student_selected = stud?.login
		student_search_string = stud?.login
	}

	const student_search = (e) => {
		const value = e?.target?.value
		if (value)
			student_search_result = online.filter(f => f?.login.includes(value))
		else {
			student_search_result 	= []
			student_selected		= ""
		}
	}

</script>

<div class="profile-popbox" class:show={show_popbox?.show}>
	<div class="image"
		style={`background-image: url(${show_popbox?.image_url})`}
	></div>
	<div class="infos">
		<div class="login">{show_popbox?.login}</div>
		<div class="name">{show_popbox?.first_name} {show_popbox?.last_name}</div>
		<div class="location">{show_popbox?.location}</div>
		<div class="level">level: {show_popbox?.level}<br/>corrections points: {show_popbox?.correction_point}</div>
	</div>
</div>

<div class="content">
	<div class={"online" + (onlineCount >= 308 ? " FULL" : "")}>
		<b>{onlineCount}</b>
	</div>
	
	<div class="tab">
		<span 
			class="item"
			class:selected={view === "FIXED-MAP"} 
			on:click={() => {view = "FIXED-MAP"}}>
			map
		</span>
		<span 
			class="item" 
			class:selected={view === "CARD"} 
			on:click={() => {view = "CARD"}}>
			card
		</span>
	</div> 


	{ #if view === "FIXED-MAP" }
	
	
	<div class="cluster-search">
		<input type="text" placeholder="Find a student..." bind:value={student_search_string}  on:input={student_search}/>
			<div class="autocomplete" class:show={student_search_result.length}>
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
		</div>
	<div class="tab">
		<span class="item" class:selected={active_floor === 2} on:click={() => {active_floor = 2}}>top ({online_floor0})</span>
		<span class="item" class:selected={active_floor === 1} on:click={() => {active_floor = 1}}>bottom ({online_floor1})</span>
	</div>
		<!-- <OnlineViewFixedMap data={online} clusters={active_floor === 1 ? [cluster_z3, cluster_z4] : [cluster_z1, cluster_z2]} bind:show_popbox={show_popbox}/> -->
		<OnlineClusterMap 
			data={online}
			clusters={active_floor === 1 ? [cluster_z3, cluster_z4] : [cluster_z1, cluster_z2]}
			student_selected={student_selected}
			hall={false}
			bind:show_popbox={show_popbox}/>
	{ /if }

	{ #if view === "CARD"}
		<div class="container">
			{#each online as e}
				<div class="stud" style="background-image: url('{e.image_url ?? `https://cdn.intra.42.fr/users/large_${e.login}.jpg`}')">
					<div class="login">
						{e.login}
					</div>
					<div class="infos">
						<div class="logtime">
							{`${Math.floor(e.uptime / 60)}h${((e.uptime % 60) < 10 ? "0" : "") + (e.uptime % 60)}`}
						</div>
						<div class="host">
							{e.location && e.location.split(".")[0]}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{ /if}
	
	
	<!-- <div class="coalitions">
		{ #each coalitions as coa}
			<div class="coa">
				{coa.name} {coa.points}<br>
			</div>
		{ /each }
	</div> -->



</div>

<style type="text/sass">
	@import "./assets/Component";
	@import "./assets/ClusterMap";
	@keyframes appear
		0%
			opacity: 0
		100%
			opacity: 1

	.coalitions
		bottom: 60px
		display: flex
		font-size: 14px
		width: 100%
		justify-content: space-around
		text-transform: lowercase
		color: #999999
		
	.content
		position: relative
		display: flex
		flex-direction: column
		align-items: stretch
		margin-top: 54px
		margin-left: auto
		margin-right: auto
		width: 80%
		height: calc(100% - 54px)
		opacity: 0
		min-width: 405px
		animation: appear .2s ease-out 
		animation-fill-mode: forwards
		animation-delay: 0.2s
		align-items: center
	.online
		text-align: center
		margin-bottom: 24px
		font-size: 22px
		&.FULL
			color: red
			font-size: 24px
		b
			font-size: 24px

	.container
		display: flex
		justify-content: space-evenly
		align-content: space-between
		flex-wrap: wrap
	.stud
		position: relative
		width: 160px
		height: 154px
		margin: 8px
		display: block
		background-size: cover
		background-position: center
		border-radius: 5px
		background-color: #363636
		.login
			background-color: #00000088
			text-align: center
			padding-bottom: 4px
			padding-top: 4px
			font-weight: bold
			font-size: 14px
		.infos
			position: absolute
			bottom: 0
			overflow: hidden
			width: inherit
			background-color: #00000088
			display: block
			height: 16px
			padding-bottom: 4px
			padding-top: 4px
			.logtime
				position: absolute
				display: inline-block
				font-size: 14px
				left: 8px
			.host
				position: absolute
				display: inline-block
				font-size: 14px
				right: 8px
			
</style>