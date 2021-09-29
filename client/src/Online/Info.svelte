<script>
import { onDestroy, onMount } from "svelte";


	export let student_selected;
	export let online;



	let student_data;

	$: {
		if (student_selected) {
			const details 	= online.find(f => f?.login === student_selected)
			const loc 		= details?.location.match(/z(\d+)r(\d+)p(\d+)/)

			student_data = {
				...details,
				z: loc?.[1],
				r: loc?.[2],
				p: loc?.[3],
			}
		}
		else {
			student_data = {}
		}
	}

	const handleClick = () => {
		if (student_data?.login) {
			window.open("https://profile.intra.42.fr/users/" + student_data?.login, '_blank');
		}
	}

	
	let intervalPropaganda = null
	let imagePropaganda = ""
	let imagesPropaganda = ["propaganda-404", "propaganda-leaks"]
	let propagandaLinks = ["https://www.loisduplain.fr/bde.pdf", ""]
	let imageIndex = parseInt(Math.random() * 2)

	onMount(() => {
		imagePropaganda = imagesPropaganda[imageIndex]
		intervalPropaganda = setInterval(() => {
			imageIndex++
			if (imageIndex >= imagesPropaganda.length)
				imageIndex = 0
			imagePropaganda = imagesPropaganda[imageIndex]
		}, 5000)
	})

	onDestroy(() => {
		clearInterval(intervalPropaganda)
		intervalPropaganda = null
	})

</script>

<div
	class="info-card d-flex justify-content-center"
	style="background-image: url({student_data?.image_url})"
>
<div class="login" on:click={() => handleClick()} style="cursor: pointer;">{student_data?.login ?? " "}</div>
	<div class="profile-info">
		<div class="location">
			<div class="z">Z<b>{student_data?.z || ""}</b></div>
			<div class="r">R<b>{student_data?.r || ""}</b></div>
			<div class="p">P<b>{student_data?.p || ""}</b></div>
		</div>
	</div>
</div>
<div class="box-name">
	{student_data?.first_name ?? " "} <b>{student_data?.last_name ?? " "}</b>
</div>
<div class="box-supl">
	<div class="level">
		<b>level</b>
		<span>{(student_data?.level ?? 0).toFixed(2)}</span>
	</div>
	<div class="correction">
		<b>correction points</b>
		<span>{student_data?.correction_point ?? 0}</span>
	</div>
</div>


<!-- <div class="propaganda-404"></div>
<div class="propaganda-leaks"></div>
<a
	class="info-card d-flex justify-content-center {imagePropaganda}"
	style="height: 620px"
	href={propagandaLinks[imageIndex]}

	target="_blank"
>

	<div class="box-name">
		<b>Espace propagande</b>
	</div>
</a> -->
<style type="text/sass">

	.propaganda-404
		background-image: url(/assets/PROPAGANDE_AFFICHE_BDE_404.png);
	.propaganda-leaks
		background-image: url(/assets/PROPAGANDE_AFFICHE_BDE_LEAKS.png);

	.info-card
		position: relative
		margin-top: 32px
		display: block
		width: 80%
		height: 420px
		border-radius: 5px
		background-size: cover
		background-position: center center
		margin-left: auto
		margin-right: auto
		background-color: #111
		
		.login
			text-align: center
			font-size: 24px
			margin-bottom: 10px
			width: 100%
			background-color: #000000dd
			border-radius: 5px 5px 0px 0px
			font-family: "Exo"
			height: 42px
			line-height: 42px
			vertical-align: middle
		.profile-info
			position: absolute
			bottom: 0
			height: 36px
			width: 100%
			background-color: #000000aa
			border-radius: 0px 0px 5px 5px
			.location
				display: flex
				justify-content: space-between
				margin-left: 46px
				margin-right: 46px
				b
					font-size: 20px

	.box-name
		position: relative
		width: 80%
		margin-left: auto
		margin-right: auto
		background-color: #111
		margin-top: 8px
		border-radius: 5px
		padding: 6px
		text-align: center
		height: 34px
	.box-supl
		position: relative
		width: 80%
		display: flex
		justify-items: center
		justify-content: space-between
		align-items: center
		margin-left: auto
		margin-right: auto
		margin-top: 8px
		> div
			position: relative
			display: block
			width: 30%
			margin-left: 4px
			margin-right: 4px
			flex-grow: 1
			border-radius: 5px
			height: 48px
			background-color: #111
			b
				width: 100%
				position: absolute
				top: 4px
				text-align: center
				font-size: 10px
			span
				position: absolute
				text-align: center
				vertical-align: middle
				line-height: 48px
				bottom: -10px
				width: 100%
</style>
