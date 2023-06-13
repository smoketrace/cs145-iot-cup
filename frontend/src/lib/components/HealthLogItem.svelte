<script lang="ts">
    import { STATUS } from '../../lib/helpers/types';

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

</script>

<li>
    <span class="dot"></span>
    <p>{time_display}</p>
    <h3>{status_color} Status</h3>
    <span>{device_id}</span>
    <span>{statusMessages[status]}</span>
</li>

<style>

</style>
