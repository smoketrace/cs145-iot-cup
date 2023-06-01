<svelte:head>
	<title>Smoke Chart</title>
	<meta name="description" content="View smoke readings on a graph" />
</svelte:head>

<script lang="ts">

  import { browser } from '$app/environment';
  import { FY2021 as satisfactionData2021 } from '$lib/data.satisfaction.json';
  import '@fontsource/merriweather';
  import { Chart, registerables } from 'chart.js';
  // import 'chartjs-adapter-date-fns';
  import { onMount } from 'svelte';
  import { fetchFromAPI } from '$lib/helpers/fetch'
  import sensor_dummy from './../../lib/sensor_dummy.json';
  import { graphSensorData } from '$lib/helpers/graph';

  Chart.register(...registerables);
 
  let lineGraph: HTMLCanvasElement;


  type SensorReadingType = {
    device_id: string;
    time: string;
    smoke_read: number;
  };

  // parsing json data to graph data
  function formatGraphData(sensorData: SensorReadingType[]) {
    const labels = sensorData.map(obj => new Date(obj.time));
    const data = sensorData.map(obj => obj.smoke_read);

    let graphData = {
      labels: labels, 
      datasets: [
        {
          // TODO: label should be sensor name
          label: "sensor 1",
          data: data,
          backgroundColor: 'blue'
        },
      ]
    }
    return graphData
  }
  


  onMount(() => { 
  
    // fetching from api
    // fetchFromAPI()
    //   .then((data) => {
    //     return formatGraphData(data as SensorReadingType[])
    //   })
    //   .then(graphData => {

    //     // creating the graph
    //     new Chart(lineGraph, {
    //       type: 'line', //this denotes the type of chart
    //       data: graphData,
    //       options: {
    //         aspectRatio: 2.5,
    //         scales: {
    //           x: {
    //             type: "time"
    //           }
    //         }
    //       }
    //     })
    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //   })


    // testing date time
    /*
    const datapoints = [
      {x: new Date('2022-05-01T00:00:00'), y: 3},
      {x: new Date('2022-05-01T01:00:00'), y: 3},
      {x: new Date('2022-05-01T02:00:00'), y: 3},
      {x: new Date('2022-05-01T03:00:00'), y: 4},
      {x: new Date('2022-05-01T04:00:00'), y: 5},
      {x: new Date('2022-05-01T05:00:00'), y: 4},
      {x: new Date('2022-05-01T06:00:00'), y: 4},
      {x: new Date('2022-05-01T07:00:00'), y: 8},
      {x: new Date('2022-05-01T08:00:00'), y: 6},
      {x: new Date('2022-05-01T09:00:00'), y: 1},
      {x: new Date('2022-05-01T10:00:00'), y: 6},
    ]

    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Weekly Sales',
        data: [18, 12, 6, 9, 12, 3, 9],
        backgroundColor: [
          'rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(0, 0, 0, 0.2)'
        ],
        borderColor: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(0, 0, 0, 1)'
        ],
        borderWidth: 1
      }]
    };

    // config 
    const config = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            // type: 'time',
          },
          y: {
            beginAtZero: true
          }
        }
      }
    };

    // render init block
    const myChart = new Chart(
      lineGraph,
      config
    );
  

    */
})


</script>
<div>
	<h1>Smoke Chart</h1>

	<p>
		[Add button to refresh graph]
	</p>
  <canvas bind:this={lineGraph} />
</div>
