<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

    import type { smokeReading, sensorHealth } from '../../lib/helpers/types';
    import { STATUS } from '$lib/helpers/types';
    import { visibleStore, openModal } from '$lib/helpers/showAlert';
    import SmokeLogItem from '$lib/components/SmokeLogItem.svelte';
    import HealthLogItem from '$lib/components/HealthLogItem.svelte';

    const apiUrl = "https://smoketrace-api.deno.dev/sensors";
    const source = new EventSource(apiUrl);

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

            if (sensor_status[0].status === 6) {
                openModal();
            }
        });
    })

    onDestroy(() => {
        console.log("clicked away. closing connection");//
        source?.close();
        // BUGFIX: This doesn't get closed?!
    })

    function parseAndSort(data: string) {
        const json = JSON.parse(data);
        return json.sort((a: smokeReading | sensorHealth, b: smokeReading | sensorHealth) => b.time - a.time);
    }
</script>


<main>
    <h1>Incident Logs</h1>
    {#if readings === undefined || sensor_status === undefined}
        <em>Waiting for data...</em>
    {:else}
        <div class="columns">
            <section>
                <h2>Recent smoke readings</h2>
                <ul class="logs">
                    {#each readings as {device_id, smoke_read, time}}
                        {#if smoke_read >= 192}
                            <SmokeLogItem seconds={time} {device_id} {smoke_read} />
                            <br>
                        {/if}
                    {/each}
                </ul>
            </section>
            <section>
                <h2>Sensor health reports</h2>
                <ul class="logs">
                    {#each sensor_status as {time, status, device_id}, i}
                        {#if status !== STATUS.GREEN}
                            <HealthLogItem seconds={time} {status} {device_id} />
                            <br>
                        {/if}
                    {/each}
                </ul>
            </section>
        </div>
    {/if}
</main>

<style>
    .logs {
        border-left: 1.5px solid var(--smoke-beige);
    }

    .columns {
        align-items: stretch;
        display: flex;
        gap: 1rem;
        justify-content: space-around;
    }

    section {
        max-width: 40%;
    }

    ul {
        padding-left: 0.8rem;
    }
</style>
