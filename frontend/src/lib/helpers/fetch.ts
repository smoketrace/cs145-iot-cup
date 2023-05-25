let api_url = "https://smoketrace-api.deno.dev/sensors/"
export function fetchFromAPI() {
    let sensor_data: any = {}

    fetch(api_url)
    .then(response => response.json())
    .then(result => {
        sensor_data = result    
    })
    return sensor_data
  }