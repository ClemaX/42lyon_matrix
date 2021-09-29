<script>
	import { socket, student, socket_data } 		from "./store.js"
	import { each, onMount, onDestroy, debug }				from "svelte/internal"
	import OnlineClusterMap							from "./Online.ClusterMap.svelte"
	import { initialize }							from "./ClusterMap/Init"
import { loc } from "svelte-spa-router";

	// Generated Cluster
	let cluster_z1 = []
	let cluster_z2 = []
	let cluster_z3 = []
	let cluster_z4 = []

	// Count online
	let online 			= []
	let selected_stud 	= {
					login: "No one",
					image_url: ""
				}
	let interval_rnd	= null

	const select_random_student = () => {
		const len = online.length
			if (len >= 1) {
				const rnd = parseInt(Math.random() * len + 0)
				const loc = online[rnd].location.match(/z(\d+)r(\d+)p(\d+)/)
				selected_stud = {
					...online[rnd],
					z: loc[1],
					r: loc[2],
					p: loc[3],
				}

			}
			else {
				selected_stud = {
					login: "No one",
					image_url: ""
				}
			}
	}
	onMount(() => {
		const eyo = initialize()

		cluster_z1 = eyo.cluster_z1
		cluster_z2 = eyo.cluster_z2
		cluster_z3 = eyo.cluster_z3
		cluster_z4 = eyo.cluster_z4

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
			select_random_student()

		})
	//	interval_rnd = setInterval(() => {
	//		select_random_student()
	//	}, 30000)

	})

	onDestroy(() => {
		socket.off("getOnline")
		clearInterval(interval_rnd)
	})
</script>

<!-- <b>{online.length ? online.length : "Only ghosts are here"}</b> {online.length > 1 ? "students" : "student"} -->

<!-- <div class="hall">
	<OnlineClusterMap data={online} clusters={[cluster_z1, cluster_z2]} hall=true/>
	<OnlineClusterMap data={online} clusters={[cluster_z3, cluster_z4]} hall=true/>
</div> -->
<div class="hall-container">
	<div class="bus-band">
		<div class="block-bus coming">
			<div class="bus-text">Coming</div>
			<div class="bus-hour">18:20</div>
			<div class="bus-id">86</div>
		</div>
		<div class="block-bus">
			<div class="bus-hour">19:42</div>
			<div class="bus-id">86</div>
		</div>
		<div class="block-bus">
			<div class="bus-hour">20:02</div>
			<div class="bus-id">86</div>
		</div>
	</div>
	<div class="block-left">
		<OnlineClusterMap data={online} clusters={[cluster_z1, cluster_z2]} student_selected={selected_stud?.login} hall=true/>
	</div>

	<div class="block-center" >
		<div class="profile-focus" style="display: {!online.length ? "none" : "flex"}; background-image: url('{selected_stud?.image_url}')">
		<div class="profile-info">
				<div class="login">{selected_stud?.login}</div>
				<div class="location">
					<div class="z">Z{selected_stud?.z || ""}</div>
					<div class="r">R{selected_stud?.r || ""}</div>
					<div class="p">P{selected_stud?.p || ""}</div>
				</div>
			</div>
		</div>
		<div class="online-count">
			<b>{online?.length}</b>
		</div>
		<!-- <div class="coalition-focus"> </div>-->
		
		<!-- <div class="current-hour">18:18</div>
		-->
	</div>
	<div class="block-right">
		<OnlineClusterMap data={online} clusters={[cluster_z3, cluster_z4]} student_selected={selected_stud?.login} hall=true/>
	</div>
</div>

<style type="text/sass">
	.bus-band
		display: flex
		position: absolute
		height: 129px
		width: 100%
		bottom: 0
		background-color: #484848
		display: none

	.online-count
		margin-top: 24px
		text-align: center
		font-size: 36px
		b
			font-size: 48px
	
	.coalition-focus
		position: relative
		margin-left: auto
		margin-right: auto
		margin-top: 24px
		width: 80%
		height: 300px
		border-radius: 10px
		background-color: #383838
		
	.profile-info
		position: absolute
		bottom: 0
		height: 76px
		width: 100%
		background-color: #000000aa
		border-radius: 0px 0px 10px 10px
		.location
			display: flex
			justify-content: space-between
			margin-left: 46px
			margin-right: 46px
		.login
			text-align: center
			font-size: 24px
			margin-bottom: 10px

	.profile-focus
		position: relative
		margin-left: auto
		margin-right: auto
		margin-top: 32px
		width: 80%
		height: 390px
		background-image: url('https://cdn.intra.42.fr/users/large_beduroul.jpg') 
		border-radius: 10px
		background-size: cover
		background-position: center center

	.current-hour
		text-align: center
		margin-top: 16px
		font-size: 54px

	.block-bus
		background-color: #686868
		border-radius: 5px
		width: 20%
		height: 64px
		display: flex
		justify-content: space-between
		align-items: center
		margin-left: auto
		margin-right: auto
		margin-top: 24px
		padding: 16px
		&.coming
			background-color: #BB86FC
		.bus-id
			font-size: 34px
			color: #ffffff
		.bus-hour
			font-size: 34px

	.hall-container
		display: flex
		width: 100%
		height: 100%
		.block-left
			display: block
			width: 40%
			//background-color: #00223355
		.block-center
			width: 20%
			//background-color: #BB86FC
			//background-color: #44225555
		.block-right
			display: block
			width: 40%
			//background-color: #66225555

	.hall
		width: 100%
		height: 100%
		display: flex
		margin-left: auto
		margin-right: auto
		justify-content: center
		align-content: center
		justify-items: center
		align-items: center
</style>