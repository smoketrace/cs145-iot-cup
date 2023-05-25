<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>





<script lang="ts">
  import { onMount } from 'svelte'

  let sensor_data: any = {}

	// code for fetching from api
	let api_url = "https://smoketrace-api.deno.dev/sensors/ESP32_JOHN"
  onMount(() => {
    fetch(api_url)
      .then(response => response.json())
      .then(result => {
				console.log(result);
				sensor_data = result
			})
  })

	// dummy data, for testing
	sensor_data = [
  {
    "device_id": "hello",
    "time": "2023-05-25T10:30:00Z",
    "smoke_read": 42
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T11:15:00Z",
    "smoke_read": 18
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T13:45:00Z",
    "smoke_read": 29
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T14:20:00Z",
    "smoke_read": 36
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T15:05:00Z",
    "smoke_read": 12
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T16:30:00Z",
    "smoke_read": 25
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T17:15:00Z",
    "smoke_read": 31
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T18:45:00Z",
    "smoke_read": 19
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T19:10:00Z",
    "smoke_read": 27
  },
  {
    "device_id": "hello",
    "time": "2023-05-25T20:25:00Z",
    "smoke_read": 14
  }
]



</script>

<div>
	<h1>Smoke Chart</h1>

	<p>
		[View smoke readings on a graph]
	</p>
</div>
