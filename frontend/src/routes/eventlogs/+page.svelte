<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { fetchFromAPI } from "$lib/helpers/fetch";

    import { collection, query, orderBy, limit } from "firebase/firestore";
	import { FirebaseApp, Collection, collectionStore } from "sveltefire";
    import { auth } from "$lib/firebase";
    import { firestore } from "$lib/firebase";
    import { json } from "@sveltejs/kit";
    import { readable } from "svelte/store";

    const sortEntriesByTime = query(collection(firestore, 'sensorData'),  orderBy('time'), limit(25));

    const apiUrl = "https://smoketrace-api.deno.dev/sensors";
    const source = new EventSource(apiUrl);
    let readings: JSON;

    $: console.log(readings);

    onMount(() => {
            console.log("welcome back, opening new connection...");
            initialFetch();
        })

    async function initialFetch() {
        const res = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Accept: "text/event-stream"
            },
            cache: "no-cache",
            // keepalive: true,
        })
        readings = JSON.parse(await res.json());
    }

    source.onmessage = (event) => {
        readings = JSON.parse(event.data);
    }

    onDestroy(() => {
        console.log("clicked away. closing connection");
        source.close();
    })

</script>

<div>
	<h1>Incident Logs</h1>

	<p>
		[Contains significant smoke readings and sensor health reports]
	</p>

    <!-- <FirebaseApp {auth} {firestore}>
        <Collection
            ref={sortEntriesByTime}
            let:data
            let:count
        >
            {#if count == 0}
                <span>Waiting for new data...</span>
            {:else}
                <p>Showing {count} entries (in the future, allow view entries from the past hour, day, week)</p>
                {#each data as smokeReading}
                    {#if smokeReading.smoke_read > 0}
                        {new Date((smokeReading.time.seconds)*1000).toLocaleString()} - {smokeReading.device_id} detected smoke level {smokeReading.smoke_read}
                        <hr>
                    {/if}
                {/each}
            {/if}
            <span slot="loading">Fetching data...</span>
        </Collection>
    </FirebaseApp> -->
</div>
