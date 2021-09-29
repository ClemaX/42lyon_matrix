
<script>
	import { each, onMount } 	from "svelte/internal"
	import { socket, student }	from "./store.js"
	import active				from 'svelte-spa-router/active'
	import {push}				from 'svelte-spa-router'
	import {link} from 'svelte-spa-router'

</script>

<div class="appbar">

	<div class="menu">
		<a href="/" class="item" use:link use:active>
			<div class="icon">
				<i class="fas fa-users"></i>
			</div>
			<!-- <div class="text">Classement</div> -->
		</a>
		<a href="/ranking" class="item" use:link use:active={{path: /ranking\/?.*/}}>
			<div class="icon">
				<i class="fas fa-sort-numeric-up"></i>
			</div>
			<!-- <div class="text">Classement</div> -->
		</a>
		<a class="item" href="/online-stats" use:link use:active>
			<div class="icon">
				<i class="fas fa-chart-area"></i>
			</div>
			<!-- <div class="text"></div> -->
		</a>
		<div class="item">
			<div class="icon"></div>
			<!-- <div class="text"></div> -->
		</div>
		<div class="item">
			<div class="icon"></div>
			<!-- <div class="text"></div> -->
		</div>
	</div>
	<div class="account">
		<a class="avatar" style="background-image: url('{$student.image_url}')" href="/profile" use:link use:active>&nbsp;</a>
		<!-- <div class="login">slopez</div> 
		<div class="data"></div>  -->
	</div>
</div>

<style type="text/sass">
	@import "./assets/Appbar.sass";

	\:global(.active)
		background-color: #484848

</style>