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

      let graphData
      const evtSource = new EventSource("https://smoketrace-api.deno.dev/sensors");
	    evtSource.onmessage = function(event) {
        graphData = event.data
        console.log(graphData);
        
    	}

      graphData = {"-NXEqNB928JMP96s3lsr":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTJ2MGp1GxmfeTeu":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEqTngNJpL7ekTkKRw":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXEyzSW0CBtXY5Bzojj":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXF1-PwM_qL9T5_vtRb":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFBP-vwzA8IfsETdQ6":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXFCBXAspvyYFg4xfv-":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFEG1EseBBmoQJO96F":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFEHm1k5IL1XqTGBTy":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFEdJUUi68peoxn-4N":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}},"-NXFFW79LZp3kO_j08U6":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFYi2fscOwc0RW5FI":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFZreIgaS4J6kZA2C":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFkuk02xKWSLMx7y8":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFlIqbGwbgGjYs9Xo":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFlYb0YtUVqSoX5Lb":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFljVpBBWtoZ4EvX-":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFlt3mo7J3uiKi117":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFm0xRmqHLIeDAEvy":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":69}},"-NXFFrEhEOFc1GLs9Fme":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":698437384}},"-NXFFseJUcupxLGo5P9r":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":6645}},"-NXFFtiV1YkF4o20nUS_":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":6645}},"-NXFFv9W0xTypiw0ivl7":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":6645}},"-NXFFwMDZpaNu64B_0nY":{"device_id":"ESP32-EYRON","smoke_read":"155","time":{"nanoseconds":0,"seconds":66465}},"-NXP8uARFCLO5EsxBxmO":{"device_id":"ESP32-JOSHEN","smoke_read":60,"time":{"nanoseconds":0,"seconds":664}}}
      /*
      id {
        device_id:,
        smoke_read
        time {
          nanoseconds:
          seconds
        }
      }
      */
      
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
