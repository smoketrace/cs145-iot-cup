<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>





<script lang="ts">
  import { onMount } from 'svelte'

  let posts: any = {}


	let api_url = "https://smoketrace-api.deno.dev/sensors/ESP32_JOHN"
  onMount(() => {
    fetch(api_url)
      .then(response => response.json())
      .then(result => {
				console.log(result);
				posts = result
			})
  })
</script>

<div>
	<h1>Smoke Chart</h1>

	<p>
		[View smoke readings on a graph]
	</p>
</div>
