
<script>
	import { each, onMount, onDestroy }				from "svelte/internal"
	import { socket, student, socket_data }			from "./store.js"
	import {push}									from 'svelte-spa-router'
	import dayjs from "dayjs"
	import customName 								from "../../custom_login.json"
 
	export let params = {}
	let data = {
		data: [],
		time: -1
	}
	
	let loaded 	= 0
	let max 	= 0
	let page 	= 0
	let ranking = "level"
	let selected_year = 0


	function infinityLoad() {
		if (!loaded)
			return
		loaded = 0
		page++
	}
	
	function	cleanData() {
		loaded = 0
		page = 0
		data.data = []
	}

	$: ranking && cleanData()

	let unsubscribe = socket_data.subscribe(res => {
		if (res.type === "ranking-level" || res.type === "ranking-correction_point" || res.type === "ranking-wallet") {
			data.time = res.time
			max = res.max
			data.data = [...data.data, ...res.data]
			loaded = 1
		}
	})

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe()
			unsubscribe = null
		}
	})

	$: {
		if (params.type) {
			ranking = params.type
		}
	}
	
	$: {
		loaded = 0
		
		socket.emit("get", {
			data: ranking,
			page: page,
			year: selected_year >= 2017 ? selected_year : null
		})
		
	}

	function eventInfiniteLoad() {
		if ((window.innerHeight + window.pageYOffset) >= document.querySelector(".content").offsetHeight) {
				infinityLoad()
			}
	}
	onMount(() => {
		const hash = window.location.hash
		const type = hash.split("-")

		if (type.length >= 2) {
			if (["level", "correction_point", "pool", "wallet"].includes(type[1]))
				ranking = type[1]
		}
		
		window.addEventListener("scroll", eventInfiniteLoad)
		return (() => {
			window.removeEventListener("scroll", eventInfiniteLoad)
		})
	})

	</script>
	

<div class="content">
	<div class="tab">
		<span class="item" class:selected={ranking === "level"} on:click={() => push("/ranking/level")}>level</span>
		<span class="item" class:selected={ranking === "correction_point"} on:click={() => push("/ranking/correction_point")}>correction point</span>
		<span class="item" class:selected={ranking === "wallet"} on:click={() => push("/ranking/wallet")}>wallet</span>
		<!-- <span class="item" class:selected={ranking === "pool"} on:click={() => push("/ranking/pool")}>pool</span> -->
	</div>

	<div class="tab">
		<span class="item" class:selected={selected_year === 0} on:click={() => {cleanData(); selected_year = 0}}>all</span>
		<span class="item" class:selected={selected_year === 2017} on:click={() => {cleanData(); selected_year = 2017}}>2017</span>
		<span class="item" class:selected={selected_year === 2018} on:click={() => {cleanData(); selected_year = 2018}}>2018</span>
		<span class="item" class:selected={selected_year === 2019} on:click={() => {cleanData(); selected_year = 2019}}>2019</span>
		<span class="item" class:selected={selected_year === 2020} on:click={() => {cleanData(); selected_year = 2020}}>2020</span>
		<span class="item" class:selected={selected_year === 2021} on:click={() => {cleanData(); selected_year = 2021}}>2021</span>
	</div>
	<div class="alert info">
		Ranking are updated for students that have logged in school in the last 6 months (starting from 24 november 2020)
	</div>
	{#if !loaded}
		Loading...
	{/if}
	<br/>

	{#each data.data as d, k}
		<!-- <div class="reg" style="animation-delay: {(k * 0.05)}s"> -->
		<div class="reg" class:first={k === 0}>
			<div class="login">{customName?.[d.login] ?? d.login}</div>
			<div class="pool_year">
				{d.pool_year}
			</div>
			<div class="last_update">
				{d.last_update ? `last update : ${dayjs(d.last_update).format("ddd DD MMM YYYY, HH[:]mm")}` : ""}
			</div>
			<div class="image" style="background-image: url('{d.image_url.includes("3b3") ? "" : d.image_url}')" >
				<div class="pos">{k + 1}</div>
			</div>
			<div class="bar-container">
				<div style="width: {(d.value / max) * 100}%; ">
					<div class="bar"></div>
					<!-- <div class="bar" style="animation-delay: {(k * 0.05)}s"></div> -->
				</div>
			</div>
			<div class="value">{d.value}</div>
		</div>
	{/each}


</div>
	
<style type="text/sass">
	@import "./assets/Component";
	@import "./assets/Appbar.sass";
	@import "./assets/Classement.sass";
</style>
