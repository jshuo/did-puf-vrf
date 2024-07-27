// Number of requests to send
const numRequests = 10000; // Adjust this value as needed

// URL to request
const url = 'http://192.168.0.23:8088/pufs_puf_vrf_service';

// Function to perform a single request
async function performRequest() {
    try {
        const response = await fetch(url);
        const data = await response.text(); // Assuming the response is text
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to perform multiple requests in a loop
async function loopRequests() {
    for (let i = 0; i < numRequests; i++) {
        console.log(`Request ${i + 1}`);
        await performRequest();
    }
}

// Start the loop
loopRequests();
