export async function GET(req) {

    const targetUrl = 'http://58.115.23.124:8088/pufs_get_uid_js';
  
        const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method === 'GET' ? req.body : undefined,
        });
       const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200, // Or an appropriate status code
        headers: {
          "Content-Type": "application/json",
        },
      });
}