<script>
	import logo_circle from '$lib/images/SmokeTrace_Logo_Circle.svg';
</script>

<header>
	<div class="corner">
		<a href="/about">
			<img src={logo_circle} alt="SmokeTrace logo" />
		</a>
	</div>

	<nav>
		<button><a href="/">Dashboard</a></button>
		<button><a href="/chart">Smoke Chart</a></button>
		<button><a href="/eventlogs">Incident Log</a></button>
		<button><a href="/about">About</a></button>
	</nav>

</header>

<style>
	.corner img {
		margin: 0.5em;
		width: 3em;
		height: 3em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
	}

	nav a {
		display: flex;
		padding: 0 0.5rem;
		color: var(--smoke-beige);
		font-size: 1rem;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--fire-orange);
	}
</style>
