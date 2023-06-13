<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">
  import { browser } from '$app/environment';
  import { Chart, registerables, type DatasetChartOptions } from 'chart.js';
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

  interface chartData {x: number, y: number}

  // Parsing data from SSE to graph data
  function parseSSEData(JsonData: SmokeData[]) {
    let smokeData = [ ]

    for (const key in JsonData) {
      const value: SmokeData = JsonData[key];
      
      smokeData.push({
        x: value.time * 1000  ,
        y: value.smoke_read,
      })
    }
    
    const chartData = {
        datasets: [
          {
          // Add ESP 32 id here
          label: 'ESP32-Jelly',
          data: smokeData
          }
        ]
      };        
    return chartData
  }
  
  var chartData
  var chart: any
  var i = 1

  function updateSmokeChart(newData: chartData) {
    // push a new data point, then update
    chart.data.datasets[0].data.push(newData)
    chart.update()
  }

  let smokeChartOptions: any = {
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
  var initialLoad = true

  onMount(() => {
    source.addEventListener("sensor",(evt) => {
      // console.log("received new smoke readings:", evt.data);
      graphData = JSON.parse(evt.data)
      chartData = parseSSEData(graphData)

      if (initialLoad) {
        chart = new Chart(lineGraph, {
            type: 'line',
            data: chartData,
            options: smokeChartOptions
        })
        initialLoad = false
      } else {
        // update graph, with data from last entry of chartData
        let lastChartEntry = chartData.datasets[0].data[24]
        updateSmokeChart(lastChartEntry)
      }
    });
  });
</script>


<div>
	<h1>Smoke Chart</h1>

  <canvas bind:this={lineGraph} />
</div>
