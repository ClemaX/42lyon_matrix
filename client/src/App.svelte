<script>
	import { onMount } from "svelte"
	import { socket, authentication, state, student, socket_data } from "./store.js"
	import Router from "svelte-spa-router"
	import { wrap } from "svelte-spa-router/wrap"
	import { location } from "svelte-spa-router"
	import { link } from "svelte-spa-router"
	import { push } from "svelte-spa-router"

	import active from "svelte-spa-router/active"

	import Login from "./Login.svelte"
	import Appbar from "./Appbar.svelte"
	import Classement from "./Classement.svelte"
	import Online from "./Online.svelte"
	import MyProfile from "./MyProfile.svelte"
	import Hallriksrmfgm from "./Hallriksrmfgm.svelte"

	import Online_New from "./Online/Online.svelte"

	import Admin from "./Admin.svelte"

	import StatLogged from "./Stats/Logged.svelte"

	function generateUUID() {
		const uuid = `${btoa(Math.random().toString(36).substr(2, 9))}${btoa(Date.now())}`
		return uuid.replace(/=/g, "")
	}

	function handshake() {
		const cookies = Object.fromEntries(document.cookie.split("; ").map((x) => x.split("=")))
		const uuid = generateUUID()

		if (cookies.handshake === "undefined") {
			cookies.handshake = null
		}
		console.log("ℹ️ Handshake", cookies.handshake ?? uuid)
		if (cookies.handshake) socket.emit("handshake", cookies.handshake)
		else {
			socket.emit("handshake", uuid)
			document.cookie = `handshake=${uuid}`
		}
	}

	let connexionLost = false

	const halfMoonDebug = halfmoon

	onMount(() => {
		halfmoon.toggleDarkMode()

		document.querySelector("html").classList.add("auto-scaling-disabled")

		socket.on("connect", (s) => {
			handshake()
			const localJWT = window.localStorage.getItem("jwt")
			if (localJWT) {
				console.log("⌛ Waiting for JWT Authentication")
				socket.emit("authentication", {
					type: "jwt",
					jwt: localJWT,
				})
			}
		})

		socket.on("reconnect", () => {
			window.location.reload(true)
		})

		socket.on("disconnect", () => {
			connexionLost = true
		})

		socket.on("server", (data) => {
			console.log("[SERVER]", data)
		})

		socket.on("authentication", (data) => {
			try {
				if (data.type === "student_data") {
					student.set(data.data)
				}
				authentication.set(data)
			} catch (e) {
				console.error(e)
				document.cookies = ""
				window.localStorage.clear()
				window.location.reload(true)
			}
		})

		socket.on("data", (res) => {
			socket_data.set(res)
		})
	})

	$: console.log("[ctx] [logged]", $state)

	const routes = {
		"/": wrap({
			component: Online_New,
		}),
		"/beta": Online_New,
		"/ranking/:type?": wrap({
			component: Classement,
		}),
		"/online-stats": wrap({
			component: StatLogged,
		}),
		"/profile": wrap({
			component: MyProfile,
		}),
		"/hall": wrap({
			component: Hallriksrmfgm,
		}),
		"/324B21": wrap({
			component: Admin,
		}),
	}

	function logout() {
		state.update((o) => ({ ...o, logged: false }))
		document.cookies = ""
		window.localStorage.clear()
		window.location.reload(true)
	}
</script>

<div class="page-wrapper with-sidebar with-navbar ">
	{#if $location !== "/hall"}
		<nav class="navbar">
			<div class="navbar-content">
				{#if $state.logged}
					<button
						style="display: {$location === '/' ? 'block' : 'none'}"
						class="btn btn-action"
						type="button"
						on:click={() => {
							halfMoonDebug.toggleSidebar()
						}}
					>
						<i class="fa fa-bars" aria-hidden="true" />
						<span class="sr-only">Toggle sidebar</span>
					</button>
				{/if}
			</div>
			<a href="#/" class="navbar-brand"> The Matrix </a>

			{#if $state.logged}
				<ul class="navbar-nav d-none d-md-flex">
					<li class="nav-item" use:active={{ path: "/" }}>
						<a href="/" class="nav-link" use:link use:active>
							<i class="fas fa-users" />
						</a>
					</li>
					<li class="nav-item" use:active={{ path: /ranking\/?.*/ }}>
						<a href="/ranking" class="nav-link" use:link>
							<i class="fas fa-sort-numeric-up" />
						</a>
					</li>
					<li class="nav-item" use:active={{ path: "/online-stats" }}>
						<a href="/online-stats" class="nav-link" use:link>
							<i class="fas fa-chart-area" />
						</a>
					</li>
				</ul>
				<form class="form-inline d-none d-md-flex ml-auto" action="..." method="...">
					<button class="btn btn-warning" type="button" on:click={() => logout()}>logout</button>
				</form>
			{/if}
		</nav>
	{/if}

	{#if !$state.logged}
		<Login />
	{:else}
		<!-- { #if $location !== "/hall" } <Appbar /> { /if } -->
		<Router {routes} />
	{/if}
</div>

<!-- <div class="lost" class:active={connexionLost}>
	connexion lost
</div>

<div class="body-container" class:blurred={connexionLost}>
	{#if !$state.logged}
		<Login />
	{:else}

		<!-- { #if $location !== "/hall" } <Appbar /> { /if }
		<Router {routes} />
	{/if}

</div> -->
<style type="text/sass">
	@import "./assets/Global";

</style>
