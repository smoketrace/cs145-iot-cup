<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
	import { fetchFromAPI } from "$lib/helpers/fetch";

	let sensor_data: any = {}
	onMount(() => {sensor_data = fetchFromAPI()})
</script>

<div>
	<h1>Incident Logs</h1>

	<p>
		[Contains significant smoke readings and sensor health reports]
	</p>
</div>
