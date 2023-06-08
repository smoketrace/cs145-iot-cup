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

  interface RawSmokeData {
    [key: string]: {
      device_id: string;
      smoke_read: number;
      time: {
        nanoseconds: number;
        seconds: number;
      }
    }
  }


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

      let graphData: RawSmokeData
      const evtSource = new EventSource("https://smoketrace-api.deno.dev/sensors");
	    evtSource.onmessage = function(event) {
        graphData = event.data
        console.log(graphData);
        
      // graphData = {"-NXEqNB928JMP96s3lsr":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTJ2MGp1GxmfeTeu":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTngNJpL7ekTkKRw":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEyzSW0CBtXY5Bzojj":{"device_id":"ESP32-EYRON","smoke_read":155,"time":{"nanoseconds":0,"seconds":69}}}
      
      let smokeData = [ ]

      for (const key in graphData) {
        // assumption, each key has a value
        const value = graphData[key];
        smokeData.push({
          x: value?.time.seconds * 1000,
          y: value?.smoke_read,
        })
      } 

      console.log("Smoke Data", smokeData);
      
      // graph here
    
      const chartData = {
          datasets: [
            {
            data: smokeData
            }
          ]
        };


      // graphData = {"-NXEqNB928JMP96s3lsr":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTJ2MGp1GxmfeTeu":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTngNJpL7ekTkKRw":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEyzSW0CBtXY5Bzojj":{"device_id":"ESP32-EYRON","smoke_read":155,"time":{"nanoseconds":0,"seconds":69}}}
      
      let smokeData = [ ]

      for (const key in graphData) {
        // assumption, each key has a value
        const value = graphData[key];
        smokeData.push({
          x: value?.time.seconds * 1000,
          y: value?.smoke_read,
        })
      }

      console.log("Smoke Data", smokeData);
      
      // graph here
    
      const chartData = {
          datasets: [
            {
            data: smokeData
            }
          ]
        };


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

</script>



<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
</div>
