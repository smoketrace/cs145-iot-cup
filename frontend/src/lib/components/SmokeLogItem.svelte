<script lang="ts">
    export let seconds: number;
    export let device_id: string;
    export let smoke_read: number;

    let timestamp = new Date(seconds*1000).toLocaleString();

</script>

<li>
    <span class="dot"></span>
    <p>{timestamp}</p>
    {#if smoke_read < 384}
        <h3>Smoke warning: LOW</h3>
    {:else}
        <h3>Smoke warning: HIGH</h3>
    {/if}
    <p>{device_id} detected smoke level {smoke_read}</p>
</li>

<style>

</style>
