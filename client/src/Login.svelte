<script>
	import { onDestroy, onMount } 				from "svelte";
	import { socket, authentication, state } 	from "./store";
	import env 									from "../../config.json"

	const loc = window.location.href
	const isLoginWindow = loc.includes("?code=")
	let closebtn
	let logged
	let submitbtn = true
	let progress = 0
	let btn_disabled = false


	//const cookies 	= Object.fromEntries(document.cookie.split('; ').map(x => x.split('=')))
	if (window.localStorage.getItem("jwt"))
		btn_disabled = true

	authentication.subscribe(d => {
		switch (d.type) {
			case "auth_success":
				authSuccess(d)
				btn_disabled = true
				break;
			case "jwt_success":
				jwtSuccess(d)
				btn_disabled = true
				break;
			case "jwt_error":
				jwtError(d)
				break;
			case "queued":
				authQueued(d)
				btn_disabled = true
				break;
			case "error":
				jwtError()
				break;
			default:
				break;
		}
	})
	


	function redirect() {
		//logged = true
		if (isLoginWindow)
			return
		progress = 100
		setTimeout(() => {
			document.querySelector(".container").style.opacity = "0"
			document.querySelector(".container").style.transform = "scale(.8)"
			setTimeout(() => {
				state.update(o => ({...o, logged: true}))
			}, 350)
		}, 500)
	}

	function jwtError(data) {
		submitbtn = true
		btn_disabled = false
		document.cookies = ""
		window.localStorage.clear()
		window.location.reload(true)
	}

	function authQueued(data) {
		progress = (data.step / 3) * 100
		btn_disabled = true
		console.log("Your authentification is in progress...", data.step + "/2")
	}

	function jwtSuccess(data) {
		try {
			console.log("✅ JWT Success")
			console.log(`Welcome back, ${data.data.login}.`)

		} catch(e) {
			console.error(e)
			jwtError()
		}
		redirect()
		//state.update(o => ({...o, logged: true}))
	}

	function authSuccess(data) {
		window.localStorage.setItem("jwt", data.jwt)

		if (isLoginWindow) {
			window.close()
			setTimeout(() => {
				closebtn.style.opacity = "1"
			}, 200)
		} else
			redirect()

	}

	let ready = false
	const maroustenter = (e) => {
		if(e?.key === "Enter") openLoginScreen()
	}

	onMount(() => {
		ready = true
		if (isLoginWindow) {	
			const queryString = Object.fromEntries(loc.split("?")[1].split("?").map(x => x.split('=')))
			console.log(queryString)
			if (queryString.code) {
				socket.emit("authentication", {
					type: "code",
					code: queryString.code
				})
			}
		}

		if (window.localStorage.getItem("jwt")) {
			submitbtn = false
		}

		//window.addEventListener("keypress", maroustenter)
	})
	//onDestroy(() => {
	//	window.removeEventListener("keypress", maroustenter)
	//})

	$: {
		if (ready && !isLoginWindow) {
			//const btn = document.querySelector("button.login")
			//btn.style.opacity = submitbtn ? "1" : "0"
		}
	}

	function openLoginScreen() {

		const cid 	= env.uid
		const redir = env.redirect_uri
		const uri 	= `https://api.intra.42.fr/oauth/authorize?client_id=${cid}&redirect_uri=${redir}&response_type=code
		`

		window.open(uri, "42 Authentication","status=no, scrollbars=no, menubar=no, height=500, width=400")
	}
</script>

<svelte:window on:keydown={maroustenter} />
{#if isLoginWindow}
	<div class="background-login">
		<div class="container">
			<div class="logo">
				<img src="assets/42_Logo.svg" alt=""/>
			</div>
			<div class="loader"></div>
			<button class="close-btn" bind:this={closebtn} on:click={() => window.close()} type="button">close</button>
		</div>
	</div>
{:else}
	<div class="background-login">
		<div class="container" class:disapear={logged}>
			<div class="logo">
				<img src="assets/42_Logo.svg" alt=""/>
			</div>
			<button type="button" class="login" on:click="{openLoginScreen}" disabled={btn_disabled}>
				{#if btn_disabled}
					<!-- <img src="../assets/ajax-loader (1).gif" alt=""/> -->
					<div class="bar-login">
						<div class="bar" style="width: {progress}%"></div>
					</div>
				{:else}
					login
				{/if}
			</button>
		</div>
	</div>
{/if}

<style type="text/sass">

	@import "./assets/Login.sass";

</style>