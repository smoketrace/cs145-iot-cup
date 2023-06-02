<svelte:head>
	<title>Incident Logs</title>
	<meta name="description" content="View an event log containing smoke readings, sensor health reports" />
</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
	import { fetchFromAPI } from "$lib/helpers/fetch";
    
    import { collection, query, orderBy, where } from "firebase/firestore";
	import { FirebaseApp, Collection, collectionStore } from "sveltefire";
    import { auth } from "$lib/firebase";
    import { firestore } from "$lib/firebase";

    const sortEntriesByTime = query(collection(firestore, 'sensorData'),  orderBy('time'));
</script>

<div>
	<h1>Incident Logs</h1>

	<p>
		[Contains significant smoke readings and sensor health reports]
	</p>

    <FirebaseApp {auth} {firestore}>
        <Collection
            ref={sortEntriesByTime}
            let:data
            let:ref
        >
            {#each data as smokeReading}
                {#if smokeReading.smoke_read > 0}
                    {new Date((smokeReading.time.seconds)*1000).toLocaleString()} - {smokeReading.device_id} detected smoke level {smokeReading.smoke_read}
                    <hr>
                {/if}
            {/each}
            
        </Collection>
    </FirebaseApp>
</div>
