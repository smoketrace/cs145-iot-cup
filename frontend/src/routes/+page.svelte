<script>
	import MiniChart from '../routes/chart/+page.svelte';
	import MiniLogs from '../routes/eventlogs/+page.svelte';
	import Button from '$lib/components/Button.svelte';
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
			<a href="/chart"><Button>View full graph</Button></a>
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
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 60%;
	}
</style>
