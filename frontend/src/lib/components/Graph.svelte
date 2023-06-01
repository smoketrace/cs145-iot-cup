<script lang="ts">
  import { browser } from '$app/environment';
  import { FY2021 as satisfactionData2021 } from '$lib/data.satisfaction.json';
  import '@fontsource/merriweather';
  import { Chart, registerables } from 'chart.js';
  import { onMount } from 'svelte';
  import { fetchFromAPI } from '$lib/helpers/fetch'
  import sensor_dummy from './../../lib/sensor_dummy.json';
  import { graphSensorData } from '$lib/helpers/graph';

  Chart.register(...registerables);
 
  let lineGraph: HTMLCanvasElement;

  let key = 0;
  
  function reloadGraph() {
    key += 1;
  }


  type Time = {
    seconds: number;
    nanoseconds: number;
  }

  type SensorReadingType = {
    device_id: string;
    time: Time;
    smoke_read: number;
  };

  // parsing json data to graph data
  function formatGraphData(sensorData: SensorReadingType[]) {
    const labels = sensorData.map(obj => obj.time['seconds']);
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
  
    // // fetching from api
    fetchFromAPI()
      .then((data) => {
        return formatGraphData(data as SensorReadingType[])
      })
      .then(graphData => {

        // creating the graph
        new Chart(lineGraph, {
          type: 'line', //this denotes the type of chart
          data: graphData,
          options: {
            aspectRatio:2.5
          }
        })
      })
      .catch(error => {
        console.error('Error:', error);
      })



  
})


</script>


<div>
  <canvas bind:this={lineGraph} />
</div>