<script>
	import { onDestroy, onMount } from "svelte";

	import { socket, student, socket_data } 		from "./store.js"
	import dayjs from "dayjs"
	let logs = []
	let queue = []

	onMount(() => {
		socket.emit("server-logs")
		socket.on("server-logs", res => {
			logs = res?.logs
		})
		socket.on("server-queue", res => {
			queue = res
		})
	})

	onDestroy(() => {
		socket.off("server-logs")
	})
</script>

<div class="content">
	<div class="logs">
	<div class="logs">
		{ #each queue as l }
		<div class={"log " + l?.state} >
			<div class="date">{l?.date ? dayjs(l.date).format("YY/MM/DD HH[:]mm") : ""}</div>
			<div class="prority">{l?.priority}</div>
			<div class="tries">{l?.tries}</div>
			<div class="state">{l?.state}</div>
			<div class="name">{l?.name}</div>
		</div>
		{ /each }
	</div>
	{ #each logs as l }
	<div class={"log " + l?.type} >
		<div class="date">{l?.date ? dayjs(l.date).format("YY/MM/DD HH[:]mm") : ""}</div>
		<div class="type">{l?.type}</div>
		<div class="component">{l?.component}</div>
		<div class="message">{l?.message}</div>
	</div>
	{ /each }
</div>

</div>

<style type="text/sass">
	@import "./assets/Global";
	.content
		display: block
		margin-top: 64px

	.logs
		margin-left: 10px
		font-size: 14px
		.log
			display: flex
			align-items: center
			width: 100%
			margin-bottom: 4px
			&.ERROR
				background-color: #771111
			.date
				width: 15%
			.type, .prority, .tries
				text-transform: uppercase
				width: 10%
			.component, .state
				width: 15%
				text-transform: uppercase
			.message, .name
				width: 55%

</style>