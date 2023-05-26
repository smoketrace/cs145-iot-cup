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
 
   const chartData = {
     labels: satisfactionData2021.map(({ framework }) => framework),
     datasets: [
       {
         label: 'Satisfaction (%)',
         data: satisfactionData2021.map(({ score }) => score),
         backgroundColor: [
           'hsl(347 38% 49%)',
           'hsl(346 65% 63%)',
           'hsl(346 49% 56%)',
           'hsl(346 89% 70%)',
           'hsl(346 90% 76%)',
           'hsl(346 90% 73%)',
           'hsl(346 89% 79%)',
           'hsl(346 89% 85%)',
           'hsl(347 89% 82%)',
           'hsl(346 90% 88%)',
           'hsl(347 87% 94%)',
           'hsl(347 91% 91%)',
           'hsl(346 87% 97%)',
         ],
         borderColor: ['hsl(43 100% 52%)'],
         borderRadius: 4,
         borderWidth: 2,
       },
     ],
   };
  

  let sensor_data: any = {}

	// code for fetching from api
	let api_url = "https://smoketrace-api.deno.dev/sensors/ESP32_JOHN"
  onMount(() => {
    sensor_data = fetchFromAPI()
  

  new Chart(barChartElement, {
    type: 'bar',
    data: chartData,
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: 'hsl(43 100% 52% / 10%)',
          },
          ticks: { color: 'hsl(43 100% 52% )' },
        },
        y: {
          beginAtZero: false,
          ticks: { color: 'hsl(43 100% 52% )', font: { size: 18 } },
          grid: {
            color: 'hsl(43 100% 52% / 40%)',
          },
          title: {
            display: true,
            text: 'Satisfaction (%)',
            color: 'hsl(43 100% 52% )',
            font: { size: 24, family: 'Merriweather' },
          },
        },
      },
    },
  });


      
  })



</script>

<div>
	<h1>Smoke Chart</h1>

	<p>
		[View smoke readings on a graph]
	</p>
  <canvas bind:this={barChartElement} />
</div>
