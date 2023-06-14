<script>
	import MiniChart from '../routes/chart/+page.svelte';
	import MiniLogs from '../routes/eventlogs/+page.svelte';
</script>

<svelte:head>
	<title>Dashboard</title>
	<meta name="description" content="SmokeTrace web app dashboard" />
</svelte:head>

<section>
	<h1>SmokeTrace Dashboard</h1>
	<div class="mini-windows">
		<div class="graph-container">
			<MiniChart />
		</div>
		<MiniLogs />
	</div>
</section>

<style>
	.mini-windows {
		display: flex;
		gap: 4rem;
		justify-content: space-evenly;
	}

	.graph-container {
		width: 60%;
	}
</style>
