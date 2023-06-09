<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">
  import { browser } from '$app/environment';
  import { Chart, registerables } from 'chart.js';
  import { onMount } from 'svelte';
  import 'chartjs-adapter-date-fns';

  Chart.register(...registerables);

  let lineGraph: HTMLCanvasElement;

  interface SSEData {
    [key: string]: {
      device_id: string;
      smoke_read: number;
      time: {
        nanoseconds: number;
        seconds: number;
      }
    }
  }

  // Parsing data from SSE to graph data
  function parseSSEData(JsonData: SSEData) {
    let smokeData = [ ]

    for (const key in JsonData) {
      // assumption, each key has a value
      const value = JsonData[key];
      smokeData.push({
        x: value?.time.seconds * 1000,
        y: value?.smoke_read,
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

  onMount(() => {
    if (browser) {

      let graphData: SSEData
      const evtSource = new EventSource("https://smoketrace-api.deno.dev/sensors");
	    evtSource.onmessage = function(event) {
        graphData = event.data
        console.log(graphData);
        
    	}

      // dummy data, replace with fetched SSE values
      graphData =    {
      "-NXPSzbO4BJTmv5kcTx_":{"device_id":"ESP32-JOSHEN","smoke_read":198,"time":{"nanoseconds":0,"seconds":1686297627}},
      "-NXPSzbO4BJTmv581_x3":{"device_id":"ESP32-JOSHEN","smoke_read":638,"time":{"nanoseconds":0,"seconds":1686397627}},
      "-NXPSzbO4BJT13581_x3":{"device_id":"ESP32-JOSHEN","smoke_read":215,"time":{"nanoseconds":0,"seconds":1686497627}},
      "-NXPSzbO4B139v581_x3":{"device_id":"ESP32-JOSHEN","smoke_read":581,"time":{"nanoseconds":0,"seconds":1686597627}},
      "-NXPdanN3B139v581_x3":{"device_id":"ESP32-JOSHEN","smoke_read":389,"time":{"nanoseconds":0,"seconds":1686697627}},
      }

      
      let chartData = parseSSEData(graphData)


      new Chart(lineGraph, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            x: {
              type: "time",
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
  });
</script>



<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
</div>
