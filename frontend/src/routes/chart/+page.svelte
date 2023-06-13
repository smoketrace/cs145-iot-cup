<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">
  import { browser } from '$app/environment';
  import { Chart, registerables } from 'chart.js';
  import { onMount } from 'svelte';
  import 'chartjs-adapter-date-fns';
  import { dataset_dev } from 'svelte/internal';

  Chart.register(...registerables);

  let lineGraph: HTMLCanvasElement;

  interface SmokeData {
    device_id: string,
    smoke_read: number,
    time: number;
  }

  // Parsing data from SSE to graph data
  function parseSSEData(JsonData: SmokeData[]) {
    let smokeData = [ ]

    for (const key in JsonData) {
      // assumption, each key has a value
      const value: SmokeData = JsonData[key];
      
      smokeData.push({
        x: value.time * 1000,
        y: value.smoke_read,
      })
    }

    console.log("Smoke Data", smokeData);
    
    const chartData = {
        datasets: [
          {
          data: smokeData
          }
        ]
      };        
    return chartData
  }

  
  const apiUrl = "https://smoketrace-api.deno.dev/sensors";
  const source = new EventSource(apiUrl);

  onMount(() => {
    source.addEventListener("sensor",(evt) => {
      console.log("received new smoke readings:", evt.data);
      graphData = JSON.parse(evt.data)
      chartData = parseSSEData(graphData)

  new Chart(lineGraph, {
      type: 'line',
      data: chartData,
      options: {
        scales: {
          x: {
            type: "timeseries",
            time: {
              unit: "hour"
            }  
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    } )
  });



    let graphData: SmokeData[]
    const evtSource = new EventSource("https://smoketrace-api.deno.dev/sensors/");
    evtSource.onmessage = function(event) {
      graphData = JSON.parse(event.data)
      console.log(graphData);
      chartData = parseSSEData(graphData)
      
      // graph here
      
    new Chart(lineGraph, {
      type: 'line',
      data: chartData,
      options: {
        scales: {
          x: {
            type: "timeseries",
            time: {
              unit: "hour"
            }  
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
      
      
    }

    // dummy data, replace with fetched SSE values
    graphData = [
      {"device_id":"ESP32-JOSHEN","smoke_read":98,"time":{"nanoseconds":0,"seconds":1686297627}},
      {"device_id":"ESP32-JOSHEN","smoke_read":132,"time":{"nanoseconds":0,"seconds":1686296627}}
    ]   

    
    let chartData = parseSSEData(graphData)


  });
</script>



<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
</div>
