
<script>
	export let data;
	export let clusters;
	export let selected_floor;
	export let student_selected;

	import { afterUpdate, onDestroy, onMount } from "svelte";
import { student } from "../store";

	let container 		= null
	let size			= 0
	let square_size 	= 0
	let resize_timeout 	= null
	let local_data		= []

	$: {
		local_data = [...data]
	}

	const dynamic_resize = () => {
		const off_x = container.offsetWidth
		const off_y = container.offsetHeight
		if (off_x > off_y)
			size = off_y
		else
			size = off_x
		square_size = size / 16
	}

	const event_dynamic_resize = () => {
		clearTimeout(resize_timeout)
		resize_timeout = setTimeout(() => {
			dynamic_resize()
		}, 250)
	}

	function is_busy(uhu, r) {
		return uhu?.find(f => f?.location === r?.location)
	}

	function get_avatar(uhu, r) {
		const res = is_busy(uhu, r)
		if (r)
			return res?.image_url ?? `https://cdn.intra.42.fr/users/large_${res?.login}.jpg`
		return null
	}

	function is_selected(data, r, student_selected) {
		const res = is_busy(data, r)
		if (res?.login === student_selected)
			return true
		return false
	}

	onMount(() => {
		dynamic_resize()
		window.addEventListener("resize", event_dynamic_resize)
	})

	onDestroy(() => {
		window.removeEventListener("resize", event_dynamic_resize)
	})

</script>

<div class="clusters-helper">

	<div class="btn-group floor-selector" role="group" >
		<button class="btn" type="button" class:btn-primary={selected_floor === 1}  on:click={() => selected_floor = 1}>
			<i class="fas fa-chevron-up"></i>
		</button>
		<button class="btn" type="button" class:btn-primary={selected_floor === 2}  on:click={() => selected_floor = 2}>
			<i class="fas fa-chevron-down"></i>
		</button>
	</div>

	<div class="cluster-center d-flex align-items-center justify-content-center" bind:this={container}>
		<div class="clusters-container">
			<div class="map-container" style="margin-left: {square_size / 3}px; ">
				{ #each clusters[0] as c }
				<div class="column">
					{ #each c as r }
					
					<div 
						style="width: {square_size}px; height: {square_size}px; "
						class={"bg-dark row " + r?.location}
						class:disabled={!r?.active} 
						>
							<div 
								class="inside" 
								style="{is_busy(data, r) ? `background-image: url(${get_avatar(data, r)})` : ""}"
								class:focus={is_selected(data, r, student_selected)}
								on:click={() => {
									const selected = is_busy(data, r)
									if (selected?.login) {
										if (selected?.login === student_selected)
											student_selected = " "
										else
											student_selected = selected?.login
									}
								}}
								>
							{r?.location}
						</div>
					</div>
					{ /each }
				</div>
				{ /each }
			</div>
			
			<div class="map-container" style="margin-right: {square_size / 3}px">
				{ #each clusters[1] as c }
				<div class="column">
					{ #each c as r }
					<div
						style="width: {square_size}px; height: {square_size}px"
						class={"bg-dark row " + r?.location}
						class:disabled={!r?.active}>
						<div 
							class="inside" 
							style="{is_busy(data, r) ? `background-image: url(${get_avatar(data, r)})` : ""}"
							class:focus={is_selected(data, r, student_selected)}
							on:click={() => {
								const selected = is_busy(data, r)
								if (selected?.login) {
									if (selected?.login === student_selected)
										student_selected = " "
									else
										student_selected = selected?.login
								}
								
							}}
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
</div>

<style type="text/sass">

	.floor-selector
		position: absolute
		width: 200px
		top: -4px
		left: 50%
		transform: translateX(-50%)
		margin-left: auto
		margin-right: auto

	.btn
		transition: all .2s linear

	.clusters-helper
		width: 100%
		height: 100%
		.cluster-center
			width: 100%
			height: 100%
		.clusters-container
			display: flex
			justify-content: center
			flex-direction: row-reverse
			//background-color: #88444455
			.map-container
				//background-color: #44884455
				margin-right: 14px
				margin-left: 14px
				.column
					display: flex
					flex-direction: row
					justify-content: center
					.row
						position: relative
						transition: all .2s ease-out
						font-size: 0px
						width: 32px
						height: 32px
						border-radius: 5px
						background-color: #4444ff55
						margin: 4px
						&.disabled
							opacity: 0	
						.inside
							position: absolute
							width: 100%
							height: 100%
							top: 0
							left: 0
							background-size: cover
							background-position: center center
							border-radius: 5px
							&.focus
								transform: scale(1.4)
								z-index: 1000
								border: 1px solid white
</style>