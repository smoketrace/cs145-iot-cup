<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">
  import Graph from '../../lib/components/Graph.svelte';
  import { onMount, onDestroy, setContext } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  let isMounted = false;

  onMount(() => {
    console.log("Mounted");
    isMounted = true;
  });

  onDestroy(() => {
    isMounted = false;
  });

  setContext('isMounted', isMounted);
  
</script>


<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  

  <!-- remount logic -->
  {#if isMounted}
    <Graph/>
  {/if}

  <button on:click={() => {
    isMounted = !isMounted
    setTimeout(() => {
      isMounted = !isMounted
    }, 200);
  }}>
    {#if isMounted}Destroy{/if}
    {#if !isMounted}Remount{/if}
  </button>

</div>

