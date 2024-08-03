// import { createProxyMiddleware } from 'http-proxy-middleware';

// const proxyOptions = {
//   target: 'http://58.115.23.124:8088/pufs_puf_vrf_service', // Target host
//   changeOrigin: true, // Needed for virtual hosted sites
// };

// export async function GET(req) {

// //  const proxy =  createProxyMiddleware(proxyOptions)
// //  console.log(proxy)

// //  return new Response(JSON.stringify({ message: "pufs_puf_vrf_service" }), {
// //     status: 200, // Or an appropriate status code
// //     headers: {
// //       "Content-Type": "application/json",
// //     },
// //   });
// const targetUrl = 'http://58.115.23.124:8088/pufs_puf_vrf_service';
  
// const response = await fetch(targetUrl, {
//   method: req.method,
//   headers: req.headers,
//   body: req.method === 'GET' ? req.body : undefined,
// });

// const data = await response.json();
// console.log(data)
// res.status(response.status).json(data);
    
// }

export async function GET(req) {

    const targetUrl = 'http://58.115.23.124:8088/pufs_puf_vrf_service';
  
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