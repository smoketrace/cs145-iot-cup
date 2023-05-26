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
 
  let lineGraph: HTMLCanvasElement;

  let sensor_data: any = {}

  onMount(() => {
    function parseSensorValue() {
      
    }

    // // fetching from api
    fetchFromAPI()
      .then(data => {
        console.log('Data', data);
        // parsejson here
      })
      .catch(error => {
        console.error('Error:', error);
      })

    function parseSensorData() {

    }
    
    

    // parsing json data to be used as graph
    //  what if only 1 data set (only 1 color)
    let graphData = {
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
    }


  // creating the graph
  new Chart(lineGraph, {
    type: 'line', //this denotes tha type of chart
    data: graphData,
    options: {
      aspectRatio:2.5
    }
  })

      
})



</script>

<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
</div>
