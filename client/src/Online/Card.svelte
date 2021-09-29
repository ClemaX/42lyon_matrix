<script>
	export let online
</script>
<div class="container" >
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

<style type="text/sass">

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
