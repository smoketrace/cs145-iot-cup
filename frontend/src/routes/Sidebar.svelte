<script lang="ts">
	import { page } from '$app/stores';

	import logo_circle from '$lib/images/SmokeTrace_Logo_Circle.svg';

	export let sidebarOpen = false;

	function matchRoute(route: string) {
		console.log($page.url.pathname);
		console.log(route);
		return $page.url.pathname == route ? 'currPage' : '';
	}
</script>

	<div class="corner">
		<img src={logo_circle} alt="SmokeTrace logo" on:click={() => sidebarOpen = !sidebarOpen} on:keypress/>
	</div>
	<nav class:sidebarOpen>
		<div class="btnGroup">
			<button class={matchRoute('/')}><a class={matchRoute('/')} href="/">Dashboard</a></button>
			<button class={matchRoute('/chart')}><a class={matchRoute('/chart')} href="/chart">Smoke Chart</a></button>
			<button class={matchRoute('/eventlogs')}><a class={matchRoute('/eventlogs')} href="/eventlogs">Incident Log</a></button>
			<button class={matchRoute('/about')}><a class={matchRoute('/about')} href="/about">About</a></button>
		</div>
	</nav>

<style>
	nav {
		background-color: var(--smoke-beige);
		box-shadow: 0.15rem 0 0.5rem var(--smoke-beige);
        height: 100%;
		left: -100%;
        position: absolute;
		transition: left 0.5s cubic-bezier(0.25, 0, 0.15, 1);
		width: 120px;
        z-index: 1;
	}

	.sidebarOpen {
		left: 0;
	}

	nav a {
		display: flex;
		color: var(--smoketrace-white);
		font-size: 1rem;
		text-decoration: none;
        transition:
            filter 0.1s,
            color 0.1s;
	}

	a:hover:not(.currPage) {
		color: var(--orange-hover);
	}

	.btnGroup {
		display: flex;
        flex-direction: column;
		gap: 1.25rem;
		padding-top: 6rem;
	}

	button {
		background-color: transparent;
		border: none;
        cursor: pointer;
        font-family: inherit;
        filter: brightness(1);
		padding: 0.5rem 0.75rem;
    }

	button:active {
		background-color: var(--fire-orange);
	}

	.currPage {
		background-color: var(--fire-orange);
		color: var(--smoketrace-black);
	}

	img {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		object-fit: contain;
		transition: filter 0.3s, box-shadow 0.1s;
	}

	img:hover {
		filter: brightness(1.25);
		box-shadow: 0.25rem 0.25rem 0.5rem var(--smoke-beige);
	}

	.corner {
		width: fit-content;
		padding: 1rem;
		padding-left: 2rem;
		z-index: 2;
	}
</style>
