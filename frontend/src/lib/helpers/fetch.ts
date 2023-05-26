let api_url = "https://smoketrace-api.deno.dev/sensors/"
export function fetchFromAPI() {
    return new Promise((resolve, reject) => {
        fetch(api_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error fetching data: " + response.status);
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            })
    })
}