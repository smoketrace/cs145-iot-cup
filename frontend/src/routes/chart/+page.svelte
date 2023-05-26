<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">
  import { browser } from '$app/environment';
  import { FY2021 as satisfactionData2021 } from '$lib/data.satisfaction.json';
  import '@fontsource/merriweather';
  import { Chart, registerables } from 'chart.js';
  import { onMount } from 'svelte';
  import { fetchFromAPI } from '$lib/helpers/fetch'

  Chart.register(...registerables);
 
  let barChartElement: HTMLCanvasElement;
  let lineGraph: HTMLCanvasElement;

  let sensor_data: any = {}

  onMount(() => {
    // fetching from api
    sensor_data = fetchFromAPI()

  new Chart(lineGraph, {
    type: 'line', //this denotes tha type of chart

    data: {// values on X-Axis
      labels: ['2022-05-10', '2022-05-11', '2022-05-12','2022-05-13',
              '2022-05-14', '2022-05-15', '2022-05-16','2022-05-17', ], 
      datasets: [
        {
          label: "Sales",
          data: ['467','576', '572', '79', '92',
              '574', '573', '576'],
          backgroundColor: 'blue'
        },
        {
          label: "Profit",
          data: ['542', '542', '536', '327', '17',
                '0.00', '538', '541'],
          backgroundColor: 'limegreen'
        }  
      ]
    },
    options: {
      aspectRatio:2.5
    }
  }
  )

      
})



</script>

<div>
	<h1>Smoke Chart</h1>

	<p>
		[View smoke readings on a graph]
	</p>
  <canvas bind:this={barChartElement} />
  <canvas bind:this={lineGraph} />
</div>
