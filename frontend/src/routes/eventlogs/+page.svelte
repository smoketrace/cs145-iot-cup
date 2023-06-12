<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

    import Fa from 'svelte-fa/src/fa.svelte';
    import { faFire } from '@fortawesome/free-solid-svg-icons'

    import SmokeLogItem from '../../lib/components/SmokeLogItem.svelte';

    const apiUrl = "https://smoketrace-api.deno.dev/sensors";
    const source = new EventSource(apiUrl);

    interface smokeReading {
        device_id: string,
        smoke_read: number,
        time: number,
    }

    enum STATUS {
        GREEN,
        ORANGE,
        RED,
        BLACK,
        RECON,
        SMS,
    }


    interface sensorHealth {
        status: STATUS,
        device_id: string,
        time: number,
    }

    let readings: smokeReading[] = [];
    let sensor_status: sensorHealth[] = [];

    onMount(() => {
        console.log("welcome back, opening new connection...");//

        source.addEventListener("sensor",(evt) => {
            console.log("received new smoke readings:", evt.data);
            readings = parseAndSort(evt.data);
        });
        source.addEventListener("status", (evt) => {
            console.log("checking device health:", evt.data);
            sensor_status = parseAndSort(evt.data);

        });
    })

    onDestroy(() => {
        console.log("clicked away. closing connection");//
        source?.close();
        // BUGFIX: This doesn't get closed?!
    })

    function parseAndSort(data: string) {
        processed_data = JSON.parse(data);
        processed_data.sort((a: smokeReading, b: smokeReading) => b.time.seconds - a.time.seconds);
    }

    async function initialFetch() {
        const res = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Accept: "text/event-stream"
            },
            cache: "no-cache",
            // keepalive: true,
        })
        parseAndSort(await res.json());
    }

</script>

<div>

    <Fa icon={faFire} />
	<h1>Incident Logs</h1>

	<p>
		[Contains significant smoke readings and sensor health reports]
	</p>

    {#if processed_data === undefined}
        <em>Waiting for data...</em>
    {:else}
        <ul class="logs">
            {#each processed_data as {device_id, smoke_read, time}}
                {#if smoke_read >= 384}
                    <SmokeLogItem seconds={time.seconds} {device_id} {smoke_read} />
                    <br>
                {/if}
            {/each}
        </ul>
    {/if}
</div>

<style>
    .logs {
        border-left: 1.5px solid var(--smoke-beige);
    }
</style>
