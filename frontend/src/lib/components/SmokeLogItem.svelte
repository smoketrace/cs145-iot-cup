<script lang="ts">
    export let seconds: number;
    export let device_id: string;
    export let smoke_read: number;

    let timestamp = new Date(seconds).toLocaleString();

    // Temporary thresholds for now; can adjust later.
    function generateMsg(smoke_read: number) {
        if (smoke_read < 0)
            return null;
        if (smoke_read < 100)
            return 'LOW smoke warning';
        if (smoke_read < 400)
            return 'MEDIUM smoke warning';

       return 'HIGH smoke warning';
    }
</script>

<li>
    <span class="dot"></span>
    <p>{timestamp}</p>
    <h3>{generateMsg(smoke_read)}</h3>
    <p>{device_id} detected smoke level {smoke_read}</p>
</li>

<style>

</style>
