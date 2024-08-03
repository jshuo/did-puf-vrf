export async function POST(request) {
  const requestData = await request.json();
    const targetUrl = 'http://58.115.23.124:8088/pufs_p256_sign_js';
  
        const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'POST' ? JSON.stringify(requestData) : undefined,
        });
       const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200, // Or an appropriate status code
        headers: {
          "Content-Type": "application/json",
        },
      });
}