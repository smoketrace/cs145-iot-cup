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
        x: value.time * 1000  ,
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
  
  var chartData
  var chart: any
  var i = 1

  function updateSmokeChart() {
    // console.log("1 entry:", chart.data.datasets[24]);

    // Get last element from SSE

    // Push the last element to chart
    let newData = {x: 177456050000 + 1000000 * i, y: 100 * i}

    chart.data.datasets[0].data.push(newData)
    i += 1
    chart.update()

  }

  let smokeChartOptions = {
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
  }


  
  const apiUrl = "https://smoketrace-api.deno.dev/sensors";
  const source = new EventSource(apiUrl);
  let graphData: SmokeData[]

  onMount(() => {
    source.addEventListener("sensor",(evt) => {
      console.log("received new smoke readings:", evt.data);
      graphData = JSON.parse(evt.data)
      chartData = parseSSEData(graphData)

      chart = new Chart(lineGraph, {
          type: 'line',
          data: chartData,
          options: smokeChartOptions,
      })
    });
  


  });
</script>



<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
  <button on:click={updateSmokeChart}>Update!</button>
</div>
