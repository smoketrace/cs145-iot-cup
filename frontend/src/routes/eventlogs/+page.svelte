<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onDestroy, onMount } from "svelte";

    let source: EventSource;
    const apiUrl = "https://smoketrace-api.deno.dev/sensors";
    interface smokeReading {
        device_id: string,
        smoke_read: number,
        time: {
            nanoseconds: number,
            seconds: number,
        }
    }
    let data: smokeReading[];

    onMount(() => {
        console.log("welcome back, opening new connection...");//
        const source = new EventSource(apiUrl);

        // initialFetch();
        source.onmessage = (event) => {
            console.log("receiving update...");//
            data = Object.values(JSON.parse(event.data));
            data.sort((a, b) => b.time.seconds - a.time.seconds);
        }
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
        data = Object.values(JSON.parse(await res.json()));
        data.sort((a, b) => b.time.seconds - a.time.seconds);
    }

    onDestroy(() => {
        console.log("clicked away. closing connection");//
        source?.close();
        // BUGFIX: This doesn't get closed?!
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
