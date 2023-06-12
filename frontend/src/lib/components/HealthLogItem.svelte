<script lang="ts">
    enum STATUS {
        GREEN,
        ORANGE,
        RED,
        BLACK,
        RECON,
        SMS,
    }

    export let status: STATUS;
    export let seconds: number;
    export let device_id: string;

    let timestamp = new Date(seconds*1000).toLocaleString();

</script>

<li>
    <span class="dot"></span>
    <p>{timestamp}</p>
    <h3>Sensor status report: {status}</h3>
    <p>{device_id} has status</p>
</li>

<style>

</style>
