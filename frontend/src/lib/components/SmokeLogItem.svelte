<script lang="ts">
    export let seconds: number;
    export let device_id: string;
    export let smoke_read: number;

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


</script>

<li>
    <span class="dot"></span>
    <p>{time_display}</p>
    {#if smoke_read < 384}
        <h3>Smoke warning: LOW</h3>
    {:else}
        <h3>Smoke warning: HIGH</h3>
    {/if}
    <p>{device_id} detected smoke level {smoke_read}</p>
</li>

<style>

</style>
