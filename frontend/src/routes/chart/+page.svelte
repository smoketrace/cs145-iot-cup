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
    let chartDatasets = []

    for (const key in JsonData) {
      const value: SmokeData = JsonData[key];
      
      const newData = {
        x: value.time * 1000  ,
        y: value.smoke_read,
      } 
      smokeData.push(newData)

      const datasetsIndex = chartDatasets.findIndex(obj => obj.label ===  value.device_id)
      if (datasetsIndex !== -1) {
        // if found
        chartDatasets[datasetsIndex].data.push(newData)
      } else {
        // if new entry
        chartDatasets.push({label: value.device_id, data: [newData]})
      }

    }
    
    const chartData = {
      datasets: chartDatasets
    }
    return chartData
  }
  
  var chartData
  var chart: any
  var i = 1

  function updateSmokeChart(value: {"device_id":string,"smoke_read":number,"time":number}) {
    let newData = {x: value.time* 1000, y: value.smoke_read}
    const datasetsIndex = chart.data.datasets.findIndex(obj => obj.label ===  value.device_id)
    if (datasetsIndex !== -1) {
      // if found
      chart.data.datasets[datasetsIndex].data.push(newData)
    } else {
      // if new entry
      chart.data.datasets.push({label: value.device_id, data: [newData]})
    }

    chart.update()
  }

  let smokeChartOptions: any = {
    scales: {
      x: {
        type: "timeseries",
        time: {
          unit: "minute"
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

  onMount(() =>   {
    source.addEventListener("sensor",(evt) => {
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
        let lastGraphDataElement = graphData[graphData.length - 1]
        updateSmokeChart(lastGraphDataElement)
        
      }
    });
  });
</script>


<div>
	<h1>Smoke Chart</h1>

  <canvas bind:this={lineGraph} />
</div>
