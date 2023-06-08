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

  const chartData = {
    datasets: [
      {
      data: [
        {x: 1686113092095, y: 10},
        {x: 1686114092095, y: 15},
        {x: 1686115092095, y: 9},
        {x: 1686116092095, y: 36},
        {x: 1686120092000, y: 20},
      ],
      },
    ],
  };

  onMount(() => {
    if (browser) {
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
