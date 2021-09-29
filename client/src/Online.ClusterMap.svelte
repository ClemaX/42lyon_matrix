
<script>
	export let data;
	export let clusters;
	export let show_popbox;
	export let student_selected;
	export let hall;

	import { onDestroy, onMount } from "svelte";

	let local_clusters = [[], []]
	let local_data = []
	let local_selected = ""

	let container_size = {}
	let size = 0
	let container
	let max = 0
	let max_row = [0, 0]

	$: {
		local_clusters[0] 	= clusters[0]
		local_clusters[1] 	= clusters[1]
		local_selected		= student_selected

		for (const r0 of local_clusters[0]) {
			if (r0?.length > max_row[0])
				max_row[0] = r0?.length
		}
		for (const r1 of local_clusters[1]) {
			if (r1?.length > max_row[1])
				max_row[1] = r1?.length
		}
		max = Math.max(max_row[0], max_row[1])

		local_data = data
	}

	let h = 0
	let sq_size = 0

	let timeout = null
	const resize_map = () => {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			container_size.x = container.offsetWidth
			container_size.y = container.offsetHeight
			if (container_size.x > container_size.y)
				size = container_size.y
			else
				size = container_size.x
			if (hall) {
				size = container_size.x / 1.5
				sq_size = (size / 12)

			}
			else {
				sq_size = (size / 12) - 18
			}
			
		}, 500)
	}
	
	function is_busy(r) {
		const result = local_data.find((f) => f.location === r?.location) ?? null
		return result
	}

	function is_searching(r) {
		const res = is_busy(r)
		if (res?.login === student_selected)
			return true
		return false
	}

	function get_avatar(r) {
		const result = is_busy(r)
		const img =  result?.image_url ?? `https://cdn.intra.42.fr/users/large_${result?.login}.jpg`
		return img
	}

	onMount(() => {
		container_size.x = container.offsetWidth
		container_size.y = container.offsetHeight

		//h = container_size.y
		//sq_size = (h / 12) - (16)
		resize_map()
		window.addEventListener("resize", resize_map)
	})

	function patate(stud) {
		if (show_popbox?.show && show_popbox.login === stud?.login) {
			show_popbox = {
				...show_popbox,
				show: false,
			}
			return
		}
		show_popbox = {
			show: true,
			...stud
		}
	}
</script>

<div class="container-cm" style="margin-top: {hall ? "26px" : "0px"}; height: {hall ? 'calc(100% - 26px)' : '100%'}">
	<div class="fixed-map-container" bind:this={container} >
		<div class="map-container">
			{ #each local_clusters[0] as c }
			<div class="column">
				{ #each c as r }
				
				<div 
					style="width: {sq_size}px; height: {sq_size}px;"
					class={"row " + r?.location}
					class:temp={r?.active === -1}
					class:disabled={!r?.active} 
					class:reversed={r?.reverse}
					>
					<div 
						class="inside"
						class:active={is_busy(r)}
						class:search={is_searching(r)}
						style="{is_busy(r) ? `background-image: url(${get_avatar(r)})` : ""}"
						on:click={patate(is_busy(r))}
						>
						{r?.location}
					</div>
				</div>
				{ /each }
			</div>
			{ /each }
		</div>
		<div class="map-container">
			{ #each local_clusters[1] as c }
			<div class="column">
				{ #each c as r }
				<div
					style="width: {sq_size}px; height: {sq_size}px;"
					class={"row " + r?.location}
					class:temp={r?.active === -1}
					class:reversed={r?.reverse}
					class:disabled={!r?.active}>
					<div 
						class="inside"
						class:active={is_busy(r)}
						class:search={is_searching(r)}
						style="{is_busy(r) ? `background-image: url(${get_avatar(r)})` : ""}"
						on:click={patate(is_busy(r))}
						>
						{r?.location}
					</div>
					
				</div>
				{ /each }
			</div>
			{ /each }
		</div>
	</div>
</div>


<style type="text/sass">
	@import "./assets/ClusterMap2";
</style>