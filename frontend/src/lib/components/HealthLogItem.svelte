<script lang="ts">
    import { collectionStore } from 'sveltefire';
    import { firestore } from '$lib/firebase';

    import { STATUS } from '$lib/helpers/types';

    export let status: number;
    export let seconds: number;
    export let device_id: string;

    export let options = {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }

    let timestamp = new Date(seconds*1000);
    let time_display = new Intl.DateTimeFormat('en-US', options).format(timestamp);

    const statusMessages = [
        "is healthy.",
        "has disconnected.",
        "is detecting high smoke levels.",
        "has disconnected while reading high smoke levels.",
        "has reconnected.",
        "sent an SMS alert to ",
        "reading consistently high smoke levels. Please contact the fire department.",
    ]

    let status_color: string = STATUS[status];

    interface contactPerson {
        name: string,
        phone: string,
    }
    const phoneDir = collectionStore<contactPerson>(firestore, 'phoneDirectoryData');
</script>

<li>
    <span class="dot"></span>
    <p class="time">{time_display}</p>
    <h3>{status_color} Status</h3>
    <span>{device_id}</span>
    <span>{statusMessages[status]}</span>
    {#if status_color === "SMS"}
        {@const phoneDirLength = $phoneDir.length}
        {#if phoneDirLength == 1}
            <span>{$phoneDir[0].name}.</span>
        {:else}
            {#each $phoneDir as contactPerson, count}
                {#if count === phoneDirLength - 1}
                    <span>{contactPerson.name}.</span>
                {:else}
                    <span>{contactPerson.name},&nbsp;</span>
                {/if}
            {/each}
        {/if}
    {/if}
</li>

<style>
    .time {
        font-size: smaller;
    }
    li {
        background-color: var(--cement-grey);
        padding: 0.6rem 1rem;
        border-radius: 0.35rem;
    }
</style>
