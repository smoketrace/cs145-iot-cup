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
  import sensor_dummy from './../../lib/sensor_dummy.json';

  Chart.register(...registerables);
 
  let lineGraph: HTMLCanvasElement;

  let sensor_data: any = {}

  // parsing json
  const labels = sensor_dummy.map(obj => obj.time);
  const data = sensor_dummy.map(obj => obj.smoke_read);

  const result = {
    labels: labels,
    data: data
  };

  console.log("parsed json", result);


  // parsing json


  onMount(() => {
    function parseSensorValue() {
      
    }

    
    console.log("sensor_dummy_data", sensor_dummy);
    

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
      labels: labels, 
      datasets: [
        {
          label: "sensor 1",
          data: data,
          backgroundColor: 'blue'
        },
        // {
        //   label: "Profit",
        //   data: ['542', '542', '536', '327', '17',
        //         '0.00', '538', '541'],
        //   backgroundColor: 'limegreen'
        // }  
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
